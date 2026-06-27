import type { TZSAmount } from './core';

/**
 * Result returned after initiating a refund.
 *
 * Not all providers support refunds. Check capability via
 * `pesa.refund !== undefined` before calling.
 *
 * @example
 * ```ts
 * if (pesa.refund) {
 *   const result = await pesa.refund('order_123', 5000);
 *   if (result.status === 'SUCCESS') {
 *     console.log(`Refund ${result.refundId} processed`);
 *   }
 * }
 * ```
 */
export interface RefundResult {
  /** Provider-assigned refund ID. */
  refundId: string;
  /** The original order ID being refunded. */
  orderId: string;
  /** Amount refunded in whole TZS. */
  amount: TZSAmount;
  /**
   * Refund status.
   * - `SUCCESS` — refund processed
   * - `QUEUED` — refund initiated, poll for updates
   * - `FAILED` — refund failed
   */
  status: 'QUEUED' | 'SUCCESS' | 'FAILED';
  /** Optional human-readable message from the provider. */
  message?: string;
  /** Raw provider response. */
  raw?: unknown;
}
