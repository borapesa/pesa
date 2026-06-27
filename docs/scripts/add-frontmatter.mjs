import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { extname, join } from 'node:path';

const API_DIR = join(import.meta.dirname, '..', 'content', 'docs', 'api');

function walk(dir) {
  const entries = readdirSync(dir);
  for (const entry of entries) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) {
      walk(path);
    } else if (extname(path) === '.md') {
      const content = readFileSync(path, 'utf-8');
      if (content.startsWith('---')) continue; // already has frontmatter

      const lines = content.split('\n');
      const title = (lines[0] || 'API').replace(/^#+\s*/, '').trim();

      const withFrontmatter = `---\ntitle: "${title}"\n---\n\n${content}`;
      writeFileSync(path, withFrontmatter);
      console.log(`  added frontmatter: ${path.split('/api/')[1]}`);
    }
  }
}

walk(API_DIR);
console.log('done');
