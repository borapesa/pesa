# Contributing to Bora Pesa

Thanks for contributing! Bora Pesa is a unified payments SDK for Tanzania — we're building the open-source foundation for digital payments in the region.

## Code of Conduct

This project follows the [Contributor Covenant](./CODE_OF_CONDUCT.md). Be respectful, be constructive, be kind.

## Getting started

```bash
git clone https://github.com/borapesa/pesa.git
cd pesa
pnpm install
pnpm build
```

### Prerequisites

- **Node.js** 22+
- **pnpm** 10+ (the project uses `packageManager` pinning — `corepack enable` handles this automatically)

### Project structure

| Directory | Purpose |
|-----------|---------|
| `packages/pesa/` | Core SDK — types, factory, event store, plugin system |
| `providers/*/` | Payment provider adapters (selcom, azampay, clickpesa, snippe) |
| `adapters/sqlite/` | SQLite event store adapter |
| `packages/devtools/` | Developer utilities (cloudflared tunnel) |
| `docs/` | Fumadocs documentation site |

## Development workflow

### Running tests

```bash
pnpm test          # all packages (via turbo)
pnpm test --filter @borapesa/pesa   # single package
```

### Type-checking

```bash
pnpm typecheck
```

### Formatting

We use Biome. Format before committing:

```bash
pnpm format
```

Pre-commit hooks (via Lefthook) run format + typecheck automatically on staged files.

## Commit conventions

We follow [Conventional Commits](https://www.conventionalcommits.org/). The CI generates changesets automatically from your commit messages.

```
feat(pesa): add customer metadata to createOrder
fix(selcom): handle webhook signature mismatch
```

Valid scopes: `pesa`, `selcom`, `azampay`, `clickpesa`, `snippe`, `sqlite`, `devtools`, `docs`

Breaking changes: add `!` after the type/scope — `feat!(pesa): drop v1 API`

### When to use a manual changeset

If your commit message doesn't map cleanly to a single package and semver bump, create a changeset manually:

```bash
pnpm changeset
```

This walks you through picking affected packages and bump levels.

## Pull request checklist

- [ ] Tests pass (`pnpm test`)
- [ ] TypeScript compiles (`pnpm typecheck`)
- [ ] Formatted (`pnpm format`)
- [ ] Changeset included (or your commit follows conventional commits for auto-generation)

## Adding a new payment provider

1. Create a new directory under `providers/<name>/`
2. Implement `BasePaymentProvider` from `@borapesa/pesa`
3. Add `package.json` following the [existing provider pattern](./providers/selcom/package.json)
4. Add tests (see existing providers for test patterns)
5. Run `pnpm --filter <pkg> build && pnpm --filter <pkg> test`

## Documentation

Docs live in `docs/` and are built with Fumadocs. To run locally:

```bash
pnpm docs:build
```

## Getting help

- [Documentation](https://borapesa.dev)
- [GitHub Discussions](https://github.com/borapesa/pesa/discussions) — Q&A, ideas, general conversation
- [Issues](https://github.com/borapesa/pesa/issues) — bugs and feature requests

## AI usage

See [AI_USAGE_POLICY.md](./AI_USAGE_POLICY.md) for our policy on AI-assisted contributions.
