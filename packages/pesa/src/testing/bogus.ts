import { v4 as uuid } from 'uuid';
import { BasePaymentProvider } from '../providers/base';
import type {
  BalanceResult,
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

type BogusBehavior = 'success' | 'fail' | 'pending' | 'ambiguous';

interface BogusScriptEntry {
  reference: string;
  behavior: BogusBehavior;
  after?: number; // return this behavior after N calls
}

interface BogusOptions {
  /** Default behavior for all operations (default: 'success'). */
  defaultBehavior?: BogusBehavior;
  /** Simulated network latency in ms (default: 200). */
  delay?: number;
  /** Deterministic per-reference behavior overrides. */
  script?: BogusScriptEntry[];
}

/**
 * BogusPaymentProvider — test double for local development and CI/CD.
 *
 * Requires no network access, no credentials, no sandbox registration.
 * Scriptable per-reference behaviors make it ideal for integration tests.
 *
 * @example
 * ```ts
 * import { createPesa } from '@borapesa/pesa';
 * import { BogusPaymentProvider } from '@borapesa/pesa/testing';
 *
 * const pesa = createPesa({
 *   provider: new BogusPaymentProvider({
 *     defaultBehavior: 'success',
 *     delay: 500,
 *     script: [
 *       { reference: 'order_001', behavior: 'success' },
 *       { reference: 'order_002', behavior: 'fail', after: 2 },
 *       { reference: 'order_003', behavior: 'ambiguous' },
 *     ],
 *   }),
 * });
 * ```
 */
export class BogusPaymentProvider extends BasePaymentProvider {
  readonly name: ProviderName = 'bogus';

  private defaultBehavior: BogusBehavior;
  private delay: number;
  private script: Map<string, { behavior: BogusBehavior; callCount: number; after: number }>;
  private orders: Map<string, { payload: CreateOrderPayload; status: PaymentStatus }> = new Map();
  private disbursements: Map<
    string,
    { payload: DisbursePayload; status: DisburseResult['status'] }
  > = new Map();

  constructor(options: BogusOptions = {}) {
    super();
    this.defaultBehavior = options.defaultBehavior ?? 'success';
    this.delay = options.delay ?? 200;
    this.script = new Map();

    for (const entry of options.script ?? []) {
      this.script.set(entry.reference, {
        behavior: entry.behavior,
        callCount: 0,
        after: entry.after ?? 1,
      });
    }
  }

  // ── Required ────────────────────────────────────────────────────────

  async createOrder(payload: CreateOrderPayload): Promise<OrderResult> {
    await this.sleep();
    const behavior = this.resolveBehavior(payload.reference);
    const orderId = `bogus_${uuid()}`;

    const statusMap: Record<BogusBehavior, PaymentStatus> = {
      success: 'SUCCESS',
      fail: 'FAILED',
      pending: 'PENDING',
      ambiguous: 'AMBIGUOUS',
    };

    const status = statusMap[behavior];
    this.orders.set(orderId, { payload, status });

    return {
      orderId,
      reference: payload.reference,
      status,
      ussdPushInitiated: behavior === 'success' || behavior === 'pending',
      checkoutUrl: behavior === 'ambiguous' ? 'https://bogus.pesa/checkout' : undefined,
    };
  }

  async getPaymentStatus(orderId: string): Promise<PaymentStatus> {
    await this.sleep();
    const order = this.orders.get(orderId);
    return order?.status ?? 'PENDING';
  }

  async handleWebhook(
    _rawBody: string | Buffer,
    _headers: Record<string, string>,
  ): Promise<PaymentEvent> {
    await this.sleep();

    // Bogus webhooks always contain a reference in a JSON body
    let reference = 'bogus_ref';
    let status: PaymentStatus = 'SUCCESS';
    let amount = 0;
    let currency = 'TZS';

    try {
      const body =
        typeof _rawBody === 'string' ? JSON.parse(_rawBody) : JSON.parse(_rawBody.toString());
      reference = body.reference ?? reference;
      status = body.status ?? status;
      amount = body.amount ?? amount;
      currency = body.currency ?? currency;
    } catch {
      // raw body, use defaults
    }

    return {
      id: uuid(),
      type: status === 'SUCCESS' ? 'PAYMENT_SUCCESS' : 'PAYMENT_FAILED',
      orderId: `bogus_${uuid()}`,
      reference,
      amount,
      currency: currency as 'TZS',
      status,
      provider: 'bogus',
      timestamp: new Date(),
    };
  }

  async disburse(payload: DisbursePayload): Promise<DisburseResult> {
    await this.sleep();
    const behavior = this.resolveBehavior(payload.reference);
    const disbursementId = `bogus_disburse_${uuid()}`;

    const statusMap: Record<BogusBehavior, DisburseResult['status']> = {
      success: 'SUCCESS',
      fail: 'FAILED',
      pending: 'QUEUED',
      ambiguous: 'QUEUED',
    };

    this.disbursements.set(disbursementId, { payload, status: statusMap[behavior] });

    return {
      disbursementId,
      reference: payload.reference,
      status: statusMap[behavior],
    };
  }

  // ── Optional (all implemented for testing) ──────────────────────────

  async refund(orderId: string, amount?: number): Promise<RefundResult> {
    await this.sleep();
    return {
      refundId: `bogus_refund_${uuid()}`,
      orderId,
      amount: amount ?? 0,
      status: 'SUCCESS',
    };
  }

  async cancelOrder(orderId: string): Promise<CancelOrderResult> {
    await this.sleep();
    const order = this.orders.get(orderId);
    if (order) {
      order.status = 'CANCELLED';
    }
    return { orderId, cancelled: true };
  }

  async validateCredentials(): Promise<{ valid: boolean; message?: string }> {
    await this.sleep();
    return { valid: true, message: 'BogusProvider is always valid' };
  }

  async getBalance(): Promise<BalanceResult> {
    await this.sleep();
    return {
      balances: [
        { currency: 'TZS', amount: 10_000_000 },
        { currency: 'USD', amount: 5_000 },
      ],
    };
  }

  async previewOrder(payload: CreateOrderPayload): Promise<PreviewResult> {
    await this.sleep();
    return { valid: true, fee: Math.floor(payload.amount * 0.01), raw: { provider: 'bogus' } };
  }

  async previewDisburse(payload: DisbursePayload): Promise<PreviewResult> {
    await this.sleep();
    return { valid: true, fee: Math.floor(payload.amount * 0.005), raw: { provider: 'bogus' } };
  }

  async getNameLookup(phoneOrAccount: string): Promise<NameLookupResult> {
    await this.sleep();
    return {
      found: true,
      accountName: 'Bogus User',
      accountNumber: phoneOrAccount,
      provider: 'BOGUS',
    };
  }

  async listOrders(_params: ListOrdersParams): Promise<ListOrdersResult> {
    await this.sleep();
    const orders = Array.from(this.orders.entries()).map(([orderId, { payload, status }]) => ({
      orderId,
      reference: payload.reference,
      status,
      amount: payload.amount,
      currency: payload.currency,
      createdAt: new Date(),
    }));
    return { orders, total: orders.length };
  }

  // ── Internal helpers ────────────────────────────────────────────────

  private resolveBehavior(reference: string): BogusBehavior {
    const scripted = this.script.get(reference);
    if (scripted) {
      scripted.callCount++;
      if (scripted.callCount >= scripted.after) {
        return scripted.behavior;
      }
      // Before the 'after' threshold, return success
      return 'success';
    }
    return this.defaultBehavior;
  }

  private sleep(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, this.delay));
  }
}
