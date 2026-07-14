import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

/** One entry in the bundled docs manifest. */
export interface DocEntry {
  /** Slug relative to the docs root, e.g. `getting-started` or `api/pesa/index`. */
  path: string;
  title: string;
  description: string;
  section: 'guides' | 'api';
  /** Canonical page URL on borapesa.dev. */
  url: string;
}

/** A fully loaded docs page. */
export interface Doc extends DocEntry {
  body: string;
}

export interface DocStore {
  entries: DocEntry[];
  /** Load a single page by manifest path. Throws on unknown paths. */
  getDoc(path: string): Doc;
  /** Load every page (cached after first call). */
  allDocs(): Doc[];
}

/**
 * Locate the bundled content directory.
 *
 * - `dist/bin.js` (published build): `./content` next to the bundle
 * - `src/*.ts` (tests, dev): `../dist/content`, produced by sync-content.mjs
 * - `BORAPESA_MCP_CONTENT_DIR`: explicit override, checked first
 */
export function resolveContentDir(override?: string): string {
  const explicit = override ?? process.env.BORAPESA_MCP_CONTENT_DIR;
  if (explicit) {
    if (existsSync(join(explicit, 'manifest.json'))) return explicit;
    throw new Error(`Bundled docs content not found in "${explicit}" (no manifest.json).`);
  }

  const candidates = [
    fileURLToPath(new URL('./content', import.meta.url)),
    fileURLToPath(new URL('../dist/content', import.meta.url)),
  ];
  for (const candidate of candidates) {
    if (existsSync(join(candidate, 'manifest.json'))) return candidate;
  }

  throw new Error(
    'Bundled docs content not found. Run "pnpm --filter @borapesa/mcp sync-content" first. ' +
      `Checked: ${candidates.join(', ')}`,
  );
}

/** Load the docs manifest and expose lazy page access. */
export function loadDocStore(contentDir?: string): DocStore {
  const dir = resolveContentDir(contentDir);
  const entries: DocEntry[] = JSON.parse(readFileSync(join(dir, 'manifest.json'), 'utf-8'));
  const byPath = new Map(entries.map((e) => [e.path, e]));
  const cache = new Map<string, Doc>();

  function getDoc(path: string): Doc {
    const normalized = path.replace(/^\/+|\/+$/g, '').replace(/\.mdx?$/, '');
    const entry = byPath.get(normalized) ?? byPath.get(`${normalized}/index`);
    if (!entry) {
      throw new Error(
        `Unknown docs path: "${path}". Use list_docs or search_docs to find valid paths.`,
      );
    }

    const cached = cache.get(entry.path);
    if (cached) return cached;

    // Read strictly by manifest entry, never by caller-supplied path, so
    // model input can never escape the content directory.
    const body = readFileSync(join(dir, `${entry.path}.md`), 'utf-8');
    const doc: Doc = { ...entry, body };
    cache.set(entry.path, doc);
    return doc;
  }

  return {
    entries,
    getDoc,
    allDocs: () => entries.map((e) => getDoc(e.path)),
  };
}
