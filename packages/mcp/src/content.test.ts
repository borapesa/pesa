import { describe, expect, it } from 'vitest';
import { loadDocStore } from './content';

describe('loadDocStore', () => {
  const store = loadDocStore();

  it('loads a non-empty manifest', () => {
    expect(store.entries.length).toBeGreaterThan(10);
    for (const entry of store.entries) {
      expect(entry.path).toBeTruthy();
      expect(entry.title).toBeTruthy();
      expect(['guides', 'api']).toContain(entry.section);
      expect(entry.url).toMatch(/^https:\/\/borapesa\.dev\/docs/);
    }
  });

  it('has unique paths', () => {
    const paths = store.entries.map((e) => e.path);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it('includes the core guide pages', () => {
    const paths = store.entries.map((e) => e.path);
    for (const expected of ['getting-started', 'architecture', 'providers', 'events', 'errors']) {
      expect(paths).toContain(expected);
    }
  });

  it('loads a page body with the title as H1', () => {
    const doc = store.getDoc('getting-started');
    expect(doc.body).toMatch(/^# Getting Started/);
    expect(doc.body).toContain('createPesa');
  });

  it('strips MDX imports outside code fences but keeps them inside', () => {
    const doc = store.getDoc('getting-started');
    expect(doc.body).not.toContain("from 'fumadocs-ui/components/callout'");
    expect(doc.body).toContain("import { createPesa } from '@borapesa/pesa';");
  });

  it('resolves directory paths to their index page', () => {
    const viaIndex = store.getDoc('api/pesa/index');
    const viaDir = store.getDoc('api/pesa');
    expect(viaDir.path).toBe(viaIndex.path);
  });

  it('normalizes leading/trailing slashes and extensions', () => {
    expect(store.getDoc('/getting-started/').path).toBe('getting-started');
    expect(store.getDoc('getting-started.mdx').path).toBe('getting-started');
  });

  it('rejects unknown and traversal-style paths', () => {
    expect(() => store.getDoc('nope-not-real')).toThrow(/Unknown docs path/);
    expect(() => store.getDoc('../../package.json')).toThrow(/Unknown docs path/);
    expect(() => store.getDoc('..%2F..%2Fetc/passwd')).toThrow(/Unknown docs path/);
  });

  it('caches loaded docs', () => {
    const first = store.getDoc('errors');
    const second = store.getDoc('errors');
    expect(first).toBe(second);
  });

  it('throws a helpful error when content is missing', () => {
    expect(() => loadDocStore('/definitely/not/here')).toThrow(/content not found/i);
  });
});
