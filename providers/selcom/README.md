# @borapesa/selcom

Selcom provider adapter for Bora Pesa.

[Selcom](https://selcom.net) is a Tanzanian payment aggregator offering checkout, mobile money disbursement, bank transfers (Qwiksend), C2B collection via USSD push, and utility bill payments.

## Install

```bash
pnpm add @borapesa/pesa @borapesa/selcom
```

## Quick Start

```ts
import { createPesa } from '@borapesa/pesa';
import { SelcomPaymentProvider } from '@borapesa/selcom';

const pesa = createPesa({
  provider: new SelcomPaymentProvider({
    apiKey:    process.env.SELCOM_API_KEY!,
    apiSecret: process.env.SELCOM_API_SECRET!,
    vendor:    process.env.SELCOM_VENDOR!,
    pin:       process.env.SELCOM_PIN!,
  }),
});

// Checkout order — customer is redirected to Selcom's payment page
const order = await pesa.createOrder({
  amount:      8000,
  currency:    'TZS',
  reference:   'order_001',
  customer:    { name: 'Juma Ali', phone: '255712345678' },
  redirectUrl: 'https://mysite.com/return',
});

// USSD push — PIN prompt sent to customer's phone (no redirectUrl)
const order2 = await pesa.createOrder({
  amount:    8000,
  currency:  'TZS',
  reference: 'order_002',
  customer:  { name: 'Juma Ali', phone: '255712345678' },
});

// Send money to mobile wallet
await pesa.disburse({
  amount:    50000,
  currency:  'TZS',
  reference: 'payout_001',
  recipient: { phone: '255754321098', name: 'Jane Doe', network: 'MPESA' },
});

// Send money to bank account (requires senderAccount/senderName/senderPhone in config)
await pesa.disburse({
  amount:    500000,
  currency:  'TZS',
  reference: 'bank_payout_001',
  recipient: { name: 'Jane Doe', accountNumber: '1234567890', bic: 'NMBTZTZ' },
});
```

## Auth

Per-request HMAC-SHA256 signing. Every request carries:

- `Authorization: SELCOM <Base64(API_KEY)>`
- `Timestamp`: ISO 8601 with timezone offset
- `Digest`: Base64-encoded HMAC-SHA256 of the signing string
- `Signed-Fields`: comma-separated parameter keys used in the signing string

The signing string is built as `timestamp=<ts>&field1=val1&field2=val2...` with fields in alphabetical order.

## Config

| Field | Type | Required | Description |
|---|---|---|---|
| `apiKey` | `string` | ✅ | API key from Selcom |
| `apiSecret` | `string` | ✅ | API secret for HMAC signing |
| `vendor` | `string` | ✅ | Float account / vendor identifier |
| `pin` | `string` | ✅ | Float account PIN |
| `baseUrl` | `string` | ❌ | Defaults to `https://apigw.selcommobile.com` |
| `senderAccount` | `string` | ❌ | Source account for Qwiksend bank transfers |
| `senderName` | `string` | ❌ | Account holder display name for bank transfers |
| `senderPhone` | `string` | ❌ | Sender mobile number for bank transfers |
| `redirectUrl` | `string` | ❌ | Default redirect URL for checkout orders. Overridable per-payment via `payload.redirectUrl` |
| `cancelUrl` | `string` | ❌ | Cancel URL for checkout orders — the customer is sent here if they abandon the payment |
| `webhookUrl` | `string` | ❌ | Webhook callback URL for payment status notifications. Typically your `pesa.mountWebhook` endpoint |

## Supported Operations

| Operation | Supported | Notes |
|---|---|---|
| `createOrder` | ✅ | Redirect-based checkout when `redirectUrl` is set. C2B USSD push otherwise. |
| `getPaymentStatus` | ✅ | |
| `handleWebhook` | ✅ | HMAC-SHA256 digest verification |
| `disburse` | ✅ | Wallet Cashin (mobile money) or Qwiksend (bank transfer) |
| `cancelOrder` | ✅ | |
| `listOrders` | ✅ | Date-range filtered |
| `getBalance` | ✅ | Float account balance |
| `getNameLookup` | ✅ | Wallet holder name via namelookup endpoint |
| `validateCredentials` | ✅ | Health check via balance endpoint |
| `previewOrder` | ❌ | Not exposed by Selcom API |
| `previewDisburse` | ❌ | Not exposed by Selcom API |
| `refund` | ❌ | Not exposed by Selcom API |

## Wallet Network Mapping

`disburse` maps mobile networks to Selcom utility codes:

| Network | Utility Code |
|---|---|
| `MPESA` | `VMCASHIN` |
| `AIRTELMONEY` | `AMCASHIN` |
| `TIGOPESA` | `TPCASHIN` |
| `HALOPESA` | `HPCASHIN` |
| Other / not set | `CASHIN` (auto-route via MNP lookup) |

## Provider-specific features

These methods live on `pesa.provider` directly — not part of the unified `PesaInstance` API.

### Wallet Pull Payment

Trigger a USSD push from an existing checkout order for in-app payments:

```ts
await (pesa.provider as SelcomPaymentProvider).checkoutWalletPayment('order_123', '255682812345');
```

### Utility Payments

Pay bills, buy airtime, and query utility accounts:

```ts
// Pay LUKU electricity
await (pesa.provider as SelcomPaymentProvider).payUtility({
  utilitycode: 'LUKU',
  utilityref: '01234567891',
  amount: 10000,
});

// Look up an account before paying
const info = await (pesa.provider as SelcomPaymentProvider).lookupUtility('LUKU', '01234567891');

// Check payment status
const status = await (pesa.provider as SelcomPaymentProvider).queryUtilityStatus('transid_123');
```

Supported utility codes: `LUKU`, `DSTV`, `AZAMTV`, `STARTIMES`, `GEPG`, `TOP` (airtime), and more — see the [Selcom API reference](https://developers.selcommobile.com).

### Selcom Pesa

Send funds to Selcom Pesa accounts and look up account names:

```ts
await (pesa.provider as SelcomPaymentProvider).selcomPesaCashin('255781234567', 5000);
const lookup = await (pesa.provider as SelcomPaymentProvider).selcomPesaNameLookup('255781234567');
```

### Agent Cashout (Huduma)

Send funds for cash pickup at any Selcom Huduma agent via `*150*50#`:

```ts
await (pesa.provider as SelcomPaymentProvider).agentCashout('255761234567', 1000, 'John Mushi');
```

### Stored Cards

Manage tokenized cards for recurring payments:

```ts
const { cards } = await (pesa.provider as SelcomPaymentProvider).fetchStoredCards('uuid_123', 'user_456');
await (pesa.provider as SelcomPaymentProvider).deleteStoredCard('card_1', 'uuid_123');
```

## Webhooks

Set your webhook URL in the Selcom dashboard. For per-order callbacks, configure `webhookUrl` in the provider config. The provider verifies the `Digest` header against the callback payload using HMAC-SHA256 constant-time comparison.

## Credentials

Contact Selcom at [info@selcom.net](mailto:info@selcom.net) or visit [developers.selcommobile.com](https://developers.selcommobile.com/). Selcom currently has no sandbox/test mode.
