import { createHmac } from 'node:crypto';
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
} from '@borapesa/pesa';
import {
  BasePaymentProvider,
  PesaError,
  PesaNetworkError,
  PesaProviderError,
} from '@borapesa/pesa';
import { v4 as uuid } from 'uuid';

// ── Constants ───────────────────────────────────────────────────────

const SANDBOX_URL = 'https://api-sandbox.clickpesa.com';
const PRODUCTION_URL = 'https://api.clickpesa.com';

// ── Config ──────────────────────────────────────────────────────────

export interface ClickPesaConfig {
  /** Client ID from ClickPesa dashboard. */
  clientId: string;
  /** API key from ClickPesa dashboard. */
  apiKey: string;
  /**
   * Optional checksum key for HMAC-SHA256 signing.
   *
   * When set, every POST/PUT/PATCH request body is automatically signed
   * with a `checksum` field.  Also used for verifying incoming webhook
   * signatures.  Generate this in the ClickPesa dashboard.
   */
  checksumKey?: string;
  /**
   * Target the sandbox environment.
   *
   * When `true`, defaults to `https://api-sandbox.clickpesa.com`.
   * When `false` (default), uses `https://api.clickpesa.com`.
   *
   * Set `baseUrl` directly to override both — useful for local proxies
   * or staging environments.
   */
  sandbox?: boolean;
  /**
   * Explicit base URL override.
   *
   * Takes precedence over `sandbox`.  You rarely need this — prefer
   * `sandbox: true` for testing and `sandbox: false` for production.
   */
  baseUrl?: string;
}

// ── Response types (ClickPesa-specific shapes) ──────────────────────

interface ClickPesaApiError {
  success: false;
  error?: string;
  message?: string;
}

interface TokenResponse {
  success: boolean;
  token: string;
}

interface UssdPushResponse {
  id: string;
  status: string;
  channel: string;
  orderReference: string;
  collectedAmount: string;
  collectedCurrency: string;
}

interface PaymentStatusItem {
  id: string;
  status: 'SUCCESS' | 'SETTLED' | 'PROCESSING' | 'PENDING' | 'FAILED';
  orderReference: string;
  collectedAmount: number;
  collectedCurrency: string;
  paymentPhoneNumber?: string;
  customer?: { customerName: string; customerPhoneNumber: string };
}

interface CheckoutLinkResponse {
  checkoutLink: string;
  orderReference: string;
}

interface MobilePayoutResponse {
  id: string;
  status: string;
  orderReference: string;
}

interface CardPaymentResponse {
  cardPaymentLink: string;
  clientId: string;
}

interface CardPreviewResponse {
  success: boolean;
  activeMethods?: Array<{ name: string; status: string }>;
}

interface PreviewResponse {
  valid: boolean;
  fee?: number;
  message?: string;
}

// ── BillPay types ────────────────────────────────────────────────────

/** A single BillPay control number. */
export interface BillPayControlNumber {
  billPayNumber: string;
  billReference?: string;
  billAmount?: number;
  billDescription?: string;
  billPaymentMode?: string;
  billCustomerName?: string;
  billStatus?: string;
  billCustomerPhone?: string;
  billCustomerEmail?: string;
}

/** Result from a bulk BillPay creation. */
export interface BillPayBulkResult {
  billPayNumbers: BillPayControlNumber[];
  created: number;
  failed: number;
  errors?: Array<{ billReference?: string; error: string }>;
}

// ── Provider ────────────────────────────────────────────────────────

export class ClickPesaProvider extends BasePaymentProvider {
  readonly name: ProviderName = 'clickpesa';

  // Shared payout status mapping (used by both mobile money + bank payouts)
  private static readonly PAYOUT_STATUS_MAP: Record<string, DisburseResult['status']> = {
    SUCCESS: 'SUCCESS',
    PROCESSING: 'QUEUED',
    PENDING: 'QUEUED',
    FAILED: 'FAILED',
  };

  private config: Required<Pick<ClickPesaConfig, 'clientId' | 'apiKey'>> &
    Pick<ClickPesaConfig, 'checksumKey'> & { baseUrl: string };
  private token: string | null = null;
  private tokenExpiresAt = 0;

  constructor(config: ClickPesaConfig) {
    super();
    const baseUrl = config.baseUrl ?? (config.sandbox ? SANDBOX_URL : PRODUCTION_URL);
    this.config = {
      baseUrl: baseUrl.replace(/\/$/, ''),
      clientId: config.clientId,
      apiKey: config.apiKey,
      checksumKey: config.checksumKey,
    };
  }

  // ── Auth (internal) ──────────────────────────────────────────────

  private authPromise: Promise<string> | null = null;

  private async authenticate(): Promise<string> {
    if (this.token && Date.now() < this.tokenExpiresAt) {
      return this.token;
    }

    // Promise-based lock: concurrent callers share a single auth request
    if (this.authPromise) return this.authPromise;

    this.authPromise = this.fetchToken();
    try {
      return await this.authPromise;
    } finally {
      this.authPromise = null;
    }
  }

  private async fetchToken(): Promise<string> {
    const res = await fetch(`${this.config.baseUrl}/third-parties/generate-token`, {
      method: 'POST',
      headers: {
        'client-id': this.config.clientId,
        'api-key': this.config.apiKey,
      },
    });

    if (!res.ok) {
      const body = await res.text();
      throw new PesaNetworkError(`ClickPesa auth failed: ${res.status} ${body}`);
    }

    const data = (await res.json()) as TokenResponse | ClickPesaApiError;
    if (!('success' in data && data.success && data.token)) {
      throw new PesaProviderError(
        `ClickPesa auth failed: ${('error' in data && data.error) || 'unknown error'}`,
        res.status,
      );
    }

    this.token = data.token; // already includes "Bearer " prefix
    this.tokenExpiresAt = Date.now() + 55 * 60 * 1000; // refresh 5 min before 1-hour expiry
    return this.token as string;
  }

  private async authHeaders(): Promise<Record<string, string>> {
    const token = await this.authenticate();
    return {
      Authorization: token,
      'Content-Type': 'application/json',
    };
  }

  // ── Helpers ──────────────────────────────────────────────────────

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const method = (init.method ?? 'GET').toUpperCase();
    const headers = await this.authHeaders();

    // Build a copy so the caller's body is never mutated (matches Python SDK pattern).
    let body = init.body as string | undefined;
    if (init.body && this.config.checksumKey && ['POST', 'PUT', 'PATCH'].includes(method)) {
      const payload = JSON.parse(init.body as string) as Record<string, unknown>;
      if (!('checksum' in payload)) {
        payload.checksum = this.createChecksum(payload);
        body = JSON.stringify(payload);
      }
    }

    const res = await fetch(`${this.config.baseUrl}${path}`, {
      ...init,
      method,
      body,
      headers: { ...headers, ...(init.headers as Record<string, string> | undefined) },
    });

    if (!res.ok) {
      const bodyText = await res.text();
      throw new PesaProviderError(
        `ClickPesa ${path} failed: ${res.status} ${bodyText}`,
        res.status,
      );
    }

    const json = (await res.json()) as T | ClickPesaApiError;
    if (json && typeof json === 'object' && 'success' in json && !json.success) {
      throw new PesaProviderError(
        ('error' in json && json.error) || ('message' in json && json.message) || 'API error',
        res.status,
        json,
      );
    }

    return json as T;
  }

  private normalizeStatus(status: string): PaymentStatus {
    switch (status) {
      case 'SUCCESS':
      case 'SETTLED':
        return 'SUCCESS';
      case 'PROCESSING':
        return 'PROCESSING';
      case 'PENDING':
        return 'PENDING';
      case 'FAILED':
        return 'FAILED';
      default:
        return 'PENDING';
    }
  }

  // ── Required Methods ─────────────────────────────────────────────

  async createOrder(payload: CreateOrderPayload): Promise<OrderResult> {
    // Route by currency:
    //   TZS + redirectUrl → hosted checkout link
    //   TZS (no redirect) → USSD push (mobile money)
    //   USD               → card payment (VISA / Mastercard)
    if (payload.currency === 'USD') {
      return this.createCardPayment(payload);
    }
    if (payload.redirectUrl) {
      return this.createCheckout(payload);
    }
    return this.createUssdPush(payload);
  }

  private async createUssdPush(payload: CreateOrderPayload): Promise<OrderResult> {
    const res = await this.request<UssdPushResponse>(
      '/third-parties/payments/initiate-ussd-push-request',
      {
        method: 'POST',
        body: JSON.stringify({
          amount: String(payload.amount),
          currency: payload.currency,
          orderReference: payload.reference,
          phoneNumber: payload.customer.phone,
        }),
      },
    );

    return {
      // Use orderReference as orderId — ClickPesa's status query API
      // accepts the merchant reference, not the internal transaction ID.
      orderId: payload.reference,
      reference: payload.reference,
      status: this.normalizeStatus(res.status),
      ussdPushInitiated: true,
    };
  }

  private async createCheckout(payload: CreateOrderPayload): Promise<OrderResult> {
    const res = await this.request<CheckoutLinkResponse>(
      '/third-parties/checkout/generate-checkout-link',
      {
        method: 'POST',
        body: JSON.stringify({
          amount: String(payload.amount),
          currency: payload.currency,
          orderReference: payload.reference,
          customer: {
            name: payload.customer.name,
            email: payload.customer.email,
            phone: payload.customer.phone,
          },
          returnUrl: payload.redirectUrl,
          description: payload.description,
        }),
      },
    );

    return {
      orderId: payload.reference,
      reference: payload.reference,
      status: 'PENDING',
      checkoutUrl: res.checkoutLink,
    };
  }

  private async createCardPayment(payload: CreateOrderPayload): Promise<OrderResult> {
    const customer: Record<string, string> = {};
    if (payload.customer.name) customer.fullName = payload.customer.name;
    if (payload.customer.email) customer.email = payload.customer.email;
    if (payload.customer.phone) customer.phoneNumber = payload.customer.phone;

    const res = await this.request<CardPaymentResponse>(
      '/third-parties/payments/initiate-card-payment',
      {
        method: 'POST',
        body: JSON.stringify({
          amount: String(payload.amount),
          currency: 'USD',
          orderReference: payload.reference,
          customer,
        }),
      },
    );

    return {
      orderId: payload.reference,
      reference: payload.reference,
      status: 'PENDING',
      checkoutUrl: res.cardPaymentLink,
    };
  }

  async getPaymentStatus(orderId: string): Promise<PaymentStatus> {
    try {
      const data = await this.request<PaymentStatusItem[]>(
        `/third-parties/payments/${encodeURIComponent(orderId)}`,
      );
      if (Array.isArray(data) && data.length > 0) {
        return this.normalizeStatus(data[0]?.status ?? 'PENDING');
      }
      return 'PENDING';
    } catch (err) {
      // 404 means the order hasn't been processed yet — return PENDING
      if (err instanceof PesaProviderError && err.statusCode === 404) {
        return 'PENDING';
      }
      if (err instanceof PesaError) throw err;
      throw new PesaNetworkError(`ClickPesa status query failed: ${err}`);
    }
  }

  async handleWebhook(
    rawBody: string | Buffer,
    headers: Record<string, string>,
  ): Promise<PaymentEvent> {
    const body = typeof rawBody === 'string' ? rawBody : rawBody.toString();

    // Verify checksum signature if key is configured
    if (this.config.checksumKey) {
      const checksum = headers['x-clickpesa-checksum'] || headers.checksum || '';
      const verified = this.verifyChecksum(body, checksum);
      if (!verified) {
        throw new PesaProviderError('ClickPesa webhook checksum verification failed', 401);
      }
    }

    let payload: Record<string, unknown>;
    try {
      payload = JSON.parse(body);
    } catch {
      throw new PesaProviderError('ClickPesa webhook: invalid JSON body', 400);
    }

    const event = payload.event as string | undefined;
    const data = payload.data as Record<string, unknown> | undefined;

    // orderId must match what createOrder returns — the merchant reference,
    // since ClickPesa's status query API accepts orderReference, not the
    // internal transaction UUID.
    const orderId = (data?.orderReference as string) ?? 'unknown';
    const reference = orderId;
    const status = this.normalizeStatus((data?.status as string) ?? 'PENDING');
    const amount = Number(data?.collectedAmount ?? data?.amount ?? 0);
    const currency = (data?.collectedCurrency as string) ?? (data?.currency as string) ?? 'TZS';

    // Deterministic event lookup — no order-sensitive conditionals that
    // silently change behaviour when reordered.
    const EVENT_MAP: Record<string, (s: string) => PaymentEvent['type']> = {
      'PAYMENT RECEIVED': (s) => (s === 'SUCCESS' ? 'PAYMENT_SUCCESS' : 'PAYMENT_PENDING'),
      'PAYOUT INITIATED': (s) => (s === 'SUCCESS' ? 'DISBURSEMENT_SUCCESS' : 'DISBURSEMENT_FAILED'),
      'PAYOUT REFUNDED': (s) => (s === 'SUCCESS' ? 'DISBURSEMENT_SUCCESS' : 'DISBURSEMENT_FAILED'),
      'PAYMENT FAILED': () => 'PAYMENT_FAILED',
    };
    const type: PaymentEvent['type'] = event
      ? (EVENT_MAP[event]?.(status as string) ??
        (status === 'FAILED' ? 'PAYMENT_FAILED' : 'PAYMENT_PENDING'))
      : status === 'FAILED'
        ? 'PAYMENT_FAILED'
        : 'PAYMENT_PENDING';

    return {
      id: uuid(),
      type,
      orderId,
      reference,
      amount: amount as number,
      currency: currency as 'TZS',
      status,
      provider: 'clickpesa',
      timestamp: new Date(),
      raw: payload,
    };
  }

  async disburse(payload: DisbursePayload): Promise<DisburseResult> {
    // Route by recipient: bank account → bank payout, phone → mobile money
    if (payload.recipient.accountNumber) {
      return this.createBankPayout(payload);
    }
    const res = await this.request<MobilePayoutResponse>(
      '/third-parties/disbursement/mobile-money-payout',
      {
        method: 'POST',
        body: JSON.stringify({
          amount: String(payload.amount),
          currency: payload.currency,
          orderReference: payload.reference,
          phoneNumber: payload.recipient.phone,
          recipientName: payload.recipient.name,
          remarks: payload.remarks,
        }),
      },
    );

    return {
      disbursementId: res.id,
      reference: payload.reference,
      status: ClickPesaProvider.PAYOUT_STATUS_MAP[res.status] ?? 'QUEUED',
    };
  }

  private async createBankPayout(payload: DisbursePayload): Promise<DisburseResult> {
    const res = await this.request<MobilePayoutResponse>(
      '/third-parties/payouts/create-bank-payout',
      {
        method: 'POST',
        body: JSON.stringify({
          amount: payload.amount,
          accountNumber: payload.recipient.accountNumber,
          accountName: payload.recipient.name,
          bic: payload.recipient.bic,
          orderReference: payload.reference,
          transferType: payload.recipient.transferType ?? 'ACH',
          currency: payload.currency,
          accountCurrency: 'TZS',
        }),
      },
    );

    return {
      disbursementId: res.id,
      reference: payload.reference,
      status: ClickPesaProvider.PAYOUT_STATUS_MAP[res.status] ?? 'QUEUED',
    };
  }

  // ── Optional Methods ─────────────────────────────────────────────

  async validateCredentials(): Promise<{ valid: boolean; message?: string }> {
    try {
      await this.authenticate();
      return { valid: true, message: 'ClickPesa credentials valid' };
    } catch (err) {
      return { valid: false, message: err instanceof Error ? err.message : 'Auth failed' };
    }
  }

  async getBalance(): Promise<BalanceResult> {
    const data = await this.request<{
      balances?: Array<{ currency: string; balance: number }>;
    }>('/third-parties/account/balance');

    const rawBalances = data.balances ?? [];
    return {
      balances: rawBalances.map((b) => ({
        currency: b.currency,
        amount: b.balance,
      })),
      raw: data,
    };
  }

  async previewOrder(payload: CreateOrderPayload): Promise<PreviewResult> {
    if (payload.currency === 'USD') {
      return this.previewCard(payload);
    }
    const res = await this.request<PreviewResponse>(
      '/third-parties/payments/preview-ussd-push-request',
      {
        method: 'POST',
        body: JSON.stringify({
          amount: String(payload.amount),
          currency: payload.currency,
          phoneNumber: payload.customer.phone,
        }),
      },
    );

    return {
      valid: res.valid !== false,
      fee: res.fee,
      message: res.message,
      raw: res,
    };
  }

  private async previewCard(payload: CreateOrderPayload): Promise<PreviewResult> {
    const res = await this.request<CardPreviewResponse>(
      '/third-parties/payments/preview-card-payment',
      {
        method: 'POST',
        body: JSON.stringify({
          amount: String(payload.amount),
          currency: 'USD',
          orderReference: payload.reference,
        }),
      },
    );

    return {
      valid: res.success !== false && (res.activeMethods?.length ?? 0) > 0,
      message:
        res.activeMethods && res.activeMethods.length > 0
          ? `Available: ${res.activeMethods.map((m) => m.name).join(', ')}`
          : 'No card methods available',
      raw: res,
    };
  }

  async previewDisburse(payload: DisbursePayload): Promise<PreviewResult> {
    if (payload.recipient.accountNumber) {
      return this.previewBankPayout(payload);
    }
    const res = await this.request<PreviewResponse>(
      '/third-parties/disbursement/mobile-money-payout/preview',
      {
        method: 'POST',
        body: JSON.stringify({
          amount: String(payload.amount),
          currency: payload.currency,
          phoneNumber: payload.recipient.phone,
        }),
      },
    );

    return {
      valid: res.valid !== false,
      fee: res.fee,
      message: res.message,
      raw: res,
    };
  }

  private async previewBankPayout(payload: DisbursePayload): Promise<PreviewResult> {
    const res = await this.request<PreviewResponse>('/third-parties/payouts/preview-bank-payout', {
      method: 'POST',
      body: JSON.stringify({
        amount: payload.amount,
        accountNumber: payload.recipient.accountNumber,
        bic: payload.recipient.bic,
        orderReference: payload.reference,
        transferType: payload.recipient.transferType ?? 'ACH',
        currency: payload.currency,
        accountCurrency: 'TZS',
      }),
    });

    return {
      valid: res.valid !== false,
      fee: res.fee,
      message: res.message,
      raw: res,
    };
  }

  /**
   * Generate a hosted payout link.
   *
   * The recipient uses the link to enter their own bank or mobile-money
   * details — you don't need to collect them yourself.  Returns a URL
   * you redirect the recipient to.
   */
  async generatePayoutLink(amount: number, orderId: string): Promise<string> {
    const res = await this.request<{ payoutLink: string; clientId: string }>(
      '/third-parties/payout-link/generate-payout-url',
      {
        method: 'POST',
        body: JSON.stringify({
          amount: String(amount),
          orderReference: orderId,
        }),
      },
    );
    return res.payoutLink;
  }

  /**
   * Fetch the latest exchange rates.
   *
   * @param source — ISO 4217 source currency (e.g. `"USD"`). All sources when omitted.
   * @param target — ISO 4217 target currency (e.g. `"TZS"`). All targets when omitted.
   */
  async getExchangeRates(
    source?: string,
    target?: string,
  ): Promise<Array<{ source: string; target: string; rate: number; date: string }>> {
    const params: Record<string, string> = {};
    if (source) params.source = source;
    if (target) params.target = target;
    const qs = new URLSearchParams(params).toString();
    return this.request<Array<{ source: string; target: string; rate: number; date: string }>>(
      `/third-parties/exchange-rates/all${qs ? `?${qs}` : ''}`,
    );
  }

  async getBanks(): Promise<Array<{ name: string; bic: string; value?: string }>> {
    const data = await this.request<Array<{ name: string; bic: string; value?: string }>>(
      '/third-parties/list/banks',
    );
    return data;
  }

  /**
   * Fetch a transaction statement for a given currency.
   *
   * @param currency — `"TZS"` (default) or `"USD"`.
   * @param startDate — Optional filter: start date.
   * @param endDate — Optional filter: end date.
   */
  async getAccountStatement(
    currency = 'TZS',
    startDate?: Date,
    endDate?: Date,
  ): Promise<{
    accountDetails: Record<string, unknown>;
    transactions: Array<Record<string, unknown>>;
  }> {
    const params: Record<string, string> = { currency };
    if (startDate) params.startDate = startDate.toISOString().slice(0, 10);
    if (endDate) params.endDate = endDate.toISOString().slice(0, 10);
    const qs = new URLSearchParams(params).toString();
    return this.request<{
      accountDetails: Record<string, unknown>;
      transactions: Array<Record<string, unknown>>;
    }>(`/third-parties/account/statement?${qs}`);
  }

  async getNameLookup(phoneOrAccount: string): Promise<NameLookupResult> {
    try {
      const res = await this.request<{
        accountName?: string;
        accountNumber?: string;
        provider?: string;
      }>(`/third-parties/disbursement/mobile-money-payout/preview`, {
        method: 'POST',
        body: JSON.stringify({ amount: '100', currency: 'TZS', phoneNumber: phoneOrAccount }),
      });

      return {
        found: !!res.accountName,
        accountName: res.accountName,
        accountNumber: res.accountNumber ?? phoneOrAccount,
        provider: res.provider ?? 'ClickPesa',
        raw: res,
      };
    } catch {
      return { found: false, accountNumber: phoneOrAccount };
    }
  }

  async listOrders(params: ListOrdersParams): Promise<ListOrdersResult> {
    const query: Record<string, string> = {};

    // Map our date types to ClickPesa's YYYY-MM-DD string params
    if (params.fromDate) {
      query.startDate = params.fromDate.toISOString().slice(0, 10);
    }
    if (params.toDate) {
      query.endDate = params.toDate.toISOString().slice(0, 10);
    }
    if (params.limit !== undefined) {
      query.limit = String(params.limit);
    }
    if (params.offset !== undefined) {
      query.skip = String(params.offset);
    }

    const qs = new URLSearchParams(query).toString();
    const path = `/third-parties/payments/all${qs ? `?${qs}` : ''}`;

    const data = await this.request<{
      data?: Array<{
        id: string;
        status: string;
        orderReference: string;
        collectedAmount: number;
        collectedCurrency: string;
        createdAt?: string;
      }>;
      totalCount?: number;
    }>(path);

    const items = data.data ?? [];
    return {
      orders: items.map((item) => ({
        orderId: item.orderReference,
        reference: item.orderReference,
        status: this.normalizeStatus(item.status),
        amount: item.collectedAmount,
        currency: (item.collectedCurrency as 'TZS') ?? 'TZS',
        createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
        raw: item,
      })),
      total: data.totalCount ?? items.length,
    };
  }

  // ── BillPay ─────────────────────────────────────────────────────────

  /**
   * Generate a one-time order control number.
   *
   * Customers pay this number via mobile money, SIM banking, or CRDB Wakala.
   * All fields are optional — the API auto-generates a reference if omitted.
   */
  async createOrderControlNumber(params?: {
    billReference?: string;
    amount?: number;
    description?: string;
    paymentMode?: 'ALLOW_PARTIAL_AND_OVER_PAYMENT' | 'EXACT';
  }): Promise<BillPayControlNumber> {
    const payload: Record<string, unknown> = {};
    if (params?.billReference) payload.billReference = params.billReference;
    if (params?.amount !== undefined) payload.billAmount = params.amount;
    if (params?.description) payload.billDescription = params.description;
    if (params?.paymentMode) payload.billPaymentMode = params.paymentMode;
    return this.request<BillPayControlNumber>(
      '/third-parties/billpay/create-order-control-number',
      { method: 'POST', body: JSON.stringify(payload) },
    );
  }

  /**
   * Generate a persistent control number tied to a specific customer.
   * At least one of `phone` or `email` must be supplied.
   */
  async createCustomerControlNumber(params: {
    customerName: string;
    phone?: string;
    email?: string;
    billReference?: string;
    amount?: number;
    description?: string;
    paymentMode?: 'ALLOW_PARTIAL_AND_OVER_PAYMENT' | 'EXACT';
  }): Promise<BillPayControlNumber> {
    if (!params.phone && !params.email) {
      throw new PesaProviderError('At least one of phone or email must be provided', 400);
    }
    const payload: Record<string, unknown> = { customerName: params.customerName };
    if (params.phone) payload.customerPhone = params.phone;
    if (params.email) payload.customerEmail = params.email;
    if (params.billReference) payload.billReference = params.billReference;
    if (params.amount !== undefined) payload.billAmount = params.amount;
    if (params.description) payload.billDescription = params.description;
    if (params.paymentMode) payload.billPaymentMode = params.paymentMode;
    return this.request<BillPayControlNumber>(
      '/third-parties/billpay/create-customer-control-number',
      { method: 'POST', body: JSON.stringify(payload) },
    );
  }

  /** Bulk-create up to 50 order control numbers in a single request. */
  async bulkCreateOrderNumbers(
    controlNumbers: Array<Record<string, unknown>>,
  ): Promise<BillPayBulkResult> {
    if (!controlNumbers.length || controlNumbers.length > 50) {
      throw new PesaProviderError('bulkCreateOrderNumbers requires 1–50 items', 400);
    }
    return this.request<BillPayBulkResult>(
      '/third-parties/billpay/bulk-create-order-control-numbers',
      { method: 'POST', body: JSON.stringify({ controlNumbers }) },
    );
  }

  /** Bulk-create up to 50 customer control numbers in a single request. */
  async bulkCreateCustomerNumbers(
    controlNumbers: Array<Record<string, unknown>>,
  ): Promise<BillPayBulkResult> {
    if (!controlNumbers.length || controlNumbers.length > 50) {
      throw new PesaProviderError('bulkCreateCustomerNumbers requires 1–50 items', 400);
    }
    return this.request<BillPayBulkResult>(
      '/third-parties/billpay/bulk-create-customer-control-numbers',
      { method: 'POST', body: JSON.stringify({ controlNumbers }) },
    );
  }

  /** Query details of a specific control number. */
  async getBillPayDetails(billPayNumber: string): Promise<BillPayControlNumber> {
    return this.request<BillPayControlNumber>(
      `/third-parties/billpay/${encodeURIComponent(billPayNumber)}`,
    );
  }

  /**
   * Partially update a BillPay reference. At least one field besides
   * `billPayNumber` must be provided.
   */
  async updateBillPayReference(
    billPayNumber: string,
    params: {
      amount?: number;
      description?: string;
      status?: 'ACTIVE' | 'INACTIVE';
      paymentMode?: 'ALLOW_PARTIAL_AND_OVER_PAYMENT' | 'EXACT';
    },
  ): Promise<BillPayControlNumber> {
    const data: Record<string, unknown> = {};
    if (params.amount !== undefined) data.billAmount = params.amount;
    if (params.description) data.billDescription = params.description;
    if (params.status) data.billStatus = params.status;
    if (params.paymentMode) data.billPaymentMode = params.paymentMode;
    if (Object.keys(data).length === 0) {
      throw new PesaProviderError('At least one field must be provided to update', 400);
    }
    return this.request<BillPayControlNumber>(
      `/third-parties/billpay/${encodeURIComponent(billPayNumber)}`,
      { method: 'PATCH', body: JSON.stringify(data) },
    );
  }

  /** Activate or deactivate a control number (convenience wrapper). */
  async updateBillPayStatus(
    billPayNumber: string,
    status: 'ACTIVE' | 'INACTIVE',
  ): Promise<BillPayControlNumber> {
    return this.updateBillPayReference(billPayNumber, { status });
  }

  // refund and cancelOrder are not supported by ClickPesa's current API.
  // They fall back to the BasePaymentProvider default (throws PesaUnsupportedError).

  // ── Private helpers ──────────────────────────────────────────────

  /**
   * Create a ClickPesa-compatible HMAC-SHA256 checksum for a request body.
   *
   * Algorithm (per ClickPesa docs):
   * 1. Canonicalize — recursively sort all object keys alphabetically.
   * 2. Serialize to compact JSON (no whitespace).
   * 3. Return hex digest of HMAC-SHA256(key, json_string).
   *
   * @internal Exposed for testing via the provider instance.
   */
  createChecksum(payload: Record<string, unknown>): string {
    if (!this.config.checksumKey) return '';

    const canonicalize = (obj: unknown): unknown => {
      if (obj === null || typeof obj !== 'object') return obj;
      if (Array.isArray(obj)) return obj.map(canonicalize);
      const sorted: Record<string, unknown> = {};
      for (const key of Object.keys(obj as Record<string, unknown>).sort()) {
        sorted[key] = canonicalize((obj as Record<string, unknown>)[key]);
      }
      return sorted;
    };

    const canonical = canonicalize(payload);
    const json = JSON.stringify(canonical);

    const hmac = createHmac('sha256', this.config.checksumKey);
    return hmac.update(json).digest('hex');
  }

  private verifyChecksum(body: string, checksum: string): boolean {
    if (!this.config.checksumKey) return true;

    const hmac = createHmac('sha256', this.config.checksumKey);
    const expected = hmac.update(body).digest('hex');

    // Constant-time comparison — prevents timing-based side-channel attacks.
    // XOR-based: every byte is compared regardless of mismatch position.
    const received = checksum.toLowerCase();
    if (expected.length !== received.length) return false;
    let diff = 0;
    for (let i = 0; i < expected.length; i++) {
      diff |= expected.charCodeAt(i) ^ received.charCodeAt(i);
    }
    return diff === 0;
  }
}
