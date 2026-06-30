---
title: "Interface: PesaConfig"
---

Defined in: [packages/pesa/src/types/config.ts:39](https://github.com/borapesa/pesa/blob/0b5f9dc84f728a559f636e4b78cea49ddb18b7ab/packages/pesa/src/types/config.ts#L39)

Configuration passed to [createPesa](../functions/createPesa).

Only `provider` is required. Everything else ships with sensible defaults:
- In-memory event store (lost on restart — swap to a persistent adapter for production)
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
    pin:       process.env.SELCOM_PIN!,
    baseUrl:   'https://apigw.selcommobile.com',
  }),
  plugins: [
    retryPlugin({ maxAttempts: 3 }),
    loggingPlugin({ level: 'info' }),
  ],
  webhooks: {
    secret: process.env.BORAPESA_WEBHOOK_SECRET,
  },
  // Override for production:
  // db: new SQLiteAdapter({ path: './pesa.db' }),
});
```

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="basepath"></a> `basePath?` | `string` | Base path for the built-in webhook handler (`pesa.mountWebhook`). The handler serves a single route: - `POST {basePath}/webhook` — receive provider webhooks For order creation and status queries, use [PesaInstance.createOrder](PesaInstance.md#createorder) and [PesaInstance.getPaymentStatus](PesaInstance.md#getpaymentstatus) in your own routes behind your own auth middleware. **Default** `'/pesa'` | [packages/pesa/src/types/config.ts:61](https://github.com/borapesa/pesa/blob/0b5f9dc84f728a559f636e4b78cea49ddb18b7ab/packages/pesa/src/types/config.ts#L61) |
| <a id="db"></a> `db?` | [`PesaDatabaseAdapter`](PesaDatabaseAdapter) | Database adapter for the event store. Defaults to an in-memory store (lost on restart). Swap to the `@borapesa/sqlite` adapter for production deployments, or implement the [PesaDatabaseAdapter](PesaDatabaseAdapter) interface for your own database. | [packages/pesa/src/types/config.ts:91](https://github.com/borapesa/pesa/blob/0b5f9dc84f728a559f636e4b78cea49ddb18b7ab/packages/pesa/src/types/config.ts#L91) |
| <a id="plugins"></a> `plugins?` | [`PesaPlugin`](PesaPlugin)[] | Plugin array. Plugins are composed **in order**. Built-in plugins available from `@borapesa/pesa/plugins`: - `retryPlugin` — exponential/linear/fixed backoff - `idempotencyPlugin` — prevents duplicate charges - `loggingPlugin` — structured logging with PII redaction | [packages/pesa/src/types/config.ts:71](https://github.com/borapesa/pesa/blob/0b5f9dc84f728a559f636e4b78cea49ddb18b7ab/packages/pesa/src/types/config.ts#L71) |
| <a id="provider"></a> `provider` | [`BasePaymentProvider`](../classes/BasePaymentProvider) | The payment provider adapter. Choose from `@borapesa/selcom`, `@borapesa/clickpesa`, `@borapesa/azampay` (DPO and Pesapal are planned), or use the built-in `BogusPaymentProvider` for local development. | [packages/pesa/src/types/config.ts:47](https://github.com/borapesa/pesa/blob/0b5f9dc84f728a559f636e4b78cea49ddb18b7ab/packages/pesa/src/types/config.ts#L47) |
| <a id="webhooks"></a> `webhooks?` | \{ `secret?`: `string`; \} | Webhook configuration. Reserved for future hosted verification services. | [packages/pesa/src/types/config.ts:74](https://github.com/borapesa/pesa/blob/0b5f9dc84f728a559f636e4b78cea49ddb18b7ab/packages/pesa/src/types/config.ts#L74) |
| `webhooks.secret?` | `string` | Reserved for future hosted webhook verification. Provider-level signature verification (HMAC, RSA, checksum) happens automatically in each provider adapter — no additional secret needed. | [packages/pesa/src/types/config.ts:81](https://github.com/borapesa/pesa/blob/0b5f9dc84f728a559f636e4b78cea49ddb18b7ab/packages/pesa/src/types/config.ts#L81) |
