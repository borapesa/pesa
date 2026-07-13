import type { Doc } from './content';

export interface SearchResult {
  path: string;
  title: string;
  description: string;
  url: string;
  score: number;
  snippet: string;
}

interface IndexedDoc {
  doc: Doc;
  titleTokens: Set<string>;
  headingTokens: Set<string>;
  pathTokens: Set<string>;
  bodyFrequency: Map<string, number>;
  lowerBody: string;
}

export interface SearchIndex {
  docs: IndexedDoc[];
}

/**
 * Lowercase alphanumeric tokens, minimum two characters.
 *
 * Trailing-s stemming (webhooks -> webhook) is applied identically to the
 * index and the query, so plural and singular forms always match. Stems are
 * prefixes of the original word, which keeps snippet lookup working.
 */
export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .map((t) => (t.length > 3 && t.endsWith('s') && !t.endsWith('ss') ? t.slice(0, -1) : t))
    .filter((t) => t.length >= 2);
}

function extractHeadings(body: string): string {
  return body
    .split('\n')
    .filter((line) => /^#{1,4}\s/.test(line))
    .join(' ');
}

export function buildIndex(docs: Doc[]): SearchIndex {
  return {
    docs: docs.map((doc) => {
      const bodyFrequency = new Map<string, number>();
      for (const token of tokenize(doc.body)) {
        bodyFrequency.set(token, (bodyFrequency.get(token) ?? 0) + 1);
      }
      return {
        doc,
        titleTokens: new Set(tokenize(`${doc.title} ${doc.description}`)),
        headingTokens: new Set(tokenize(extractHeadings(doc.body))),
        pathTokens: new Set(tokenize(doc.path)),
        bodyFrequency,
        lowerBody: doc.body.toLowerCase(),
      };
    }),
  };
}

/** Collapse whitespace and pull a window of text around the first match. */
function makeSnippet(body: string, lowerBody: string, query: string, tokens: string[]): string {
  const lowerQuery = query.trim().toLowerCase();
  let at = lowerQuery.length >= 3 ? lowerBody.indexOf(lowerQuery) : -1;

  if (at < 0) {
    for (const token of tokens) {
      const idx = lowerBody.indexOf(token);
      if (idx >= 0 && (at < 0 || idx < at)) at = idx;
    }
  }
  if (at < 0) at = 0;

  const start = Math.max(0, at - 80);
  const end = Math.min(body.length, at + 180);
  const window = body.slice(start, end).replace(/\s+/g, ' ').trim();

  const prefix = start > 0 ? '...' : '';
  const suffix = end < body.length ? '...' : '';
  return `${prefix}${window}${suffix}`;
}

/**
 * Rank docs against a keyword query.
 *
 * Weights: title/description hits dominate, then headings and the page
 * path, then body term frequency. Guides outrank generated API reference
 * pages at equal score so agents land on conceptual pages first.
 */
export function search(index: SearchIndex, query: string, limit = 8): SearchResult[] {
  const tokens = tokenize(query);
  if (tokens.length === 0) return [];

  const lowerQuery = query.trim().toLowerCase();
  const results: SearchResult[] = [];

  for (const {
    doc,
    titleTokens,
    headingTokens,
    pathTokens,
    bodyFrequency,
    lowerBody,
  } of index.docs) {
    let score = 0;

    for (const token of tokens) {
      if (titleTokens.has(token)) score += 8;
      if (headingTokens.has(token)) score += 3;
      if (pathTokens.has(token)) score += 2;
      score += Math.min(bodyFrequency.get(token) ?? 0, 5);
    }

    if (tokens.length >= 2 && lowerBody.includes(lowerQuery)) score += 6;
    if (score === 0) continue;

    if (doc.section === 'guides') score *= 1.15;

    results.push({
      path: doc.path,
      title: doc.title,
      description: doc.description,
      url: doc.url,
      score: Math.round(score * 100) / 100,
      snippet: makeSnippet(doc.body, lowerBody, query, tokens),
    });
  }

  return results.sort((a, b) => b.score - a.score || a.path.localeCompare(b.path)).slice(0, limit);
}
