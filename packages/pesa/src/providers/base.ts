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
 * leaks into application code. Required methods must be implemented.
 * Optional methods default to throwing PesaUnsupportedError.
 */
export abstract class BasePaymentProvider {
  /** Unique provider identifier. */
  abstract readonly name: ProviderName;

  // ── Required ────────────────────────────────────────────────────────

  /** Initiate a checkout / USSD push / redirect. */
  abstract createOrder(payload: CreateOrderPayload): Promise<OrderResult>;

  /** Poll or fetch the current payment status for an order. */
  abstract getPaymentStatus(orderId: string): Promise<PaymentStatus>;

  /**
   * Parse + verify an incoming webhook.
   * The provider validates its own signature internally.
   * Returns a normalized PaymentEvent, ready for persistence.
   */
  abstract handleWebhook(
    rawBody: string | Buffer,
    headers: Record<string, string>,
  ): Promise<PaymentEvent>;

  /** B2C / wallet-out disbursement. */
  abstract disburse(payload: DisbursePayload): Promise<DisburseResult>;

  // ── Optional — throw PesaUnsupportedError by default ─────────────────

  /** Refund a completed payment. Providers that support refunds override this. */
  refund?(_orderId: string, _amount?: number): Promise<RefundResult> {
    throw new PesaUnsupportedError(`${this.name} does not support refunds`);
  }

  /** Cancel a pending or in-progress order. */
  cancelOrder?(_orderId: string): Promise<CancelOrderResult> {
    throw new PesaUnsupportedError(`${this.name} does not support cancelling orders`);
  }

  /** Validate that a provider config works (health check). */
  validateCredentials?(): Promise<{ valid: boolean; message?: string }> {
    throw new PesaUnsupportedError(`${this.name} does not support credential validation`);
  }

  /** Preview / dry-run a payment before committing. */
  previewOrder?(_payload: CreateOrderPayload): Promise<PreviewResult> {
    throw new PesaUnsupportedError(`${this.name} does not support payment preview`);
  }

  /** Preview / dry-run a disbursement before committing. */
  previewDisburse?(_payload: DisbursePayload): Promise<PreviewResult> {
    throw new PesaUnsupportedError(`${this.name} does not support disbursement preview`);
  }

  /** Resolve the account holder name for a phone or account number. */
  getNameLookup?(_phoneOrAccount: string): Promise<NameLookupResult> {
    throw new PesaUnsupportedError(`${this.name} does not support name lookup`);
  }

  /** List payment orders for a date range. */
  listOrders?(_params: ListOrdersParams): Promise<ListOrdersResult> {
    throw new PesaUnsupportedError(`${this.name} does not support listing orders`);
  }
}
