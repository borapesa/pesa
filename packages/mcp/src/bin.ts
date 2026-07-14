import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createBorapesaMcpServer } from './server';

// stdout carries the MCP protocol; anything human-readable goes to stderr.
try {
  const server = createBorapesaMcpServer();
  await server.connect(new StdioServerTransport());
  console.error('[borapesa-mcp] server running on stdio');
} catch (error) {
  console.error('[borapesa-mcp] failed to start:', error instanceof Error ? error.message : error);
  process.exit(1);
}
