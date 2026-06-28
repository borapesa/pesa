import { v4 as uuid } from 'uuid';
import type { PesaDatabaseAdapter } from './db/adapter';
import { SQLiteAdapter } from './db/sqlite';
import {
  PesaNetworkError,
  PesaProviderError,
  PesaUnsupportedError,
  PesaValidationError,
  PesaWebhookError,
} from './errors';
import { createPesaHandler } from './handler';
import type { RequestContext, ResponseContext } from './plugins/types';
import type { BasePaymentProvider } from './providers/base';
import type { BalanceResult } from './types/account';
import type { PesaConfig } from './types/config';
import type { DisbursePayload, DisburseResult } from './types/disbursement';
import type { PaymentEvent, PaymentEventType } from './types/event';
import type {
  CancelOrderResult,
  CreateOrderPayload,
  ListOrdersParams,
  ListOrdersResult,
  OrderResult,
  PaymentStatus,
} from './types/order';
import type { NameLookupResult, PreviewResult } from './types/preview';
import type { RefundResult } from './types/refund';
import { validateCreateOrderPayload, validateDisbursePayload } from './validate';

/**
 * Fully configured payments SDK instance — returned by {@link createPesa}.
 *
 * @since 0.1.0
 *
 * ## Core operations
 *
 * ```ts
 * // Initiate a payment
 * const order = await pesa.createOrder({
 *   amount:    15000,
 *   currency:  'TZS',
 *   reference: 'order_abc',
 *   customer:  { name: 'Juma Ali', phone: '255712345678' },
 * });
 *
 * // Poll status
 * const status = await pesa.getPaymentStatus(order.orderId);
 *
 * // Send money to a customer
 * await pesa.disburse({
 *   amount:    50000,
 *   currency:  'TZS',
 *   reference: 'payout_xyz',
 *   recipient: { phone: '255754321098', network: 'MPESA' },
 * });
 * ```
 *
 * ## Events
 *
 * ```ts
 * // React to verified + persisted payment events
 * pesa.on('PAYMENT_SUCCESS', async (event) => {
 *   await db.orders.update({
 *     id:     event.reference,
 *     status: 'paid',
 *   });
 * });
 * ```
 *
 * ## Optional operations (feature detection)
 *
 * ```ts
 * // Not all providers support these. Check before calling.
 * if (pesa.getBalance)   await pesa.getBalance();
 * if (pesa.refund)       await pesa.refund('order_123', 5000);
 * if (pesa.previewOrder) await pesa.previewOrder({ ... });
 * if (pesa.validateCredentials) await pesa.validateCredentials();
 * ```
 *
 * ## HTTP mount
 *
 * ```ts
 * // Mount directly on any fetch-compatible server
 * Bun.serve({ fetch: pesa.mount });
 * // Or use a framework adapter:
 * // - @borapesa/nextjs → export const { GET, POST } = toNextJsHandler(pesa);
 * // - @borapesa/express → app.use('/api/pesa', toPesaRouter(pesa));
 * ```
 */
export interface PesaInstance {
  // ── Operations ──────────────────────────────────────────────────────

  /**
   * Initiate a checkout / USSD push / redirect.
   *
   * The SDK validates the payload before forwarding to the provider
   * (amount > 0, valid MSISDN phone, non-empty reference).
   *
   * @throws `PesaValidationError` — if the payload is invalid.
   * @throws `PesaNetworkError` — if the provider is unreachable.
   * @throws `PesaProviderError` — if the provider returns an error.
   */
  createOrder(payload: CreateOrderPayload): Promise<OrderResult>;

  /**
   * Poll or fetch current payment status.
   *
   * @throws `PesaNetworkError` — if the provider is unreachable.
   * @throws `PesaProviderError` — if the provider returns an error.
   */
  getPaymentStatus(orderId: string): Promise<PaymentStatus>;

  /**
   * B2C / wallet-out disbursement.
   *
   * The SDK validates the payload before forwarding to the provider.
   *
   * @throws `PesaValidationError` — if the payload is invalid.
   * @throws `PesaNetworkError` — if the provider is unreachable.
   * @throws `PesaProviderError` — if the provider returns an error.
   */
  disburse(payload: DisbursePayload): Promise<DisburseResult>;

  /**
   * Handle an incoming webhook. Called by framework adapters.
   *
   * Flow: provider verification → UUID assignment → plugin hooks
   * → event persistence → user-registered handler emission.
   */
  handleWebhook(rawBody: string | Buffer, headers: Record<string, string>): Promise<void>;

  // ── Event emitter ───────────────────────────────────────────────────

  /**
   * Register a handler for a payment event type.
   *
   * Handlers fire **after** the event is verified and persisted.
   * Multiple handlers can be registered for the same event type.
   */
  on(event: PaymentEventType, handler: (event: PaymentEvent) => Promise<void> | void): void;

  // ── Optional operations (delegated to provider) ─────────────────────

  /** Refund a completed payment. `undefined` if unsupported. */
  refund?(orderId: string, amount?: number): Promise<RefundResult>;

  /** Cancel a pending or in-progress order. `undefined` if unsupported. */
  cancelOrder?(orderId: string): Promise<CancelOrderResult>;

  /** Validate provider credentials (health check). `undefined` if unsupported. */
  validateCredentials?(): Promise<{ valid: boolean; message?: string }>;

  /** Retrieve wallet balances across currencies. `undefined` if unsupported. */
  getBalance?(): Promise<BalanceResult>;

  /** Preview / dry-run a payment. `undefined` if unsupported. */
  previewOrder?(payload: CreateOrderPayload): Promise<PreviewResult>;

  /** Preview / dry-run a disbursement. `undefined` if unsupported. */
  previewDisburse?(payload: DisbursePayload): Promise<PreviewResult>;

  /** Resolve account holder name. `undefined` if unsupported. */
  getNameLookup?(phoneOrAccount: string): Promise<NameLookupResult>;

  /** List payment orders. `undefined` if unsupported. */
  listOrders?(params: ListOrdersParams): Promise<ListOrdersResult>;

  // ── Internals (exposed for framework adapters) ──────────────────────

  /** The underlying provider adapter. */
  provider: BasePaymentProvider;

  /**
   * Generic fetch-like handler. Works with any framework.
   *
   * Routes: `POST /order`, `GET /status/:orderId`, `POST /webhook`.
   */
  mount: (request: Request) => Promise<Response>;
}

/**
 * The single entry point for the entire Bora Pesa SDK.
 *
 * @since 0.1.0
 *
 * Returns a fully configured {@link PesaInstance} with provider logic,
 * plugin pipeline, and event store wired together.
 *
 * @param config — only `provider` is required. Everything else has
 * sensible defaults (SQLite event store, no plugins, webhook secret
 * from `BORAPESA_WEBHOOK_SECRET` environment variable).
 *
 * @example
 * **Production setup with Selcom**
 * ```ts
 * import { createPesa } from '@borapesa/pesa';
 * import { SelcomPaymentProvider } from '@borapesa/selcom';
 * import { retryPlugin, loggingPlugin } from '@borapesa/pesa/plugins';
 *
 * const pesa = createPesa({
 *   provider: new SelcomPaymentProvider({
 *     apiKey:    process.env.SELCOM_API_KEY!,
 *     apiSecret: process.env.SELCOM_API_SECRET!,
 *     vendor:    process.env.SELCOM_VENDOR!,
 *     env:       'live',
 *   }),
 *   plugins: [
 *     retryPlugin({ maxAttempts: 3, backoff: 'exponential' }),
 *     loggingPlugin({ level: 'info' }),
 *   ],
 * });
 * ```
 *
 * **Local development with BogusProvider**
 * ```ts
 * import { createPesa } from '@borapesa/pesa';
 * import { BogusPaymentProvider } from '@borapesa/pesa/testing';
 *
 * const pesa = createPesa({
 *   provider: new BogusPaymentProvider({
 *     defaultBehavior: 'success',
 *     delay: 200,
 *   }),
 * });
 * ```
 *
 * @throws `PesaProviderError` — if the provider config is invalid or unreachable.
 * @throws `PesaValidationError` — if required config fields are missing.
 */
export function createPesa(config: PesaConfig): PesaInstance {
  const provider = config.provider;
  const plugins = config.plugins ?? [];
  const db: PesaDatabaseAdapter = config.db ?? new SQLiteAdapter();

  // Event emitter
  const handlers = new Map<PaymentEventType, Set<(event: PaymentEvent) => Promise<void> | void>>();

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

  // Circuit breaker — safety cap so a misconfigured plugin never loops
  // forever.  The retry plugin's `maxAttempts` is the real limit; this
  // only exists as a backstop.
  const MAX_SAFETY_ITERATIONS = 100;

  /**
   * Run an operation through the plugin pipeline with retry.
   *
   * The retry plugin (if configured) owns the retry decision — the core
   * loop simply respects `rCtx.retry`.  This means `retryPlugin({ maxAttempts: 5 })`
   * actually gives 5 retries; the core does not override it.
   */
  async function withRetry<T>(
    operation: RequestContext['operation'],
    payload: CreateOrderPayload | DisbursePayload,
    execute: (ctx: RequestContext) => Promise<T>,
  ): Promise<T> {
    const ctx = await runBeforeHooks(operation, payload);

    for (let i = 0; i < MAX_SAFETY_ITERATIONS; i++) {
      try {
        const result = await execute(ctx);
        const rCtx = await runAfterHooks(
          ctx,
          result as OrderResult | DisburseResult | Record<string, unknown>,
        );

        if (!rCtx.retry) return result;

        const delay = (rCtx.metadata.retryDelayMs as number) ?? 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
      } catch (err) {
        throw normalizeError(err);
      }
    }

    throw new PesaProviderError(`${operation}: retry circuit breaker triggered`, 502);
  }

  async function createOrder(payload: CreateOrderPayload): Promise<OrderResult> {
    validateCreateOrderPayload(payload);
    return withRetry('createOrder', payload, (ctx) =>
      provider.createOrder(ctx.payload as CreateOrderPayload),
    );
  }

  async function getPaymentStatus(orderId: string): Promise<PaymentStatus> {
    try {
      return await provider.getPaymentStatus(orderId);
    } catch (err) {
      throw normalizeError(err);
    }
  }

  async function disburse(payload: DisbursePayload): Promise<DisburseResult> {
    validateDisbursePayload(payload);
    return withRetry('disburse', payload, (ctx) =>
      provider.disburse(ctx.payload as DisbursePayload),
    );
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

    // 3. Run plugin hooks BEFORE persisting — webhook verification plugins
    //    can reject the event before it touches the database.
    for (const plugin of plugins) {
      if (plugin.onPaymentEvent) {
        await plugin.onPaymentEvent(event);
      }
    }

    // 4. Persist to event store (only after all plugins have accepted it)
    await db.saveEvent(event);

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
    handlers.get(event)?.add(handler);
  }

  // ── Optional operations (feature-detect from provider) ──────────────

  const refund = provider.refund ? provider.refund.bind(provider) : undefined;
  const cancelOrder = provider.cancelOrder ? provider.cancelOrder.bind(provider) : undefined;
  const validateCredentials = provider.validateCredentials
    ? provider.validateCredentials.bind(provider)
    : undefined;
  const getBalance = provider.getBalance ? provider.getBalance.bind(provider) : undefined;
  const previewOrder = provider.previewOrder ? provider.previewOrder.bind(provider) : undefined;
  const previewDisburse = provider.previewDisburse
    ? provider.previewDisburse.bind(provider)
    : undefined;
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
    getBalance,
    previewOrder,
    previewDisburse,
    getNameLookup,
    listOrders,
    provider,
    // mount set below after assembly
    // biome-ignore lint/style/noNonNullAssertion: placeholder, set immediately after
    mount: undefined!,
  };

  instance.mount = createPesaHandler(instance);

  // ── Bootstrap plugins ───────────────────────────────────────────────

  // Call init hooks after assembly so plugins receive the real instance.
  for (const plugin of plugins) {
    plugin.init?.(instance);
  }

  return instance;
}

// ── Error normalization ────────────────────────────────────────────────

function normalizeError(err: unknown): Error {
  // Pass through known Pesa errors so callers can use instanceof checks
  if (
    err instanceof PesaWebhookError ||
    err instanceof PesaUnsupportedError ||
    err instanceof PesaNetworkError ||
    err instanceof PesaValidationError
  ) {
    return err;
  }
  if (err instanceof TypeError && err.message.includes('fetch')) {
    return new PesaNetworkError(`Network error: ${err.message}. Is the provider API reachable?`);
  }
  if (err instanceof Error) {
    return new PesaProviderError(err.message, 502);
  }
  return new PesaProviderError('Unknown provider error', 502);
}
