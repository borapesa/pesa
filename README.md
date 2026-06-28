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
- **Framework-native** — idiomatic adapters for Next.js, Express, ElysiaJS, NestJS, and TanStack Start
- **Secrets never leave the server** — client packages contain zero provider credentials
- **Tanzania-first** — TZS only, MSISDN-centric, Swahili-aware error messages in roadmap

## Packages

| Package               | Description                                       |
| --------------------- | ------------------------------------------------- |
| `@borapesa/pesa`      | Core — types, factory, event store, BogusProvider |
| `@borapesa/selcom`    | Selcom provider adapter                           |
| `@borapesa/azampay`   | AzamPay provider adapter                          |
| `@borapesa/clickpesa` | ClickPesa provider adapter                        |
| `@borapesa/dpo`       | DPO provider adapter                              |
| `@borapesa/pesapal`   | Pesapal provider adapter                          |
| `@borapesa/nextjs`    | Next.js App Router adapter                        |
| `@borapesa/express`   | Express / Fastify adapter                         |
| `@borapesa/nestjs`    | NestJS PesaModule + PesaService                   |
| `@borapesa/elysia`    | ElysiaJS Bun-native plugin                        |
| `@borapesa/tanstack`  | TanStack Start + Query integration                |
| `@borapesa/react`     | `usePesaPayment()` React hook                     |
| `@borapesa/client`    | Browser / RN client — zero secrets                |
| `@borapesa/libsql`    | Turso / libSQL event store adapter                |
| `@borapesa/pg`        | PostgreSQL event store adapter                    |
| `@borapesa/prisma`    | Prisma event store adapter                        |
| `@borapesa/drizzle`   | Drizzle ORM event store adapter                   |

## Quick Start

```bash
pnpm add @borapesa/pesa @borapesa/selcom
```

See [examples/](./examples/) for full working integrations.

## Documentation

Full docs at [borapesa.dev](https://borapesa.dev).

## Contributing

We welcome contributions. Read our [AI Usage Policy](./AI_USAGE_POLICY.md) before submitting AI-assisted PRs.

## License

MIT © Bora Pesa contributors
