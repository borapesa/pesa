/**
 * Auto-changeset — generates changeset files from conventional commits.
 *
 * Runs on push to master. Scans commits since the last tag, parses
 * conventional commit prefixes to determine which packages bumped and
 * at what semver level, then writes .changeset/*.md files.
 *
 * The standard changesets/action picks up these files and creates
 * a Version Packages PR.
 */

import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

// ── Package mapping ────────────────────────────────────────────────────

const SCOPE_TO_PKG = {
  pesa: '@borapesa/pesa',
  azampay: '@borapesa/azampay',
  selcom: '@borapesa/selcom',
  clickpesa: '@borapesa/clickpesa',
  sqlite: '@borapesa/sqlite',
};

const PKG_TO_DIR = {
  '@borapesa/pesa': 'packages/pesa',
  '@borapesa/azampay': 'providers/azampay',
  '@borapesa/selcom': 'providers/selcom',
  '@borapesa/clickpesa': 'providers/clickpesa',
  '@borapesa/sqlite': 'adapters/sqlite',
};

const IGNORED_SCOPES = new Set(['docs', 'chore', 'ci', 'test', 'style', 'refactor']);

const TYPE_TO_BUMP = {
  fix: 'patch',
  feat: 'minor',
};

const BUMP_ORDER = { patch: 0, minor: 1, major: 2 };

// ── Git helpers ────────────────────────────────────────────────────────

function git(args, opts = {}) {
  const result = execFileSync('git', args, {
    encoding: 'utf-8',
    stdio: ['ignore', 'pipe', 'inherit'],
    ...opts,
  });
  return result.trim();
}

function lastTag() {
  try {
    // Changesets creates per-package tags: @borapesa/pesa@0.2.1, etc.
    return git(['describe', '--tags', '--abbrev=0', '--match', '@borapesa/*@*']);
  } catch {
    try {
      // Legacy tags from before changesets
      return git(['describe', '--tags', '--abbrev=0', '--match', 'v*']);
    } catch {
      // No tags yet — use first commit
      return git(['rev-list', '--max-parents=0', 'HEAD']);
    }
  }
}

function commitsSince(ref) {
  const range = `${ref}..HEAD`;
  try {
    return git(['log', range, '--pretty=format:%H %s', '--no-merges']);
  } catch {
    return '';
  }
}

function changedDirs(commit) {
  try {
    const files = git(['diff-tree', '--no-commit-id', '--name-only', '-r', commit]);
    const dirs = new Set();
    for (const f of files.split('\n').filter(Boolean)) {
      // Match package directories at any depth
      for (const [pkg, dir] of Object.entries(PKG_TO_DIR)) {
        if (f.startsWith(dir + '/')) {
          dirs.add(pkg);
        }
      }
    }
    return dirs;
  } catch {
    return new Set();
  }
}

// ── Commit parsing ─────────────────────────────────────────────────────

// Matches: type(scope): subject  or  type!: subject
const CC_RE = /^(\w+)(?:\(([^)]+)\))?(!)?:\s*(.+)/;

function parseCommit(line) {
  const space = line.indexOf(' ');
  const hash = line.slice(0, space);
  const message = line.slice(space + 1);
  const match = message.match(CC_RE);

  if (!match) return null;

  return {
    hash,
    type: match[1],
    scope: match[2] ?? null,
    breaking: !!match[3],
    subject: match[4],
  };
}

// ── Main ───────────────────────────────────────────────────────────────

function main() {
  // Don't regenerate if the incoming commit is a changeset release merge —
  // changesets/action just consumed all changeset files and published.
  // If we regenerate here, the action sees new files and opens another PR.
  // Skip if HEAD is a release merge — the merge commit message contains
  // "changeset-release/master" (GitHub's default merge title), and the
  // actual "chore: release" commit is the PR contents being merged.
  const headMsg = git(['log', '-1', '--pretty=format:%s']);
  if (headMsg.includes('changeset-release/master') || headMsg.includes('chore: release')) {
    console.log('Skipping: release merge detected — changesets were just consumed.');
    return;
  }

  const ref = lastTag();
  console.log(`Scanning commits since ${ref}`);

  const log = commitsSince(ref);
  if (!log) {
    console.log('No new commits since last tag.');
    return;
  }

  const lines = log.split('\n').filter(Boolean);
  console.log(`Found ${lines.length} commits.`);

  // Aggregate: per-package highest bump + collected subjects
  const packages = {};

  for (const line of lines) {
    const commit = parseCommit(line);
    if (!commit) {
      console.log(`  SKIP (non-conventional): ${line.slice(0, 80)}`);
      continue;
    }

    // Skip ignorable types
    if (IGNORED_SCOPES.has(commit.type)) {
      console.log(`  SKIP (${commit.type}): ${commit.subject.slice(0, 60)}`);
      continue;
    }

    // Determine which packages this commit affects
    let affectedPackages = [];

    if (commit.scope && SCOPE_TO_PKG[commit.scope]) {
      // Explicit scope maps directly to a package
      affectedPackages = [SCOPE_TO_PKG[commit.scope]];
    } else {
      // No scope or unknown scope — check which dirs changed
      const dirs = changedDirs(commit.hash);
      affectedPackages = [...dirs].filter((p) => PKG_TO_DIR[p]);
    }

    if (affectedPackages.length === 0) {
      console.log(`  SKIP (no package): ${commit.subject.slice(0, 60)}`);
      continue;
    }

    // Determine bump level
    let bump = TYPE_TO_BUMP[commit.type] ?? null;
    if (commit.breaking) bump = 'major';
    if (!bump) {
      console.log(`  SKIP (non-bumping type ${commit.type}): ${commit.subject.slice(0, 60)}`);
      continue;
    }

    for (const pkg of affectedPackages) {
      if (!packages[pkg]) packages[pkg] = { bump: 'patch', items: [] };

      // Take highest bump level
      if (BUMP_ORDER[bump] > BUMP_ORDER[packages[pkg].bump]) {
        packages[pkg].bump = bump;
      }

      packages[pkg].items.push(`- ${commit.subject}`);
    }

    console.log(`  ${bump.padEnd(7)} [${affectedPackages.join(', ')}] ${commit.subject.slice(0, 60)}`);
  }

  // ── New packages ──────────────────────────────────────────────────
  // @changesets/cli bumps unpublished packages to 1.0.0 when there's no
  // explicit changeset.  Detect new packages via empty CHANGELOG (just
  // the title line) and generate a patch changeset so they start at the
  // correct semver level instead of 1.0.0.

  for (const [pkg, dir] of Object.entries(PKG_TO_DIR)) {
    if (packages[pkg]) continue; // already covered by a commit

    const changelogPath = join(process.cwd(), dir, 'CHANGELOG.md');
    let changelog = '';
    try {
      changelog = readFileSync(changelogPath, 'utf-8').trim();
    } catch {
      // no CHANGELOG yet — definitely new
    }

    // A CHANGELOG with only the title line (or empty) means unpublished
    const lines = changelog.split('\n').filter((l) => l.trim());
    if (lines.length <= 1) {
      packages[pkg] = {
        bump: 'patch',
        items: ['- Initial release'],
      };
      console.log(`  patch   [${pkg}] unpublished package`);
    }
  }

  // Write changeset files
  if (Object.keys(packages).length === 0) {
    console.log('No package changes detected.');
    return;
  }

  const changesetDir = join(process.cwd(), '.changeset');
  mkdirSync(changesetDir, { recursive: true });

  const timestamp = Date.now();

  for (const [pkg, data] of Object.entries(packages)) {
    const description = data.items.join('\n');
    const content = `---
"${pkg}": ${data.bump}
---

${description}
`;

    const filename = `auto-${pkg.replace('@borapesa/', '')}-${timestamp}.md`;
    writeFileSync(join(changesetDir, filename), content, 'utf-8');
    console.log(`Wrote ${filename} (${data.bump})`);
  }
}

main();
