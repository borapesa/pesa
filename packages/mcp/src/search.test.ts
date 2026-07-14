import { describe, expect, it } from 'vitest';
import type { Doc } from './content';
import { buildIndex, search, tokenize } from './search';

function doc(partial: Partial<Doc> & { path: string }): Doc {
  return {
    title: partial.path,
    description: '',
    section: 'guides',
    url: `https://borapesa.dev/docs/${partial.path}`,
    body: '',
    ...partial,
  };
}

describe('tokenize', () => {
  it('lowercases and splits on non-alphanumerics', () => {
    expect(tokenize('Webhook-Verification (HMAC)!')).toEqual(['webhook', 'verification', 'hmac']);
  });

  it('drops single-character fragments', () => {
    expect(tokenize('a B cc')).toEqual(['cc']);
  });

  it('keeps digits', () => {
    expect(tokenize('TZS 15000')).toEqual(['tzs', '15000']);
  });

  it('stems plurals so singular queries match plural headings', () => {
    expect(tokenize('webhooks')).toEqual(['webhook']);
    expect(tokenize('plugins events')).toEqual(['plugin', 'event']);
    expect(tokenize('class address')).toEqual(['class', 'address']);
  });
});

describe('search', () => {
  const docs: Doc[] = [
    doc({
      path: 'events',
      title: 'Event System',
      description: 'Webhooks, persistence, and event handlers.',
      body: '## Webhooks\n\nEvery webhook is verified then persisted. webhook webhook webhook',
    }),
    doc({
      path: 'plugins',
      title: 'Plugins',
      description: 'Retry, idempotency, logging.',
      body: 'Plugins compose in order. A webhook mention.',
    }),
    doc({
      path: 'api/pesa/interfaces/PaymentEvent',
      title: 'PaymentEvent',
      description: '',
      section: 'api',
      body: 'Emitted after every verified webhook. webhook webhook webhook webhook',
    }),
  ];
  const index = buildIndex(docs);

  it('returns empty for empty queries', () => {
    expect(search(index, '')).toEqual([]);
    expect(search(index, '!!')).toEqual([]);
  });

  it('ranks title/description matches above body-only matches', () => {
    const results = search(index, 'webhook');
    expect(results[0]?.path).toBe('events');
  });

  it('prefers guides over api pages at similar relevance', () => {
    const results = search(index, 'webhook');
    const eventsRank = results.findIndex((r) => r.path === 'events');
    const apiRank = results.findIndex((r) => r.path === 'api/pesa/interfaces/PaymentEvent');
    expect(eventsRank).toBeLessThan(apiRank);
  });

  it('excludes docs with no matching token', () => {
    const results = search(index, 'idempotency');
    expect(results.map((r) => r.path)).toEqual(['plugins']);
  });

  it('respects the limit', () => {
    expect(search(index, 'webhook', 2)).toHaveLength(2);
  });

  it('includes a snippet around the first match', () => {
    const results = search(index, 'persisted');
    expect(results[0]?.snippet).toContain('persisted');
  });

  it('applies a phrase bonus for multi-word queries', () => {
    const withPhrase = doc({
      path: 'a',
      title: 'A',
      body: 'event handlers run after persistence',
    });
    const withoutPhrase = doc({
      path: 'b',
      title: 'B',
      body: 'handlers exist. event things happen. handlers again. event again.',
    });
    const idx = buildIndex([withPhrase, withoutPhrase]);
    const results = search(idx, 'event handlers');
    expect(results[0]?.path).toBe('a');
  });

  it('searches the real bundled docs sensibly', async () => {
    const { loadDocStore } = await import('./content');
    const store = loadDocStore();
    const idx = buildIndex(store.allDocs());

    const webhook = search(idx, 'mount webhook handler');
    expect(webhook.length).toBeGreaterThan(0);
    expect(webhook.slice(0, 3).map((r) => r.path)).toContain('integrations');

    const errors = search(idx, 'error hierarchy retry');
    expect(errors.slice(0, 3).map((r) => r.path)).toContain('errors');
  });
});
