# Bora Pesa — Provider Integration Verification

Self-certify that your payment integration handles the edge cases provider docs don't tell you about. Check every box and your integration is production-ready. Miss one? There's a bug waiting.

## Platform & environment

- [ ] `NODE_ENV` is set to `production` in production — the SDK uses it for safety checks
- [ ] Provider credentials come from environment variables, never hardcoded or committed
- [ ] `pnpm-lock.yaml` is committed — reproducible installs

## Provider configuration

### ClickPesa

- [ ] `checksumKey` is configured if enabled in the ClickPesa dashboard — without it, webhooks are NOT verified
- [ ] Webhook URL in the ClickPesa dashboard points to `https://<your-domain>/pesa/webhook`

### Selcom

- [ ] `pin` is configured — required for disbursements and balance queries
- [ ] `baseUrl` is set to the production URL (`https://apigw.selcommobile.com`)
- [ ] Webhook URL in the Selcom dashboard points to `https://<your-domain>/pesa/webhook`

### AzamPay

- [ ] All 5 required fields are present: `appName`, `clientId`, `clientSecret`, `apiKey`, `senderName`
- [ ] `sandbox` is set to `false` in production
- [ ] Webhook URL in the AzamPay dashboard points to `https://<your-domain>/pesa/webhook`

## Plugin pipeline

- [ ] `idempotencyPlugin()` is configured **before** `retryPlugin()` in the plugins array
- [ ] `retryPlugin({ maxAttempts: 3 })` is configured — handles transient `PROCESSING`/`QUEUED` statuses and network errors
- [ ] `loggingPlugin()` is configured in production — PII-redacted payment logs for debugging
- [ ] `tunnelPlugin()` is NOT in the production plugin array (it spawns `cloudflared`) — use [@borapesa/devtools](/packages/devtools) and guard it behind `NODE_ENV !== 'production'`

```ts
const isDev = process.env.NODE_ENV !== 'production';

const pesa = createPesa({
  provider: new ClickPesaProvider({ ... }),
  plugins: [
    idempotencyPlugin(),
    retryPlugin({ maxAttempts: 3 }),
    loggingPlugin({ level: 'info' }),
    ...(isDev ? [tunnelPlugin({ port: 8080 })] : []),
  ],
});
```

## Event store

- [ ] A persistent event store adapter is configured (not the in-memory default)
  - Use `@borapesa/sqlite` or implement `PesaDatabaseAdapter` for your database
- [ ] The event store has a volume/monitoring alert — if the events table grows unexpectedly, something is wrong

```ts
import { SQLiteAdapter } from '@borapesa/sqlite';

const pesa = createPesa({
  provider: new ClickPesaProvider({ ... }),
  db: new SQLiteAdapter('./pesa.db'),
});
```

## Webhook handling

- [ ] `pesa.mountWebhook` is mounted on a publicly accessible route (`POST /pesa/webhook` by default)
- [ ] The webhook endpoint does NOT sit behind authentication middleware — providers POST callbacks anonymously
- [ ] `pesa.on('PAYMENT_SUCCESS')` handler is registered before the webhook route (event emitter order)
- [ ] `pesa.on('PAYMENT_FAILED')` handler is registered — alerts your team when payments fail
- [ ] Webhook handler code is idempotent — if the same webhook is delivered twice, it should not double-activate

```ts
// Register handlers BEFORE mounting the webhook route
pesa.on('PAYMENT_SUCCESS', async (event) => {
  // event.reference is your order ID
  await activateOrder(event.reference)
})

pesa.on('PAYMENT_FAILED', async (event) => {
  await notifySupport(event)
})

// Mount publicly — no auth middleware
Bun.serve({ fetch: pesa.mountWebhook })
```

## Error handling

- [ ] Payment initiation errors are caught and surfaced to the user in Swahili / English
- [ ] `PesaNetworkError` is handled separately — "try again later" messaging
- [ ] `PesaProviderError` is logged with its status code — helps diagnose provider-side issues
- [ ] `PesaValidationError` is surfaced as a client error — the payload was invalid

```ts
try {
  const order = await pesa.createOrder({ ... });
} catch (err) {
  if (err instanceof PesaNetworkError) {
    // Provider unreachable — ask user to retry
  } else if (err instanceof PesaValidationError) {
    // Invalid payload — fix your code
  } else if (err instanceof PesaProviderError) {
    // Provider returned an error — log and alert
    console.error(`[pesa] ${err.statusCode}: ${err.message}`);
  }
}
```

## Input validation

- [ ] Phone numbers are sent in MSISDN format (`255XXXXXXXXX`) — not local `07XX`
- [ ] Amounts are whole integers (`15000` = TZS 15,000) — never floats
- [ ] Reference strings are unique per payment — reused references break idempotency
- [ ] Customer name is always provided — required by most providers

## Production readiness

- [ ] A health check endpoint reports provider connectivity status
- [ ] Payment logs are shipped to your observability platform (not just `console.log`)
- [ ] You've tested with a real provider sandbox (not just `BogusProvider`)
- [ ] You've simulated a webhook callback from the provider's dashboard or Postman
- [ ] You've tested the full flow: initiate → receive webhook → activate → query status (fallback)

## Verification

Date: ****\_\_\_****

Provider: ClickPesa / Selcom / AzamPay

Checked by: ****\_\_\_****

---

**All boxes checked?** Your integration qualifies for the **Bora Pesa Verified** badge. [Attestation coming soon — for now, keep this checklist in your repo as proof of review.]
