import type { Currency, TZSAmount } from './core';

/**
 * Supported mobile money networks for disbursement (B2C payouts).
 *
 * @example
 * ```ts
 * await pesa.disburse({
 *   amount:    50000,
 *   currency:  'TZS',
 *   reference: 'payout_001',
 *   recipient: {
 *     phone:   '255754321098',
 *     name:    'Juma Ali',
 *     network: 'MPESA',
 *   },
 * });
 * ```
 */
export type MobileNetwork = 'MPESA' | 'TIGOPESA' | 'AIRTELMONEY' | 'HALOPESA' | 'AZAMPESA';

/**
 * Payload for sending a disbursement (B2C / wallet-out).
 *
 * Pass this to {@link PesaInstance.disburse} to send money to a
 * customer's mobile money wallet.
 */
export interface DisbursePayload {
  /** Amount in whole TZS. Must be > 0. */
  amount: TZSAmount;
  /** Currency code. Currently only `'TZS'`. */
  currency: Currency;
  /** Recipient details. */
  recipient: {
    /** Mobile money phone number in MSISDN format: `255XXXXXXXXX`. */
    phone: string;
    /** Recipient's full name (optional but recommended). */
    name?: string;
    /** Target mobile money network. */
    network?: MobileNetwork;
  };
  /** Your internal reference. Must be unique. */
  reference: string;
  /** Optional remarks / narration for the payout. */
  remarks?: string;
}

/**
 * Result returned after initiating a disbursement.
 *
 * @example
 * ```ts
 * const result = await pesa.disburse({
 *   amount:    50000,
 *   currency:  'TZS',
 *   reference: 'payout_001',
 *   recipient: { phone: '255754321098', network: 'MPESA' },
 * });
 *
 * if (result.status === 'SUCCESS') {
 *   console.log(`Disbursement ${result.disbursementId} sent`);
 * }
 * ```
 */
export interface DisburseResult {
  /** Provider-assigned disbursement ID. */
  disbursementId: string;
  /** Your reference, echoed back. */
  reference: string;
  /**
   * Disbursement status.
   * - `SUCCESS` — funds sent
   * - `QUEUED` — processing, poll for updates
   * - `FAILED` — definitively failed
   */
  status: 'QUEUED' | 'SUCCESS' | 'FAILED';
  /** Raw provider response. Escape hatch. */
  raw?: unknown;
}
