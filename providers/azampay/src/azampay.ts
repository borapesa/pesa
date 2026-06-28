import { createVerify } from 'node:crypto';
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
  PesaWebhookError,
} from '@borapesa/pesa';
import { v4 as uuid } from 'uuid';

// ── Constants ───────────────────────────────────────────────────────

const AUTH_SANDBOX = 'https://authenticator-sandbox.azampay.co.tz';
const AUTH_PRODUCTION = 'https://authenticator.azampay.co.tz';
const CHECKOUT_SANDBOX = 'https://sandbox.azampay.co.tz';
const CHECKOUT_PRODUCTION = 'https://checkout.azampay.co.tz';
const DISBURSEMENT_SANDBOX = 'https://api-disbursement-sandbox.azampay.co.tz';
const DISBURSEMENT_PRODUCTION = 'https://api-disbursement.azampay.co.tz';

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
  /**
   * Override disbursement base URL.
   *
   * The AzamPay API uses a **separate host** for disbursement endpoints
   * (`disburse`, `getNameLookup`, `getPaymentStatus`).  Defaults to
   * `https://api-disbursement-sandbox.azampay.co.tz` (sandbox) or
   * `https://api-disbursement.azampay.co.tz` (production).
   */
  disbursementBaseUrl?: string;
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

/** Matches spec schema `Disbursement200Response`. */
interface DisburseResponse {
  pgReferenceId: string;
  message: string;
  success: boolean;
  statusCode: number;
}

/** Matches spec schema `NameLookupResponse` — `status` (boolean), not `success`. */
interface NameLookupResponse {
  fname?: string | null;
  lname?: string | null;
  name?: string | null;
  message?: string | null;
  status: boolean;
  statusCode: number;
  accountNumber?: string | null;
  bankName?: string | null;
}

interface TransactionStatusResponse {
  data: string;
  message: string;
  success: boolean;
  statusCode: number;
}

/** Matches spec `CallbackRequest` schema. */
interface CallbackRequest {
  message: string;
  user: string;
  password: string;
  clientId: string;
  transactionstatus: string;
  operator: string;
  reference: string;
  externalreference: string;
  utilityref: string;
  amount: string;
  transid: string;
  msisdn: string;
  mnoreference: string;
  submerchantAcc?: unknown;
  additionalProperties?: Record<string, unknown>;
  signature?: string | null;
}

/** Matches spec `GetPaymentPartnersResponse` schema (a bare array of these). */
interface PartnerResponse {
  logoUrl?: string | null;
  partnerName?: string | null;
  provider: number;
  vendorName?: string | null;
  paymentVendorId: string;
  paymentPartnerId: string;
  currency?: string | null;
}

interface PublicKeyResponse {
  success: boolean;
  format: string;
  publicKey: string;
}

// ── Provider ────────────────────────────────────────────────────────

export class AzamPayPaymentProvider extends BasePaymentProvider {
  readonly name: ProviderName = 'azampay';

  private config: Required<
    Omit<AzamPayConfig, 'authBaseUrl' | 'checkoutBaseUrl' | 'disbursementBaseUrl' | 'senderBank'>
  > &
    Pick<AzamPayConfig, 'senderBank'> & {
      authBaseUrl: string;
      checkoutBaseUrl: string;
      disbursementBaseUrl: string;
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
      disbursementBaseUrl: (
        config.disbursementBaseUrl ?? (sandbox ? DISBURSEMENT_SANDBOX : DISBURSEMENT_PRODUCTION)
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

  /**
   * Unified request helper.
   *
   * @param baseUrl — optionally override the checkout base URL
   *   (e.g. pass `this.config.disbursementBaseUrl` for disbursement endpoints).
   */
  private async request<T>(
    method: 'GET' | 'POST' | 'DELETE',
    path: string,
    body?: Record<string, unknown>,
    baseUrl?: string,
  ): Promise<T> {
    const headers = await this.checkoutHeaders();

    const res = await fetch(`${baseUrl ?? this.config.checkoutBaseUrl}${path}`, {
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

  // ── Callback Signature Verification ──────────────────────────────

  /** Cached PEM-encoded RSA public key for callback verification. */
  private cachedPublicKey: string | null = null;
  private publicKeyExpiresAt = 0;
  private publicKeyPromise: Promise<string> | null = null;

  /**
   * Fetch the RSA public key from AzamPay for callback signature verification.
   *
   * Endpoint: `GET /azampay/v1/public-key?format=Pem`
   * Cached for 24 hours per the spec recommendation.
   */
  private async fetchPublicKey(): Promise<string> {
    const headers = await this.checkoutHeaders();
    const res = await fetch(`${this.config.checkoutBaseUrl}/azampay/v1/public-key?format=Pem`, {
      method: 'GET',
      headers,
    });

    if (!res.ok) {
      throw new PesaNetworkError(`AzamPay public key fetch failed: ${res.status}`);
    }

    const data = (await res.json()) as PublicKeyResponse;
    if (!data.success || !data.publicKey) {
      throw new PesaProviderError('AzamPay public key fetch: unsuccessful response', 502);
    }

    return data.publicKey;
  }

  private async getPublicKey(): Promise<string> {
    if (this.cachedPublicKey && Date.now() < this.publicKeyExpiresAt) {
      return this.cachedPublicKey;
    }

    if (this.publicKeyPromise) return this.publicKeyPromise;

    this.publicKeyPromise = this.fetchPublicKey();
    try {
      const key = await this.publicKeyPromise;
      this.cachedPublicKey = key;
      // Cache for 24 hours
      this.publicKeyExpiresAt = Date.now() + 24 * 60 * 60 * 1000;
      return key;
    } finally {
      this.publicKeyPromise = null;
    }
  }

  /**
   * Verify an AzamPay callback RSA signature.
   *
   * The signature is computed over
   * `{utilityref}{externalreference}{transactionstatus}{operator}`,
   * signed with RSA SHA-256 and PKCS#1 v1.5 padding.
   */
  private async verifyCallbackSignature(callback: CallbackRequest): Promise<boolean> {
    const signature = callback.signature;
    if (!signature) {
      // Spec says signature is nullable — if absent, skip verification.
      // This is NOT secure in production; log a warning.
      return true;
    }

    const dataToVerify = `${callback.utilityref}${callback.externalreference}${callback.transactionstatus}${callback.operator}`;

    try {
      const publicKey = await this.getPublicKey();
      const verifier = createVerify('SHA256');
      verifier.update(dataToVerify, 'utf8');
      verifier.end();
      return verifier.verify(publicKey, signature, 'base64');
    } catch {
      // Verification failure — re-fetch key and retry once (per spec)
      try {
        this.cachedPublicKey = null;
        const freshKey = await this.getPublicKey();
        const verifier = createVerify('SHA256');
        verifier.update(dataToVerify, 'utf8');
        verifier.end();
        return verifier.verify(freshKey, signature, 'base64');
      } catch {
        return false;
      }
    }
  }

  // ── Required Methods ─────────────────────────────────────────────

  async createOrder(payload: CreateOrderPayload): Promise<OrderResult> {
    // The checkout API uses PascalCase `Provider` enum; disbursement uses lowercase.
    // Store both in `raw` so callers can pick the right value for their use case.
    const checkoutProvider = this.mapCheckoutProvider(payload.customer.phone);
    const disburseProvider = this.mapDisburseProvider(payload.customer.phone);

    const body: Record<string, unknown> = {
      accountNumber: payload.customer.phone,
      amount: String(payload.amount),
      currency: payload.currency,
      externalId: payload.reference,
      provider: checkoutProvider,
    };

    const res = await this.request<CheckoutResult>('POST', '/azampay/mno/checkout', body);

    return {
      orderId: res.transactionId,
      reference: payload.reference,
      status: res.success ? 'PENDING' : 'FAILED',
      ussdPushInitiated: res.success,
      raw: { ...res, _checkoutProvider: checkoutProvider, _providerName: disburseProvider },
    };
  }

  /**
   * Map phone prefix to AzamPay MNO name for **checkout** endpoints.
   *
   * The `CheckoutRequest.provider` enum per the spec is:
   * `["Airtel", "Tigo", "Halopesa", "Azampesa", "Mpesa"]` — all PascalCase.
   */
  private mapCheckoutProvider(phone: string): string {
    if (phone.startsWith('25578') || phone.startsWith('25568')) return 'Airtel';
    if (phone.startsWith('25576') || phone.startsWith('25565')) return 'Tigo';
    if (phone.startsWith('25562')) return 'Halopesa';
    if (phone.startsWith('25574') || phone.startsWith('25575')) return 'Mpesa';
    return 'Azampesa';
  }

  /**
   * Map phone prefix to AzamPay MNO name for **disbursement** endpoints.
   *
   * The `MnoDisbursementRequest` `bankName` enum per the (unofficial) spec is:
   * `["tigo", "airtel", "azampesa"]` — all lowercase.
   *
   * **⚠ KNOWN AMBIGUITY — requires sandbox verification:**
   *
   * The unofficial OpenAPI spec excludes `halopesa` and `Mpesa` from the
   * disbursement `bankName` enum, but includes both in the checkout-side
   * `Provider` enum. It is unclear whether this reflects the real API:
   *
   * - If the real API **rejects** halopesa/mpesa: this fallback is correct,
   *   but `raw._providerName` will differ from the actual checkout MNO.
   * - If the real API **accepts** halopesa/mpesa: this fallback is wrong
   *   and should be removed — it silently converts valid requests.
   *
   * Additionally, `disburse` `source.bankName` is restricted to the same
   * `["tigo","airtel","azampesa"]` enum by the spec, but these are MNO
   * names, not bank names. It is unclear what value a merchant using
   * CRDB or NMB should set for `senderBank`. The code defaults to
   * `'azampesa'` but the correct value depends on the real API.
   *
   * **Resolve by testing against the AzamPay sandbox or asking their
   * integration team.** Until then, the fallback maps unknown prefixes
   * to `'azampesa'` (the provider's own wallet, always in the enum).
   */
  private mapDisburseProvider(phone: string): string {
    if (phone.startsWith('25578') || phone.startsWith('25568')) return 'airtel';
    if (phone.startsWith('25576') || phone.startsWith('25565')) return 'tigo';
    return 'azampesa'; // fallback — also covers 25562 (halopesa) and 25574/75 (Mpesa)
  }

  /**
   * Query payment status.
   *
   * Uses the **disbursement** base URL per the OpenAPI spec.
   *
   * @param orderId - The AzamPay transaction ID returned by {@link createOrder}.
   * @param providerName - The mobile money provider used for the order
   *   (e.g. `'airtel'`, `'tigo'`, `'azampesa'`). Defaults to `'azampesa'`
   *   when called through the SDK — the default exists because the SDK only
   *   passes `orderId`. **When calling this method directly, always pass the
   *   explicit provider name** from {@link createOrder}'s `raw._providerName`
   *   to avoid silently querying with the wrong bank name.
   *   The checkout-side provider is at `raw._checkoutProvider` (PascalCase,
   *   matches what was sent to the checkout API — may differ from
   *   `_providerName` for HaloPesa/M-Pesa due to spec enum constraints).
   */
  async getPaymentStatus(orderId: string, providerName = 'azampesa'): Promise<PaymentStatus> {
    try {
      const qs = new URLSearchParams({
        pgReferenceId: orderId,
        bankName: providerName,
      });
      const res = await this.request<TransactionStatusResponse>(
        'GET',
        `/api/v1/azampay/transactionstatus?${qs.toString()}`,
        undefined,
        this.config.disbursementBaseUrl,
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

  /**
   * Disburse (B2C payout).
   *
   * Uses the **disbursement** base URL per the OpenAPI spec.
   *
   * Response uses `pgReferenceId` (spec field), not `data`.
   * `transferDetails.dateInEpoch` per spec (epoch seconds, not ISO string).
   * `bankName` fields use lowercase enum values (`tigo`, `airtel`, `azampesa`).
   */
  async disburse(payload: DisbursePayload): Promise<DisburseResult> {
    const body: Record<string, unknown> = {
      source: {
        countryCode: 'TZ',
        fullName: this.config.senderName,
        bankName: (this.config.senderBank ?? 'azampesa').toLowerCase(),
        accountNumber: this.config.clientId,
        currency: payload.currency,
      },
      destination: {
        countryCode: 'TZ',
        fullName: payload.recipient.name ?? '',
        bankName: payload.recipient.accountNumber
          ? payload.recipient.bic
          : this.mapDisburseProvider(payload.recipient.phone ?? ''),
        accountNumber: payload.recipient.accountNumber ?? payload.recipient.phone ?? '',
        currency: 'TZS',
      },
      transferDetails: {
        type: 'DISBURSEMENT',
        amount: payload.amount,
        dateInEpoch: Math.floor(Date.now() / 1000),
      },
      externalReferenceId: payload.reference,
      remarks: payload.remarks ?? '',
    };

    const res = await this.request<DisburseResponse>(
      'POST',
      '/api/v1/azampay/disburse',
      body,
      this.config.disbursementBaseUrl,
    );

    return {
      disbursementId: res.pgReferenceId ?? payload.reference,
      reference: payload.reference,
      status: res.success ? 'SUCCESS' : 'FAILED',
      raw: res,
    };
  }

  /**
   * Parse and verify an incoming AzamPay callback (webhook).
   *
   * Matches the `CallbackRequest` schema from the AzamPay OpenAPI spec:
   * `transactionstatus` (string), `transid`, `utilityref`, `operator`,
   * `externalreference`, `msisdn`, `mnoreference`, `amount` (string),
   * and `signature` (RSA base64).
   *
   * **Signature verification:** AzamPay signs callbacks with an RSA
   * digital signature over
   * `{utilityref}{externalreference}{transactionstatus}{operator}`.
   * The public key is fetched from
   * `GET /azampay/v1/public-key?format=Pem` (cached 24 hours).
   * If the signature is absent (`null`), verification is skipped —
   * this is accepted in the spec but should be logged for production.
   */
  async handleWebhook(
    rawBody: string | Buffer,
    _headers: Record<string, string>,
  ): Promise<PaymentEvent> {
    const body = typeof rawBody === 'string' ? rawBody : rawBody.toString();

    let payload: CallbackRequest;
    try {
      payload = JSON.parse(body) as CallbackRequest;
    } catch {
      throw new PesaProviderError('AzamPay webhook: invalid JSON body', 400);
    }

    // Verify RSA signature
    const signatureValid = await this.verifyCallbackSignature(payload);
    if (!signatureValid) {
      throw new PesaWebhookError('AzamPay webhook: signature verification failed');
    }

    // Validate required fields — per spec, these MUST be present.
    // Producing sentinel values like 'unknown' or 0 is worse than
    // rejecting the callback: an unprocessable callback should surface
    // loudly so the operator can investigate.
    if (!payload.transid) {
      throw new PesaWebhookError('AzamPay webhook: missing required field "transid"');
    }
    if (!payload.transactionstatus) {
      throw new PesaWebhookError('AzamPay webhook: missing required field "transactionstatus"');
    }
    if (payload.amount === undefined || payload.amount === null) {
      throw new PesaWebhookError('AzamPay webhook: missing required field "amount"');
    }

    // Map `transactionstatus` (string: "success"/"failure") to PaymentStatus
    const isSuccess = payload.transactionstatus.toLowerCase() === 'success';
    const status: PaymentStatus = isSuccess ? 'SUCCESS' : 'FAILED';
    const eventType = isSuccess ? 'PAYMENT_SUCCESS' : 'PAYMENT_FAILED';

    const amount = Number(payload.amount);

    return {
      id: uuid(),
      type: eventType,
      orderId: payload.transid,
      reference: payload.utilityref ?? payload.reference ?? 'unknown',
      amount,
      currency: 'TZS',
      status,
      provider: 'azampay',
      timestamp: new Date(),
      raw: payload,
    };
  }

  // ── Optional Methods ─────────────────────────────────────────────

  /**
   * Name lookup.
   *
   * Uses the **disbursement** base URL per the OpenAPI spec.
   * Accepts `status` field from the spec; falls back to `success` for
   * provider implementations that deviate from their own spec.
   */
  async getNameLookup(phoneOrAccount: string): Promise<NameLookupResult> {
    try {
      const res = await this.request<NameLookupResponse>(
        'POST',
        '/api/v1/azampay/namelookup',
        {
          bankName: this.mapDisburseProvider(phoneOrAccount),
          accountNumber: phoneOrAccount,
        },
        this.config.disbursementBaseUrl,
      );

      // Spec uses `status` (boolean). Accept both `status` and the
      // unofficial `success` in case the real API deviates.
      const raw = res as unknown as Record<string, unknown>;
      const ok = raw.success ?? res.status;

      return {
        found: Boolean(ok) && !!res.name,
        accountName: res.name ?? undefined,
        accountNumber: res.accountNumber || phoneOrAccount,
        provider: res.bankName ?? 'azampesa',
        raw: res,
      };
    } catch {
      return { found: false, accountNumber: phoneOrAccount };
    }
  }

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

  /**
   * List available payment partners for the configured merchant.
   *
   * The AzamPay spec returns a **bare JSON array** of partner objects,
   * not a `{ partners: [...] }` wrapper.
   */
  async getPaymentPartners(): Promise<PartnerResponse[]> {
    const res = await this.request<PartnerResponse[]>('GET', '/api/v1/Partner/GetPaymentPartners');

    return Array.isArray(res) ? res : [];
  }

  /**
   * Disbursement checksums.
   *
   * The AzamPay OpenAPI spec documents a checksum requirement for
   * disbursement endpoints (`disburse`, `getNameLookup`):
   * `Base64(RSA(SHA512(input)))` with PKCS#1 padding using a public
   * key provided by AzamPay support.
   *
   * The exact fields hashed vary by endpoint and must be obtained by
   * contacting AzamPay ("Please contact us for the fields that will
   * be used to calculate checksum"). This is not yet implemented
   * because the field list is undocumented.
   *
   * To enable: add `disbursementChecksumKey` to `AzamPayConfig`
   * (the PEM public key), implement `computeDisbursementChecksum()`,
   * and call it in `disburse()` and `getNameLookup()`.
   *
   * @see misc/azampay-api-schema.json#L755-791
   */

  // Not supported:
  // cancelOrder, listOrders, getBalance, previewOrder, previewDisburse, refund
  // — AzamPay does not expose these.
}
