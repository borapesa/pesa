# @borapesa/pesa

Core package for Bora Pesa — types, factory, event store, plugin system, and BogusProvider.

## Install

```bash
pnpm add @borapesa/pesa
```

## Quick Start

```ts
import { createPesa } from '@borapesa/pesa';
import { BogusPaymentProvider } from '@borapesa/pesa/testing';

const pesa = createPesa({
  provider: new BogusPaymentProvider({ defaultBehavior: 'success' }),
});

const order = await pesa.createOrder({
  amount:    15000,
  currency:  'TZS',
  reference: 'order_001',
  customer:  { name: 'Juma Ali', phone: '255712345678' },
});

console.log(order.status); // 'SUCCESS'
```

## Exports

| Path | Contents |
|---|---|
| `@borapesa/pesa` | `createPesa`, `BasePaymentProvider`, `PesaError` hierarchy, all types |
| `@borapesa/pesa/plugins` | `retryPlugin`, `idempotencyPlugin`, `loggingPlugin` |
| `@borapesa/pesa/testing` | `BogusPaymentProvider` |

## Documentation

Full docs at [borapesa.dev](https://borapesa.dev).
