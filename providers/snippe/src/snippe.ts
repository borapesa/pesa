import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import type {
  BalanceResult,
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
} from '@borapesa/pesa';
import {
  BasePaymentProvider,
  normalisePhone,
  PesaNetworkError,
  PesaProviderError,
  PesaValidationError,
  PesaWebhookError,
} from '@borapesa/pesa';

// ── Constants ───────────────────────────────────────────────────────

const DEFAULT_BASE_URL = 'https://api.snippe.sh';
const API_VERSION = '2026-01-25';
const DEFAULT_TIMEOUT_MS = 30_000;
const MIN_PAYMENT_TZS = 500;
const MIN_PAYOUT_TZS = 5000;

// ── Config ──────────────────────────────────────────────────────────

export interface SnippeConfig {
  /** Snippe API key (`snp_...`). */
  apiKey: string;
  /** HMAC-SHA256 signing key for webhook verification. */
  webhookSecret: string;
  /** Base URL override. Defaults to https://api.snippe.sh. */
  baseUrl?: string;
  /**
   * Default webhook URL applied to createOrder / disburse when the
   * caller doesn't provide one.  Set this so you don't have to pass it
   * on every call.  Provider callbacks POST here.
   */
  webhookUrl?: string;
  /** Request timeout in milliseconds (default: 30_000). */
  timeoutMs?: number;
}

// ── Response types ──────────────────────────────────────────────────

interface SnippeEnvelope<T> {
  status: 'success';
  code: number;
  data: T;
}

interface SnippeMoney {
  currency: string;
  value: number;
}

interface SnippePayment {
  reference: string;
  status: string;
  payment_type: string;
  amount: SnippeMoney;
  expires_at: string;
  payment_url?: string;
  payment_token?: string;
  metadata?: Record<string, unknown>;
}

interface SnippeBalance {
  available: SnippeMoney;
  balance: SnippeMoney;
  object: 'balance';
}

interface SnippePayout {
  reference: string;
  status: string;
  amount: SnippeMoney;
  fees: SnippeMoney;
  total: SnippeMoney;
  channel: { type: string; provider?: string; bank?: string };
  recipient: { name?: string; phone?: string; account?: string; bank?: string };
  external_reference?: string;
  failure_reason?: string;
  metadata?: Record<string, unknown>;
}

interface SnippePayoutFee {
  amount: number;
  feeAmount: number;
  totalAmount: number;
  currency: 'TZS';
}

interface WebhookEvent {
  id: string;
  type: string;
  api_version: string;
  created_at: string;
  data: Record<string, unknown>;
}

// ── Provider ────────────────────────────────────────────────────────

export class SnippePaymentProvider extends BasePaymentProvider {
  readonly name: ProviderName = 'snippe';

  private config: Required<SnippeConfig>;

  constructor(config: SnippeConfig) {
    super();
    this.config = {
      apiKey: config.apiKey,
      webhookSecret: config.webhookSecret,
      baseUrl: (config.baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, ''),
      webhookUrl: config.webhookUrl ?? '',
      timeoutMs: config.timeoutMs ?? DEFAULT_TIMEOUT_MS,
    };
  }

  // ── Auth (internal) ──────────────────────────────────────────────

  private authHeaders(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.config.apiKey}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'Snippe-Version': API_VERSION,
      'User-Agent': 'borapesa-snippe/1.0',
    };
  }

  private idempotencyKey(): string {
    // Snippe format: snp- prefix + 20 hex chars = 24 total (≤ 30 limit)
    return `snp-${randomUUID().replace(/-/g, '').slice(0, 20)}`;
  }

  // ── Helpers ──────────────────────────────────────────────────────

  private async request<T>(
    method: 'GET' | 'POST' | 'DELETE',
    path: string,
    body?: Record<string, unknown>,
  ): Promise<T> {
    const url = `${this.config.baseUrl}${path}`;
    const headers = this.authHeaders();

    // Snippe requires Idempotency-Key on all POSTs
    if (method === 'POST') {
      headers['Idempotency-Key'] = this.idempotencyKey();
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeoutMs);

    let res: Response;
    try {
      res = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });
    } catch (err) {
      clearTimeout(timeoutId);
      if ((err as Error).name === 'AbortError') {
        throw new PesaNetworkError(
          `Snippe ${method} ${path} timed out after ${this.config.timeoutMs}ms`,
        );
      }
      throw new PesaNetworkError(`Snippe ${method} ${path} failed: ${(err as Error).message}`);
    }
    clearTimeout(timeoutId);

    const requestId = res.headers.get('x-request-id') ?? undefined;
    const text = await res.text();
    let parsed: unknown;
    try {
      parsed = text ? JSON.parse(text) : undefined;
    } catch {
      throw new PesaProviderError(
        `Snippe ${method} ${path}: non-JSON response (HTTP ${res.status})`,
        res.status,
        { requestId, raw: text },
      );
    }

    if (
      !res.ok ||
      (parsed &&
        typeof parsed === 'object' &&
        (parsed as Record<string, unknown>).status === 'error')
    ) {
      const envelope = parsed as { error_code?: string; message?: string } | undefined;
      throw new PesaProviderError(
        envelope?.message ?? `Snippe API error (HTTP ${res.status})`,
        res.status,
        { requestId, errorCode: envelope?.error_code, raw: parsed },
      );
    }

    // Snippe wraps successes in { status: "success", code, data }
    const snippeEnvelope = parsed as SnippeEnvelope<T> | undefined;
    if (snippeEnvelope?.status === 'success' && 'data' in snippeEnvelope) {
      return snippeEnvelope.data;
    }

    return parsed as T;
  }

  // ── Status mapping ──────────────────────────────────────────────

  private normalizeStatus(status: string): PaymentStatus {
    switch (status) {
      case 'completed':
        return 'SUCCESS';
      case 'pending':
        return 'PENDING';
      case 'failed':
        return 'FAILED';
      case 'voided':
        return 'CANCELLED';
      case 'expired':
        return 'FAILED';
      default:
        return 'PENDING';
    }
  }

  private normalizePayoutStatus(status: string): DisburseResult['status'] {
    switch (status) {
      case 'completed':
        return 'SUCCESS';
      case 'pending':
        return 'QUEUED';
      case 'failed':
      case 'reversed':
        return 'FAILED';
      default:
        return 'QUEUED';
    }
  }

  private coercePhone(phone: string): string {
    try {
      return normalisePhone(phone);
    } catch {
      // normalisePhone throws on non-TZ numbers — pass through as-is
      // for the API to reject with a clearer error
      return phone;
    }
  }

  // ── Required Methods ─────────────────────────────────────────────

  async createOrder(payload: CreateOrderPayload): Promise<OrderResult> {
    if (payload.amount < MIN_PAYMENT_TZS) {
      throw new PesaValidationError(
        `amount must be at least ${MIN_PAYMENT_TZS} TZS (got ${payload.amount})`,
      );
    }

    const isCard = !!payload.redirectUrl;
    const phone = payload.customer.phone;

    const body: Record<string, unknown> = {
      payment_type: isCard ? 'card' : 'mobile',
      details: {
        amount: payload.amount,
        currency: 'TZS',
        ...(isCard ? { redirect_url: payload.redirectUrl, cancel_url: payload.redirectUrl } : {}),
      },
      phone_number: this.coercePhone(phone),
      customer: {
        firstname: payload.customer.name.split(' ')[0] ?? payload.customer.name,
        lastname: payload.customer.name.split(' ').slice(1).join(' ') || '',
        email: payload.customer.email ?? '',
      },
      webhook_url: this.config.webhookUrl || undefined,
      metadata: payload.description ? { description: payload.description } : undefined,
    };

    // Remove undefined fields — Snippe is strict about absent vs null
    for (const key of Object.keys(body)) {
      if (body[key] === undefined) delete body[key];
    }

    const res = await this.request<SnippePayment>('POST', '/v1/payments', body);

    return {
      orderId: res.reference,
      reference: payload.reference,
      status: this.normalizeStatus(res.status),
      checkoutUrl: res.payment_url,
      raw: res,
    };
  }

  async getPaymentStatus(orderId: string): Promise<PaymentStatus> {
    try {
      const res = await this.request<SnippePayment>(
        'GET',
        `/v1/payments/${encodeURIComponent(orderId)}`,
      );
      return this.normalizeStatus(res.status);
    } catch (err) {
      if (err instanceof PesaProviderError || err instanceof PesaNetworkError) throw err;
      throw new PesaNetworkError(`Snippe status query failed: ${err}`);
    }
  }

  async handleWebhook(
    rawBody: string | Buffer,
    headers: Record<string, string>,
  ): Promise<PaymentEvent> {
    const body = typeof rawBody === 'string' ? rawBody : rawBody.toString();

    // Verify HMAC-SHA256 signature
    const signature = headers['x-webhook-signature'] || headers['X-Webhook-Signature'] || '';
    const timestamp = headers['x-webhook-timestamp'] || headers['X-Webhook-Timestamp'] || '';

    if (!signature || !timestamp) {
      throw new PesaWebhookError('Snippe webhook: missing signature or timestamp header');
    }

    // Replay protection — reject events older than 5 minutes
    const eventTime = Number.parseInt(timestamp, 10);
    if (!Number.isFinite(eventTime)) {
      throw new PesaWebhookError('Snippe webhook: malformed timestamp');
    }
    const currentTime = Math.floor(Date.now() / 1000);
    if (currentTime - eventTime > 300) {
      throw new PesaWebhookError('Snippe webhook: timestamp too old (possible replay)');
    }

    // HMAC-SHA256 over "{timestamp}.{rawBody}"
    const expected = createHmac('sha256', this.config.webhookSecret)
      .update(`${timestamp}.${body}`)
      .digest('hex');

    const expectedBuf = Buffer.from(expected, 'utf8');
    const providedBuf = Buffer.from(signature, 'utf8');
    if (expectedBuf.length !== providedBuf.length || !timingSafeEqual(expectedBuf, providedBuf)) {
      throw new PesaWebhookError('Snippe webhook: invalid signature');
    }

    let event: WebhookEvent;
    try {
      event = JSON.parse(body) as WebhookEvent;
    } catch {
      throw new PesaWebhookError('Snippe webhook: invalid JSON body');
    }

    const data = event.data ?? {};
    const status = this.normalizeStatus((data.status as string) ?? 'pending');
    const amountObj = data.amount as Record<string, unknown> | undefined;

    return {
      id: event.id,
      type: this.webhookEventType(event.type, status),
      orderId: (data.reference as string) ?? 'unknown',
      reference: (data.external_reference as string) ?? (data.reference as string) ?? 'unknown',
      amount: Number(amountObj?.value ?? 0),
      currency: 'TZS',
      status,
      provider: 'snippe',
      timestamp: new Date(event.created_at ?? Date.now()),
      raw: event,
    };
  }

  private webhookEventType(snippeType: string, status: PaymentStatus): PaymentEvent['type'] {
    if (snippeType.startsWith('payout.')) {
      if (status === 'SUCCESS') return 'DISBURSEMENT_SUCCESS';
      if (status === 'FAILED') return 'DISBURSEMENT_FAILED';
      return 'PAYMENT_PENDING';
    }
    if (status === 'SUCCESS') return 'PAYMENT_SUCCESS';
    if (status === 'FAILED') return 'PAYMENT_FAILED';
    return 'PAYMENT_PENDING';
  }

  async disburse(payload: DisbursePayload): Promise<DisburseResult> {
    if (payload.amount < MIN_PAYOUT_TZS) {
      throw new PesaValidationError(
        `amount must be at least ${MIN_PAYOUT_TZS} TZS for payouts (got ${payload.amount})`,
      );
    }

    const isBank = !!payload.recipient.accountNumber;

    const body: Record<string, unknown> = {
      channel: isBank ? 'bank' : 'mobile',
      amount: payload.amount,
      ...(isBank
        ? {
            recipient_bank: payload.recipient.bic,
            recipient_account: payload.recipient.accountNumber,
            recipient_name: payload.recipient.name ?? '',
          }
        : {
            recipient_phone: this.coercePhone(payload.recipient.phone ?? ''),
            recipient_name: payload.recipient.name ?? '',
          }),
      narration: payload.remarks ?? '',
      webhook_url: this.config.webhookUrl || undefined,
    };

    for (const key of Object.keys(body)) {
      if (body[key] === undefined) delete body[key];
    }

    const res = await this.request<SnippePayout>('POST', '/v1/payouts/send', body);

    return {
      disbursementId: res.reference,
      reference: payload.reference,
      status: this.normalizePayoutStatus(res.status),
      raw: res,
    };
  }

  // ── Optional: Balances ───────────────────────────────────────────

  async getBalance(): Promise<BalanceResult> {
    const res = await this.request<SnippeBalance>('GET', '/v1/payments/balance');
    return {
      balances: [{ currency: 'TZS', amount: res.available?.value ?? 0 }],
      raw: res,
    };
  }

  // ── Optional: Order listing + search ─────────────────────────────

  async listOrders(params: ListOrdersParams): Promise<ListOrdersResult> {
    const query: Record<string, string> = {};
    if (params.fromDate) query.from_date = params.fromDate.toISOString().slice(0, 10);
    if (params.toDate) query.to_date = params.toDate.toISOString().slice(0, 10);
    if (params.limit !== undefined) query.limit = String(params.limit);
    if (params.offset !== undefined) query.offset = String(params.offset);

    const qs = new URLSearchParams(query).toString();
    const path = `/v1/payments${qs ? `?${qs}` : ''}`;
    const res = await this.request<SnippePayment[]>('GET', path);

    return {
      orders: res.map((item) => ({
        orderId: item.reference,
        reference: item.reference,
        status: this.normalizeStatus(item.status),
        amount: item.amount?.value ?? 0,
        currency: 'TZS' as const,
        createdAt: new Date(item.expires_at ?? Date.now()),
        raw: item,
      })),
      total: res.length,
    };
  }

  // ── Optional: Credentials ────────────────────────────────────────

  async validateCredentials(): Promise<{ valid: boolean; message?: string }> {
    try {
      await this.getBalance();
      return { valid: true, message: 'Snippe credentials valid' };
    } catch (err) {
      return {
        valid: false,
        message: err instanceof Error ? err.message : 'Validation failed',
      };
    }
  }

  // ── Optional: USSD push retrigger ────────────────────────────────

  /**
   * Re-send the USSD push prompt for a pending mobile payment.
   * Returns the updated payment object.
   */
  async retriggerPush(reference: string): Promise<OrderResult> {
    const res = await this.request<SnippePayment>(
      'POST',
      `/v1/payments/${encodeURIComponent(reference)}/push`,
    );

    return {
      orderId: res.reference,
      reference,
      status: this.normalizeStatus(res.status),
      checkoutUrl: res.payment_url,
      raw: res,
    };
  }

  // ── Optional: Name lookup ────────────────────────────────────────

  async getNameLookup(phoneOrAccount: string): Promise<NameLookupResult> {
    try {
      // Use the search endpoint to find payments for this phone number.
      // This is a lightweight probe — if the number has been seen by
      // Snippe before, the customer name will be in the response.
      const qs = new URLSearchParams({ phone_number: phoneOrAccount, limit: '1' });
      const res = await this.request<SnippePayment[]>(
        'GET',
        `/v1/payments/search?${qs.toString()}`,
      );

      const match = (Array.isArray(res) ? res : []).find(
        (p) => (p as SnippePayment & { customer?: { phone?: string } }).amount,
      );

      return {
        found: !!match,
        accountNumber: phoneOrAccount,
        raw: res,
      };
    } catch {
      return { found: false, accountNumber: phoneOrAccount };
    }
  }

  // ── Optional: Payout fee preview ─────────────────────────────────

  async previewDisburse(payload: DisbursePayload): Promise<PreviewResult> {
    const qs = new URLSearchParams({ amount: String(payload.amount) });
    const res = await this.request<SnippePayoutFee>('GET', `/v1/payouts/fee?${qs.toString()}`);

    return {
      valid: true,
      fee: res.feeAmount,
      message: `Fee: TZS ${res.feeAmount} / Total: TZS ${res.totalAmount}`,
      raw: res,
    };
  }

  // ── Optional: Refund (void a payment) ────────────────────────────

  async refund(orderId: string, _amount?: number): Promise<RefundResult> {
    // Snippe doesn't have a dedicated refund endpoint, but voiding a
    // pending payment has the same effect for most use cases.
    const res = await this.request<SnippePayment>(
      'DELETE',
      `/v1/payments/${encodeURIComponent(orderId)}`,
    );

    return {
      refundId: res.reference,
      orderId,
      amount: _amount ?? res.amount?.value ?? 0,
      status: this.normalizeStatus(res.status) === 'CANCELLED' ? 'SUCCESS' : 'FAILED',
      raw: res,
    };
  }
}
