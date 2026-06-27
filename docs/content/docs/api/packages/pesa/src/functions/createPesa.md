---
title: "Function: createPesa()"
---

# Function: createPesa()

```ts
function createPesa(config): PesaInstance;
```

Defined in: [packages/pesa/src/pesa.ts:221](https://github.com/borapesa/pesa/blob/d5e3ce1bd76d0bcd3eae4880e0c1c2cb00933e6c/packages/pesa/src/pesa.ts#L221)

The single entry point for the entire Bora Pesa SDK.

Returns a fully configured [PesaInstance](../interfaces/PesaInstance.md) with provider logic,
plugin pipeline, and event store wired together.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `config` | [`PesaConfig`](../interfaces/PesaConfig.md) | — only `provider` is required. Everything else has sensible defaults (SQLite event store, no plugins, webhook secret from `BORAPESA_WEBHOOK_SECRET` environment variable). |

## Returns

[`PesaInstance`](../interfaces/PesaInstance.md)

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
    env:       'live',
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

## Throws

`PesaValidationError` — if required config fields are missing.
