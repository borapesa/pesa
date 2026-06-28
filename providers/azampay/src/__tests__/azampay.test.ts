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

  // ── disburse ────────────────────────────────────────────────────

  it('sends disbursement with source and destination', async () => {
    mockSeq(tokenResponse(), {
      data: 'disb_ref_001',
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

    const url = (fetch as ReturnType<typeof mockSeq>).mock.calls[1]?.[0] as string;
    expect(url).toContain('disburse');
  });

  // ── getNameLookup ───────────────────────────────────────────────

  it('resolves account name via namelookup', async () => {
    mockSeq(tokenResponse(), {
      name: 'Jane Doe',
      message: 'Name lookup successful',
      success: true,
      accountNumber: '255754321098',
      bankName: 'Mpesa',
    });

    const provider = new AzamPayPaymentProvider(defaultConfig());

    const result = await provider.getNameLookup!('255754321098');
    expect(result.found).toBe(true);
    expect(result.accountName).toBe('Jane Doe');
  });

  // ── handleWebhook ────────────────────────────────────────────────

  it('parses webhook callback', async () => {
    const provider = new AzamPayPaymentProvider(defaultConfig());

    const body = JSON.stringify({
      transactionId: 'txn_wh',
      reference: 'ref_wh',
      success: true,
      amount: 15000,
      currency: 'TZS',
    });

    const event = await provider.handleWebhook(body, {});
    expect(event.type).toBe('PAYMENT_SUCCESS');
    expect(event.orderId).toBe('txn_wh');
    expect(event.provider).toBe('azampay');
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

  it('lists payment partners', async () => {
    mockSeq(tokenResponse(), {
      partners: [{ partnerName: 'M-Pesa', provider: 10, vendorName: 'Vodacom', currency: 'TZS' }],
      success: true,
    });

    const provider = new AzamPayPaymentProvider(defaultConfig());

    const partners = await provider.getPaymentPartners();
    expect(partners).toHaveLength(1);
    expect(partners[0]?.partnerName).toBe('M-Pesa');
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

  // ── validateCredentials ──────────────────────────────────────────

  it('validates credentials via token endpoint', async () => {
    mockSeq(tokenResponse());

    const provider = new AzamPayPaymentProvider(defaultConfig());

    const creds = await provider.validateCredentials!();
    expect(creds.valid).toBe(true);
  });
});
