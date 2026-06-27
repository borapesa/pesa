# @borapesa/docs

Bora Pesa documentation site — powered by [Fumadocs](https://fumadocs.dev).

## Quick Start

```bash
pnpm dev        # Start dev server at http://localhost:3000
pnpm build      # Production build
pnpm docs:api   # Regenerate API reference from JSDoc
```

## Workflow

### Editing docs pages

Add or edit `.mdx` files in `content/docs/`. They appear automatically in the sidebar.

### Generating API reference

The API reference at `/docs/api` is auto-generated from JSDoc in the source packages.

```bash
# 1. Rebuild packages (only needed if JSDoc changed in cross-referenced packages)
pnpm --filter @borapesa/pesa run build

# 2. Regenerate API docs
pnpm -C docs run docs:api
```

This runs TypeDoc + a post-processing script that:
- Generates markdown from JSDoc into `content/docs/api/`
- Flattens directory structure (`packages/pesa/src` → `pesa`)
- Fixes cross-package links and removes `.md` extensions
- Merges duplicate `@throws` sections
- Writes `meta.json` for sidebar ordering

### Adding a new package to the API reference

1. Add the package to the `PACKAGES` array in `scripts/add-frontmatter.mjs`:
   ```js
   { dir: 'providers/selcom/src', name: '@borapesa/selcom', desc: 'Selcom provider adapter' },
   ```

2. Add its entry point to `typedoc.json`:
   ```json
   "entryPoints": [
     "../packages/pesa/src/index.ts",
     "../providers/clickpesa/src/index.ts",
     "../providers/selcom/src/index.ts"
   ]
   ```

3. Regenerate:
   ```bash
   pnpm -C docs run docs:api
   ```

### LLMs.txt

Fumadocs auto-generates AI-readable docs at `/llms.txt` and serves any page as raw markdown via `.md` suffix.

## Project Structure

```
docs/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout (theme provider)
│   ├── page.tsx            # Landing page
│   ├── docs/               # Docs pages
│   │   ├── layout.tsx      # Docs layout (sidebar + TOC)
│   │   └── [[...slug]]/    # MDX page renderer
│   └── llms.txt/           # llms.txt endpoint
├── content/docs/           # MDX content (hand-written)
│   ├── index.mdx           # Docs landing page
│   └── api/                # API reference (auto-generated)
├── scripts/
│   └── add-frontmatter.mjs # Post-processing for generated docs
├── typedoc.json            # TypeDoc config
├── typedoc.tsconfig.json   # TSConfig for TypeDoc
└── source.config.ts        # Fumadocs MDX config
```
