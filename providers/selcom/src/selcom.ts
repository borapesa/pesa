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

  private config: Required<Omit<SelcomConfig, 'baseUrl'>> & { baseUrl: string };

  constructor(config: SelcomConfig) {
    super();
    this.config = {
      baseUrl: (config.baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, ''),
      apiKey: config.apiKey,
      apiSecret: config.apiSecret,
      vendor: config.vendor,
      pin: config.pin,
    };
  }

  // ── Auth (internal) ──────────────────────────────────────────────

  /**
   * Build Selcom HMAC-SHA256 digest for a request.
   *
   * Selcom requires every request to carry an HMAC signature of the
   * payload fields.  The signing string is:
   *   timestamp=<ts>&field1=val1&field2=val2...
   * with fields in the exact order of `signedFields`.
   */
  private sign(signedFields: string[], params: Record<string, unknown>): string {
    const ts = this.timestamp();
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
    return {
      'Content-Type': 'application/json',
      Authorization: `SELCOM ${Buffer.from(this.config.apiKey).toString('base64')}`,
      'Digest-Method': 'HS256',
      Digest: this.sign(signedFields, params),
      Timestamp: this.timestamp(),
      'Signed-Fields': signedFields.join(','),
    };
  }

  // ── Helpers ──────────────────────────────────────────────────────

  private async post<T>(
    path: string,
    signedFields: string[],
    body: Record<string, unknown>,
  ): Promise<T> {
    const headers = this.authHeaders(signedFields, body);
    const res = await fetch(`${this.config.baseUrl}${path}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new PesaProviderError(`Selcom ${path} failed: ${res.status} ${text}`, res.status);
    }

    const json = (await res.json()) as SelcomResponse;
    this.throwOnError(json);
    return json as T;
  }

  private async get<T>(
    path: string,
    signedFields: string[],
    params: Record<string, string>,
  ): Promise<T> {
    const qs = new URLSearchParams(params).toString();
    const fullPath = qs ? `${path}?${qs}` : path;
    const headers = this.authHeaders(signedFields, params);

    const res = await fetch(`${this.config.baseUrl}${fullPath}`, {
      method: 'GET',
      headers,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new PesaProviderError(`Selcom ${path} failed: ${res.status} ${text}`, res.status);
    }

    const json = (await res.json()) as SelcomResponse;
    this.throwOnError(json);
    return json as T;
  }

  private async del<T>(
    path: string,
    signedFields: string[],
    params: Record<string, string>,
  ): Promise<T> {
    const qs = new URLSearchParams(params).toString();
    const fullPath = qs ? `${path}?${qs}` : path;
    const headers = this.authHeaders(signedFields, params);

    const res = await fetch(`${this.config.baseUrl}${fullPath}`, {
      method: 'DELETE',
      headers,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new PesaProviderError(`Selcom ${path} failed: ${res.status} ${text}`, res.status);
    }

    const json = (await res.json()) as SelcomResponse;
    this.throwOnError(json);
    return json as T;
  }

  private throwOnError(res: SelcomResponse): void {
    if (res.resultcode === '000') return;
    if (res.resultcode === '999') {
      throw new PesaProviderError(`Selcom: AMBIGUOUS — ${res.message}`, 502, res);
    }
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
        return 'PENDING';
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
    const body: Record<string, unknown> = {
      vendor: this.config.vendor,
      order_id: payload.reference,
      buyer_email: payload.customer.email ?? '',
      buyer_name: payload.customer.name,
      buyer_phone: payload.customer.phone,
      amount: String(payload.amount),
      currency: payload.currency,
      webhook: Buffer.from(payload.redirectUrl ?? '').toString('base64'),
      buyer_remarks: payload.description ?? '',
      merchant_remarks: '',
      no_of_items: 1,
    };

    const signedFields = [
      'vendor',
      'order_id',
      'buyer_email',
      'buyer_name',
      'buyer_phone',
      'amount',
      'currency',
      'webhook',
      'buyer_remarks',
      'merchant_remarks',
      'no_of_items',
    ];

    const res = await this.post<SelcomResponse>(
      '/v1/checkout/create-order-minimal',
      signedFields,
      body,
    );

    const firstItem = res.data[0] as Record<string, unknown> | undefined;
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
    // Generate unique transid — Selcom requires it on every call
    const transid = uuid();
    const body: Record<string, unknown> = {
      transid,
      utilityref: payload.reference,
      amount: String(payload.amount),
      vendor: this.config.vendor,
      msisdn: payload.customer.phone,
    };

    const signedFields = ['transid', 'utilityref', 'amount', 'vendor', 'msisdn'];

    const res = await this.post<SelcomResponse>('/v1/wallet/pushussd', signedFields, body);

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
      const res = await this.get<SelcomResponse>('/v1/checkout/order-status', ['order_id'], {
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

    const signedFields = [
      'transid',
      'utilitycode',
      'utilityref',
      'amount',
      'vendor',
      'pin',
      'msisdn',
    ];

    const res = await this.post<SelcomResponse>('/v1/walletcashin/process', signedFields, body);

    return {
      disbursementId: res.transid ?? transid,
      reference: payload.reference,
      status: this.normalizeDisburseStatus(res.result),
      raw: res,
    };
  }

  private async disburseToBank(payload: DisbursePayload): Promise<DisburseResult> {
    const transid = uuid();

    const body: Record<string, unknown> = {
      transid,
      recipientFiCode: payload.recipient.bic ?? '',
      recipientAccount: payload.recipient.accountNumber ?? '',
      recipientName: payload.recipient.name ?? '',
      senderAccount: this.config.vendor,
      senderName: payload.recipient.name ?? '',
      amount: String(payload.amount),
      vendor: this.config.vendor,
      pin: this.config.pin,
      msisdn: payload.recipient.phone ?? '',
      remarks: payload.remarks ?? '',
    };

    const signedFields = [
      'transid',
      'recipientFiCode',
      'recipientAccount',
      'recipientName',
      'senderAccount',
      'senderName',
      'amount',
      'vendor',
      'pin',
      'msisdn',
      'remarks',
    ];

    const res = await this.post<SelcomResponse>('/v1/qwiksend/process', signedFields, body);

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
        return 'FAILED';
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
      const computed = this.sign(signedFields, payload as Record<string, unknown>);
      // Constant-time comparison
      const a = Buffer.from(computed);
      const b = Buffer.from(receivedDigest);
      if (a.length !== b.length || !a.equals(b)) {
        throw new PesaProviderError('Selcom webhook: invalid digest signature', 401);
      }
    }

    const status = this.normalizeStatus(
      (payload.result as string) ?? 'PENDING',
      (payload.payment_status as string) ?? undefined,
    );

    return {
      id: uuid(),
      type: this.webhookEventType(status),
      orderId: (payload.order_id as string) ?? (payload.reference as string) ?? 'unknown',
      reference: (payload.reference as string) ?? (payload.order_id as string) ?? 'unknown',
      amount: Number(payload.amount ?? 0),
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
    const res = await this.del<SelcomResponse>('/v1/checkout/cancel-order', ['order_id'], {
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

    const signedFields = Object.keys(query);

    const res = await this.get<SelcomResponse>(
      '/v1/checkout/list-orders',
      signedFields.length > 0 ? signedFields : ['fromdate'],
      query,
    );

    const items = res.data as Array<Record<string, unknown>>;
    return {
      orders: items.map((item) => ({
        orderId: (item.order_id as string) ?? '',
        reference: (item.order_id as string) ?? '',
        status: this.normalizeStatus('PENDING', item.payment_status as string | undefined),
        amount: Number(item.amount ?? 0),
        currency: 'TZS' as const,
        createdAt: item.creation_date ? new Date(item.creation_date as string) : new Date(),
        raw: item,
      })),
      total: items.length,
    };
  }

  async getBalance(): Promise<BalanceResult> {
    const transid = uuid();

    const res = await this.post<SelcomResponse>(
      '/v1/vendor/balance',
      ['vendor', 'pin', 'transid'],
      { vendor: this.config.vendor, pin: this.config.pin, transid },
    );

    const firstItem = res.data[0] as Record<string, unknown> | undefined;
    return {
      balances: [
        {
          currency: 'TZS',
          amount: Number(firstItem?.balance ?? 0),
        },
      ],
      raw: res,
    };
  }

  async getNameLookup(phoneOrAccount: string): Promise<NameLookupResult> {
    try {
      const transid = uuid();
      const res = await this.get<SelcomResponse>(
        '/v1/walletcashin/namelookup',
        ['utilitycode', 'utilityref', 'transid'],
        {
          utilitycode: 'CASHIN', // auto-route
          utilityref: phoneOrAccount,
          transid,
        },
      );

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
