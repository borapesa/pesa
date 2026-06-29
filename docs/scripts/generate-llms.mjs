/**
 * Postbuild: writes llms.txt, llms-full.txt, and per-page markdown files
 * to out/ by walking the content directory.
 * No runtime imports — reads filesystem directly.
 */
import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const OUT_DIR = join(import.meta.dirname, '..', 'out');
const PUBLIC_DIR = join(import.meta.dirname, '..', 'public');
const CONTENT_DIR = join(import.meta.dirname, '..', 'content', 'docs');

function walk(dir, depth = 0, items = []) {
  const entries = readdirSync(dir).filter(
    (e) => !e.startsWith('.') && e !== 'meta.json',
  );

  entries.sort((a, b) => {
    const aIsDir = statSync(join(dir, a)).isDirectory();
    const bIsDir = statSync(join(dir, b)).isDirectory();
    if (aIsDir && !bIsDir) return -1;
    if (!aIsDir && bIsDir) return 1;
    return a.localeCompare(b);
  });

  let output = '';
  for (const entry of entries) {
    const full = join(dir, entry);
    const stat = statSync(full);

    if (stat.isDirectory()) {
      output += `${'  '.repeat(depth)}- ${entry}\n`;
      output += walk(full, depth + 1, items);
    } else if (entry.endsWith('.md') || entry.endsWith('.mdx')) {
      if ((entry === 'index.md' || entry === 'index.mdx') && depth > 0) continue;
      const content = readFileSync(full, 'utf-8');
      const titleMatch =
        content.match(/^title:\s*"?([^"\n]+)"?/m) || content.match(/^#\s+(.+)/m);
      const title = titleMatch ? titleMatch[1].trim() : entry;
      const relPath = relative(CONTENT_DIR, full)
        .replace(/\\/g, '/')
        .replace(/\.(md|mdx)$/, '');
      output += `${'  '.repeat(depth)}- [${title}](/docs/${relPath})\n`;

      // Collect for per-file markdown output
      items.push({ relPath, content, title });
    }
  }
  return output;
}

// ── Per-page markdown files ──────────────────────────────────────
const markdownItems = [];
const treeContent = `# Docs\n\n${walk(CONTENT_DIR, 0, markdownItems)}`;

// Write per-page markdown to public/llms/ (served in dev + prod)
// Use .md extension (flat files, no trailing slash conflicts)
for (const item of markdownItems) {
  const pubPath = join(PUBLIC_DIR, 'llms', item.relPath);
  mkdirSync(pubPath, { recursive: true });
  const bodyOnly = item.content.replace(/^---[\s\S]*?---\n/, '');
  const md = `# ${item.title}\n\n${bodyOnly}`;
  writeFileSync(join(pubPath, 'index.md'), md, 'utf-8');
}
console.log(`[generate-llms] wrote ${markdownItems.length} per-page markdown files`);

// ── llms-full.txt ────────────────────────────────────────────────
const fullContent = markdownItems
  .map((item) => {
    const bodyOnly = item.content.replace(/^---[\s\S]*?---\n/, '');
    return `# ${item.title}\n\n${bodyOnly}`;
  })
  .join('\n\n---\n\n');
writeFileSync(join(OUT_DIR, 'llms-full.txt'), fullContent, 'utf-8');
writeFileSync(join(PUBLIC_DIR, 'llms-full.txt'), fullContent, 'utf-8');
console.log('[generate-llms] wrote out/llms-full.txt');

// ── llms.txt ─────────────────────────────────────────────────────
writeFileSync(join(OUT_DIR, 'llms.txt'), treeContent, 'utf-8');
writeFileSync(join(PUBLIC_DIR, 'llms.txt'), treeContent, 'utf-8');
console.log('[generate-llms] wrote out/llms.txt');
