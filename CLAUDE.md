# CLAUDE.md — Bora Pesa

A unified, open-source payments SDK for Tanzania. `@borapesa/pesa` is a single factory function that wires together a payment provider, plugins, and an event store — inspired by better-auth's architecture.

## Project map

```
pesa/                            # Turborepo + pnpm workspaces
├── packages/pesa/               # @borapesa/pesa — core SDK
│   └── src/
│       ├── pesa.ts              # createPesa() factory + PesaInstance
│       ├── handler.ts           # Generic HTTP mount handler
│       ├── providers/base.ts    # BasePaymentProvider (abstract, 4 required + 7 optional)
│       ├── plugins/             # retry, idempotency, logging
│       ├── db/                  # MemoryAdapter (default), PesaDatabaseAdapter interface
│       ├── testing/bogus.ts     # BogusPaymentProvider (test double, all methods)
│       ├── types/               # All type definitions (foundation, order, event, disburse, etc.)
│       ├── errors.ts            # PesaError hierarchy (6 subclasses)
│       └── validate.ts          # MSISDN phone, positive integer amount, non-empty reference
├── packages/devtools/           # @borapesa/devtools: cloudflared tunnel, webhook dev utilities
├── packages/mcp/                # @borapesa/mcp: MCP server for AI agents (bundled docs snapshot)
├── providers/clickpesa/         # @borapesa/clickpesa — ClickPesa adapter (token auth)
├── providers/selcom/            # @borapesa/selcom — Selcom adapter (HMAC auth)
├── providers/azampay/           # @borapesa/azampay — AzamPay adapter (token auth)
├── providers/snippe/            # @borapesa/snippe: Snippe adapter (bearer auth)
├── providers/{dpo,pesapal}/     # Planned (empty)
├── adapters/sqlite/             # @borapesa/sqlite — SQLite event store adapter
├── docs/                        # Fumadocs documentation site
├── biome.json                   # Formatter + linter config
├── lefthook.yml                 # Git hooks (pre-commit: format+typecheck, pre-push: test)
└── turbo.json                   # Task pipeline
```

## Core architecture

`createPesa(config)` takes a provider, optional plugins, optional db adapter, and optional basePath for the webhook handler. Returns a wired-up `PesaInstance`:

```
config.provider: BasePaymentProvider  ← Selcom, ClickPesa, AzamPay, Snippe, Bogus
config.plugins: PesaPlugin[]          ← retry, idempotency, logging
config.db: PesaDatabaseAdapter        ← in-memory (default), SQLite (@borapesa/sqlite)

                    ↓

pesa.createOrder(payload)   → OrderResult
pesa.getPaymentStatus(id)   → PaymentStatus
pesa.disburse(payload)      → DisburseResult
pesa.handleWebhook(body, h) → void (verify → persist → emit)
pesa.on('PAYMENT_SUCCESS', handler)
pesa.mountWebhook            → (Request) → Promise<Response>  (standard fetch handler)
```

### Plugin pipeline

```
app calls pesa.createOrder(payload)
  ├─ validateCreateOrderPayload()      ← SDK-level input validation
  ├─ beforeRequest hooks (once)        ← idempotency, logging
  ├─ for attempt in 0..3:
  │   ├─ provider.createOrder(ctx.payload)
  │   └─ afterResponse hooks           ← retry decision, logging
  └─ return result (or throw normalized error)
```

### Error hierarchy

All errors extend `PesaError`. `normalizeError()` passes through:
- `PesaWebhookError`, `PesaUnsupportedError`, `PesaNetworkError`, `PesaValidationError`
- Wraps `TypeError` with 'fetch' → `PesaNetworkError`
- Wraps everything else → `PesaProviderError(502)`

## Conventions

- **Package naming**: `@borapesa/<name>` (not `@borapesa/pesa-<name>`)
- **TZS amounts**: Whole integers only. 15000 = TZS 15,000. No floats.
- **Phone numbers**: MSISDN format (`255XXXXXXXXX`). Local `07XX` rejected at validation.
- **Imports**: Extensionless (`./pesa` not `./pesa.js`)
- **Formatter**: Biome — `pnpm format` (write) / `pnpm format:check` (CI)
- **Git hooks**: Lefthook — pre-commit runs format + typecheck, pre-push runs full test suite
- **Tests**: Vitest with `@vitest/coverage-v8`. 97.7% coverage required.
- **Commits**: Include `Co-Authored-By: Claude <noreply@anthropic.com>` for AI-assisted commits
- **AI policy**: See `AI_USAGE_POLICY.md`

## Key design decisions (do not change without RFC)

- Currency: TZS only, whole integers
- Auth: Out of SDK scope (use better-auth or similar)
- Event store default: SQLite via better-sqlite3 (zero config)
- Client/server split: Server owns all API calls; client contains zero secrets
- Multi-currency: Post-v1 (driven by community issues/PRs)

## AI surfaces (keep in sync when the SDK changes)

- `packages/mcp` (`@borapesa/mcp`): MCP server for agents. Update `src/providers.ts` when provider configs change and `src/examples.ts` when public API shapes change.
- llms.txt endpoints on borapesa.dev (`/llms.txt`, `/llms-full.txt`, `/llms/<path>/index.md`, `sitemap.xml`): generated from `docs/content/docs/` by `docs/scripts/generate-llms.mjs`.
- `AGENTS.md` mirrors this file for other agents. Update both together.

Docs pages under `docs/content/docs/` feed the site, llms.txt, and the MCP snapshot, so fixing docs fixes every surface at once.
