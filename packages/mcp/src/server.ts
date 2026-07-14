import { readFileSync } from 'node:fs';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { type DocStore, loadDocStore } from './content';
import { EXAMPLES, exampleTopics, getExample } from './examples';
import { getProvider, PROVIDERS } from './providers';
import { buildIndex, search } from './search';

/** Read the package version. Works from src (tests) and dist (published). */
function packageVersion(): string {
  try {
    const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf-8'));
    return pkg.version ?? '0.0.0';
  } catch {
    return '0.0.0';
  }
}

const INSTRUCTIONS = `Bora Pesa is a unified, open-source TypeScript payments SDK for Tanzania.
One factory function, createPesa(), wires a payment provider (Selcom, AzamPay, ClickPesa,
Snippe, or the built-in Bogus test provider), optional plugins (retry, idempotency, logging),
and an event store. Amounts are whole TZS integers. Phone numbers use MSISDN format
(255XXXXXXXXX).

Use these tools when helping someone integrate or debug Bora Pesa:
- search_docs: find relevant documentation pages by keyword
- get_doc: read a full documentation page as markdown
- list_docs: see every available documentation page
- list_providers: compare payment providers at a glance
- get_provider: full config fields and capabilities for one provider
- get_example: copy-paste-ready code for common tasks

Prefer get_example for "how do I do X" questions and search_docs + get_doc for
conceptual or debugging questions. Provider config questions are best answered
with get_provider.`;

export interface CreateServerOptions {
  /** Override the bundled docs directory (mainly for tests). */
  contentDir?: string;
}

/** Build the Bora Pesa MCP server with all tools and resources registered. */
export function createBorapesaMcpServer(options: CreateServerOptions = {}): McpServer {
  const store: DocStore = loadDocStore(options.contentDir);
  const index = buildIndex(store.allDocs());

  const server = new McpServer(
    { name: 'borapesa', version: packageVersion() },
    { instructions: INSTRUCTIONS },
  );

  const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] });
  const errorText = (value: string) => ({
    content: [{ type: 'text' as const, text: value }],
    isError: true,
  });

  server.registerTool(
    'search_docs',
    {
      title: 'Search Bora Pesa docs',
      description:
        'Keyword search across all Bora Pesa documentation (guides and API reference). Returns ranked pages with snippets. Follow up with get_doc to read a full page.',
      inputSchema: {
        query: z.string().describe('Keywords to search for, e.g. "webhook verification"'),
        limit: z.number().int().min(1).max(20).optional().describe('Max results, default 8'),
      },
    },
    async ({ query, limit }) => {
      const results = search(index, query, limit ?? 8);
      if (results.length === 0) {
        return text(
          `No results for "${query}". Try broader keywords, or call list_docs to browse every page.`,
        );
      }
      return text(JSON.stringify({ query, results }, null, 2));
    },
  );

  server.registerTool(
    'get_doc',
    {
      title: 'Read a docs page',
      description:
        'Fetch one Bora Pesa documentation page as markdown. Paths come from search_docs or list_docs, e.g. "getting-started" or "api/pesa/functions/createPesa".',
      inputSchema: {
        path: z.string().describe('Docs path, e.g. "getting-started"'),
      },
    },
    async ({ path }) => {
      try {
        const doc = store.getDoc(path);
        return text(`> Canonical: ${doc.url}\n\n${doc.body}`);
      } catch (error) {
        return errorText(error instanceof Error ? error.message : String(error));
      }
    },
  );

  server.registerTool(
    'list_docs',
    {
      title: 'List all docs pages',
      description:
        'List every Bora Pesa documentation page with its path, title, and description. Guides cover concepts; the api section is the generated API reference.',
      inputSchema: {
        section: z
          .enum(['guides', 'api', 'all'])
          .optional()
          .describe('Filter by section, default "all"'),
      },
    },
    async ({ section }) => {
      const filter = section ?? 'all';
      const entries = store.entries
        .filter((e) => filter === 'all' || e.section === filter)
        .map(({ path, title, description, section: s }) => ({
          path,
          title,
          description,
          section: s,
        }));
      return text(JSON.stringify({ count: entries.length, pages: entries }, null, 2));
    },
  );

  server.registerTool(
    'list_providers',
    {
      title: 'List payment providers',
      description:
        'Compare every Bora Pesa payment provider: package name, status, auth model, and sandbox support. Use get_provider for full config fields.',
      inputSchema: {},
    },
    async () => {
      const providers = PROVIDERS.map((p) => ({
        id: p.id,
        package: p.package,
        className: p.className,
        status: p.status,
        summary: p.summary,
        auth: p.auth,
        sandbox: p.sandbox,
      }));
      return text(JSON.stringify({ providers }, null, 2));
    },
  );

  server.registerTool(
    'get_provider',
    {
      title: 'Get provider details',
      description:
        'Full details for one provider: every config field with required flags, core and optional capabilities, provider-specific methods, and webhook verification notes.',
      inputSchema: {
        id: z.string().describe(`Provider id. One of: ${PROVIDERS.map((p) => p.id).join(', ')}`),
      },
    },
    async ({ id }) => {
      const provider = getProvider(id);
      if (!provider) {
        return errorText(
          `Unknown provider "${id}". Valid ids: ${PROVIDERS.map((p) => p.id).join(', ')}`,
        );
      }
      return text(JSON.stringify(provider, null, 2));
    },
  );

  server.registerTool(
    'get_example',
    {
      title: 'Get a code example',
      description: `Copy-paste-ready TypeScript for a common Bora Pesa task. Topics: ${exampleTopics().join(', ')}`,
      inputSchema: {
        topic: z.string().describe(`One of: ${exampleTopics().join(', ')}`),
      },
    },
    async ({ topic }) => {
      const example = getExample(topic);
      if (!example) {
        return errorText(`Unknown topic "${topic}". Valid topics: ${exampleTopics().join(', ')}`);
      }
      return text(
        `## ${example.title}\n\n${example.description}\n\nFull guide: https://borapesa.dev/docs/${example.docsPath}\n\n\`\`\`ts\n${example.code}\n\`\`\``,
      );
    },
  );

  for (const entry of store.entries) {
    server.registerResource(
      entry.path,
      `borapesa://docs/${entry.path}`,
      {
        title: entry.title,
        description: entry.description,
        mimeType: 'text/markdown',
      },
      async (uri) => ({
        contents: [
          {
            uri: uri.href,
            mimeType: 'text/markdown',
            text: store.getDoc(entry.path).body,
          },
        ],
      }),
    );
  }

  return server;
}

export { EXAMPLES, PROVIDERS };
