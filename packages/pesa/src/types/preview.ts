import type { TZSAmount } from './core';

/**
 * Result of a preview / dry-run validation before committing an action.
 *
 * Use `pesa.previewOrder()` or `pesa.previewDisburse()` to validate
 * payloads and check fees before initiating real transactions.
 *
 * @example
 * ```ts
 * if (pesa.previewOrder) {
 *   const preview = await pesa.previewOrder({
 *     amount: 15000, currency: 'TZS', reference: 'pre_001',
 *     customer: { name: 'Juma', phone: '255712345678' },
 *   });
 *
 *   console.log(`Fee: TZS ${preview.fee}`);
 *   console.log(`Total: TZS ${15000 + (preview.fee ?? 0)}`);
 * }
 * ```
 */
export interface PreviewResult {
  /** Whether the payload is valid. */
  valid: boolean;
  /** Expected transaction fee in TZS, if available. */
  fee?: TZSAmount;
  /** Optional human-readable message (e.g., error details). */
  message?: string;
  /** Raw provider response. */
  raw?: unknown;
}

/**
 * Result of a name lookup — resolves the account holder name
 * for a phone number or bank account before disbursing.
 *
 * @example
 * ```ts
 * if (pesa.getNameLookup) {
 *   const lookup = await pesa.getNameLookup('255712345678');
 *   if (lookup.found) {
 *     console.log(`Account: ${lookup.accountName}`);
 *   }
 * }
 * ```
 */
export interface NameLookupResult {
  /** Whether the account was found. */
  found: boolean;
  /** Account holder's name, if found. */
  accountName?: string;
  /** Account number / phone number. */
  accountNumber?: string;
  /** Provider or network name (e.g., 'MPESA', 'CRDB'). */
  provider?: string;
  /** Optional human-readable message. */
  message?: string;
  /** Raw provider response. */
  raw?: unknown;
}
