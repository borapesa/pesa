/**
 * Postbuild: writes llms.txt to out/ by walking the content directory.
 * No runtime imports — reads filesystem directly.
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const OUT_DIR = join(import.meta.dirname, '..', 'out');
const CONTENT_DIR = join(import.meta.dirname, '..', 'content', 'docs');
function walk(dir, depth = 0) {
  let output = '';
  const entries = readdirSync(dir).filter(
    (e) => !e.startsWith('.') && e !== 'meta.json',
  );

  // Sort: directories first, then files alphabetically
  entries.sort((a, b) => {
    const aIsDir = statSync(join(dir, a)).isDirectory();
    const bIsDir = statSync(join(dir, b)).isDirectory();
    if (aIsDir && !bIsDir) return -1;
    if (!aIsDir && bIsDir) return 1;
    return a.localeCompare(b);
  });

  for (const entry of entries) {
    const full = join(dir, entry);
    const stat = statSync(full);

    if (stat.isDirectory()) {
      output += `${'  '.repeat(depth)}- ${entry}\n`;
      output += walk(full, depth + 1);
    } else if (entry.endsWith('.md') || entry.endsWith('.mdx')) {
      if (entry === 'index.md' || entry === 'index.mdx') continue; // skip index pages
      const content = readFileSync(full, 'utf-8');
      const titleMatch =
        content.match(/^title:\s*"?([^"\n]+)"?/m) ||
        content.match(/^#\s+(.+)/m);
      const title = titleMatch ? titleMatch[1].trim() : entry;
      const relPath = relative(CONTENT_DIR, full)
        .replace(/\\/g, '/')
        .replace(/\.(md|mdx)$/, '');
      output += `${'  '.repeat(depth)}- [${title}](/docs/${relPath})\n`;
    }
  }

  return output;
}

const content = `# Docs\n\n${walk(CONTENT_DIR)}`;
writeFileSync(join(OUT_DIR, 'llms.txt'), content, 'utf-8');
console.log('[generate-llms] wrote out/llms.txt');
