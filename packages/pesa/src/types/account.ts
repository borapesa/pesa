import type { Currency } from './core';

/**
 * Result of a balance inquiry — returns available balances
 * across all active currencies in the provider's wallet.
 *
 * Use `pesa.getBalance()` to verify available funds before
 * initiating disbursements or to display wallet health in dashboards.
 *
 * @since 0.2.0
 *
 * @example
 * ```ts
 * if (pesa.getBalance) {
 *   const { balances } = await pesa.getBalance();
 *   const tzsBalance = balances.find((b) => b.currency === 'TZS');
 *   console.log(`Available: TZS ${tzsBalance?.amount ?? 0}`);
 * }
 * ```
 */
export interface BalanceResult {
  /** Per-currency balance entries. */
  balances: BalanceEntry[];
  /** Raw provider response. */
  raw?: unknown;
}

/**
 * A single currency balance entry.
 */
export interface BalanceEntry {
  /** ISO 4217 currency code (e.g., `"TZS"`, `"USD"`). */
  currency: Currency | string;
  /** Available amount in that currency. */
  amount: number;
}
