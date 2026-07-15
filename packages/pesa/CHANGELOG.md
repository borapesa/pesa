# @borapesa/pesa

## 0.6.9

### Patch Changes

- - move provenance flag to publishConfig

## 0.6.8

### Patch Changes

- - move provenance flag to publishConfig

## 0.6.7

### Patch Changes

- - move provenance flag to publishConfig

## 0.6.6

### Patch Changes

- - move provenance flag to publishConfig

## 0.6.5

### Patch Changes

- - move provenance flag to publishConfig

## 0.6.4

### Patch Changes

- - move provenance flag to publishConfig

## 0.6.3

### Patch Changes

- - move provenance flag to publishConfig

## 0.6.2

### Patch Changes

- - move provenance flag to publishConfig

## 0.6.1

### Patch Changes

- - move provenance flag to publishConfig

## 0.6.0

### Minor Changes

- - add Snippe payment provider (@borapesa/snippe)
  - AzamPay status query, retry on network errors, remove dead webhook secret

## 0.5.0

### Minor Changes

- - in-memory adapter by default, extract SQLite to adapters/sqlite
  - rename pesa.mount → pesa.mountWebhook (webhook only)
  - add basePath config + tunnel webhookPath option
  - use detached + logfile to isolate Ctrl+C from dev server
  - persist tunnel across Bun watch reloads to avoid rate limits
  - prevent console blockage and process orphans
  - unref child process so Ctrl+C kills the dev server instantly
  - detach cloudflared listeners after tunnel is established

## 0.5.0

### Minor Changes

- - in-memory adapter by default, extract SQLite to adapters/sqlite
  - rename pesa.mount → pesa.mountWebhook (webhook only)
  - add basePath config + tunnel webhookPath option
  - use detached + logfile to isolate Ctrl+C from dev server
  - persist tunnel across Bun watch reloads to avoid rate limits
  - prevent console blockage and process orphans
  - unref child process so Ctrl+C kills the dev server instantly
  - detach cloudflared listeners after tunnel is established

## 0.4.1

### Patch Changes

- - parse cloudflared output on stderr, not stdout

## 0.4.0

### Minor Changes

- - namespace HTTP routes under /pesa/ + built-in tunnel plugin

## 0.3.0

### Minor Changes

- - namespace HTTP routes under /pesa/ + built-in tunnel plugin

## 0.2.1

### Patch Changes

- - P1 normalizeError + P2 idempotency error types

## 0.2.0

### Minor Changes

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
- Retry plugin documentation no longer claims to retry on network errors (only status-based retries for AMBIGUOUS/PROCESSING/QUEUED)

**Removed**

- `webhookVerifyPlugin` — was a no-op that only checked an env var. Guard folded into `createPesa()` directly.

**Internal**

- `withRetry()` helper extracted — eliminates duplicate retry loop between `createOrder` and `disburse`
- `idempotencyPlugin()` signature simplified (unused `options` param removed)
- Circuit breaker test added for infinite-retry safety cap (100 iterations)

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
