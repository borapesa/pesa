---
title: "Interface: PesaConfig"
---

Defined in: [packages/pesa/src/types/config.ts:38](https://github.com/borapesa/pesa/blob/b650282517ee25488b2499acb1ca4114c3e14358/packages/pesa/src/types/config.ts#L38)

Configuration passed to [createPesa](../functions/createPesa).

Only `provider` is required. Everything else ships with sensible defaults:
- SQLite event store at `./pesa.db`
- No plugins
- `BORAPESA_WEBHOOK_SECRET` read from environment

## Example

```ts
import { createPesa } from '@borapesa/pesa';
import { SelcomPaymentProvider } from '@borapesa/selcom';
import { retryPlugin, loggingPlugin } from '@borapesa/pesa/plugins';

const pesa = createPesa({
  provider: new SelcomPaymentProvider({
    apiKey:    process.env.SELCOM_API_KEY!,
    apiSecret: process.env.SELCOM_API_SECRET!,
    vendor:    process.env.SELCOM_VENDOR!,
    env:       'sandbox',
  }),
  plugins: [
    retryPlugin({ maxAttempts: 3 }),
    loggingPlugin({ level: 'info' }),
  ],
  webhooks: {
    secret: process.env.BORAPESA_WEBHOOK_SECRET,
  },
  // Override for production:
  // db: new LibSQLAdapter({ url: process.env.TURSO_DATABASE_URL! }),
});
```

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="db"></a> `db?` | [`PesaDatabaseAdapter`](PesaDatabaseAdapter) | Database adapter for the event store. Defaults to SQLite at `./pesa.db` (zero config). Swap for `LibSQLAdapter` (Turso), `PostgresAdapter`, `PrismaAdapter`, or `DrizzleAdapter` for production deployments. | [packages/pesa/src/types/config.ts:77](https://github.com/borapesa/pesa/blob/b650282517ee25488b2499acb1ca4114c3e14358/packages/pesa/src/types/config.ts#L77) |
| <a id="plugins"></a> `plugins?` | [`PesaPlugin`](PesaPlugin)[] | Plugin array. Plugins are composed **in order**. Built-in plugins available from `@borapesa/pesa/plugins`: - `retryPlugin` — exponential/linear/fixed backoff - `idempotencyPlugin` — prevents duplicate charges - `loggingPlugin` — structured logging with PII redaction - `webhookVerifyPlugin` — enforces webhook secret in production | [packages/pesa/src/types/config.ts:57](https://github.com/borapesa/pesa/blob/b650282517ee25488b2499acb1ca4114c3e14358/packages/pesa/src/types/config.ts#L57) |
| <a id="provider"></a> `provider` | [`BasePaymentProvider`](../classes/BasePaymentProvider) | The payment provider adapter. Choose from `@borapesa/selcom`, `@borapesa/clickpesa`, `@borapesa/azampay`, `@borapesa/dpo`, `@borapesa/pesapal`, or use the built-in `BogusPaymentProvider` for local development. | [packages/pesa/src/types/config.ts:46](https://github.com/borapesa/pesa/blob/b650282517ee25488b2499acb1ca4114c3e14358/packages/pesa/src/types/config.ts#L46) |
| <a id="webhooks"></a> `webhooks?` | \{ `secret?`: `string`; \} | Webhook configuration. | [packages/pesa/src/types/config.ts:60](https://github.com/borapesa/pesa/blob/b650282517ee25488b2499acb1ca4114c3e14358/packages/pesa/src/types/config.ts#L60) |
| `webhooks.secret?` | `string` | Shared secret for HMAC verification of incoming webhooks. Falls back to `process.env.BORAPESA_WEBHOOK_SECRET` if not set. **Required in production.** | [packages/pesa/src/types/config.ts:67](https://github.com/borapesa/pesa/blob/b650282517ee25488b2499acb1ca4114c3e14358/packages/pesa/src/types/config.ts#L67) |
