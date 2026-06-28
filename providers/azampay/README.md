# @borapesa/azampay

AzamPay provider adapter for Bora Pesa.

[AzamPay](https://azampay.com) is a Tanzanian payment platform offering mobile money checkout, bank checkout, hosted checkout pages, cross-border disbursement, and name lookup.

## Install

```bash
pnpm add @borapesa/pesa @borapesa/azampay
```

## Quick Start

```ts
import { createPesa } from '@borapesa/pesa';
import { AzamPayPaymentProvider } from '@borapesa/azampay';

const pesa = createPesa({
  provider: new AzamPayPaymentProvider({
    appName:     process.env.AZAMPAY_APP_NAME!,
    clientId:    process.env.AZAMPAY_CLIENT_ID!,
    clientSecret: process.env.AZAMPAY_CLIENT_SECRET!,
    apiKey:      process.env.AZAMPAY_API_KEY!,
    senderName:   'Bora Pesa Ltd',
    sandbox:     true,          // false for production
  }),
});

// MNO checkout — phone prefix auto-maps to provider
const order = await pesa.createOrder({
  amount:    5000,
  currency:  'TZS',
  reference: 'order_001',
  customer:  { name: 'Juma Ali', phone: '255712345678' },
});

// Name lookup
const lookup = await pesa.getNameLookup!('255712345678');

// Disburse to mobile wallet
await pesa.disburse({
  amount:    50000,
  currency:  'TZS',
  reference: 'payout_001',
  recipient: { phone: '255754321098', name: 'Jane Doe' },
});
```

## Auth

Bearer token — credentials sent to `POST /AppRegistration/GenerateToken`. Token cached for 55 minutes. All checkout calls include `Authorization: Bearer <token>` and `X-API-Key` header.

Separate base URLs for auth (`authenticator.azampay.co.tz`) and API (`checkout.azampay.co.tz`), each with sandbox variants.

## Config

| Field | Type | Required | Description |
|---|---|---|---|
| `appName` | `string` | ✅ | App name from AzamPay dashboard |
| `clientId` | `string` | ✅ | Client ID from AzamPay dashboard |
| `clientSecret` | `string` | ✅ | Client secret from AzamPay dashboard |
| `apiKey` | `string` | ✅ | API key from AzamPay dashboard |
| `senderName` | `string` | ✅ | Merchant display name for disbursement transfers |
| `senderBank` | `string` | ❌ | Bank name for disbursement source (default: `"AzamPay"`) |
| `sandbox` | `boolean` | ❌ | Target sandbox (default: `true`) |
| `authBaseUrl` | `string` | ❌ | Override auth base URL |
| `checkoutBaseUrl` | `string` | ❌ | Override checkout base URL |

## Supported Operations

| Operation | Supported | Notes |
|---|---|---|
| `createOrder` | ✅ | MNO checkout. Phone prefix auto-maps to provider (Airtel, Tigo, M-Pesa, etc.) |
| `getPaymentStatus` | ✅ | Query by transaction ID with tracked provider |
| `disburse` | ✅ | Cross-border transfer with source/destination shape |
| `handleWebhook` | ✅ | Callback parsing |
| `getNameLookup` | ✅ | Namelookup endpoint |
| `validateCredentials` | ✅ | Health check via token endpoint |
| `cancelOrder` | ❌ | Not exposed by AzamPay API |
| `listOrders` | ❌ | Not exposed by AzamPay API |
| `getBalance` | ❌ | Not exposed by AzamPay API |
| `previewOrder` | ❌ | Not exposed by AzamPay API |
| `previewDisburse` | ❌ | Not exposed by AzamPay API |
| `refund` | ❌ | Not exposed by AzamPay API |

## Provider-Specific Methods

**Bank checkout** — two-step OTP flow. Customer obtains OTP via USSD (`*150*03#` for CRDB, `*150*66#` for NMB), provides it to your app:

```ts
const result = await provider.createBankCheckout({
  amount: '50000',
  merchantAccountNumber: '1234567890',
  merchantMobileNumber: '255712345678',
  otp: '123456',          // from customer's USSD session
  provider: 'CRDB',        // 'CRDB' | 'NMB'
  referenceId: 'ref_001',
});
```

**Post checkout** — hosted checkout page (returns a URL to redirect to):

```ts
const url = await provider.createPostCheckout({
  amount: '5000',
  currency: 'TZS',
  externalId: 'ext_001',
  vendorName: 'My Store',
  vendorId: 'v_001',
  redirectSuccessURL: 'https://mysite.com/success',
  redirectFailURL: 'https://mysite.com/fail',
});
// Redirect customer to `url`
```

**Payment partners** — list available payment providers:

```ts
const partners = await provider.getPaymentPartners();
```

## Phone → Provider Mapping

`createOrder` auto-detects the MNO from the phone prefix:

| Prefix | Provider |
|---|---|
| `25578`, `25568` | Airtel |
| `25576`, `25565` | Tigo |
| `25562` | HaloPesa |
| `25574`, `25575` | M-Pesa |
| Other | AzamPesa |

## Credentials

Register on the [AzamPay Developer Portal](https://developers.azampay.co.tz) to get your `appName`, `clientId`, `clientSecret`, and `apiKey`.
