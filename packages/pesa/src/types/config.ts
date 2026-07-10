import type { PesaDatabaseAdapter } from '../db/adapter';
import type { PesaPlugin } from '../plugins/types';
import type { BasePaymentProvider } from '../providers/base';

/**
 * Configuration passed to {@link createPesa}.
 *
 * Only `provider` is required. Everything else ships with sensible defaults:
 * - In-memory event store (lost on restart — swap to a persistent adapter for production)
 * - No plugins
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
 *     pin:       process.env.SELCOM_PIN!,
 *     baseUrl:   'https://apigw.selcommobile.com',
 *   }),
 *   plugins: [
 *     retryPlugin({ maxAttempts: 3 }),
 *     loggingPlugin({ level: 'info' }),
 *   ],
 *   // Override for production:
 *   // db: new SQLiteAdapter({ path: './pesa.db' }),
 * });
 * ```
 */
export interface PesaConfig {
  /**
   * The payment provider adapter.
   *
   * Choose from `@borapesa/selcom`, `@borapesa/clickpesa`,
   * `@borapesa/azampay` (DPO and Pesapal are planned),
   * or use the built-in `BogusPaymentProvider` for local development.
   */
  provider: BasePaymentProvider;

  /**
   * Base path for the built-in webhook handler (`pesa.mountWebhook`).
   *
   * The handler serves a single route:
   * - `POST {basePath}/webhook` — receive provider webhooks
   *
   * For order creation and status queries, use {@link PesaInstance.createOrder}
   * and {@link PesaInstance.getPaymentStatus} in your own routes behind your
   * own auth middleware.
   *
   * @default '/pesa'
   */
  basePath?: string;

  /**
   * Plugin array. Plugins are composed **in order**.
   *
   * Built-in plugins available from `@borapesa/pesa/plugins`:
   * - `retryPlugin` — exponential/linear/fixed backoff
   * - `idempotencyPlugin` — prevents duplicate charges
   * - `loggingPlugin` — structured logging with PII redaction
   */
  plugins?: PesaPlugin[];

  /**
   * Database adapter for the event store.
   *
   * Defaults to an in-memory store (lost on restart). Swap to the
   * `@borapesa/sqlite` adapter for production deployments, or implement
   * the {@link PesaDatabaseAdapter} interface for your own database.
   */
  db?: PesaDatabaseAdapter;
}
