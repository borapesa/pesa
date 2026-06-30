import type { PesaInstance } from '../pesa';
import type { DisbursePayload, DisburseResult } from '../types/disbursement';
import type { PaymentEvent } from '../types/event';
import type { CreateOrderPayload, OrderResult } from '../types/order';

/**
 * Context passed to beforeRequest hooks.
 * Allows plugins to inspect and modify the outgoing request.
 */
export interface RequestContext {
  operation: 'createOrder' | 'disburse' | 'refund' | 'cancelOrder';
  payload: CreateOrderPayload | DisbursePayload | Record<string, unknown>;
  headers: Record<string, string>;
  metadata: Record<string, unknown>;
}

/**
 * Context passed to afterResponse hooks.
 * Allows plugins to inspect the provider response and decide on retries.
 */
export interface ResponseContext {
  operation: 'createOrder' | 'disburse' | 'refund' | 'cancelOrder';
  payload: CreateOrderPayload | DisbursePayload | Record<string, unknown>;
  result: OrderResult | DisburseResult | Record<string, unknown>;
  durationMs: number;
  retry: boolean;
  metadata: Record<string, unknown>;
}

/**
 * Plugin lifecycle hooks.
 *
 * Plugins are plain objects passed in the `plugins` array of PesaConfig.
 * They are composed in order at createPesa() time. No class inheritance.
 */
export interface PesaPlugin {
  /** Unique plugin name (used for logging and debugging). */
  name: string;

  /**
   * Called before each outgoing request to a payment provider.
   * Plugins can modify the request context (e.g., add idempotency keys).
   */
  beforeRequest?: (ctx: RequestContext) => Promise<RequestContext>;

  /**
   * Called after each response from a payment provider.
   * Plugins can inspect the response and set `ctx.retry = true` to trigger
   * a retry (handled by the retry plugin).
   */
  afterResponse?: (ctx: ResponseContext) => Promise<ResponseContext>;

  /**
   * Called when a provider request throws an error.
   *
   * Plugins can inspect the error and set `ctx.retry = true` + a delay in
   * `ctx.metadata.retryDelayMs` to trigger a retry.  If no plugin sets
   * `retry = true`, the error is re-thrown.
   *
   * @since 0.6.0
   */
  onError?: (error: Error, ctx: RequestContext) => Promise<ResponseContext | undefined>;

  /**
   * Called **before** a verified PaymentEvent is persisted to the event store.
   *
   * Throw to reject the event — it will bubble up as a webhook error and the
   * event will not be saved. Do **not** query the event store for this event
   * here — it hasn't been persisted yet.
   *
   * Use for: webhook deduplication, custom verification, spam filtering.
   * For side effects after persistence, register a {@link PesaInstance.on}
   * handler instead.
   */
  onPaymentEvent?: (event: PaymentEvent) => Promise<void>;

  /**
   * Called once at startup. Receives the pesa instance for extension.
   */
  init?: (pesa: PesaInstance) => void;
}
