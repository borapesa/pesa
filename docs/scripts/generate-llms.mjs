/**
 * Postbuild: writes llms.txt, llms-full.txt, sitemap.xml, and per-page
 * markdown files to out/ by walking the content directory.
 * No runtime imports — reads filesystem directly.
 *
 * llms.txt follows the llmstxt.org convention: an H1, a blockquote summary,
 * then curated link sections. Every link points at the absolute markdown
 * URL so agents can fetch pages directly without HTML parsing.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const SITE_URL = 'https://borapesa.dev';
const OUT_DIR = join(import.meta.dirname, '..', 'out');
const PUBLIC_DIR = join(import.meta.dirname, '..', 'public');
const CONTENT_DIR = join(import.meta.dirname, '..', 'content', 'docs');

// ── Collect pages ────────────────────────────────────────────────
function collect(dir, items = []) {
  const entries = readdirSync(dir)
    .filter((e) => !e.startsWith('.') && e !== 'meta.json')
    .sort((a, b) => a.localeCompare(b));

  for (const entry of entries) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      collect(full, items);
    } else if (entry.endsWith('.md') || entry.endsWith('.mdx')) {
      const content = readFileSync(full, 'utf-8');
      const titleMatch = content.match(/^title:\s*"?([^"\n]+)"?/m) || content.match(/^#\s+(.+)/m);
      const title = titleMatch ? titleMatch[1].trim() : entry;
      const descMatch = content.match(/^description:\s*"?([^"\n]+)"?/m);
      const description = descMatch ? descMatch[1].trim() : '';
      const relPath = relative(CONTENT_DIR, full)
        .replace(/\\/g, '/')
        .replace(/\.(md|mdx)$/, '');
      items.push({ relPath, content, title, description, mtime: statSync(full).mtime });
    }
  }
  return items;
}

/** Order guide pages by the sidebar order in meta.json, then everything else. */
function sortItems(items) {
  const metaPath = join(CONTENT_DIR, 'meta.json');
  let order = [];
  if (existsSync(metaPath)) {
    try {
      order = JSON.parse(readFileSync(metaPath, 'utf-8')).pages ?? [];
    } catch {
      order = [];
    }
  }
  const rank = (item) => {
    const top = item.relPath.split('/')[0];
    const idx = order.indexOf(top === 'index' ? 'index' : top);
    return idx === -1 ? order.length : idx;
  };
  return [...items].sort((a, b) => rank(a) - rank(b) || a.relPath.localeCompare(b.relPath));
}

// ── Markdown cleanup ─────────────────────────────────────────────
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

const bodyOnly = (item) => cleanMdx(item.content.replace(/^---[\s\S]*?---\n/, ''));
const descLine = (item) => (item.description ? `${item.description}\n\n` : '');
const markdown = (item) => `# ${item.title}\n\n${descLine(item)}${bodyOnly(item)}\n`;

const markdownItems = sortItems(collect(CONTENT_DIR));

// ── Per-page markdown files ──────────────────────────────────────
// Write per-page markdown to public/ (dev) + out/ (Cloudflare Pages production).
// public/ is copied to out/ by next build BEFORE postbuild runs, so we must
// write to out/ directly for the markdown files to be served in production.
for (const item of markdownItems) {
  const pubPath = join(PUBLIC_DIR, 'llms', item.relPath);
  const outPath = join(OUT_DIR, 'llms', item.relPath);
  mkdirSync(pubPath, { recursive: true });
  mkdirSync(outPath, { recursive: true });
  const md = markdown(item);
  writeFileSync(join(pubPath, 'index.md'), md, 'utf-8');
  writeFileSync(join(outPath, 'index.md'), md, 'utf-8');
}
console.log(`[generate-llms] wrote ${markdownItems.length} per-page markdown files`);

// ── llms-full.txt ────────────────────────────────────────────────
const fullContent = markdownItems.map((item) => markdown(item).trim()).join('\n\n---\n\n');

// ── llms.txt ─────────────────────────────────────────────────────
const mdUrl = (item) => `${SITE_URL}/llms/${item.relPath}/index.md`;
const linkLine = (item) =>
  `- [${item.title}](${mdUrl(item)})${item.description ? `: ${item.description}` : ''}`;

const guides = markdownItems.filter((i) => !i.relPath.startsWith('api/') && i.relPath !== 'api');
const apiPages = markdownItems.filter((i) => i.relPath.startsWith('api/') || i.relPath === 'api');

const llmsTxt = `# Bora Pesa

> A unified, open-source TypeScript payments SDK for Tanzania. One factory function, createPesa(), wires a payment provider (Selcom, AzamPay, ClickPesa, Snippe, or a built-in test provider), optional plugins (retry, idempotency, logging), and an event store behind a single consistent interface.

Key conventions: amounts are whole TZS integers (15000 = TZS 15,000, never floats), phone numbers use MSISDN format (255XXXXXXXXX), and all provider API calls happen server-side. Packages are published under the @borapesa npm scope.

Every documentation page is available as plain markdown at ${SITE_URL}/llms/<path>/index.md. AI agents can also install the MCP server: npx -y @borapesa/mcp

## Documentation

${guides.map(linkLine).join('\n')}

## API Reference

${apiPages.map(linkLine).join('\n')}

## Optional

- [llms-full.txt](${SITE_URL}/llms-full.txt): the entire documentation in a single file
- [AI tools guide](${SITE_URL}/docs/ai-tools/): MCP server setup for Claude Code, Cursor, VS Code, and Windsurf
- [GitHub repository](https://github.com/borapesa/pesa)
`;

// ── sitemap.xml ──────────────────────────────────────────────────
// Index files collapse to their directory URL: api/pesa/index -> /docs/api/pesa/
const pageUrl = (item) => {
  const slug = item.relPath === 'index' ? '' : item.relPath.replace(/\/index$/, '');
  return slug ? `${SITE_URL}/docs/${slug}/` : `${SITE_URL}/docs/`;
};
const newestMtime = new Date(Math.max(...markdownItems.map((i) => i.mtime.getTime())));
const urlEntries = [
  { loc: `${SITE_URL}/`, mtime: newestMtime },
  ...markdownItems.map((item) => ({ loc: pageUrl(item), mtime: item.mtime })),
];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries
  .map(
    (u) =>
      `  <url><loc>${u.loc}</loc><lastmod>${u.mtime.toISOString().slice(0, 10)}</lastmod></url>`,
  )
  .join('\n')}
</urlset>
`;

// ── Write shared outputs ─────────────────────────────────────────
mkdirSync(OUT_DIR, { recursive: true });
for (const [name, data] of [
  ['llms-full.txt', fullContent],
  ['llms.txt', llmsTxt],
  ['sitemap.xml', sitemap],
]) {
  writeFileSync(join(OUT_DIR, name), data, 'utf-8');
  writeFileSync(join(PUBLIC_DIR, name), data, 'utf-8');
  console.log(`[generate-llms] wrote out/${name}`);
}
