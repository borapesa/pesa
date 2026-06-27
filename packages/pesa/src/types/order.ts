import type { Currency, TZSAmount } from './core';

/**
 * Payment lifecycle statuses.
 *
 * These are the **normalized** statuses the SDK exposes. Each provider
 * adapter maps its native statuses to these values, so application
 * code never has to handle provider-specific status strings.
 *
 * **`AMBIGUOUS`** is a first-class status — it is a real Selcom
 * response meaning the transaction outcome is unknown. Normalizing it
 * to `PENDING` or `FAILED` would lose information. Applications
 * should poll when they receive `AMBIGUOUS`.
 *
 * @example
 * ```ts
 * pesa.on('PAYMENT_SUCCESS', (event) => {
 *   if (event.status === 'SUCCESS') {
 *     // funds confirmed
 *   }
 * });
 * ```
 */
export type PaymentStatus =
  | 'PENDING' /** Initiated, awaiting user action. */
  | 'PROCESSING' /** MNO confirmed, awaiting settlement. */
  | 'SUCCESS' /** Funds received. */
  | 'FAILED' /** Definitively failed. */
  | 'CANCELLED' /** Cancelled by user or merchant. */
  | 'AMBIGUOUS'; /** Selcom-specific: outcome unknown, must poll. */

/**
 * Payload for creating a payment order.
 *
 * Pass this to {@link PesaInstance.createOrder} to initiate a payment.
 * The SDK validates required fields before forwarding to the provider.
 *
 * @example
 * ```ts
 * const order = await pesa.createOrder({
 *   amount:    15000,
 *   currency:  'TZS',
 *   reference: 'order_abc123',
 *   customer:  {
 *     name:  'Juma Ali',
 *     phone: '255712345678',
 *     email: 'juma@example.com',
 *   },
 *   description: 'Monthly subscription',
 * });
 * ```
 */
export interface CreateOrderPayload {
  /** Amount in whole TZS. 15000 = TZS 15,000. Must be > 0. */
  amount: TZSAmount;
  /** Currency code. Currently only `'TZS'`. */
  currency: Currency;
  /**
   * Your internal order identifier. Must be unique.
   * Used for idempotency — the same reference won't be charged twice.
   */
  reference: string;
  /** Optional human-readable description of the order. */
  description?: string;
  /** Customer details. */
  customer: {
    /** Customer's full name. */
    name: string;
    /**
     * Mobile money phone number in MSISDN format: `255XXXXXXXXX`.
     * Local formats like `07XX` are rejected.
     */
    phone: string;
    /** Customer's email address (optional). */
    email?: string;
  };
  /**
   * Required for redirect-based providers (DPO, Pesapal).
   * URL the customer is sent to after completing payment.
   */
  redirectUrl?: string;
  /** Arbitrary metadata attached to the order. */
  metadata?: Record<string, unknown>;
}

/**
 * Result returned after initiating a payment.
 *
 * The shape varies by provider. Redirect-based providers (DPO, Pesapal)
 * return `checkoutUrl`. USSD push providers (Selcom, ClickPesa) set
 * `ussdPushInitiated: true`.
 *
 * @example
 * ```ts
 * const order = await pesa.createOrder({ ... });
 *
 * if (order.checkoutUrl) {
 *   // Redirect-based flow: send customer to the URL
 *   return redirect(order.checkoutUrl);
 * }
 * // USSD push flow: customer receives a PIN prompt on their phone
 * ```
 */
export interface OrderResult {
  /**
   * Provider-assigned transaction ID. Use this to query status
   * via {@link PesaInstance.getPaymentStatus}.
   */
  orderId: string;
  /** Your reference, echoed back. */
  reference: string;
  /** Current payment status. */
  status: PaymentStatus;
  /** Redirect URL for DPO / Pesapal redirect flows. */
  checkoutUrl?: string;
  /** Whether a USSD push was initiated (Selcom / MNO push flows). */
  ussdPushInitiated?: boolean;
  /**
   * Raw provider response. **Escape hatch — never rely on this.**
   * Use the normalized fields instead.
   */
  raw?: unknown;
}

/** Payload for cancelling a pending or in-progress order. */
export interface CancelOrderPayload {
  /** The provider-assigned order ID. */
  orderId: string;
}

/** Result returned after cancelling a payment order. */
export interface CancelOrderResult {
  /** The cancelled order ID. */
  orderId: string;
  /** Whether the cancellation succeeded. */
  cancelled: boolean;
  /** Optional human-readable message from the provider. */
  message?: string;
  /** Raw provider response. */
  raw?: unknown;
}

/** Parameters for listing payment orders. */
export interface ListOrdersParams {
  /** Filter orders created on or after this date. */
  fromDate?: Date;
  /** Filter orders created on or before this date. */
  toDate?: Date;
  /** Maximum number of orders to return. */
  limit?: number;
  /** Number of orders to skip (for pagination). */
  offset?: number;
}

/** Result returned when listing orders. */
export interface ListOrdersResult {
  /** Matching orders. */
  orders: Array<{
    orderId: string;
    reference: string;
    status: PaymentStatus;
    amount: TZSAmount;
    currency: Currency;
    createdAt: Date;
    raw?: unknown;
  }>;
  /** Total number of matching orders (before limit/offset). */
  total: number;
}
