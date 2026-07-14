/**
 * Bundles the MCP server into a single Node-runnable ESM file.
 *
 * The repo convention is extensionless relative imports, which plain tsc
 * output cannot resolve under Node ESM. Bundling with esbuild fixes that.
 * Bare imports (the MCP SDK, zod) stay external and resolve from
 * node_modules at runtime.
 */
import { chmodSync } from 'node:fs';
import { build } from 'esbuild';

await build({
  entryPoints: ['src/bin.ts'],
  outfile: 'dist/bin.js',
  bundle: true,
  packages: 'external',
  platform: 'node',
  format: 'esm',
  target: 'node18',
  banner: { js: '#!/usr/bin/env node' },
});

chmodSync('dist/bin.js', 0o755);

console.log('[bundle] wrote dist/bin.js');
