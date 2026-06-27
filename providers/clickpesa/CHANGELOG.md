# @borapesa/clickpesa

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
