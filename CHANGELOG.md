# Changelog

## v0.2.0

### @borapesa/pesa (core)

**New types**
- `BalanceResult` / `BalanceEntry` — per-currency wallet balances
- `BankTransferType` — `'ACH' | 'RTGS'`
- `Currency` extended to `'TZS' | 'USD'`

**New optional method**
- `getBalance()` added to `BasePaymentProvider` — throws `PesaUnsupportedError` by default, feature-detectable via `'getBalance' in pesa`

**Disbursement**
- `DisbursePayload.recipient` now accepts optional bank fields: `accountNumber`, `bic`, `transferType`
- Bank payout validation: `accountNumber` + `bic` required when `phone` is absent

**Bug fixes**
- **P0 (critical):** Retry plugin's `maxAttempts` was silently ignored by the core's hardcoded `MAX_RETRIES = 3`. The retry plugin is now the sole authority on retry decisions.
- Retry plugin documentation no longer claims to retry on network errors

**Removed**
- `webhookVerifyPlugin` — was a no-op that only checked an env var. Guard folded into `createPesa()` directly.

---

### @borapesa/clickpesa

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

---

## v0.1.1

### @borapesa/pesa

- Initial release — core factory, plugin pipeline, event store, BogusProvider

### @borapesa/clickpesa

- Initial provider adapter — USSD push, checkout links, mobile money disbursement, webhook handling
