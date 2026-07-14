import { describe, expect, it } from 'vitest';
import { EXAMPLES, exampleTopics, getExample } from './examples';

describe('examples', () => {
  it('has unique topics', () => {
    const topics = exampleTopics();
    expect(new Set(topics).size).toBe(topics.length);
    expect(topics.length).toBeGreaterThanOrEqual(10);
  });

  it('every example has non-empty fields', () => {
    for (const example of EXAMPLES) {
      expect(example.title).toBeTruthy();
      expect(example.description).toBeTruthy();
      expect(example.docsPath).toBeTruthy();
      expect(example.code.trim().length).toBeGreaterThan(20);
    }
  });

  it('does not reference APIs that no longer exist', () => {
    for (const example of EXAMPLES) {
      // The webhooks.secret config block was removed from PesaConfig.
      expect(example.code).not.toMatch(/webhooks:\s*\{/);
      expect(example.code).not.toContain('BORAPESA_WEBHOOK_SECRET');
    }
  });

  it('uses MSISDN phone numbers and integer amounts in snippets', () => {
    for (const example of EXAMPLES) {
      const phones = example.code.match(/phone:\s*'([^']+)'/g) ?? [];
      for (const phone of phones) {
        expect(phone).toMatch(/'255\d{9}'/);
      }
      expect(example.code).not.toMatch(/amount:\s*\d+\.\d+/);
    }
  });

  it('covers the essential integration topics', () => {
    const topics = exampleTopics();
    for (const expected of [
      'quickstart',
      'create-order',
      'webhook-mount',
      'events',
      'disburse',
      'error-handling',
      'testing',
    ]) {
      expect(topics).toContain(expected);
    }
  });

  it('looks up topics case-insensitively', () => {
    expect(getExample('QUICKSTART')?.topic).toBe('quickstart');
    expect(getExample('nope')).toBeUndefined();
  });
});
