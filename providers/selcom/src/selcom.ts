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
  ProviderName,
} from '@borapesa/pesa';
import {
  BasePaymentProvider,
  PesaError,
  PesaNetworkError,
  PesaProviderError,
  PesaValidationError,
} from '@borapesa/pesa';
import { v4 as uuid } from 'uuid';

// ── Constants ───────────────────────────────────────────────────────

const DEFAULT_BASE_URL = 'https://apigw.selcommobile.com';

// ── Config ──────────────────────────────────────────────────────────

export interface SelcomConfig {
  /** Base URL. Defaults to https://apigw.selcommobile.com. */
  baseUrl?: string;
  /** API key from Selcom. */
  apiKey: string;
  /** API secret for HMAC signing. */
  apiSecret: string;
  /** Float account / vendor identifier. */
  vendor: string;
  /** Float account PIN — required for disbursement and balance queries. */
  pin: string;
  /**
   * Source account number for Qwiksend bank transfers.
   * Defaults to vendor if not set.
   */
  senderAccount?: string;
  /**
   * Account holder display name for bank transfers.
   * Defaults to vendor if not set.
   */
  senderName?: string;
  /**
   * Sender mobile number for bank transfers.
   */
  senderPhone?: string;
  /**
   * Default redirect URL for checkout orders.  The customer is sent here
   * after completing payment.  Overridable per-payment via
   * {@link CreateOrderPayload.redirectUrl}.
   */
  redirectUrl?: string;
  /**
   * Cancel URL for checkout orders.  The customer is sent here if they
   * abandon the payment.  Base64-encoded per Selcom spec.
   */
  cancelUrl?: string;
  /**
   * Webhook callback URL for payment status notifications.  Selcom POSTs
   * the payment result here.  Typically your pesa.mountWebhook endpoint.
   * Base64-encoded per Selcom spec.
   */
  webhookUrl?: string;
}

// ── Response types ──────────────────────────────────────────────────

interface SelcomResponse {
  transid?: string;
  reference: string;
  resultcode: string;
  result: string;
  message: string;
  data: unknown[];
}

// ── Provider ────────────────────────────────────────────────────────

export class SelcomPaymentProvider extends BasePaymentProvider {
  readonly name: ProviderName = 'selcom';

  /** Tracks orderId → Selcom query endpoint so getPaymentStatus hits the right API. */
  private orderTypes = new Map<string, 'checkout' | 'push'>();
  private static readonly MAX_ORDER_MAP = 10_000;

  private config: Required<
    Omit<
      SelcomConfig,
      | 'baseUrl'
      | 'redirectUrl'
      | 'cancelUrl'
      | 'webhookUrl'
      | 'senderAccount'
      | 'senderName'
      | 'senderPhone'
    >
  > &
    Pick<
      SelcomConfig,
      'redirectUrl' | 'cancelUrl' | 'webhookUrl' | 'senderAccount' | 'senderName' | 'senderPhone'
    > & {
      baseUrl: string;
    };

  constructor(config: SelcomConfig) {
    super();
    this.config = {
      baseUrl: (config.baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, ''),
      apiKey: config.apiKey,
      apiSecret: config.apiSecret,
      vendor: config.vendor,
      pin: config.pin,
      senderAccount: config.senderAccount,
      senderName: config.senderName,
      senderPhone: config.senderPhone,
      redirectUrl: config.redirectUrl,
      cancelUrl: config.cancelUrl,
      webhookUrl: config.webhookUrl,
    };
  }

  // ── Auth (internal) ──────────────────────────────────────────────

  /**
   * Build Selcom HMAC-SHA256 digest for a request.
   *
   * Selcom requires every request to carry an HMAC signature of the
   * payload fields.  The timestamp used in the signing string must
   * match the `Timestamp` header exactly — generate it once and
   * thread it through.
   */
  private sign(signedFields: string[], params: Record<string, unknown>, ts: string): string {
    const parts = [`timestamp=${ts}`];
    for (const field of signedFields) {
      const val = params[field];
      if (val !== undefined) {
        parts.push(`${field}=${val}`);
      }
    }
    const signingString = parts.join('&');
    const hmac = createHmac('sha256', this.config.apiSecret);
    return hmac.update(signingString).digest('base64');
  }

  /** ISO 8601 timestamp with timezone offset (e.g., 2026-06-28T17:00:00+03:00). */
  private timestamp(): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    const d = new Date();
    const offset = -d.getTimezoneOffset();
    const sign = offset >= 0 ? '+' : '-';
    const abs = Math.abs(offset);
    const tz = `${sign}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`;
    return (
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
      `T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}${tz}`
    );
  }

  private authHeaders(
    signedFields: string[],
    params: Record<string, unknown>,
  ): Record<string, string> {
    const ts = this.timestamp();
    return {
      'Content-Type': 'application/json',
      Authorization: `SELCOM ${Buffer.from(this.config.apiKey).toString('base64')}`,
      'Digest-Method': 'HS256',
      Digest: this.sign(signedFields, params, ts),
      Timestamp: ts,
      'Signed-Fields': signedFields.join(','),
    };
  }

  // ── Helpers ──────────────────────────────────────────────────────

  /**
   * Execute a signed request against the Selcom API.
   *
   * `signedFields` is derived automatically from `Object.keys(params)`
   * in alphabetical order — no manual lists to keep in sync.
   */
  private async request<T>(
    method: 'POST' | 'GET' | 'DELETE',
    path: string,
    params: Record<string, unknown>,
  ): Promise<T> {
    const signedFields = Object.keys(params).sort();
    const headers = this.authHeaders(signedFields, params);

    const isGetOrDelete = method === 'GET' || method === 'DELETE';
    const qs = isGetOrDelete
      ? new URLSearchParams(params as Record<string, string>).toString()
      : '';
    const fullPath = qs ? `${path}?${qs}` : path;

    const res = await fetch(`${this.config.baseUrl}${fullPath}`, {
      method,
      headers,
      body: isGetOrDelete ? undefined : JSON.stringify(params),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new PesaProviderError(
        `Selcom ${method} ${path} failed: ${res.status} ${text}`,
        res.status,
      );
    }

    const json = (await res.json()) as SelcomResponse;
    this.throwOnError(json);
    return json as T;
  }

  /** Throw on genuinely fatal Selcom responses. INPROGRESS and AMBIGUOUS pass through. */
  private throwOnError(res: SelcomResponse): void {
    if (res.resultcode === '000') return;
    if (res.resultcode === '111' || res.resultcode === '927') return; // INPROGRESS
    if (res.resultcode === '999') return; // AMBIGUOUS — poll status
    throw new PesaProviderError(`Selcom error [${res.resultcode}]: ${res.message}`, 502, res);
  }

  private normalizeStatus(result: string, paymentStatus?: string): PaymentStatus {
    // Some endpoints return `result`, some return `payment_status`
    const status = paymentStatus ?? result;
    switch (status) {
      case 'SUCCESS':
      case 'COMPLETED':
      case 'COMPLETE':
        return 'SUCCESS';
      case 'INPROGRESS':
      case 'PROCESSING':
        return 'PROCESSING';
      case 'AMBIGUOUS':
        return 'AMBIGUOUS';
      case 'PENDING':
        return 'PENDING';
      case 'CANCELLED':
      case 'USERCANCELLED':
        return 'CANCELLED';
      case 'REJECTED':
      case 'FAIL':
      case 'FAILED':
        return 'FAILED';
      default:
        // AMBIGUOUS is Selcom's own "outcome unknown" status — it forces
        // the caller to poll, which is the correct behavior for an
        // unrecognized code.  PENDING would incorrectly imply "waiting for
        // user action."
        return 'AMBIGUOUS';
    }
  }

  // ── Required Methods ─────────────────────────────────────────────

  async createOrder(payload: CreateOrderPayload): Promise<OrderResult> {
    if (payload.redirectUrl) {
      return this.createCheckoutOrder(payload);
    }
    return this.createUssdPush(payload);
  }

  private async createCheckoutOrder(payload: CreateOrderPayload): Promise<OrderResult> {
    // buyer_email is Mandatory per Selcom checkout spec.
    if (!payload.customer.email) {
      throw new PesaValidationError('customer.email is required for Selcom checkout orders');
    }

    const redirectUrl = payload.redirectUrl || this.config.redirectUrl;

    const body: Record<string, unknown> = {
      vendor: this.config.vendor,
      order_id: payload.reference,
      buyer_email: payload.customer.email,
      buyer_name: payload.customer.name,
      buyer_phone: payload.customer.phone,
      amount: String(payload.amount),
      currency: payload.currency,
      no_of_items: 1,
      buyer_remarks: payload.description ?? '',
      merchant_remarks: '',
    };

    // All URLs must be base64-encoded per Selcom spec
    if (redirectUrl) {
      body.redirect_url = Buffer.from(redirectUrl).toString('base64');
    }
    if (this.config.cancelUrl) {
      body.cancel_url = Buffer.from(this.config.cancelUrl).toString('base64');
    }
    if (this.config.webhookUrl) {
      body.webhook = Buffer.from(this.config.webhookUrl).toString('base64');
    }

    const res = await this.request<SelcomResponse>(
      'POST',
      '/v1/checkout/create-order-minimal',
      body,
    );

    const firstItem = res.data[0] as Record<string, unknown> | undefined;

    if (this.orderTypes.size >= SelcomPaymentProvider.MAX_ORDER_MAP) {
      this.orderTypes.clear();
    }
    this.orderTypes.set(payload.reference, 'checkout');

    return {
      orderId: payload.reference,
      reference: payload.reference,
      status: 'PENDING',
      checkoutUrl: firstItem?.payment_gateway_url
        ? Buffer.from(String(firstItem.payment_gateway_url), 'base64').toString('utf-8')
        : undefined,
      raw: res,
    };
  }

  private async createUssdPush(payload: CreateOrderPayload): Promise<OrderResult> {
    const transid = uuid();
    const body: Record<string, unknown> = {
      transid,
      utilityref: payload.reference,
      amount: String(payload.amount),
      vendor: this.config.vendor,
      msisdn: payload.customer.phone,
    };

    const res = await this.request<SelcomResponse>('POST', '/v1/wallet/pushussd', body);

    if (this.orderTypes.size >= SelcomPaymentProvider.MAX_ORDER_MAP) {
      this.orderTypes.clear();
    }
    this.orderTypes.set(transid, 'push');

    return {
      orderId: transid,
      reference: payload.reference,
      status: this.normalizeStatus(res.result),
      ussdPushInitiated: res.result === 'SUCCESS',
      raw: res,
    };
  }

  async getPaymentStatus(orderId: string): Promise<PaymentStatus> {
    try {
      const orderType = this.orderTypes.get(orderId);

      if (orderType === 'push') {
        // C2B push orders use the C2B query endpoint
        const res = await this.request<SelcomResponse>('GET', '/v1/c2b/query-status', {
          transid: orderId,
        });
        return this.normalizeStatus(res.result, undefined);
      }

      // Checkout orders (and unknown — fall back to checkout endpoint)
      const res = await this.request<SelcomResponse>('GET', '/v1/checkout/order-status', {
        order_id: orderId,
      });

      const firstItem = res.data[0] as Record<string, unknown> | undefined;
      return this.normalizeStatus(res.result, firstItem?.payment_status as string | undefined);
    } catch (err) {
      if (err instanceof PesaError) throw err;
      throw new PesaNetworkError(`Selcom status query failed: ${err}`);
    }
  }

  async disburse(payload: DisbursePayload): Promise<DisburseResult> {
    if (payload.recipient.accountNumber) {
      return this.disburseToBank(payload);
    }
    return this.disburseToWallet(payload);
  }

  private async disburseToWallet(payload: DisbursePayload): Promise<DisburseResult> {
    const transid = uuid();
    const utilitycode = this.networkToUtilityCode(payload.recipient.network);

    const body: Record<string, unknown> = {
      transid,
      utilitycode,
      utilityref: payload.recipient.phone ?? '',
      amount: String(payload.amount),
      vendor: this.config.vendor,
      pin: this.config.pin,
      msisdn: payload.recipient.phone ?? '',
    };
    const res = await this.request<SelcomResponse>('POST', '/v1/walletcashin/process', body);

    return {
      disbursementId: res.transid ?? transid,
      reference: payload.reference,
      status: this.normalizeDisburseStatus(res.result),
      raw: res,
    };
  }

  private async disburseToBank(payload: DisbursePayload): Promise<DisburseResult> {
    if (!this.config.senderAccount || !this.config.senderName || !this.config.senderPhone) {
      throw new PesaProviderError(
        'selcom bank disbursement requires senderAccount, senderName, and senderPhone in provider config',
        400,
      );
    }

    const transid = uuid();

    // All three are Mandatory per Selcom Qwiksend spec.
    if (!payload.recipient.bic) {
      throw new PesaValidationError('recipient.bic is required for bank disbursement');
    }
    if (!payload.recipient.accountNumber) {
      throw new PesaValidationError('recipient.accountNumber is required for bank disbursement');
    }
    if (!payload.recipient.name) {
      throw new PesaValidationError('recipient.name is required for bank disbursement');
    }

    const body: Record<string, unknown> = {
      transid,
      recipientFiCode: payload.recipient.bic,
      recipientAccount: payload.recipient.accountNumber,
      recipientName: payload.recipient.name,
      senderAccount: this.config.senderAccount,
      senderName: this.config.senderName,
      amount: String(payload.amount),
      vendor: this.config.vendor,
      pin: this.config.pin,
      msisdn: this.config.senderPhone,
      // Spec lists GIFT as an example purpose.  DISBURSEMENT is unverified —
      // verify against Selcom's accepted purpose enum values.
      purpose: 'DISBURSEMENT',
      remarks: payload.remarks ?? '',
    };
    const res = await this.request<SelcomResponse>('POST', '/v1/qwiksend/process', body);

    return {
      disbursementId: res.transid ?? transid,
      reference: payload.reference,
      status: this.normalizeDisburseStatus(res.result),
      raw: res,
    };
  }

  private networkToUtilityCode(network?: string): string {
    switch (network) {
      case 'MPESA':
        return 'VMCASHIN';
      case 'AIRTELMONEY':
        return 'AMCASHIN';
      case 'TIGOPESA':
        return 'TPCASHIN';
      case 'HALOPESA':
        return 'HPCASHIN';
      default:
        return 'CASHIN'; // auto-route via MNP lookup
    }
  }

  private normalizeDisburseStatus(result: string): DisburseResult['status'] {
    switch (result) {
      case 'SUCCESS':
        return 'SUCCESS';
      case 'INPROGRESS':
      case 'PROCESSING':
        return 'QUEUED';
      default:
        // QUEUED is non-terminal — if Selcom returns an unrecognized status,
        // the caller keeps polling rather than treating it as an irreversible
        // failure.  FAILED would be the wrong default because it's terminal.
        return 'QUEUED';
    }
  }

  async handleWebhook(
    rawBody: string | Buffer,
    headers: Record<string, string>,
  ): Promise<PaymentEvent> {
    const body = typeof rawBody === 'string' ? rawBody : rawBody.toString();

    let payload: Record<string, unknown>;
    try {
      payload = JSON.parse(body);
    } catch {
      throw new PesaProviderError('Selcom webhook: invalid JSON body', 400);
    }

    // Verify digest if the webhook carries Selcom auth headers
    const receivedDigest = headers['digest'] || headers['Digest'] || '';
    const signedFieldsStr = headers['signed-fields'] || headers['Signed-Fields'] || '';
    if (receivedDigest && signedFieldsStr) {
      const signedFields = signedFieldsStr.split(',').map((f) => f.trim());
      const webhookTs = headers['timestamp'] || headers['Timestamp'] || '';
      const computed = this.sign(signedFields, payload as Record<string, unknown>, webhookTs);
      // Constant-time comparison
      const a = Buffer.from(computed);
      const b = Buffer.from(receivedDigest);
      if (a.length !== b.length || !a.equals(b)) {
        throw new PesaProviderError('Selcom webhook: invalid digest signature', 401);
      }
    }

    // Reject webhooks missing required fields — producing sentinel values
    // like 0 or 'unknown' is worse than surfacing the malformed callback.
    if (payload.amount === undefined || payload.amount === null) {
      throw new PesaProviderError('Selcom webhook: missing required field "amount"', 400);
    }

    const status = this.normalizeStatus(
      (payload.result as string) ?? 'PENDING',
      (payload.payment_status as string) ?? undefined,
    );

    return {
      id: uuid(),
      type: this.webhookEventType(status),
      orderId:
        (payload.order_id as string) ??
        (payload.transid as string) ??
        (payload.reference as string) ??
        'unknown',
      reference: (payload.reference as string) ?? (payload.order_id as string) ?? 'unknown',
      amount: Number(payload.amount),
      currency: (payload.currency as 'TZS') ?? 'TZS',
      status,
      provider: 'selcom',
      timestamp: new Date(),
      raw: payload,
    };
  }

  private webhookEventType(status: PaymentStatus): PaymentEvent['type'] {
    switch (status) {
      case 'SUCCESS':
        return 'PAYMENT_SUCCESS';
      case 'FAILED':
      case 'CANCELLED':
        return 'PAYMENT_FAILED';
      case 'PROCESSING':
      case 'PENDING':
      default:
        return 'PAYMENT_PENDING';
    }
  }

  // ── Optional Methods ─────────────────────────────────────────────

  async cancelOrder(
    orderId: string,
  ): Promise<{ orderId: string; cancelled: boolean; message?: string }> {
    const res = await this.request<SelcomResponse>('DELETE', '/v1/checkout/cancel-order', {
      order_id: orderId,
    });

    return {
      orderId,
      cancelled: res.result === 'SUCCESS',
      message: res.message,
    };
  }

  async listOrders(params: ListOrdersParams): Promise<ListOrdersResult> {
    const query: Record<string, string> = {};
    if (params.fromDate) {
      query.fromdate = params.fromDate.toISOString().slice(0, 10);
    }
    if (params.toDate) {
      query.todate = params.toDate.toISOString().slice(0, 10);
    }

    const res = await this.request<SelcomResponse>('GET', '/v1/checkout/list-orders', query);

    const items = res.data as Array<Record<string, unknown>>;
    return {
      orders: items.map((item) => ({
        orderId: (item.order_id as string) ?? '',
        // Selcom's list-orders data items don't include a per-item reference
        // field — only order_id.  We echo order_id as reference.
        reference: (item.order_id as string) ?? '',
        status: this.normalizeStatus('PENDING', item.payment_status as string | undefined),
        amount: Number(item.amount ?? 0),
        currency: 'TZS' as const,
        // creation_date is always present per Selcom spec.  If absent, use
        // epoch 0 as a sentinel — current time would be silently wrong.
        createdAt: item.creation_date ? new Date(item.creation_date as string) : new Date(0),
        raw: item,
      })),
      total: items.length,
    };
  }

  async getBalance(): Promise<BalanceResult> {
    const transid = uuid();

    const res = await this.request<SelcomResponse>('POST', '/v1/vendor/balance', {
      vendor: this.config.vendor,
      pin: this.config.pin,
      transid,
    });

    const firstItem = res.data[0] as Record<string, unknown> | undefined;
    return {
      balances: [
        {
          currency: 'TZS',
          amount: firstItem?.balance !== undefined ? Number(firstItem.balance) : 0,
        },
      ],
      raw: res,
    };
  }

  async getNameLookup(phoneOrAccount: string): Promise<NameLookupResult> {
    try {
      const transid = uuid();
      const res = await this.request<SelcomResponse>('GET', '/v1/walletcashin/namelookup', {
        utilitycode: 'CASHIN', // auto-route
        utilityref: phoneOrAccount,
        transid,
      });

      const firstItem = res.data[0] as Record<string, unknown> | undefined;
      return {
        found: !!firstItem?.name,
        accountName: firstItem?.name as string | undefined,
        accountNumber: phoneOrAccount,
        raw: res,
      };
    } catch {
      return { found: false, accountNumber: phoneOrAccount };
    }
  }

  async validateCredentials(): Promise<{ valid: boolean; message?: string }> {
    try {
      await this.getBalance();
      return { valid: true, message: 'Selcom credentials valid' };
    } catch (err) {
      return {
        valid: false,
        message: err instanceof Error ? err.message : 'Validation failed',
      };
    }
  }

  // Not supported by Selcom
  // previewOrder, previewDisburse, and refund fall back to
  // BasePaymentProvider default (throws PesaUnsupportedError).
}
