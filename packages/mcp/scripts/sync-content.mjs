/**
 * Build step: copies the documentation source from docs/content/docs into
 * dist/content as plain markdown, plus a manifest.json index.
 *
 * The MCP server ships this snapshot inside the npm package so agents get
 * full docs access offline, versioned with the release.
 *
 * MDX-specific syntax is stripped OUTSIDE code fences only:
 * - frontmatter (title/description move into the manifest and H1)
 * - `import ... from '...'` component imports
 * - <Callout> wrapper tags (inner content is kept)
 */
import { mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const CONTENT_SRC = join(ROOT, '..', '..', '..', 'docs', 'content', 'docs');
const CONTENT_DEST = join(ROOT, '..', 'dist', 'content');

/** Recursively collect .md/.mdx files, sorted for deterministic output. */
function collectFiles(dir, files = []) {
  const entries = readdirSync(dir)
    .filter((e) => !e.startsWith('.'))
    .sort((a, b) => a.localeCompare(b));

  for (const entry of entries) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      collectFiles(full, files);
    } else if (entry.endsWith('.md') || entry.endsWith('.mdx')) {
      files.push(full);
    }
  }
  return files;
}

/** Extract frontmatter fields and return { title, description, body }. */
function parseFrontmatter(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) return { title: '', description: '', body: raw };

  const fm = match[1];
  const titleMatch = fm.match(/^title:\s*"?([^"\n]+)"?\s*$/m);
  const descMatch = fm.match(/^description:\s*"?([^"\n]+)"?\s*$/m);

  return {
    title: titleMatch ? titleMatch[1].trim() : '',
    description: descMatch ? descMatch[1].trim() : '',
    body: raw.slice(match[0].length),
  };
}

/** Strip MDX imports and component wrappers, but never touch code fences. */
function cleanMdx(body) {
  const out = [];
  let inFence = false;

  for (const line of body.split('\n')) {
    if (/^(```|~~~)/.test(line.trim())) {
      inFence = !inFence;
      out.push(line);
      continue;
    }
    if (inFence) {
      out.push(line);
      continue;
    }
    if (/^import\s+.*from\s+['"][^'"]+['"];?\s*$/.test(line)) continue;

    out.push(line.replace(/<Callout[^>]*>/g, '').replace(/<\/Callout>/g, ''));
  }

  return out
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

rmSync(CONTENT_DEST, { recursive: true, force: true });
mkdirSync(CONTENT_DEST, { recursive: true });

const manifest = [];

for (const file of collectFiles(CONTENT_SRC)) {
  const raw = readFileSync(file, 'utf-8');
  const { title, description, body } = parseFrontmatter(raw);

  const relPath = relative(CONTENT_SRC, file)
    .replace(/\\/g, '/')
    .replace(/\.(md|mdx)$/, '');

  const cleaned = cleanMdx(body);
  const heading = title || relPath;
  const descLine = description ? `${description}\n\n` : '';
  const markdown = `# ${heading}\n\n${descLine}${cleaned}\n`;

  const destFile = join(CONTENT_DEST, `${relPath}.md`);
  mkdirSync(dirname(destFile), { recursive: true });
  writeFileSync(destFile, markdown, 'utf-8');

  // Index files collapse to their directory URL: api/pesa/index -> /docs/api/pesa/
  const slug = relPath === 'index' ? '' : relPath.replace(/\/index$/, '');
  manifest.push({
    path: relPath,
    title: heading,
    description,
    section: relPath.startsWith('api/') || relPath === 'api' ? 'api' : 'guides',
    url: slug ? `https://borapesa.dev/docs/${slug}/` : 'https://borapesa.dev/docs/',
  });
}

writeFileSync(
  join(CONTENT_DEST, 'manifest.json'),
  `${JSON.stringify(manifest, null, 2)}\n`,
  'utf-8',
);

console.log(`[sync-content] bundled ${manifest.length} docs pages into dist/content`);
