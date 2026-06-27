import type { PesaDatabaseAdapter } from '../db/adapter';
import type { PesaPlugin } from '../plugins/types';
import type { BasePaymentProvider } from '../providers/base';

/**
 * Configuration passed to {@link createPesa}.
 *
 * Only `provider` is required. Everything else ships with sensible defaults:
 * - SQLite event store at `./pesa.db`
 * - No plugins
 * - `BORAPESA_WEBHOOK_SECRET` read from environment
 *
 * @example
 * ```ts
 * import { createPesa } from '@borapesa/pesa';
 * import { SelcomPaymentProvider } from '@borapesa/selcom';
 * import { retryPlugin, loggingPlugin } from '@borapesa/pesa/plugins';
 *
 * const pesa = createPesa({
 *   provider: new SelcomPaymentProvider({
 *     apiKey:    process.env.SELCOM_API_KEY!,
 *     apiSecret: process.env.SELCOM_API_SECRET!,
 *     vendor:    process.env.SELCOM_VENDOR!,
 *     env:       'sandbox',
 *   }),
 *   plugins: [
 *     retryPlugin({ maxAttempts: 3 }),
 *     loggingPlugin({ level: 'info' }),
 *   ],
 *   webhooks: {
 *     secret: process.env.BORAPESA_WEBHOOK_SECRET,
 *   },
 *   // Override for production:
 *   // db: new LibSQLAdapter({ url: process.env.TURSO_DATABASE_URL! }),
 * });
 * ```
 */
export interface PesaConfig {
  /**
   * The payment provider adapter.
   *
   * Choose from `@borapesa/selcom`, `@borapesa/clickpesa`,
   * `@borapesa/azampay`, `@borapesa/dpo`, `@borapesa/pesapal`,
   * or use the built-in `BogusPaymentProvider` for local development.
   */
  provider: BasePaymentProvider;

  /**
   * Plugin array. Plugins are composed **in order**.
   *
   * Built-in plugins available from `@borapesa/pesa/plugins`:
   * - `retryPlugin` — exponential/linear/fixed backoff
   * - `idempotencyPlugin` — prevents duplicate charges
   * - `loggingPlugin` — structured logging with PII redaction
   * - `webhookVerifyPlugin` — enforces webhook secret in production
   */
  plugins?: PesaPlugin[];

  /** Webhook configuration. */
  webhooks?: {
    /**
     * Shared secret for HMAC verification of incoming webhooks.
     *
     * Falls back to `process.env.BORAPESA_WEBHOOK_SECRET` if not set.
     * **Required in production.**
     */
    secret?: string;
  };

  /**
   * Database adapter for the event store.
   *
   * Defaults to SQLite at `./pesa.db` (zero config).
   * Swap for `LibSQLAdapter` (Turso), `PostgresAdapter`, `PrismaAdapter`,
   * or `DrizzleAdapter` for production deployments.
   */
  db?: PesaDatabaseAdapter;
}
