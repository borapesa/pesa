<p align="center">
  <img src="docs/public/borapesa.svg" alt="Bora Pesa" width="96" />
</p>

# Bora Pesa

A unified, open-source payments SDK for Tanzania.

## What is Bora Pesa?

Bora Pesa is a TypeScript SDK that gives you a single, consistent interface for integrating with all major Tanzanian payment providers — Selcom, AzamPay, ClickPesa, DPO, and Pesapal.

Swap providers with a one-line config change. No per-provider boilerplate.

```ts
import { createPesa } from '@borapesa/pesa'
import { SelcomPaymentProvider } from '@borapesa/selcom'

export const pesa = createPesa({
  provider: new SelcomPaymentProvider({
    apiKey:    process.env.SELCOM_API_KEY!,
    apiSecret: process.env.SELCOM_API_SECRET!,
    vendor:    process.env.SELCOM_VENDOR!,
    pin:       process.env.SELCOM_PIN!,
  }),
})

const order = await pesa.createOrder({
  amount: 15000, // TZS 15,000
  currency: 'TZS',
  reference: 'order_abc123',
  customer: { name: 'Juma Ali', phone: '255712345678' },
})
```

## Design Principles

- **Provider-agnostic** — swap providers without changing application code
- **TypeScript-first** — fully typed, zero `any` in public APIs
- **Zero-config defaults** — SQLite event store, BogusProvider for local dev
- **Universal HTTP** — `pesa.mountWebhook` is a standard fetch handler; mount on any server with zero framework-specific code
- **Server-only** — all provider API calls happen server-side; no credentials ever reach the browser
- **Tanzania-first** — TZS only, MSISDN-centric, Swahili-aware error messages in roadmap

## Packages

| Package               | Description                                       |
| --------------------- | ------------------------------------------------- |
| `@borapesa/pesa`      | Core — types, factory, event store, BogusProvider |
| `@borapesa/selcom`    | Selcom provider adapter                           |
| `@borapesa/azampay`   | AzamPay provider adapter                          |
| `@borapesa/clickpesa` | ClickPesa provider adapter                        |
| `@borapesa/snippe`    | Snippe provider adapter                           |
| `@borapesa/dpo`       | DPO provider adapter (planned)                    |
| `@borapesa/pesapal`   | Pesapal provider adapter (planned)                |
| `@borapesa/sqlite`    | SQLite event store adapter                        |
| `@borapesa/devtools`  | Developer tools (cloudflared tunnel)              |
| `@borapesa/mcp`       | MCP server: searchable docs and examples for AI agents |

## Quick Start

```bash
pnpm add @borapesa/pesa @borapesa/selcom
```

## Documentation

Full docs at [borapesa.dev](https://borapesa.dev).

## Using AI agents with Bora Pesa

Bora Pesa is built to be integrated by AI coding agents as well as humans:

- **MCP server**: give your agent searchable docs, provider comparisons, and runnable examples.

  ```bash
  claude mcp add borapesa -- npx -y @borapesa/mcp
  ```

  Works with Claude Code, Cursor, VS Code, Windsurf, and any MCP client. This repo ships a [`.mcp.json`](./.mcp.json) so agents working here pick it up automatically.

- **llms.txt**: the full documentation is served as plain markdown at [borapesa.dev/llms.txt](https://borapesa.dev/llms.txt) (index), [borapesa.dev/llms-full.txt](https://borapesa.dev/llms-full.txt) (everything in one file), and `borapesa.dev/llms/<path>/index.md` (per page).

- **AGENTS.md**: agents contributing to this repo read [AGENTS.md](./AGENTS.md) for conventions.

See the [AI tools guide](https://borapesa.dev/docs/ai-tools) for setup in each editor.

## Contributing

We welcome contributions from the community. See [CONTRIBUTING.md](./CONTRIBUTING.md) to get started and [SUPPORT.md](./SUPPORT.md) for help.

This project follows the [Contributor Covenant](./CODE_OF_CONDUCT.md) code of conduct.

## Security

Report vulnerabilities privately. See [SECURITY.md](./SECURITY.md) for details.

## License

MIT © Bora Pesa contributors
