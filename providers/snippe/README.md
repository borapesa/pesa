# @borapesa/snippe

[Snippe](https://snippe.sh) provider adapter for [Bora Pesa](https://borapesa.dev).

## Install

```bash
pnpm add @borapesa/pesa @borapesa/snippe
```

## Quick Start

```ts
import { createPesa } from '@borapesa/pesa';
import { SnippePaymentProvider } from '@borapesa/snippe';

const pesa = createPesa({
  provider: new SnippePaymentProvider({
    apiKey:        process.env.SNIPPE_API_KEY!,
    webhookSecret: process.env.SNIPPE_WEBHOOK_SECRET!,
  }),
});

// Mobile money USSD push
const order = await pesa.createOrder({
  amount:    500,
  currency:  'TZS',
  reference: 'order_001',
  customer:  { name: 'Juma Ali', phone: '255712345678' },
});

// Card payment — set redirect URLs in config for reuse
const pesaCard = createPesa({
  provider: new SnippePaymentProvider({
    apiKey:        process.env.SNIPPE_API_KEY!,
    webhookSecret: process.env.SNIPPE_WEBHOOK_SECRET!,
    redirectUrl:   'https://mysite.com/success',
    cancelUrl:     'https://mysite.com/cancelled',
    webhookUrl:    'https://mysite.com/pesa/webhook',
  }),
});

const cardOrder = await pesaCard.createOrder({
  amount:    50000,
  currency:  'TZS',
  reference: 'card_001',
  customer:  { name: 'Juma Ali', phone: '255712345678' },
});
// → redirects customer to Snippe's card payment page
```

## Config

| Field | Type | Required | Description |
|---|---|---|---|
| `apiKey` | `string` | ✅ | Snippe API key (`snp_...`) |
| `webhookSecret` | `string` | ✅ | HMAC-SHA256 signing key (Snippe Dashboard → Webhook Secret) |
| `baseUrl` | `string` | ❌ | Override base URL. Defaults to `https://api.snippe.sh` |
| `webhookUrl` | `string` | ❌ | Default webhook URL set on create/disburse calls |
| `redirectUrl` | `string` | ❌ | Default redirect URL for card payments. Overridable per-payment via `payload.redirectUrl` |
| `cancelUrl` | `string` | ❌ | Cancel URL for card payments. Falls back to `redirectUrl` if not set |
| `timeoutMs` | `number` | ❌ | Request timeout (default: 30_000) |

## Auth

Bearer token — `Authorization: Bearer <apiKey>`. Every POST gets an auto-generated `Idempotency-Key` header (`snp-` prefix, ≤30 chars). All requests carry `Snippe-Version: 2026-01-25`.

## Supported Operations

| Operation | Supported | Notes |
|---|---|---|
| `createOrder` | ✅ | USSD push by default. Card payment when `redirectUrl` is set (config or payload) |
| `getPaymentStatus` | ✅ | |
| `handleWebhook` | ✅ | HMAC-SHA256 signature + replay protection (5 min window) |
| `disburse` | ✅ | Mobile money + bank transfer |
| `getBalance` | ✅ | Available + book balance |
| `listOrders` | ✅ | Date-range + Snippe-specific filters (`status`, `paymentType`, `q`) |
| `validateCredentials` | ✅ | Health check via balance endpoint |
| `previewDisburse` | ✅ | Payout fee lookup via `/v1/payouts/fee` |
| `refund` | ✅ | Voids a pending payment via DELETE |
| `retriggerPush` | ✅ | Re-sends USSD push prompt for pending mobile payment |
| `getNameLookup` | ✅ | Probes phone via payments search |
| `previewOrder` | ❌ | Not exposed by Snippe API |
| `cancelOrder` | ❌ | Not exposed by Snippe API |

## Provider-specific features

These methods live on `pesa.provider` directly — not part of the unified `PesaInstance` API.

### Checkout sessions

Snippe's hosted checkout renders the payment UI on its own page, handling method selection automatically. Access via `pesa.provider`:

```ts
const session = await (pesa.provider as SnippePaymentProvider).createCheckoutSession({
  amount: 500,
  description: 'Bando la Wiki',
  expiresIn: 3600, // 1 hour
});

console.log(session.paymentLinkUrl); // share via SMS / WhatsApp
console.log(session.checkoutUrl);    // embed in your UI
```

Methods: `createCheckoutSession`, `getCheckoutSession`, `listCheckoutSessions`, `cancelCheckoutSession`.

### Retrigger USSD

Re-send the PIN prompt for a pending mobile payment:

```ts
await (pesa.provider as SnippePaymentProvider).retriggerPush(orderId);
```

### Search

`listOrders` accepts optional Snippe-specific filters: `status` (`pending`/`completed`/`failed`/`voided`/`expired`), `paymentType` (`mobile`/`card`), and free-text `q` (routes to the search endpoint).

```ts
const result = await pesa.listOrders({ status: 'completed', limit: 10 });
```

## Webhooks

Set your webhook URL in the Snippe dashboard to `https://your-app.com/pesa/webhook`. Events include `payment.completed`, `payment.failed`, `payment.voided`, `payment.expired`, `payout.completed`, `payout.failed`, and `payout.reversed`.

## Credentials

Get your `apiKey` and `webhookSecret` from the [Snippe Dashboard](https://dashboard.snippe.sh). Sign up at [snippe.sh](https://snippe.sh).

## License

MIT © Bora Pesa contributors
