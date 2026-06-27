import type { Currency, TZSAmount } from './core';

/**
 * Payment lifecycle statuses.
 *
 * AMBIGUOUS is preserved as a first-class status — it is a real Selcom
 * response meaning the transaction outcome is unknown. Normalizing it to
 * PENDING or FAILED would lose information.
 */
export type PaymentStatus =
  | 'PENDING' // initiated, awaiting user action
  | 'PROCESSING' // MNO confirmed, awaiting settlement
  | 'SUCCESS' // funds received
  | 'FAILED' // definitively failed
  | 'CANCELLED' // cancelled by user or merchant
  | 'AMBIGUOUS'; // Selcom-specific: outcome unknown, must poll

/** Payload for creating a payment order. */
export interface CreateOrderPayload {
  amount: TZSAmount;
  currency: Currency;
  reference: string; // your internal order ID — must be unique
  description?: string;
  customer: {
    name: string;
    phone: string; // MSISDN format: 255XXXXXXXXX
    email?: string;
  };
  redirectUrl?: string; // required for DPO / Pesapal redirect flows
  metadata?: Record<string, unknown>;
}

/** Result returned after initiating a payment. */
export interface OrderResult {
  orderId: string; // provider-assigned transaction ID
  reference: string; // your reference, echoed back
  status: PaymentStatus;
  checkoutUrl?: string; // redirect-based providers (DPO, Pesapal)
  ussdPushInitiated?: boolean; // Selcom / MNO push flows
  raw?: unknown; // escape hatch — never rely on this
}

/** Payload for cancelling a payment order. */
export interface CancelOrderPayload {
  orderId: string;
}

/** Result returned after cancelling a payment order. */
export interface CancelOrderResult {
  orderId: string;
  cancelled: boolean;
  message?: string;
  raw?: unknown;
}

/** Parameters for listing orders. */
export interface ListOrdersParams {
  fromDate?: Date;
  toDate?: Date;
  limit?: number;
  offset?: number;
}

/** Result returned when listing orders. */
export interface ListOrdersResult {
  orders: Array<{
    orderId: string;
    reference: string;
    status: PaymentStatus;
    amount: TZSAmount;
    currency: Currency;
    createdAt: Date;
    raw?: unknown;
  }>;
  total: number;
}
