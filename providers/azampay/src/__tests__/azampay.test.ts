import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AzamPayPaymentProvider } from '../azampay';

const customer = { name: 'Juma Ali', phone: '255712345678' };

function ok(data: unknown) {
  return {
    ok: true,
    status: 200,
    text: async () => JSON.stringify(data),
    json: async () => data,
  } as Response;
}

function mockSeq(...responses: unknown[]) {
  let i = 0;
  return vi.spyOn(globalThis, 'fetch').mockImplementation(() => {
    const data = responses[i] ?? responses[responses.length - 1];
    i++;
    return Promise.resolve(ok(data));
  });
}

function tokenResponse() {
  return {
    success: true,
    data: { accessToken: 'tok_abc', expire: '3600' },
    message: 'Success',
    statusCode: 200,
  };
}

function checkoutResponse() {
  return { transactionId: 'txn_123', message: 'Checkout successful', success: true };
}

/** Matches spec `CallbackRequest` — all 14 fields. */
function callbackPayload(overrides?: Partial<Record<string, unknown>>) {
  return JSON.stringify({
    message: 'Transaction completed successfully',
    user: 'merchant_user',
    password: 'merchant_password',
    clientId: 'client_123',
    transactionstatus: 'success',
    operator: 'Tigo',
    reference: 'REF123456789',
    externalreference: 'EXT987654321',
    utilityref: 'UTIL001',
    amount: '10000',
    transid: 'TXN123456',
    msisdn: '255712345678',
    mnoreference: 'MNO_REF_001',
    submerchantAcc: null,
    signature: null, // skip RSA verification in tests
    ...overrides,
  });
}

function defaultConfig(overrides?: Partial<import('../azampay').AzamPayConfig>) {
  return {
    appName: 'TestApp',
    clientId: 'test-client-id',
    clientSecret: 'test-client-secret',
    apiKey: 'test-api-key',
    senderName: 'Bora Pesa Ltd',
    ...overrides,
  };
}

describe('AzamPayPaymentProvider', () => {
  beforeEach(() => {
    vi.useFakeTimers({ now: 0 });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  // ── Auth ─────────────────────────────────────────────────────────

  it('authenticates and sends Bearer token', async () => {
    mockSeq(tokenResponse(), checkoutResponse());

    const provider = new AzamPayPaymentProvider(defaultConfig());

    await provider.createOrder({
      amount: 5000,
      currency: 'TZS',
      reference: 'ord_001',
      customer,
    });

    const authUrl = (fetch as ReturnType<typeof mockSeq>).mock.calls[0]?.[0] as string;
    expect(authUrl).toContain('authenticator');
    expect(authUrl).toContain('GenerateToken');
  });

  it('caches token and reuses it', async () => {
    mockSeq(tokenResponse(), checkoutResponse(), checkoutResponse());

    const provider = new AzamPayPaymentProvider(defaultConfig());

    await provider.createOrder({
      amount: 5000,
      currency: 'TZS',
      reference: 'ord_001',
      customer,
    });
    expect(fetch).toHaveBeenCalledTimes(2); // auth + checkout

    vi.clearAllMocks();
    // Second call: token cached, only checkout API called
    const spy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(ok(checkoutResponse()));

    await provider.createOrder({
      amount: 5000,
      currency: 'TZS',
      reference: 'ord_002',
      customer,
    });
    expect(spy).toHaveBeenCalledTimes(1);
  });

  // ── createOrder ──────────────────────────────────────────────────

  it('initiates MNO checkout', async () => {
    mockSeq(tokenResponse(), checkoutResponse());

    const provider = new AzamPayPaymentProvider(defaultConfig());

    const order = await provider.createOrder({
      amount: 5000,
      currency: 'TZS',
      reference: 'ord_mno',
      customer,
    });

    expect(order.orderId).toBe('txn_123');
    expect(order.status).toBe('PENDING');

    const url = (fetch as ReturnType<typeof mockSeq>).mock.calls[1]?.[0] as string;
    expect(url).toContain('mno/checkout');

    // Verify checkout body uses PascalCase Provider enum
    const body = JSON.parse(
      (fetch as ReturnType<typeof mockSeq>).mock.calls[1]?.[1]?.body as string,
    );
    expect(body.provider).toBe('Azampesa'); // 25571 → fallback (matches no prefix)
  });

  it('sends PascalCase provider in checkout body matching spec Provider enum', async () => {
    mockSeq(tokenResponse(), checkoutResponse());

    const provider = new AzamPayPaymentProvider(defaultConfig());
    await provider.createOrder({
      amount: 5000,
      currency: 'TZS',
      reference: 'ord_case',
      customer: { name: 'Juma Ali', phone: '255784321098' }, // 25578 → Airtel
    });

    const body = JSON.parse(
      (fetch as ReturnType<typeof mockSeq>).mock.calls[1]?.[1]?.body as string,
    );
    expect(body.provider).toBe('Airtel'); // PascalCase per spec Provider enum
  });

  it('sends X-API-Key on checkout calls', async () => {
    mockSeq(tokenResponse(), checkoutResponse());

    const provider = new AzamPayPaymentProvider(defaultConfig({ apiKey: 'test-api-key-xyz' }));

    await provider.createOrder({
      amount: 5000,
      currency: 'TZS',
      reference: 'ord_xapi',
      customer,
    });

    const headers = (fetch as ReturnType<typeof mockSeq>).mock.calls[1]?.[1]?.headers as
      | Record<string, string>
      | undefined;
    expect(headers?.['X-API-Key']).toBe('test-api-key-xyz');
    expect(headers?.Authorization).toContain('Bearer ');
  });

  it('sets ussdPushInitiated when checkout succeeds', async () => {
    mockSeq(tokenResponse(), checkoutResponse());

    const provider = new AzamPayPaymentProvider(defaultConfig());
    const order = await provider.createOrder({
      amount: 5000,
      currency: 'TZS',
      reference: 'ord_ussd',
      customer,
    });

    expect(order.ussdPushInitiated).toBe(true);
  });

  it('returns both _providerName and _checkoutProvider in raw', async () => {
    mockSeq(tokenResponse(), checkoutResponse());

    const provider = new AzamPayPaymentProvider(defaultConfig());
    const order = await provider.createOrder({
      amount: 5000,
      currency: 'TZS',
      reference: 'ord_raw',
      customer: { name: 'Juma Ali', phone: '255784321098' }, // 25578 → airtel (same in both enums)
    });

    const raw = order.raw as Record<string, unknown> | undefined;
    expect(raw?._providerName).toBe('airtel'); // lowercase, for getPaymentStatus
    expect(raw?._checkoutProvider).toBe('Airtel'); // PascalCase, matches what checkout API received
  });

  it('stores disburse fallback in _providerName when MNO not in disbursement enum', async () => {
    mockSeq(tokenResponse(), checkoutResponse());

    const provider = new AzamPayPaymentProvider(defaultConfig());
    // 25562 → Halopesa (PascalCase for checkout), but halopesa not in disbursement enum
    const order = await provider.createOrder({
      amount: 5000,
      currency: 'TZS',
      reference: 'ord_halo',
      customer: { name: 'Juma Ali', phone: '255621234567' },
    });

    const raw = order.raw as Record<string, unknown> | undefined;
    expect(raw?._checkoutProvider).toBe('Halopesa'); // what checkout API received
    expect(raw?._providerName).toBe('azampesa'); // disbursement fallback (halopesa not in enum)
    // Callers for getPaymentStatus should use _providerName, not _checkoutProvider
  });

  // ── disburse ────────────────────────────────────────────────────

  it('sends disbursement with spec-compliant fields', async () => {
    mockSeq(tokenResponse(), {
      pgReferenceId: 'disb_ref_001',
      message: 'Disbursement successful',
      success: true,
      statusCode: 200,
    });

    const provider = new AzamPayPaymentProvider(defaultConfig());

    const result = await provider.disburse({
      amount: 50000,
      currency: 'TZS',
      reference: 'disb_001',
      recipient: { phone: '255754321098', name: 'Jane Doe' },
    });

    expect(result.status).toBe('SUCCESS');
    expect(result.disbursementId).toBe('disb_ref_001'); // pgReferenceId

    // Should hit the disbursement host, not checkout
    const url = (fetch as ReturnType<typeof mockSeq>).mock.calls[1]?.[0] as string;
    expect(url).toContain('api-disbursement-sandbox.azampay.co.tz');
    expect(url).toContain('disburse');

    // Verify the body has dateInEpoch (not date string)
    const reqBody = JSON.parse(
      (fetch as ReturnType<typeof mockSeq>).mock.calls[1]?.[1]?.body as string,
    );
    expect(reqBody.transferDetails.dateInEpoch).toBe(0); // Date.now() faked to 0
    expect(reqBody.transferDetails.date).toBeUndefined();
    // source.bankName should be lowercase per spec enum
    expect(reqBody.source.bankName).toBe('azampesa');
  });

  it('returns FAILED status on unsuccessful disbursement', async () => {
    mockSeq(tokenResponse(), {
      pgReferenceId: null,
      message: 'Insufficient balance',
      success: false,
      statusCode: 400,
    });

    const provider = new AzamPayPaymentProvider(defaultConfig());
    const result = await provider.disburse({
      amount: 50000,
      currency: 'TZS',
      reference: 'disb_fail',
      recipient: { phone: '255754321098' },
    });

    expect(result.status).toBe('FAILED');
    expect(result.disbursementId).toBe('disb_fail'); // falls back to reference
  });

  // ── getNameLookup ───────────────────────────────────────────────

  it('resolves account name via namelookup', async () => {
    mockSeq(tokenResponse(), {
      name: 'Jane Doe',
      message: 'Name lookup successful',
      status: true, // spec field (not "success")
      statusCode: 200,
      accountNumber: '255754321098',
      bankName: 'Mpesa',
    });

    const provider = new AzamPayPaymentProvider(defaultConfig());

    const result = await provider.getNameLookup!('255754321098');
    expect(result.found).toBe(true);
    expect(result.accountName).toBe('Jane Doe');

    // Should hit the disbursement host
    const url = (fetch as ReturnType<typeof mockSeq>).mock.calls[1]?.[0] as string;
    expect(url).toContain('api-disbursement-sandbox.azampay.co.tz');
    expect(url).toContain('namelookup');
  });

  it('returns not-found when name lookup fails', async () => {
    mockSeq(tokenResponse(), {
      name: '',
      message: 'Account not found',
      status: false,
      statusCode: 404,
      accountNumber: '255754321098',
      bankName: '',
    });

    const provider = new AzamPayPaymentProvider(defaultConfig());
    const result = await provider.getNameLookup!('255754321098');
    expect(result.found).toBe(false);
  });

  // ── getPaymentStatus ─────────────────────────────────────────────

  it('returns SUCCESS for COMPLETE status', async () => {
    mockSeq(tokenResponse(), {
      data: 'COMPLETE',
      message: 'Transaction complete',
      success: true,
      statusCode: 200,
    });

    const provider = new AzamPayPaymentProvider(defaultConfig());
    const status = await provider.getPaymentStatus('txn_123');
    expect(status).toBe('SUCCESS');

    // Should hit the disbursement host
    const url = (fetch as ReturnType<typeof mockSeq>).mock.calls[1]?.[0] as string;
    expect(url).toContain('api-disbursement-sandbox.azampay.co.tz');
    expect(url).toContain('transactionstatus');
  });

  it('returns PROCESSING for PENDING status', async () => {
    mockSeq(tokenResponse(), {
      data: 'PENDING',
      message: 'Transaction pending',
      success: true,
      statusCode: 200,
    });

    const provider = new AzamPayPaymentProvider(defaultConfig());
    const status = await provider.getPaymentStatus('txn_456');
    expect(status).toBe('PROCESSING');
  });

  it('returns FAILED when success is false', async () => {
    mockSeq(tokenResponse(), {
      data: 'FAILED',
      message: 'Transaction failed',
      success: false,
      statusCode: 200,
    });

    const provider = new AzamPayPaymentProvider(defaultConfig());
    const status = await provider.getPaymentStatus('txn_fail');
    expect(status).toBe('FAILED');
  });

  it('uses explicit provider name in status query', async () => {
    mockSeq(tokenResponse(), { data: 'SUCCESS', message: 'OK', success: true, statusCode: 200 });

    const provider = new AzamPayPaymentProvider(defaultConfig());
    await provider.getPaymentStatus('txn_789', 'tigo');

    const url = (fetch as ReturnType<typeof mockSeq>).mock.calls[1]?.[0] as string;
    expect(url).toContain('bankName=tigo');
    expect(url).toContain('pgReferenceId=txn_789');
  });

  it('throws PesaNetworkError on network failure', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    fetchSpy
      .mockResolvedValueOnce(ok(tokenResponse())) // auth succeeds
      .mockRejectedValueOnce(new Error('Connection refused')); // status fetch fails

    const provider = new AzamPayPaymentProvider(defaultConfig());
    await expect(provider.getPaymentStatus('txn_err')).rejects.toThrow(
      'AzamPay status query failed',
    );
  });

  // ── handleWebhook ────────────────────────────────────────────────

  it('parses CallbackRequest and returns PAYMENT_SUCCESS', async () => {
    const provider = new AzamPayPaymentProvider(defaultConfig());

    const event = await provider.handleWebhook(callbackPayload(), {});

    expect(event.type).toBe('PAYMENT_SUCCESS');
    expect(event.orderId).toBe('TXN123456'); // transid
    expect(event.reference).toBe('UTIL001'); // utilityref
    expect(event.amount).toBe(10000); // string→number
    expect(event.provider).toBe('azampay');
  });

  it('returns PAYMENT_FAILED for transactionstatus=failure', async () => {
    const provider = new AzamPayPaymentProvider(defaultConfig());

    const event = await provider.handleWebhook(
      callbackPayload({ transactionstatus: 'failure' }),
      {},
    );

    expect(event.type).toBe('PAYMENT_FAILED');
    expect(event.status).toBe('FAILED');
  });

  it('throws on invalid JSON webhook', async () => {
    const provider = new AzamPayPaymentProvider(defaultConfig());
    await expect(provider.handleWebhook('not json', {})).rejects.toThrow('invalid JSON body');
  });

  it('rejects webhook with invalid RSA signature', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');

    // Mock public key fetch
    fetchSpy
      .mockResolvedValueOnce(
        ok({
          success: true,
          format: 'Pem',
          publicKey:
            '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAfake\n-----END PUBLIC KEY-----',
        }),
      )
      .mockRejectedValueOnce(new Error('should not be called'));

    const provider = new AzamPayPaymentProvider(defaultConfig());

    // Payload with a non-null signature that will fail verification
    await expect(
      provider.handleWebhook(callbackPayload({ signature: 'aW52YWxpZC1zaWduYXR1cmU=' }), {}),
    ).rejects.toThrow('signature verification failed');
  });

  it('accepts webhook with signature=null (skips verification)', async () => {
    const provider = new AzamPayPaymentProvider(defaultConfig());

    // signature: null → verifyCallbackSignature returns true without fetch
    const event = await provider.handleWebhook(callbackPayload({ signature: null }), {});

    expect(event.type).toBe('PAYMENT_SUCCESS');
  });

  // ── Provider-specific ────────────────────────────────────────────

  it('generates post checkout URL', async () => {
    mockSeq(tokenResponse(), {
      data: 'https://checkout.azampay.co.tz/pay/abc123',
      success: true,
    });

    const provider = new AzamPayPaymentProvider(defaultConfig());

    const url = await provider.createPostCheckout({
      amount: '5000',
      currency: 'TZS',
      externalId: 'ext_001',
      vendorName: 'Test Vendor',
      vendorId: 'v_001',
      redirectSuccessURL: 'https://mysite.com/success',
      redirectFailURL: 'https://mysite.com/fail',
    });

    expect(url).toBe('https://checkout.azampay.co.tz/pay/abc123');
  });

  it('lists payment partners (spec: bare array)', async () => {
    mockSeq(tokenResponse(), [
      { partnerName: 'M-Pesa', provider: 10, vendorName: 'Vodacom', currency: 'TZS' },
    ]);

    const provider = new AzamPayPaymentProvider(defaultConfig());

    const partners = await provider.getPaymentPartners();
    expect(partners).toHaveLength(1);
    expect(partners[0]?.partnerName).toBe('M-Pesa');
  });

  it('returns empty array when partners response is not an array', async () => {
    // Defensive: if API returns an object instead of bare array
    mockSeq(tokenResponse(), { error: 'unexpected' });

    const provider = new AzamPayPaymentProvider(defaultConfig());
    const partners = await provider.getPaymentPartners();
    expect(partners).toEqual([]);
  });

  // ── Bank checkout ────────────────────────────────────────────────

  it('creates bank checkout with OTP', async () => {
    mockSeq(tokenResponse(), {
      transactionId: 'bnk_txn_001',
      message: 'Bank checkout successful',
      success: true,
    });

    const provider = new AzamPayPaymentProvider(defaultConfig());

    const result = await provider.createBankCheckout({
      amount: '50000',
      merchantAccountNumber: '1234567890',
      merchantMobileNumber: '255712345678',
      otp: '123456',
      provider: 'CRDB',
      referenceId: 'ref_bnk_001',
    });

    expect(result.success).toBe(true);
    expect(result.transactionId).toBe('bnk_txn_001');

    const url = (fetch as ReturnType<typeof mockSeq>).mock.calls[1]?.[0] as string;
    expect(url).toContain('bank/checkout');
  });

  it('returns false success when bank checkout fails', async () => {
    mockSeq(tokenResponse(), {
      transactionId: '',
      message: 'Invalid OTP',
      success: false,
    });

    const provider = new AzamPayPaymentProvider(defaultConfig());
    const result = await provider.createBankCheckout({
      amount: '50000',
      merchantAccountNumber: '1234567890',
      merchantMobileNumber: '255712345678',
      otp: '000000',
      provider: 'CRDB',
      referenceId: 'ref_fail',
    });

    expect(result.success).toBe(false);
  });

  // ── createPostCheckout edge ──────────────────────────────────────

  it('throws on post checkout failure', async () => {
    mockSeq(tokenResponse(), { data: null, success: false });

    const provider = new AzamPayPaymentProvider(defaultConfig());
    await expect(
      provider.createPostCheckout({
        amount: '5000',
        currency: 'TZS',
        externalId: 'ext_bad',
        vendorName: 'Test',
        vendorId: 'v_001',
        redirectSuccessURL: 'https://mysite.com/success',
        redirectFailURL: 'https://mysite.com/fail',
      }),
    ).rejects.toThrow('AzamPay post checkout failed');
  });

  // ── validateCredentials ──────────────────────────────────────────

  it('validates credentials via token endpoint', async () => {
    mockSeq(tokenResponse());

    const provider = new AzamPayPaymentProvider(defaultConfig());

    const creds = await provider.validateCredentials!();
    expect(creds.valid).toBe(true);
  });

  it('returns invalid on auth failure', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('DNS lookup failed'));

    const provider = new AzamPayPaymentProvider(defaultConfig());
    const creds = await provider.validateCredentials!();
    expect(creds.valid).toBe(false);
    expect(creds.message).toContain('DNS');
  });

  // ── Config ───────────────────────────────────────────────────────

  it('defaults disbursementBaseUrl to sandbox when sandbox=true', () => {
    const provider = new AzamPayPaymentProvider(defaultConfig({ sandbox: true }));
    // Access private config via prototype to verify
    const config = (provider as unknown as { config: { disbursementBaseUrl: string } }).config;
    expect(config.disbursementBaseUrl).toContain('api-disbursement-sandbox.azampay.co.tz');
  });

  it('uses custom disbursementBaseUrl when provided', () => {
    const provider = new AzamPayPaymentProvider(
      defaultConfig({ disbursementBaseUrl: 'https://my-disburse.example.com' }),
    );
    const config = (provider as unknown as { config: { disbursementBaseUrl: string } }).config;
    expect(config.disbursementBaseUrl).toBe('https://my-disburse.example.com');
  });
});
