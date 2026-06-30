---
title: "Function: createPesa()"
---

```ts
function createPesa(config): PesaInstance;
```

Defined in: [packages/pesa/src/pesa.ts:236](https://github.com/borapesa/pesa/blob/fd0db8b0df993c6583d9e24a7ce47f1b6a556685/packages/pesa/src/pesa.ts#L236)

The single entry point for the entire Bora Pesa SDK.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `config` | [`PesaConfig`](../interfaces/PesaConfig) | — only `provider` is required. Everything else has sensible defaults (in-memory event store, no plugins, webhook secret from `BORAPESA_WEBHOOK_SECRET` environment variable). |

## Returns

[`PesaInstance`](../interfaces/PesaInstance)

## Since

0.1.0

Returns a fully configured [PesaInstance](../interfaces/PesaInstance) with provider logic,
plugin pipeline, and event store wired together.

## Example

**Production setup with Selcom**
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
    retryPlugin({ maxAttempts: 3, backoff: 'exponential' }),
    loggingPlugin({ level: 'info' }),
  ],
});
```

**Local development with BogusProvider**
```ts
import { createPesa } from '@borapesa/pesa';
import { BogusPaymentProvider } from '@borapesa/pesa/testing';

const pesa = createPesa({
  provider: new BogusPaymentProvider({
    defaultBehavior: 'success',
    delay: 200,
  }),
});
```

## Throws

`PesaProviderError` — if the provider config is invalid or unreachable.

`PesaValidationError` — if required config fields are missing.