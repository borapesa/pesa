import type { PesaDatabaseAdapter } from '../db/adapter';
import type { PesaPlugin } from '../plugins/types';
import type { BasePaymentProvider } from '../providers/base';

/**
 * Configuration passed to createPesa().
 *
 * Only `provider` is required. Everything else ships with sensible defaults:
 * - SQLite event store at `./pesa.db`
 * - No plugins
 * - BORAPESA_WEBHOOK_SECRET from environment
 */
export interface PesaConfig {
  /** The payment provider adapter (e.g. Selcom, AzamPay, BogusProvider). */
  provider: BasePaymentProvider;

  /** Optional plugin array. Plugins are composed in order. */
  plugins?: PesaPlugin[];

  /** Webhook configuration. */
  webhooks?: {
    /**
     * Shared secret for HMAC verification of incoming webhooks.
     * Must match the BORAPESA_WEBHOOK_SECRET environment variable.
     * Falls back to process.env.BORAPESA_WEBHOOK_SECRET if not set.
     */
    secret?: string;
  };

  /**
   * Database adapter for the event store.
   * Default: SQLiteAdapter at `./pesa.db`.
   */
  db?: PesaDatabaseAdapter;
}
