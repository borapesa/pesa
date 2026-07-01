import { readdirSync, readFileSync, renameSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { extname, join } from 'node:path'

const API_DIR = join(import.meta.dirname, '..', 'content', 'docs', 'api')

// ── Package config — add new packages here ──────────────────────
const PACKAGES = [
  {
    dir: 'packages/pesa/src',
    name: '@borapesa/pesa',
    desc: 'Core — types, factory, event store, plugins',
  },
  {
    dir: 'providers/azampay/src',
    name: '@borapesa/azampay',
    desc: 'AzamPay provider adapter',
  },
  {
    dir: 'providers/clickpesa/src',
    name: '@borapesa/clickpesa',
    desc: 'ClickPesa provider adapter',
  },
  {
    dir: 'providers/selcom/src',
    name: '@borapesa/selcom',
    desc: 'Selcom provider adapter',
  },
  {
    dir: 'providers/snippe/src',
    name: '@borapesa/snippe',
    desc: 'Snippe provider adapter',
  },
  {
    dir: 'adapters/sqlite/src',
    name: '@borapesa/sqlite',
    desc: 'SQLite event store adapter',
  },
  {
    dir: 'packages/devtools/src',
    name: '@borapesa/devtools',
    desc: 'Developer tools — cloudflared tunnel, webhook dev utilities',
  },
]

// ── Step 1: Flatten directory structure ─────────────────────────

for (const pkg of PACKAGES) {
  const oldDir = join(API_DIR, pkg.dir)
  const newDir = join(API_DIR, slugify(pkg.name))
  try {
    if (statSync(oldDir).isDirectory()) {
      try {
        rmSync(newDir, { recursive: true })
      } catch {}
      renameSync(oldDir, newDir)
      console.log(`  ${pkg.dir} → ${slugify(pkg.name)}`)
    }
  } catch {
    /* skip */
  }
}

// Clean up empty parent dirs
for (const dir of ['packages', 'providers', 'adapters']) {
  try {
    rmSync(join(API_DIR, dir), { recursive: true })
  } catch {}
}

// ── Step 2: Fix links and titles ─────────────────────────────────

function processFile(path) {
  let content = readFileSync(path, 'utf-8')
  if (content.startsWith('---')) return

  // Fix cross-package links using the PACKAGES config
  for (const pkg of PACKAGES) {
    const name = slugify(pkg.name)
    // Relative links from other packages
    content = content.replace(new RegExp(`\\]\\(\\.\\./${pkg.dir.replace(/\//g, '\\/')}/`, 'g'), `](../${name}/`)
    // Absolute-ish links within same directory
    content = content.replace(new RegExp(`\\]\\(${pkg.dir.replace(/\//g, '\\/')}/`, 'g'), `](${name}/`)
    // Index page titles
    content = content.replace(`title: "${pkg.dir}"`, `title: "${pkg.name}"`)
    // Root index links: [packages/pesa/src](core/index) → [@borapesa/pesa](core)
    content = content.replace(new RegExp(`\\[${pkg.dir.replace(/\//g, '\\/')}\\]\\(${name}/index\\)`, 'g'), `[${pkg.name}](${name})`)
  }

  // Extract title from first H1, then map to package display name
  const h1Match = content.match(/^# (.+)/m)
  let title = h1Match ? h1Match[1].trim() : 'API'
  for (const pkg of PACKAGES) {
    if (title === pkg.dir || title.startsWith(pkg.dir)) {
      title = pkg.name
      break
    }
  }

  // Remove H1 (Fumadocs renders frontmatter title)
  content = content.replace(/^# .+\n\n?/, '')

  // Merge "#### Throws" sections
  content = content.replace(/(#### Throws\n\n[^\n]+(\n\n)?)+/g, (match) => {
    const items = match.split('#### Throws\n\n').filter(Boolean)
    return `#### Throws\n\n${items.join('\n\n')}\n\n`
  })

  // Merge "## Throws" sections
  const parts = content.split('\n## Throws\n')
  if (parts.length > 2) {
    const before = parts[0]
    const allThrows = parts
      .slice(1)
      .map((p) => {
        const nextSection = p.indexOf('\n## ')
        return nextSection >= 0 ? p.substring(0, nextSection).trim() : p.trim()
      })
      .filter(Boolean)
      .join('\n\n')
    const lastPart = parts[parts.length - 1]
    const afterIdx = lastPart.indexOf('\n## ')
    const after = afterIdx >= 0 ? `\n\n${lastPart.substring(afterIdx).trim()}` : ''
    content = `${before}\n## Throws\n\n${allThrows}${after}`
  }

  // Strip .md from links
  content = content.replace(/\.md\)/g, ')')

  const withFrontmatter = `---\ntitle: "${title}"\n---\n\n${content}`
  writeFileSync(path, withFrontmatter)
}

function walk(dir) {
  const entries = readdirSync(dir)
  for (const entry of entries) {
    const path = join(dir, entry)
    if (statSync(path).isDirectory()) {
      walk(path)
    } else if (extname(path) === '.md') {
      processFile(path)
    }
  }
}

walk(API_DIR)

// Overwrite root index with clean, correct links
const rows = PACKAGES.map((pkg) => `| [${pkg.name}](${slugify(pkg.name)}) | ${pkg.desc || ''} |`).join('\n')

const rootIndex = join(API_DIR, 'index.md')
writeFileSync(
  rootIndex,
  `---
title: "API Reference"
---

Bora Pesa API reference — auto-generated from JSDoc.

## Packages

| Package | Description |
| --- | --- |
${rows}
`,
)
// Write meta.json to enforce sidebar ordering from PACKAGES config
const metaOrder = PACKAGES.map((p) => slugify(p.name))
writeFileSync(join(API_DIR, 'meta.json'), JSON.stringify({ pages: metaOrder }, null, 2) + '\n')

console.log('done')

// ── Helpers ──────────────────────────────────────────────────────

function slugify(name) {
  return name.replace('@borapesa/', '')
}
