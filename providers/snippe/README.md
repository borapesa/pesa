# @borapesa/snippe

[Snippe](https://snippe.sh) provider adapter for [Bora Pesa](https://borapesa.dev).

## Install

```bash
pnpm add @borapesa/pesa @borapesa/snippe
```

## Usage

```ts
import { createPesa } from '@borapesa/pesa';
import { SnippePaymentProvider } from '@borapesa/snippe';

const pesa = createPesa({
  provider: new SnippePaymentProvider({
    apiKey: process.env.SNIPPE_API_KEY!,
    webhookSecret: process.env.SNIPPE_WEBHOOK_SECRET!,
  }),
});
```

## Supported operations

| Operation              | Supported |
| ---------------------- | --------- |
| `createOrder`          | ✅        |
| `getPaymentStatus`     | ✅        |
| `handleWebhook`        | ✅        |
| `disburse`             | ✅        |
| `getBalance`           | ✅        |
| `listOrders`           | ✅        |
| `validateCredentials`  | ✅        |
| `refund`               | ❌        |
| `cancelOrder`          | ❌        |
| `previewOrder`         | ❌        |
| `previewDisburse`      | ❌        |
| `getNameLookup`        | ❌        |

## License

MIT © Bora Pesa contributors
