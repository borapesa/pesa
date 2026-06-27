# @borapesa/clickpesa

ClickPesa provider adapter for Bora Pesa.

[ClickPesa](https://clickpesa.com) is a licensed Payment System Provider under the Bank of Tanzania, supporting mobile money (M-Pesa, Airtel Money, Tigo Pesa, HaloPesa), card payments (Visa, Mastercard, UnionPay), and bank payouts.

## Install

```bash
pnpm add @borapesa/pesa @borapesa/clickpesa
```

## Quick Start

```ts
import { createPesa } from '@borapesa/pesa';
import { ClickPesaProvider } from '@borapesa/clickpesa';

const pesa = createPesa({
  provider: new ClickPesaProvider({
    baseUrl:  'https://api.clickpesa.com',
    clientId: process.env.CLICKPESA_CLIENT_ID!,
    apiKey:   process.env.CLICKPESA_API_KEY!,
  }),
});

// USSD push — sends PIN prompt to customer's phone
const order = await pesa.createOrder({
  amount:    15000,
  currency:  'TZS',
  reference: 'order_001',
  customer:  { name: 'Juma Ali', phone: '255712345678' },
});

// Poll status
const status = await pesa.getPaymentStatus(order.orderId);
```

## Auth

Token-based — `client-id` + `api-key` sent as custom headers to ClickPesa's `/third-parties/generate-token` endpoint. Tokens are cached in memory for 55 minutes (5-minute safety margin before the 1-hour expiry).

## Supported Operations

| Operation | Supported | Notes |
|---|---|---|
| `createOrder` | ✅ | USSD push (default). Checkout link when `redirectUrl` is set. |
| `getPaymentStatus` | ✅ | |
| `handleWebhook` | ✅ | HMAC-SHA256 checksum verification via Web Crypto |
| `disburse` | ✅ | Mobile money payout |
| `validateCredentials` | ✅ | Health check via token endpoint |
| `previewOrder` | ✅ | Preview USSD push (fee + validity) |
| `previewDisburse` | ✅ | Preview payout |
| `getNameLookup` | ✅ | Resolve account holder via payout preview |
| `refund` | ❌ | Not exposed by ClickPesa API |
| `cancelOrder` | ❌ | Not exposed by ClickPesa API |
| `listOrders` | ❌ | Not exposed by ClickPesa API |

## Webhooks

Set your webhook URL in the ClickPesa dashboard to `https://your-app.com/api/pesa/webhook`. Provide `checksumSecret` in the config to enable HMAC-SHA256 verification.

## Credentials

Get your `clientId` and `apiKey` from the [ClickPesa Dashboard](https://docs.clickpesa.com). Sign up at [clickpesa.com](https://clickpesa.com).
