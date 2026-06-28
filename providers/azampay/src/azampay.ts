import type {
  CreateOrderPayload,
  DisbursePayload,
  DisburseResult,
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

const AUTH_SANDBOX = 'https://authenticator-sandbox.azampay.co.tz';
const AUTH_PRODUCTION = 'https://authenticator.azampay.co.tz';
const CHECKOUT_SANDBOX = 'https://sandbox.azampay.co.tz';
const CHECKOUT_PRODUCTION = 'https://checkout.azampay.co.tz';

// ── Config ──────────────────────────────────────────────────────────

export interface AzamPayConfig {
  /** App name from AzamPay dashboard. */
  appName: string;
  /** Client ID from AzamPay dashboard. */
  clientId: string;
  /** Client secret from AzamPay dashboard. */
  clientSecret: string;
  /** API key from AzamPay dashboard. */
  apiKey: string;
  /** Sender/merchant display name for disbursement transfers. */
  senderName: string;
  /** Sender/merchant bank name for disbursement (default: "AzamPay"). */
  senderBank?: string;
  /** Target sandbox (default: true). */
  sandbox?: boolean;
  /** Override auth base URL. */
  authBaseUrl?: string;
  /** Override checkout base URL. */
  checkoutBaseUrl?: string;
}

// ── Response types ──────────────────────────────────────────────────

interface TokenData {
  accessToken: string;
  expire: string;
}

interface TokenResponse {
  data: TokenData;
  success: boolean;
  message: string;
  statusCode: number;
}

interface CheckoutResult {
  transactionId: string;
  message: string;
  success: boolean;
}

interface DisburseResponse {
  data: string;
  message: string;
  success: boolean;
  statusCode: number;
}

interface NameLookupResponse {
  name: string;
  message: string;
  success: boolean;
  accountNumber: string;
  bankName: string;
}

interface TransactionStatusResponse {
  data: string;
  message: string;
  success: boolean;
  statusCode: number;
}

interface PartnersResult {
  partners: Array<{
    partnerName: string;
    provider: number;
    vendorName: string;
    currency: string;
  }>;
  success: boolean;
}

// ── Provider ────────────────────────────────────────────────────────

export class AzamPayPaymentProvider extends BasePaymentProvider {
  readonly name: ProviderName = 'azampay';

  private config: Required<Omit<AzamPayConfig, 'authBaseUrl' | 'checkoutBaseUrl' | 'senderBank'>> &
    Pick<AzamPayConfig, 'senderBank'> & {
      authBaseUrl: string;
      checkoutBaseUrl: string;
    };
  private token: string | null = null;
  private tokenExpiresAt = 0;

  constructor(config: AzamPayConfig) {
    super();
    const sandbox = config.sandbox !== false;
    this.config = {
      appName: config.appName,
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      apiKey: config.apiKey,
      senderName: config.senderName,
      senderBank: config.senderBank,
      sandbox,
      authBaseUrl: (config.authBaseUrl ?? (sandbox ? AUTH_SANDBOX : AUTH_PRODUCTION)).replace(
        /\/$/,
        '',
      ),
      checkoutBaseUrl: (
        config.checkoutBaseUrl ?? (sandbox ? CHECKOUT_SANDBOX : CHECKOUT_PRODUCTION)
      ).replace(/\/$/, ''),
    };
  }

  // ── Auth ──────────────────────────────────────────────────────────

  private authPromise: Promise<string> | null = null;

  private async authenticate(): Promise<string> {
    if (this.token && Date.now() < this.tokenExpiresAt) {
      return this.token;
    }

    if (this.authPromise) return this.authPromise;

    this.authPromise = this.fetchToken();
    try {
      return await this.authPromise;
    } finally {
      this.authPromise = null;
    }
  }

  private async fetchToken(): Promise<string> {
    const res = await fetch(`${this.config.authBaseUrl}/AppRegistration/GenerateToken`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        appName: this.config.appName,
        clientId: this.config.clientId,
        clientSecret: this.config.clientSecret,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new PesaNetworkError(`AzamPay auth failed: ${res.status} ${text}`);
    }

    const data = (await res.json()) as TokenResponse;
    if (!data.success || !data.data?.accessToken) {
      throw new PesaProviderError(
        `AzamPay auth failed: ${data.message || 'unknown error'}`,
        data.statusCode || 401,
      );
    }

    this.token = data.data.accessToken;
    // Cache for 55 minutes (1-hour TTL with safety margin)
    this.tokenExpiresAt = Date.now() + 55 * 60 * 1000;
    return this.token;
  }

  private async checkoutHeaders(): Promise<Record<string, string>> {
    const token = await this.authenticate();
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'X-API-Key': this.config.apiKey,
    };
  }

  // ── Helpers ──────────────────────────────────────────────────────

  private async request<T>(
    method: 'GET' | 'POST' | 'DELETE',
    path: string,
    body?: Record<string, unknown>,
  ): Promise<T> {
    const headers = body
      ? await this.checkoutHeaders()
      : {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${await this.authenticate()}`,
        };

    const res = await fetch(`${this.config.checkoutBaseUrl}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new PesaProviderError(
        `AzamPay ${method} ${path} failed: ${res.status} ${text}`,
        res.status,
      );
    }

    const json = (await res.json()) as T;
    return json;
  }

  // ── Required Methods ─────────────────────────────────────────────

  async createOrder(payload: CreateOrderPayload): Promise<OrderResult> {
    const body: Record<string, unknown> = {
      accountNumber: payload.customer.phone,
      amount: String(payload.amount),
      currency: payload.currency,
      externalId: payload.reference,
      provider: this.mapNetwork(payload.customer.phone),
    };

    const provider = this.mapNetwork(payload.customer.phone);
    const res = await this.request<CheckoutResult>('POST', '/azampay/mno/checkout', body);

    // Track provider for status queries
    this.orderProviders.set(res.transactionId, provider);

    return {
      orderId: res.transactionId,
      reference: payload.reference,
      status: res.success ? 'PENDING' : 'FAILED',
      raw: res,
    };
  }

  /** Map phone prefix to AzamPay provider name. */
  private mapNetwork(phone: string): string {
    // AzamPay accepts: Airtel, Tigo, Halopesa, Azampesa, Mpesa
    if (phone.startsWith('25578') || phone.startsWith('25568')) return 'Airtel';
    if (phone.startsWith('25576') || phone.startsWith('25565')) return 'Tigo';
    if (phone.startsWith('25562')) return 'Halopesa';
    if (phone.startsWith('25574') || phone.startsWith('25575')) return 'Mpesa';
    return 'Azampesa'; // fallback to Azam's own wallet
  }

  // Track which provider was used per order for status queries.
  private orderProviders = new Map<string, string>();

  async getPaymentStatus(orderId: string): Promise<PaymentStatus> {
    try {
      const bankName = this.orderProviders.get(orderId) ?? 'Azampesa';
      const res = await this.request<TransactionStatusResponse>(
        'GET',
        `/api/v1/azampay/transactionstatus?pgReferenceId=${encodeURIComponent(orderId)}&bankName=${bankName}`,
      );

      if (!res.success) return 'FAILED';
      switch (res.data?.toUpperCase()) {
        case 'COMPLETE':
        case 'SUCCESS':
          return 'SUCCESS';
        case 'PENDING':
        case 'PROCESSING':
          return 'PROCESSING';
        case 'FAILED':
        case 'FAIL':
          return 'FAILED';
        default:
          return 'PENDING';
      }
    } catch (err) {
      if (err instanceof PesaError) throw err;
      throw new PesaNetworkError(`AzamPay status query failed: ${err}`);
    }
  }

  async disburse(payload: DisbursePayload): Promise<DisburseResult> {
    const body: Record<string, unknown> = {
      source: {
        countryCode: 'TZ',
        fullName: this.config.senderName,
        bankName: this.config.senderBank ?? 'AzamPay',
        accountNumber: this.config.clientId,
        currency: payload.currency,
      },
      destination: {
        countryCode: 'TZ',
        fullName: payload.recipient.name ?? '',
        bankName: payload.recipient.accountNumber
          ? (payload.recipient.bic ?? 'NMB')
          : this.mapNetwork(payload.recipient.phone ?? ''),
        accountNumber: payload.recipient.accountNumber ?? payload.recipient.phone ?? '',
        currency: 'TZS',
      },
      transferDetails: {
        type: 'DISBURSEMENT',
        amount: payload.amount,
        date: new Date().toISOString().slice(0, 10),
      },
      externalReferenceId: payload.reference,
      remarks: payload.remarks ?? '',
    };

    const res = await this.request<DisburseResponse>('POST', '/api/v1/azampay/disburse', body);

    return {
      disbursementId: res.data ?? payload.reference,
      reference: payload.reference,
      status: res.success ? 'SUCCESS' : 'FAILED',
      raw: res,
    };
  }

  async handleWebhook(
    rawBody: string | Buffer,
    _headers: Record<string, string>,
  ): Promise<PaymentEvent> {
    const body = typeof rawBody === 'string' ? rawBody : rawBody.toString();

    let payload: Record<string, unknown>;
    try {
      payload = JSON.parse(body);
    } catch {
      throw new PesaProviderError('AzamPay webhook: invalid JSON body', 400);
    }

    const status: PaymentStatus = payload.success ? 'SUCCESS' : 'FAILED';

    return {
      id: uuid(),
      type: status === 'SUCCESS' ? 'PAYMENT_SUCCESS' : 'PAYMENT_FAILED',
      orderId: (payload.transactionId as string) ?? (payload.reference as string) ?? 'unknown',
      reference: (payload.reference as string) ?? 'unknown',
      amount: Number(payload.amount ?? 0),
      currency: (payload.currency as 'TZS') ?? 'TZS',
      status,
      provider: 'azampay',
      timestamp: new Date(),
      raw: payload,
    };
  }

  // ── Optional Methods ─────────────────────────────────────────────

  async getNameLookup(phoneOrAccount: string): Promise<NameLookupResult> {
    try {
      const res = await this.request<NameLookupResponse>('POST', '/azampay/namelookup', {
        bankName: this.mapNetwork(phoneOrAccount),
        accountNumber: phoneOrAccount,
      });

      return {
        found: res.success && !!res.name,
        accountName: res.name,
        accountNumber: res.accountNumber || phoneOrAccount,
        provider: res.bankName ?? 'AzamPay',
        raw: res,
      };
    } catch {
      return { found: false, accountNumber: phoneOrAccount };
    }
  }

  // ── Optional Methods ─────────────────────────────────────────────

  async validateCredentials(): Promise<{ valid: boolean; message?: string }> {
    try {
      await this.authenticate();
      return { valid: true, message: 'AzamPay credentials valid' };
    } catch (err) {
      return {
        valid: false,
        message: err instanceof Error ? err.message : 'Auth failed',
      };
    }
  }

  // ── Provider-specific ─────────────────────────────────────────────

  /**
   * Bank checkout — accepts OTP from the customer (obtained via USSD).
   *
   * This is a two-step flow:
   * 1. Customer dials `*150*03#` (CRDB) or `*150*66#` (NMB) to get OTP
   * 2. Customer provides OTP to your app
   * 3. Your app calls this method with the OTP
   */
  async createBankCheckout(params: {
    amount: string;
    merchantAccountNumber: string;
    merchantMobileNumber: string;
    otp: string;
    provider: 'CRDB' | 'NMB';
    merchantName?: string;
    referenceId: string;
  }): Promise<{ transactionId: string; success: boolean }> {
    const body: Record<string, unknown> = {
      amount: params.amount,
      currencyCode: 'TZS',
      merchantAccountNumber: params.merchantAccountNumber,
      merchantMobileNumber: params.merchantMobileNumber,
      merchantName: params.merchantName ?? '',
      otp: params.otp,
      provider: params.provider,
      referenceId: params.referenceId,
    };

    const res = await this.request<CheckoutResult>('POST', '/azampay/bank/checkout', body);

    return { transactionId: res.transactionId, success: res.success };
  }

  /** Generate a hosted checkout page URL. Returns the URL to redirect to. */
  async createPostCheckout(params: {
    amount: string;
    currency: string;
    externalId: string;
    vendorName: string;
    vendorId: string;
    redirectSuccessURL: string;
    redirectFailURL: string;
    language?: string;
    items?: Array<{ name: string }>;
  }): Promise<string> {
    const body: Record<string, unknown> = {
      appName: this.config.appName,
      clientId: this.config.clientId,
      vendorId: params.vendorId,
      language: params.language ?? 'en',
      currency: params.currency,
      externalId: params.externalId,
      requestOrigin: params.redirectSuccessURL,
      redirectFailURL: params.redirectFailURL,
      redirectSuccessURL: params.redirectSuccessURL,
      vendorName: params.vendorName,
      amount: params.amount,
      cart: {
        items: params.items ?? [{ name: 'Order' }],
      },
    };

    const res = await this.request<{ data: string; success: boolean }>(
      'POST',
      '/api/v1/Partner/PostCheckout',
      body,
    );

    if (!res.success || !res.data) {
      throw new PesaProviderError('AzamPay post checkout failed to return a URL', 502);
    }

    return res.data;
  }

  /** List available payment partners for the configured merchant. */
  async getPaymentPartners(): Promise<PartnersResult['partners']> {
    const res = await this.request<PartnersResult>('GET', '/api/v1/Partner/GetPaymentPartners');

    return res.partners ?? [];
  }

  // Not supported:
  // cancelOrder, listOrders, getBalance, previewOrder, previewDisburse, refund
  // — AzamPay does not expose these.
}
