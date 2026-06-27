import { v4 as uuid } from 'uuid';
import type { PesaConfig } from './types/config';
import type {
  CreateOrderPayload,
  OrderResult,
  PaymentStatus,
  CancelOrderResult,
  ListOrdersParams,
  ListOrdersResult,
} from './types/order';
import type { PaymentEvent, PaymentEventType } from './types/event';
import type { DisbursePayload, DisburseResult } from './types/disbursement';
import type { RefundResult } from './types/refund';
import type { PreviewResult, NameLookupResult } from './types/preview';
import type { PesaDatabaseAdapter } from './db/adapter';
import { SQLiteAdapter } from './db/sqlite';
import type { RequestContext, ResponseContext } from './plugins/types';
import type { BasePaymentProvider } from './providers/base';
import { createPesaHandler } from './handler';
import {
  PesaUnsupportedError,
  PesaWebhookError,
  PesaNetworkError,
  PesaProviderError,
} from './errors';

/**
 * PesaInstance — the fully configured payments SDK.
 *
 * Returned by createPesa(). Provides the runtime API for initiating payments,
 * polling status, handling webhooks, and reacting to events.
 */
export interface PesaInstance {
  // ── Operations ──────────────────────────────────────────────────────

  /** Initiate a checkout / USSD push / redirect. */
  createOrder(payload: CreateOrderPayload): Promise<OrderResult>;

  /** Poll or fetch current payment status. */
  getPaymentStatus(orderId: string): Promise<PaymentStatus>;

  /** B2C / wallet-out disbursement. */
  disburse(payload: DisbursePayload): Promise<DisburseResult>;

  /**
   * Handle an incoming webhook. Called by framework adapters.
   * Verifies, normalizes, persists, and emits the event.
   */
  handleWebhook(
    rawBody: string | Buffer,
    headers: Record<string, string>,
  ): Promise<void>;

  // ── Event emitter ───────────────────────────────────────────────────

  /** React to a verified + persisted payment event. */
  on(
    event: PaymentEventType,
    handler: (event: PaymentEvent) => Promise<void> | void,
  ): void;

  // ── Optional operations (delegated to provider) ─────────────────────

  /** Refund a completed payment. Throws PesaUnsupportedError if the provider doesn't support it. */
  refund?(orderId: string, amount?: number): Promise<RefundResult>;

  /** Cancel a pending or in-progress order. */
  cancelOrder?(orderId: string): Promise<CancelOrderResult>;

  /** Validate that provider credentials are correct (health check). */
  validateCredentials?(): Promise<{ valid: boolean; message?: string }>;

  /** Preview / dry-run a payment. */
  previewOrder?(payload: CreateOrderPayload): Promise<PreviewResult>;

  /** Preview / dry-run a disbursement. */
  previewDisburse?(payload: DisbursePayload): Promise<PreviewResult>;

  /** Resolve the account holder name. */
  getNameLookup?(phoneOrAccount: string): Promise<NameLookupResult>;

  /** List payment orders. */
  listOrders?(params: ListOrdersParams): Promise<ListOrdersResult>;

  // ── Internals (exposed for framework adapters) ──────────────────────

  /** The underlying provider adapter. */
  provider: BasePaymentProvider;

  /** Mount handler — generic fetch-like interface for any framework. */
  mount: (request: Request) => Promise<Response>;
}

/**
 * createPesa() — the single entry point for the entire SDK.
 *
 * Mirrors better-auth's betterAuth() factory. Returns a fully configured
 * pesa instance with all provider logic, plugins, and event store wired together.
 *
 * @example
 * ```ts
 * import { createPesa } from '@borapesa/pesa';
 * import { SelcomPaymentProvider } from '@borapesa/selcom';
 *
 * const pesa = createPesa({
 *   provider: new SelcomPaymentProvider({ ... }),
 *   plugins: [retryPlugin(), loggingPlugin()],
 * });
 * ```
 */
export function createPesa(config: PesaConfig): PesaInstance {
  const provider = config.provider;
  const plugins = config.plugins ?? [];
  const db: PesaDatabaseAdapter = config.db ?? new SQLiteAdapter();

  // Event emitter
  const handlers = new Map<PaymentEventType, Set<(event: PaymentEvent) => Promise<void> | void>>();

  // ── Bootstrap plugins ───────────────────────────────────────────────

  // We build the instance reference first, then call init hooks.
  // The mount handler is set later.
  const pesa: PesaInstance = {} as PesaInstance;

  for (const plugin of plugins) {
    plugin.init?.(pesa);
  }

  // ── Plugin pipeline ─────────────────────────────────────────────────

  async function runBeforeHooks(
    operation: RequestContext['operation'],
    payload: CreateOrderPayload | DisbursePayload | Record<string, unknown>,
  ): Promise<RequestContext> {
    let ctx: RequestContext = {
      operation,
      payload,
      headers: {},
      metadata: {},
    };
    for (const plugin of plugins) {
      if (plugin.beforeRequest) {
        ctx = await plugin.beforeRequest(ctx);
      }
    }
    return ctx;
  }

  async function runAfterHooks(
    ctx: RequestContext,
    result: OrderResult | DisburseResult | Record<string, unknown>,
  ): Promise<ResponseContext> {
    const startTime = ctx.metadata.startTime as number;
    let rCtx: ResponseContext = {
      operation: ctx.operation,
      payload: ctx.payload,
      result,
      durationMs: startTime ? Date.now() - startTime : 0,
      retry: false,
      metadata: {},
    };
    for (const plugin of plugins) {
      if (plugin.afterResponse) {
        rCtx = await plugin.afterResponse(rCtx);
      }
    }
    return rCtx;
  }

  // ── Operations ──────────────────────────────────────────────────────

  async function createOrder(payload: CreateOrderPayload): Promise<OrderResult> {
    const ctx = await runBeforeHooks('createOrder', payload);

    try {
      const result = await provider.createOrder(payload);
      const rCtx = await runAfterHooks(ctx, result);

      // Retry logic
      if (rCtx.retry) {
        const attempt = (rCtx.metadata.retryAttempt as number) ?? 1;
        const delay = (rCtx.metadata.retryDelayMs as number) ?? 1000;
        if (attempt <= 3) {
          await new Promise((resolve) => setTimeout(resolve, delay));
          return createOrder(payload);
        }
      }

      return result;
    } catch (err) {
      throw normalizeError(err);
    }
  }

  async function getPaymentStatus(orderId: string): Promise<PaymentStatus> {
    try {
      return await provider.getPaymentStatus(orderId);
    } catch (err) {
      throw normalizeError(err);
    }
  }

  async function disburse(payload: DisbursePayload): Promise<DisburseResult> {
    const ctx = await runBeforeHooks('disburse', payload);

    try {
      const result = await provider.disburse(payload);
      const rCtx = await runAfterHooks(ctx, result);

      if (rCtx.retry) {
        const attempt = (rCtx.metadata.retryAttempt as number) ?? 1;
        const delay = (rCtx.metadata.retryDelayMs as number) ?? 1000;
        if (attempt <= 3) {
          await new Promise((resolve) => setTimeout(resolve, delay));
          return disburse(payload);
        }
      }

      return result;
    } catch (err) {
      throw normalizeError(err);
    }
  }

  async function handleWebhook(
    rawBody: string | Buffer,
    headers: Record<string, string>,
  ): Promise<void> {
    // 1. Provider verifies its own signature
    let event: PaymentEvent;
    try {
      event = await provider.handleWebhook(rawBody, headers);
    } catch (err) {
      throw new PesaWebhookError(
        `Webhook verification failed: ${err instanceof Error ? err.message : 'unknown error'}`,
      );
    }

    // 2. Assign UUID if not already set
    if (!event.id) {
      event.id = uuid();
    }

    // 3. Persist to event store
    await db.saveEvent(event);

    // 4. Run plugin hooks
    for (const plugin of plugins) {
      if (plugin.onPaymentEvent) {
        await plugin.onPaymentEvent(event);
      }
    }

    // 5. Emit to user-registered handlers
    const eventHandlers = handlers.get(event.type);
    if (eventHandlers) {
      for (const handler of eventHandlers) {
        await handler(event);
      }
    }
  }

  // ── Event emitter ───────────────────────────────────────────────────

  function on(
    event: PaymentEventType,
    handler: (event: PaymentEvent) => Promise<void> | void,
  ): void {
    if (!handlers.has(event)) {
      handlers.set(event, new Set());
    }
    handlers.get(event)!.add(handler);
  }

  // ── Optional operations (feature-detect from provider) ──────────────

  const refund     = provider.refund ? provider.refund.bind(provider) : undefined;
  const cancelOrder = provider.cancelOrder ? provider.cancelOrder.bind(provider) : undefined;
  const validateCredentials = provider.validateCredentials
    ? provider.validateCredentials.bind(provider) : undefined;
  const previewOrder = provider.previewOrder ? provider.previewOrder.bind(provider) : undefined;
  const previewDisburse = provider.previewDisburse
    ? provider.previewDisburse.bind(provider) : undefined;
  const getNameLookup = provider.getNameLookup ? provider.getNameLookup.bind(provider) : undefined;
  const listOrders = provider.listOrders ? provider.listOrders.bind(provider) : undefined;

  // ── Assemble ────────────────────────────────────────────────────────

  const instance: PesaInstance = {
    createOrder,
    getPaymentStatus,
    disburse,
    handleWebhook,
    on,
    refund,
    cancelOrder,
    validateCredentials,
    previewOrder,
    previewDisburse,
    getNameLookup,
    listOrders,
    provider,
    // mount set below after assembly
    mount: undefined!,
  };

  instance.mount = createPesaHandler(instance);

  return instance;
}

// ── Error normalization ────────────────────────────────────────────────

function normalizeError(err: unknown): Error {
  if (err instanceof PesaWebhookError || err instanceof PesaUnsupportedError) {
    return err;
  }
  if (err instanceof TypeError && err.message.includes('fetch')) {
    return new PesaNetworkError(
      `Network error: ${err.message}. Is the provider API reachable?`,
    );
  }
  if (err instanceof Error) {
    return new PesaProviderError(err.message, 502);
  }
  return new PesaProviderError('Unknown provider error', 502);
}
