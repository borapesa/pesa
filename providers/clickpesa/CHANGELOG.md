# @borapesa/clickpesa

## 0.2.0

### Minor Changes

The ClickPesa provider now covers the complete API surface.

**Payments**

- USSD push (TZS mobile money)
- Card payments (USD, VISA/Mastercard)
- Hosted checkout links
- Order listing with date filtering and pagination

**Disbursements**

- Mobile money payout
- Bank payout (ACH/RTGS) with `getBanks()` for BIC lookup
- Hosted payout links (recipient enters own payment details)

**Account & Utilities**

- `getAccountStatement()` — transaction history with date filters
- `getExchangeRates()` — currency conversion rates

**BillPay**

- `createOrderControlNumber()` / `createCustomerControlNumber()`
- `bulkCreateOrderNumbers()` / `bulkCreateCustomerNumbers()` (up to 50 per request)
- `getBillPayDetails()` / `updateBillPayReference()` / `updateBillPayStatus()`

**Security**

- Sandbox mode (`sandbox: true` — auto-targets `api-sandbox.clickpesa.com`)
- Request checksum signing: HMAC-SHA256 auto-injected on all POST/PUT/PATCH requests
- Constant-time webhook signature verification

**Bug fixes**

- `getPaymentStatus` now uses `this.request()` — auto-refreshes bearer tokens on 401 instead of failing
- Webhook event type dispatch replaced with a deterministic lookup table (was order-sensitive if/else chain)
- Duplicate `statusMap` literal in two disbursement methods extracted to `static PAYOUT_STATUS_MAP`

**Internal**

- Checksum methods unified on `crypto.createHmac` (dropped dual Web Crypto + Node crypto split)
- `WEBHOOK_EVENT_MAP` moved to module-level constant (was recreated on every webhook call)

### Patch Changes

- Updated dependencies
  - @borapesa/pesa@0.2.0

## 0.1.1

### Patch Changes

- Fixes:

  - Retry loop uses for-loop instead of recursion — idempotency + retry plugins now compatible
  - Provider receives ctx.payload instead of original param — plugin payload modifications reach the provider
  - normalizeError passes through PesaNetworkError and PesaValidationError for instanceof checks
  - db.saveEvent() runs after plugin onPaymentEvent hooks — verification plugins can reject before persistence

  Features:

  - Input validation: MSISDN phone format, positive integer amounts, non-empty references
  - validateCredentials() optional method on BasePaymentProvider
  - retryPlugin now retries on QUEUED status (disbursements)
  - 109 tests, 97.7% statement coverage

  - Token auth with in-memory caching (55-min TTL)
  - USSD push + checkout link via redirectUrl
  - HMAC-SHA256 webhook verification (fails closed on crypto errors)
  - Webhook orderId matches createOrder — getPaymentStatus no longer breaks after webhooks
  - Token refresh uses promise-based lock to prevent concurrent auth calls
  - Mobile money payout, preview, name lookup
  - 8 smoke tests

- Updated dependencies
  - @borapesa/pesa@0.1.1
