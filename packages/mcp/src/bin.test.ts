import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const BIN_PATH = fileURLToPath(new URL('../dist/bin.js', import.meta.url));

/**
 * Smoke test for the esbuild bundle: spawns the real dist/bin.js as a child
 * process and drives it over actual stdio. Catches bundling regressions
 * (unresolved imports, broken shebang/banner, content dir resolution) that
 * the in-memory server tests cannot see.
 *
 * The test script runs scripts/bundle.mjs before vitest, so dist/bin.js
 * always reflects the current source.
 */
describe('bundled bin (smoke test over real stdio)', () => {
  let client: Client;

  beforeAll(async () => {
    client = new Client({ name: 'bin-smoke', version: '0.0.0' });
    await client.connect(new StdioClientTransport({ command: process.execPath, args: [BIN_PATH] }));
  }, 20_000);

  afterAll(async () => {
    await client.close();
  });

  it('spawns, completes the initialize handshake, and reports server info', () => {
    const serverInfo = client.getServerVersion();
    expect(serverInfo?.name).toBe('borapesa');
    expect(serverInfo?.version).toMatch(/^\d+\.\d+\.\d+/);
  });

  it('serves tools end to end from the bundle', async () => {
    const { tools } = await client.listTools();
    expect(tools.map((t) => t.name)).toContain('search_docs');

    const result = await client.callTool({
      name: 'get_example',
      arguments: { topic: 'quickstart' },
    });
    const content = (result as { content?: Array<{ type: string; text?: string }> }).content ?? [];
    expect(content[0]?.text).toContain('createPesa');
  });

  it('resolves the bundled content directory next to the bundle', async () => {
    const result = await client.callTool({
      name: 'get_doc',
      arguments: { path: 'getting-started' },
    });
    const content = (result as { content?: Array<{ type: string; text?: string }> }).content ?? [];
    expect(content[0]?.text).toContain('# Getting Started');
  });
});
