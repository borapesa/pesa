import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { beforeAll, describe, expect, it } from 'vitest';
import { createBorapesaMcpServer } from './server';

function firstText(result: unknown): string {
  const content = (result as { content?: Array<{ type: string; text?: string }> }).content ?? [];
  const block = content.find((c) => c.type === 'text');
  expect(block?.text).toBeTruthy();
  return block?.text ?? '';
}

describe('borapesa MCP server (end to end over in-memory transport)', () => {
  let client: Client;

  beforeAll(async () => {
    const server = createBorapesaMcpServer();
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    client = new Client({ name: 'test-client', version: '0.0.0' });
    await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);
  });

  it('exposes the expected tools', async () => {
    const { tools } = await client.listTools();
    const names = tools.map((t) => t.name).sort();
    expect(names).toEqual([
      'get_doc',
      'get_example',
      'get_provider',
      'list_docs',
      'list_providers',
      'search_docs',
    ]);
  });

  it('search_docs returns ranked results', async () => {
    const result = await client.callTool({
      name: 'search_docs',
      arguments: { query: 'webhook', limit: 5 },
    });
    const parsed = JSON.parse(firstText(result));
    expect(parsed.results.length).toBeGreaterThan(0);
    expect(parsed.results.length).toBeLessThanOrEqual(5);
    expect(parsed.results[0]).toHaveProperty('path');
    expect(parsed.results[0]).toHaveProperty('snippet');
  });

  it('search_docs handles zero matches gracefully', async () => {
    const result = await client.callTool({
      name: 'search_docs',
      arguments: { query: 'xyzzynotaword' },
    });
    expect(firstText(result)).toContain('No results');
  });

  it('get_doc returns page markdown with a canonical URL', async () => {
    const result = await client.callTool({
      name: 'get_doc',
      arguments: { path: 'getting-started' },
    });
    const text = firstText(result);
    expect(text).toContain('> Canonical: https://borapesa.dev/docs/getting-started');
    expect(text).toContain('# Getting Started');
  });

  it('get_doc flags unknown paths as errors', async () => {
    const result = await client.callTool({
      name: 'get_doc',
      arguments: { path: 'not/a/page' },
    });
    expect(result.isError).toBe(true);
    expect(firstText(result)).toContain('Unknown docs path');
  });

  it('list_docs filters by section', async () => {
    const result = await client.callTool({
      name: 'list_docs',
      arguments: { section: 'guides' },
    });
    const parsed = JSON.parse(firstText(result));
    expect(parsed.count).toBeGreaterThan(5);
    for (const page of parsed.pages) {
      expect(page.section).toBe('guides');
    }
  });

  it('list_providers summarizes the registry', async () => {
    const result = await client.callTool({ name: 'list_providers', arguments: {} });
    const parsed = JSON.parse(firstText(result));
    const ids = parsed.providers.map((p: { id: string }) => p.id);
    expect(ids).toContain('selcom');
    expect(ids).toContain('bogus');
  });

  it('get_provider returns config fields', async () => {
    const result = await client.callTool({
      name: 'get_provider',
      arguments: { id: 'clickpesa' },
    });
    const parsed = JSON.parse(firstText(result));
    expect(parsed.package).toBe('@borapesa/clickpesa');
    expect(parsed.configFields.map((f: { name: string }) => f.name)).toContain('checksumKey');
  });

  it('get_provider flags unknown ids as errors', async () => {
    const result = await client.callTool({ name: 'get_provider', arguments: { id: 'stripe' } });
    expect(result.isError).toBe(true);
    expect(firstText(result)).toContain('Valid ids');
  });

  it('get_example returns fenced TypeScript', async () => {
    const result = await client.callTool({
      name: 'get_example',
      arguments: { topic: 'quickstart' },
    });
    const text = firstText(result);
    expect(text).toContain('```ts');
    expect(text).toContain('createPesa');
    expect(text).toContain('https://borapesa.dev/docs/');
  });

  it('get_example flags unknown topics as errors', async () => {
    const result = await client.callTool({
      name: 'get_example',
      arguments: { topic: 'blockchain' },
    });
    expect(result.isError).toBe(true);
    expect(firstText(result)).toContain('Valid topics');
  });

  it('exposes every docs page as a resource', async () => {
    const { resources } = await client.listResources();
    expect(resources.length).toBeGreaterThan(10);
    const uris = resources.map((r) => r.uri);
    expect(uris).toContain('borapesa://docs/getting-started');

    const read = await client.readResource({ uri: 'borapesa://docs/getting-started' });
    const first = read.contents[0] as { mimeType?: string; text?: string };
    expect(first.mimeType).toBe('text/markdown');
    expect(first.text).toContain('# Getting Started');
  });
});
