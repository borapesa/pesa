import { PesaUnsupportedError } from '../errors';
import type {
  CancelOrderResult,
  CreateOrderPayload,
  DisbursePayload,
  DisburseResult,
  ListOrdersParams,
  ListOrdersResult,
  NameLookupResult,
  OrderResult,
  PaymentEvent,
  PaymentStatus,
  PreviewResult,
  ProviderName,
  RefundResult,
} from '../types/index';

/**
 * Abstract base class every provider adapter must implement.
 *
 * The SDK calls only these methods — no provider-specific logic ever
 * leaks into application code.
 *
 * ## Required methods (must implement)
 *
 * - {@link createOrder} — initiate a checkout / USSD push / redirect
 * - {@link getPaymentStatus} — poll or fetch current payment status
 * - {@link handleWebhook} — parse + verify an incoming webhook
 * - {@link disburse} — B2C / wallet-out disbursement
 *
 * ## Optional methods (override to enable)
 *
 * Default implementations throw {@link PesaUnsupportedError}.
 * Applications can feature-detect capability:
 *
 * ```ts
 * if (pesa.refund) {
 *   await pesa.refund('order_123', 5000);
 * }
 * ```
 *
 * ## Writing a provider adapter
 *
 * ```ts
 * import { BasePaymentProvider } from '@borapesa/pesa';
 * import type { ProviderName, CreateOrderPayload, OrderResult } from '@borapesa/pesa';
 *
 * export class MyProvider extends BasePaymentProvider {
 *   readonly name: ProviderName = 'selcom';
 *
 *   async createOrder(payload: CreateOrderPayload): Promise<OrderResult> {
 *     // Call your provider's API
 *     const res = await fetch('https://api.provider.com/order', {
 *       method: 'POST',
 *       body: JSON.stringify(payload),
 *     });
 *     const data = await res.json();
 *     return {
 *       orderId:   data.transactionId,
 *       reference: payload.reference,
 *       status:    'PENDING',
 *     };
 *   }
 *
 *   async getPaymentStatus(orderId: string): Promise<PaymentStatus> { ... }
 *   async handleWebhook(rawBody, headers): Promise<PaymentEvent> { ... }
 *   async disburse(payload): Promise<DisburseResult> { ... }
 * }
 * ```
 */
export abstract class BasePaymentProvider {
  /** Unique provider identifier. */
  abstract readonly name: ProviderName;

  // ── Required ────────────────────────────────────────────────────────

  /**
   * Initiate a checkout / USSD push / redirect.
   *
   * The SDK calls `validateCreateOrderPayload()` before this,
   * so you can assume `amount > 0`, `reference` is non-empty,
   * and `customer.phone` is in MSISDN format.
   */
  abstract createOrder(payload: CreateOrderPayload): Promise<OrderResult>;

  /** Poll or fetch the current payment status for an order. */
  abstract getPaymentStatus(orderId: string): Promise<PaymentStatus>;

  /**
   * Parse + verify an incoming webhook.
   *
   * The provider must:
   * 1. Verify its own cryptographic signature (HMAC, checksum, etc.)
   * 2. Parse the raw body into structured data
   * 3. Return a normalized {@link PaymentEvent}
   *
   * The SDK handles UUID assignment, event persistence, plugin hooks,
   * and user-registered handler emission after this method returns.
   */
  abstract handleWebhook(
    rawBody: string | Buffer,
    headers: Record<string, string>,
  ): Promise<PaymentEvent>;

  /**
   * B2C / wallet-out disbursement.
   *
   * The SDK calls `validateDisbursePayload()` before this.
   */
  abstract disburse(payload: DisbursePayload): Promise<DisburseResult>;

  // ── Optional — throw PesaUnsupportedError by default ─────────────────

  /**
   * Refund a completed payment.
   *
   * @throws `PesaUnsupportedError` — if the provider does not support refunds.
   */
  refund?(_orderId: string, _amount?: number): Promise<RefundResult> {
    throw new PesaUnsupportedError(`${this.name} does not support refunds`);
  }

  /**
   * Cancel a pending or in-progress order.
   *
   * @throws `PesaUnsupportedError` — if the provider does not support cancellation.
   */
  cancelOrder?(_orderId: string): Promise<CancelOrderResult> {
    throw new PesaUnsupportedError(`${this.name} does not support cancelling orders`);
  }

  /**
   * Validate that a provider config works (health check).
   *
   * Useful for startup checks or `/health` endpoints.
   *
   * @returns `{ valid: true }` if credentials are correct.
   * @throws `PesaUnsupportedError` — if the provider does not support validation.
   */
  validateCredentials?(): Promise<{ valid: boolean; message?: string }> {
    throw new PesaUnsupportedError(`${this.name} does not support credential validation`);
  }

  /**
   * Preview / dry-run a payment before committing.
   *
   * Returns expected fees and validity without charging the customer.
   *
   * @throws `PesaUnsupportedError` — if the provider does not support preview.
   */
  previewOrder?(_payload: CreateOrderPayload): Promise<PreviewResult> {
    throw new PesaUnsupportedError(`${this.name} does not support payment preview`);
  }

  /**
   * Preview / dry-run a disbursement before committing.
   *
   * @throws `PesaUnsupportedError` — if the provider does not support preview.
   */
  previewDisburse?(_payload: DisbursePayload): Promise<PreviewResult> {
    throw new PesaUnsupportedError(`${this.name} does not support disbursement preview`);
  }

  /**
   * Resolve the account holder name for a phone or account number.
   *
   * Useful for verifying recipient identity before disbursing.
   *
   * @throws `PesaUnsupportedError` — if the provider does not support name lookup.
   */
  getNameLookup?(_phoneOrAccount: string): Promise<NameLookupResult> {
    throw new PesaUnsupportedError(`${this.name} does not support name lookup`);
  }

  /**
   * List payment orders for a date range.
   *
   * @throws `PesaUnsupportedError` — if the provider does not support listing orders.
   */
  listOrders?(_params: ListOrdersParams): Promise<ListOrdersResult> {
    throw new PesaUnsupportedError(`${this.name} does not support listing orders`);
  }
}
