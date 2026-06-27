import { v4 as uuid } from 'uuid';
import {
  BasePaymentProvider,
  PesaError,
  PesaNetworkError,
  PesaProviderError,
} from '@borapesa/pesa';
import type {
  ProviderName,
  CreateOrderPayload,
  OrderResult,
  PaymentStatus,
  PaymentEvent,
  DisbursePayload,
  DisburseResult,
  PreviewResult,
  NameLookupResult,
} from '@borapesa/pesa';

// ── Config ──────────────────────────────────────────────────────────

export interface ClickPesaConfig {
  /** Base URL (default: https://api.clickpesa.com). */
  baseUrl: string;
  /** Client ID from ClickPesa dashboard. */
  clientId: string;
  /** API key from ClickPesa dashboard. */
  apiKey: string;
  /** Optional checksum secret for webhook verification. */
  checksumSecret?: string;
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

interface PreviewResponse {
  valid: boolean;
  fee?: number;
  message?: string;
}

// ── Provider ────────────────────────────────────────────────────────

export class ClickPesaProvider extends BasePaymentProvider {
  readonly name: ProviderName = 'clickpesa';

  private config: ClickPesaConfig;
  private token: string | null = null;
  private tokenExpiresAt = 0;

  constructor(config: ClickPesaConfig) {
    super();
    this.config = {
      baseUrl: config.baseUrl.replace(/\/$/, ''),
      clientId: config.clientId,
      apiKey: config.apiKey,
      checksumSecret: config.checksumSecret,
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
    return this.token!;
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
    const headers = await this.authHeaders();
    const res = await fetch(`${this.config.baseUrl}${path}`, {
      ...init,
      headers: { ...headers, ...(init.headers as Record<string, string> | undefined) },
    });

    if (!res.ok) {
      const body = await res.text();
      throw new PesaProviderError(
        `ClickPesa ${path} failed: ${res.status} ${body}`,
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
      case 'SETTLED':   return 'SUCCESS';
      case 'PROCESSING': return 'PROCESSING';
      case 'PENDING':    return 'PENDING';
      case 'FAILED':     return 'FAILED';
      default:           return 'PENDING';
    }
  }

  // ── Required Methods ─────────────────────────────────────────────

  async createOrder(payload: CreateOrderPayload): Promise<OrderResult> {
    // ClickPesa supports USSD push (mobile money) and hosted checkout link.
    // We use USSD push by default. If redirectUrl is provided, generate a checkout link.
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

  async getPaymentStatus(orderId: string): Promise<PaymentStatus> {
    try {
      const res = await fetch(
        `${this.config.baseUrl}/third-parties/payments/${encodeURIComponent(orderId)}`,
        { method: 'GET', headers: await this.authHeaders() },
      );

      if (res.status === 404) return 'PENDING';
      if (!res.ok) {
        const body = await res.text();
        throw new PesaProviderError(`ClickPesa query failed: ${res.status} ${body}`, res.status);
      }

      const data = (await res.json()) as PaymentStatusItem[] | ClickPesaApiError;
      if (Array.isArray(data) && data.length > 0) {
        return this.normalizeStatus(data[0]!.status);
      }
      return 'PENDING';
    } catch (err) {
      if (err instanceof PesaError) throw err;
      throw new PesaNetworkError(`ClickPesa status query failed: ${err}`);
    }
  }

  async handleWebhook(
    rawBody: string | Buffer,
    headers: Record<string, string>,
  ): Promise<PaymentEvent> {
    const body = typeof rawBody === 'string' ? rawBody : rawBody.toString();

    // Verify checksum signature if secret is configured
    if (this.config.checksumSecret) {
      const checksum = headers['x-clickpesa-checksum'] || headers['checksum'] || '';
      // ClickPesa uses HMAC-SHA256 for webhook verification
      const verified = await this.verifyChecksum(body, checksum);
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

    // Map ClickPesa event names to PaymentEventType.
    // Payout events checked before PAYMENT_FAILED to avoid the `status === 'FAILED'`
    // branch catching payout failures as PAYMENT_FAILED.
    let type: PaymentEvent['type'] = 'PAYMENT_PENDING';
    if (event === 'PAYMENT RECEIVED' && status === 'SUCCESS') {
      type = 'PAYMENT_SUCCESS';
    } else if (event === 'PAYOUT INITIATED' || event === 'PAYOUT REFUNDED') {
      type = status === 'SUCCESS' ? 'DISBURSEMENT_SUCCESS' : 'DISBURSEMENT_FAILED';
    } else if (event === 'PAYMENT FAILED' || status === 'FAILED') {
      type = 'PAYMENT_FAILED';
    }

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

    const statusMap: Record<string, DisburseResult['status']> = {
      SUCCESS:    'SUCCESS',
      PROCESSING: 'QUEUED',
      PENDING:    'QUEUED',
      FAILED:     'FAILED',
    };

    return {
      disbursementId: res.id,
      reference: payload.reference,
      status: statusMap[res.status] ?? 'QUEUED',
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

  async previewOrder(payload: CreateOrderPayload): Promise<PreviewResult> {
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

  async previewDisburse(payload: DisbursePayload): Promise<PreviewResult> {
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

  async getNameLookup(phoneOrAccount: string): Promise<NameLookupResult> {
    try {
      const res = await this.request<{
        accountName?: string;
        accountNumber?: string;
        provider?: string;
      }>(
        `/third-parties/disbursement/mobile-money-payout/preview`,
        {
          method: 'POST',
          body: JSON.stringify({ amount: '100', currency: 'TZS', phoneNumber: phoneOrAccount }),
        },
      );

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

  // ── Not yet supported ────────────────────────────────────────────

  // refund, cancelOrder, and listOrders are not supported by ClickPesa's current API.
  // They fall back to the BasePaymentProvider default (throws PesaUnsupportedError).

  // ── Private helpers ──────────────────────────────────────────────

  private async verifyChecksum(body: string, checksum: string): Promise<boolean> {
    if (!this.config.checksumSecret) return true;

    try {
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(this.config.checksumSecret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign'],
      );
      const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(body));
      const hex = new Uint8Array(signature);
      let computed = '';
      for (let i = 0; i < hex.length; i++) {
        computed += hex[i]!.toString(16).padStart(2, '0');
      }

      return computed === checksum.toLowerCase();
    } catch (err) {
      // Fail closed — if Web Crypto is unavailable, reject the webhook
      // rather than silently accepting it. Requires Node 19+ or a polyfill.
      throw new PesaProviderError(
        `ClickPesa webhook checksum verification unavailable: ${err instanceof Error ? err.message : 'unknown error'}. ` +
        `Web Crypto API is required (Node 19+).`,
        500,
      );
    }
  }
}
