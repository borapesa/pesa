import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ClickPesaProvider } from '../clickpesa';

const customer = { name: 'Juma Ali', phone: '255712345678' };

function mockFetch(response: unknown, status = 200) {
  return vi.spyOn(globalThis, 'fetch').mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    text: async () => JSON.stringify(response),
    json: async () => response,
  } as Response);
}

describe('ClickPesaProvider', () => {
  beforeEach(() => {
    vi.useFakeTimers({ now: 0 });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  // ── Token caching ───────────────────────────────────────────────

  it('caches the auth token and reuses it', async () => {
    mockFetch({ success: true, token: 'Bearer tok_abc' });

    const provider = new ClickPesaProvider({
      baseUrl: 'https://api.clickpesa.com',
      clientId: 'test-client',
      apiKey: 'test-key',
    });

    // First call — fetches token
    await provider.validateCredentials!();
    expect(fetch).toHaveBeenCalledTimes(1);

    // Second call within TTL — reuses cached token
    await provider.validateCredentials!();
    expect(fetch).toHaveBeenCalledTimes(1); // still 1

    // Advance past 55-minute TTL
    vi.advanceTimersByTime(56 * 60 * 1000);

    mockFetch({ success: true, token: 'Bearer tok_new' });
    await provider.validateCredentials!();
    expect(fetch).toHaveBeenCalledTimes(2); // refreshed
  });

  // ── createOrder routing ─────────────────────────────────────────

  it('uses USSD push when no redirectUrl', async () => {
    mockFetch({
      success: true,
      id: 'txn_123',
      status: 'SUCCESS',
      channel: 'USSD',
      orderReference: 'order_001',
      collectedAmount: '15000',
      collectedCurrency: 'TZS',
    });

    const provider = new ClickPesaProvider({
      baseUrl: 'https://api.clickpesa.com',
      clientId: 'test-client',
      apiKey: 'test-key',
    });

    // Need to auth first
    mockFetch({ success: true, token: 'Bearer tok' });
    await provider.validateCredentials!();
    vi.clearAllMocks();

    mockFetch({
      success: true,
      id: 'txn_123',
      status: 'SUCCESS',
      channel: 'USSD',
      orderReference: 'order_001',
      collectedAmount: '15000',
      collectedCurrency: 'TZS',
    });

    const order = await provider.createOrder({
      amount: 15000,
      currency: 'TZS',
      reference: 'order_001',
      customer,
    });

    expect(order.orderId).toBe('order_001'); // matches reference
    expect(order.status).toBe('SUCCESS');
    expect(order.ussdPushInitiated).toBe(true);

    const url = (fetch as ReturnType<typeof mockFetch>).mock.calls[0]?.[0] as string;
    expect(url).toContain('initiate-ussd-push-request');
  });

  it('uses checkout link when redirectUrl is set', async () => {
    // Auth
    mockFetch({ success: true, token: 'Bearer tok' });
    const provider = new ClickPesaProvider({
      baseUrl: 'https://api.clickpesa.com',
      clientId: 'test-client',
      apiKey: 'test-key',
    });
    await provider.validateCredentials!();
    vi.clearAllMocks();

    mockFetch({
      success: true,
      checkoutLink: 'https://pay.clickpesa.com/checkout/abc',
      orderReference: 'order_002',
    });

    const order = await provider.createOrder({
      amount: 15000,
      currency: 'TZS',
      reference: 'order_002',
      customer,
      redirectUrl: 'https://mysite.com/callback',
    });

    expect(order.checkoutUrl).toBe('https://pay.clickpesa.com/checkout/abc');
    expect(order.status).toBe('PENDING');

    const url = (fetch as ReturnType<typeof mockFetch>).mock.calls[0]?.[0] as string;
    expect(url).toContain('generate-checkout-link');
  });

  it('routes USD currency to card payment', async () => {
    mockFetch({ success: true, token: 'Bearer tok' });
    const provider = new ClickPesaProvider({
      baseUrl: 'https://api.clickpesa.com',
      clientId: 'test-client',
      apiKey: 'test-key',
    });
    await provider.validateCredentials!();
    vi.clearAllMocks();

    mockFetch({
      success: true,
      cardPaymentLink: 'https://pay.clickpesa.com/card/xyz',
      clientId: 'client_1',
    });

    const order = await provider.createOrder({
      amount: 50,
      currency: 'USD',
      reference: 'card_001',
      customer: { name: 'Juma Ali', phone: '255712345678', email: 'juma@example.com' },
    });

    expect(order.checkoutUrl).toBe('https://pay.clickpesa.com/card/xyz');
    expect(order.status).toBe('PENDING');

    const url = (fetch as ReturnType<typeof mockFetch>).mock.calls[0]?.[0] as string;
    expect(url).toContain('initiate-card-payment');
  });

  it('previews card payment methods for USD', async () => {
    mockFetch({ success: true, token: 'Bearer tok' });
    const provider = new ClickPesaProvider({
      baseUrl: 'https://api.clickpesa.com',
      clientId: 'test-client',
      apiKey: 'test-key',
    });
    await provider.validateCredentials!();
    vi.clearAllMocks();

    mockFetch({
      success: true,
      activeMethods: [
        { name: 'VISA', status: 'AVAILABLE' },
        { name: 'MASTER CARD', status: 'AVAILABLE' },
      ],
    });

    const preview = await provider.previewOrder!({
      amount: 50,
      currency: 'USD',
      reference: 'card_pre_001',
      customer: { name: 'Juma', phone: '255712345678' },
    });

    expect(preview.valid).toBe(true);
    expect(preview.message).toContain('VISA');
    expect(preview.message).toContain('MASTER CARD');
  });

  it('reports invalid when no card methods available', async () => {
    mockFetch({ success: true, token: 'Bearer tok' });
    const provider = new ClickPesaProvider({
      baseUrl: 'https://api.clickpesa.com',
      clientId: 'test-client',
      apiKey: 'test-key',
    });
    await provider.validateCredentials!();
    vi.clearAllMocks();

    mockFetch({ success: true, activeMethods: [] });

    const preview = await provider.previewOrder!({
      amount: 50,
      currency: 'USD',
      reference: 'card_pre_002',
      customer: { name: 'Juma', phone: '255712345678' },
    });

    expect(preview.valid).toBe(false);
  });

  // ── getPaymentStatus ────────────────────────────────────────────

  it('normalizes SETTLED to SUCCESS', async () => {
    mockFetch({ success: true, token: 'Bearer tok' });
    const provider = new ClickPesaProvider({
      baseUrl: 'https://api.clickpesa.com',
      clientId: 'test-client',
      apiKey: 'test-key',
    });
    await provider.validateCredentials!();
    vi.clearAllMocks();

    mockFetch([
      {
        id: 'txn_1',
        status: 'SETTLED',
        orderReference: 'ref_1',
        collectedAmount: 5000,
        collectedCurrency: 'TZS',
      },
    ]);

    const status = await provider.getPaymentStatus('ref_1');
    expect(status).toBe('SUCCESS');
  });

  it('returns PENDING on 404', async () => {
    mockFetch({ success: true, token: 'Bearer tok' });
    const provider = new ClickPesaProvider({
      baseUrl: 'https://api.clickpesa.com',
      clientId: 'test-client',
      apiKey: 'test-key',
    });
    await provider.validateCredentials!();
    vi.clearAllMocks();

    // 404
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 404,
      text: async () => 'not found',
      json: async () => ({}),
    } as Response);

    const status = await provider.getPaymentStatus('unknown_ref');
    expect(status).toBe('PENDING');
  });

  // ── handleWebhook ───────────────────────────────────────────────

  it('normalizes PAYMENT RECEIVED webhook to PaymentEvent', async () => {
    const provider = new ClickPesaProvider({
      baseUrl: 'https://api.clickpesa.com',
      clientId: 'test-client',
      apiKey: 'test-key',
    });

    const body = JSON.stringify({
      event: 'PAYMENT RECEIVED',
      data: {
        orderReference: 'order_wh',
        status: 'SUCCESS',
        collectedAmount: 15000,
        collectedCurrency: 'TZS',
      },
    });

    const event = await provider.handleWebhook(body, {});
    expect(event.type).toBe('PAYMENT_SUCCESS');
    expect(event.orderId).toBe('order_wh');
    expect(event.reference).toBe('order_wh');
    expect(event.amount).toBe(15000);
    expect(event.provider).toBe('clickpesa');
  });

  it('normalizes PAYOUT INITIATED webhook correctly', async () => {
    const provider = new ClickPesaProvider({
      baseUrl: 'https://api.clickpesa.com',
      clientId: 'test-client',
      apiKey: 'test-key',
    });

    const body = JSON.stringify({
      event: 'PAYOUT INITIATED',
      data: {
        orderReference: 'payout_wh',
        status: 'SUCCESS',
        amount: 50000,
        currency: 'TZS',
      },
    });

    const event = await provider.handleWebhook(body, {});
    expect(event.type).toBe('DISBURSEMENT_SUCCESS');
    expect(event.orderId).toBe('payout_wh');
  });

  // ── disburse ────────────────────────────────────────────────────

  it('disburses via mobile money payout endpoint', async () => {
    mockFetch({ success: true, token: 'Bearer tok' });
    const provider = new ClickPesaProvider({
      baseUrl: 'https://api.clickpesa.com',
      clientId: 'test-client',
      apiKey: 'test-key',
    });
    await provider.validateCredentials!();
    vi.clearAllMocks();

    mockFetch({
      success: true,
      id: 'disb_1',
      status: 'SUCCESS',
      orderReference: 'payout_001',
    });

    const result = await provider.disburse({
      amount: 50000,
      currency: 'TZS',
      reference: 'payout_001',
      recipient: { phone: '255754321098', name: 'Juma', network: 'MPESA' },
    });

    expect(result.status).toBe('SUCCESS');
    expect(result.disbursementId).toBe('disb_1');
  });

  it('routes to bank payout when accountNumber is present', async () => {
    mockFetch({ success: true, token: 'Bearer tok' });
    const provider = new ClickPesaProvider({
      baseUrl: 'https://api.clickpesa.com',
      clientId: 'test-client',
      apiKey: 'test-key',
    });
    await provider.validateCredentials!();
    vi.clearAllMocks();

    mockFetch({
      success: true,
      id: 'bank_disb_1',
      status: 'SUCCESS',
      orderReference: 'bank_payout_001',
    });

    const result = await provider.disburse({
      amount: 500000,
      currency: 'TZS',
      reference: 'bank_payout_001',
      recipient: {
        name: 'Jane Doe',
        accountNumber: '1234567890',
        bic: 'EQBLTZTZ',
        transferType: 'RTGS',
      },
    });

    expect(result.status).toBe('SUCCESS');
    expect(result.disbursementId).toBe('bank_disb_1');

    const url = (fetch as ReturnType<typeof mockFetch>).mock.calls[0]?.[0] as string;
    expect(url).toContain('create-bank-payout');

    const body = JSON.parse(
      (fetch as ReturnType<typeof mockFetch>).mock.calls[0]?.[1]?.body as string,
    );
    expect(body.accountNumber).toBe('1234567890');
    expect(body.bic).toBe('EQBLTZTZ');
    expect(body.transferType).toBe('RTGS');
  });

  it('defaults bank transferType to ACH', async () => {
    mockFetch({ success: true, token: 'Bearer tok' });
    const provider = new ClickPesaProvider({
      baseUrl: 'https://api.clickpesa.com',
      clientId: 'test-client',
      apiKey: 'test-key',
    });
    await provider.validateCredentials!();
    vi.clearAllMocks();

    mockFetch({
      success: true,
      id: 'bank_disb_2',
      status: 'PROCESSING',
      orderReference: 'bank_payout_002',
    });

    await provider.disburse({
      amount: 100000,
      currency: 'TZS',
      reference: 'bank_payout_002',
      recipient: { name: 'Jane', accountNumber: '0987654321', bic: 'NMBTZTZ' },
    });

    const body = JSON.parse(
      (fetch as ReturnType<typeof mockFetch>).mock.calls[0]?.[1]?.body as string,
    );
    expect(body.transferType).toBe('ACH');
  });

  it('fetches list of supported banks', async () => {
    mockFetch({ success: true, token: 'Bearer tok' });
    const provider = new ClickPesaProvider({
      baseUrl: 'https://api.clickpesa.com',
      clientId: 'test-client',
      apiKey: 'test-key',
    });
    await provider.validateCredentials!();
    vi.clearAllMocks();

    mockFetch([
      {
        name: 'EQUITY BANK TANZANIA LIMITED',
        bic: 'EQBLTZTZ',
        value: 'equity_bank_tanzania_limited',
      },
      { name: 'NMB BANK', bic: 'NMBTZTZ', value: 'nmb_bank' },
    ]);

    const banks = await provider.getBanks!();
    expect(banks).toHaveLength(2);
    expect(banks[0]?.bic).toBe('EQBLTZTZ');
  });

  // ── Sandbox flag ─────────────────────────────────────────────────

  it('sandbox: true defaults to sandbox base URL', async () => {
    mockFetch({ success: true, token: 'Bearer tok' });
    const provider = new ClickPesaProvider({
      sandbox: true,
      clientId: 'test-client',
      apiKey: 'test-key',
    });
    await provider.validateCredentials!();

    const url = (fetch as ReturnType<typeof mockFetch>).mock.calls[0]?.[0] as string;
    expect(url).toContain('api-sandbox.clickpesa.com');
  });

  it('sandbox: false defaults to production base URL', async () => {
    mockFetch({ success: true, token: 'Bearer tok' });
    const provider = new ClickPesaProvider({
      sandbox: false,
      clientId: 'test-client',
      apiKey: 'test-key',
    });
    await provider.validateCredentials!();

    const url = (fetch as ReturnType<typeof mockFetch>).mock.calls[0]?.[0] as string;
    expect(url).toContain('api.clickpesa.com');
  });

  it('no sandbox flag defaults to production', async () => {
    mockFetch({ success: true, token: 'Bearer tok' });
    const provider = new ClickPesaProvider({
      clientId: 'test-client',
      apiKey: 'test-key',
    });
    await provider.validateCredentials!();

    const url = (fetch as ReturnType<typeof mockFetch>).mock.calls[0]?.[0] as string;
    expect(url).toContain('api.clickpesa.com');
  });

  it('baseUrl overrides sandbox flag', async () => {
    mockFetch({ success: true, token: 'Bearer tok' });
    const provider = new ClickPesaProvider({
      sandbox: true,
      baseUrl: 'https://custom-proxy.example.com',
      clientId: 'test-client',
      apiKey: 'test-key',
    });
    await provider.validateCredentials!();

    const url = (fetch as ReturnType<typeof mockFetch>).mock.calls[0]?.[0] as string;
    expect(url).toContain('custom-proxy.example.com');
  });

  // ── Checksum creation ────────────────────────────────────────────

  it('createChecksum returns empty string when no checksumKey', () => {
    const provider = new ClickPesaProvider({
      clientId: 'test-client',
      apiKey: 'test-key',
    });
    expect(provider.createChecksum({ amount: '5000' })).toBe('');
  });

  it('createChecksum canonicalizes and signs payload', () => {
    const provider = new ClickPesaProvider({
      clientId: 'test-client',
      apiKey: 'test-key',
      checksumKey: 'sk_test_abc123',
    });

    // Same payload, different key order — must produce the same checksum
    const a = provider.createChecksum({ amount: '5000', currency: 'TZS', phone: '255712345678' });
    const b = provider.createChecksum({ phone: '255712345678', currency: 'TZS', amount: '5000' });
    expect(a).toBe(b);
    expect(a.length).toBe(64); // SHA-256 hex is 64 chars
  });

  it('createChecksum produces different values for different payloads', () => {
    const provider = new ClickPesaProvider({
      clientId: 'test-client',
      apiKey: 'test-key',
      checksumKey: 'sk_test_abc123',
    });

    const a = provider.createChecksum({ amount: '5000' });
    const b = provider.createChecksum({ amount: '10000' });
    expect(a).not.toBe(b);
  });

  it('injects checksum into POST request body', async () => {
    // Auth
    mockFetch({ success: true, token: 'Bearer tok' });
    const provider = new ClickPesaProvider({
      baseUrl: 'https://api.clickpesa.com',
      clientId: 'test-client',
      apiKey: 'test-key',
      checksumKey: 'sk_test_abc123',
    });
    await provider.validateCredentials!();
    vi.clearAllMocks();

    mockFetch({
      success: true,
      id: 'txn_cs',
      status: 'SUCCESS',
      channel: 'USSD',
      orderReference: 'order_cs',
      collectedAmount: '15000',
      collectedCurrency: 'TZS',
    });

    await provider.createOrder({
      amount: 15000,
      currency: 'TZS',
      reference: 'order_cs',
      customer,
    });

    const body = JSON.parse(
      (fetch as ReturnType<typeof mockFetch>).mock.calls[0]?.[1]?.body as string,
    );
    expect(body.checksum).toBeDefined();
    expect(body.checksum).toHaveLength(64); // SHA-256 hex
  });

  it('does not inject checksum on GET requests', async () => {
    mockFetch({ success: true, token: 'Bearer tok' });
    const provider = new ClickPesaProvider({
      baseUrl: 'https://api.clickpesa.com',
      clientId: 'test-client',
      apiKey: 'test-key',
      checksumKey: 'sk_test_abc123',
    });
    await provider.validateCredentials!();

    // validateCredentials uses POST for auth, then we check
    // getPaymentStatus is a GET — no body, so no checksum injection.
    vi.clearAllMocks();
    mockFetch([
      {
        id: 't1',
        status: 'SUCCESS',
        orderReference: 'r1',
        collectedAmount: 5000,
        collectedCurrency: 'TZS',
      },
    ]);

    await provider.getPaymentStatus('r1');
    const init = (fetch as ReturnType<typeof mockFetch>).mock.calls[0]?.[1] as
      | RequestInit
      | undefined;
    // GET request should not have a body with checksum
    expect(init?.body).toBeUndefined();
  });

  // ── getBalance ───────────────────────────────────────────────────

  it('returns per-currency balances', async () => {
    mockFetch({ success: true, token: 'Bearer tok' });
    const provider = new ClickPesaProvider({
      baseUrl: 'https://api.clickpesa.com',
      clientId: 'test-client',
      apiKey: 'test-key',
    });
    await provider.validateCredentials!();
    vi.clearAllMocks();

    mockFetch({
      success: true,
      balances: [
        { currency: 'TZS', balance: 1500000 },
        { currency: 'USD', balance: 250.5 },
      ],
    });

    const result = await provider.getBalance!();
    expect(result.balances).toHaveLength(2);
    expect(result.balances[0]).toEqual({ currency: 'TZS', amount: 1500000 });
    expect(result.balances[1]).toEqual({ currency: 'USD', amount: 250.5 });
  });

  it('returns empty balances when account has no funds', async () => {
    mockFetch({ success: true, token: 'Bearer tok' });
    const provider = new ClickPesaProvider({
      baseUrl: 'https://api.clickpesa.com',
      clientId: 'test-client',
      apiKey: 'test-key',
    });
    await provider.validateCredentials!();
    vi.clearAllMocks();

    mockFetch({ success: true, balances: [] });

    const result = await provider.getBalance!();
    expect(result.balances).toHaveLength(0);
    expect(result.raw).toBeDefined();
  });

  // ── listOrders ───────────────────────────────────────────────────

  it('lists orders with date range and pagination', async () => {
    mockFetch({ success: true, token: 'Bearer tok' });
    const provider = new ClickPesaProvider({
      baseUrl: 'https://api.clickpesa.com',
      clientId: 'test-client',
      apiKey: 'test-key',
    });
    await provider.validateCredentials!();
    vi.clearAllMocks();

    mockFetch({
      success: true,
      data: [
        {
          id: 'txn_1',
          status: 'SUCCESS',
          orderReference: 'ref_1',
          collectedAmount: 5000,
          collectedCurrency: 'TZS',
          createdAt: '2026-01-15T10:30:00Z',
        },
        {
          id: 'txn_2',
          status: 'PROCESSING',
          orderReference: 'ref_2',
          collectedAmount: 15000,
          collectedCurrency: 'TZS',
          createdAt: '2026-01-16T14:00:00Z',
        },
      ],
      totalCount: 42,
    });

    const result = await provider.listOrders!({
      fromDate: new Date('2026-01-01'),
      toDate: new Date('2026-01-31'),
      limit: 20,
      offset: 0,
    });

    expect(result.orders).toHaveLength(2);
    expect(result.total).toBe(42);
    expect(result.orders[0]?.status).toBe('SUCCESS');
    expect(result.orders[1]?.status).toBe('PROCESSING');
    expect(result.orders[0]?.amount).toBe(5000);

    // Verify query params were sent
    const url = (fetch as ReturnType<typeof mockFetch>).mock.calls[0]?.[0] as string;
    expect(url).toContain('startDate=2026-01-01');
    expect(url).toContain('endDate=2026-01-31');
    expect(url).toContain('limit=20');
    expect(url).toContain('skip=0');
  });

  it('returns empty list when no orders match', async () => {
    mockFetch({ success: true, token: 'Bearer tok' });
    const provider = new ClickPesaProvider({
      baseUrl: 'https://api.clickpesa.com',
      clientId: 'test-client',
      apiKey: 'test-key',
    });
    await provider.validateCredentials!();
    vi.clearAllMocks();

    mockFetch({ success: true, data: [], totalCount: 0 });

    const result = await provider.listOrders!({});
    expect(result.orders).toHaveLength(0);
    expect(result.total).toBe(0);
  });

  it('handles missing totalCount gracefully', async () => {
    mockFetch({ success: true, token: 'Bearer tok' });
    const provider = new ClickPesaProvider({
      baseUrl: 'https://api.clickpesa.com',
      clientId: 'test-client',
      apiKey: 'test-key',
    });
    await provider.validateCredentials!();
    vi.clearAllMocks();

    mockFetch({
      success: true,
      data: [
        {
          id: 'txn_3',
          status: 'FAILED',
          orderReference: 'ref_3',
          collectedAmount: 3000,
          collectedCurrency: 'TZS',
        },
      ],
    });

    const result = await provider.listOrders!({});
    expect(result.orders).toHaveLength(1);
    expect(result.total).toBe(1); // falls back to items.length
  });

  // ── BillPay ──────────────────────────────────────────────────────

  it('creates an order control number', async () => {
    mockFetch({ success: true, token: 'Bearer tok' });
    const provider = new ClickPesaProvider({
      baseUrl: 'https://api.clickpesa.com',
      clientId: 'test-client',
      apiKey: 'test-key',
    });
    await provider.validateCredentials!();
    vi.clearAllMocks();

    mockFetch({
      success: true,
      billPayNumber: '55042914871931',
      billAmount: 90900,
      billDescription: 'Water Bill - July 2026',
      billPaymentMode: 'EXACT',
    });

    const cn = await provider.createOrderControlNumber({
      amount: 90900,
      description: 'Water Bill - July 2026',
      paymentMode: 'EXACT',
    });

    expect(cn.billPayNumber).toBe('55042914871931');
    expect(cn.billAmount).toBe(90900);

    const url = (fetch as ReturnType<typeof mockFetch>).mock.calls[0]?.[0] as string;
    expect(url).toContain('create-order-control-number');
  });

  it('creates a customer control number', async () => {
    mockFetch({ success: true, token: 'Bearer tok' });
    const provider = new ClickPesaProvider({
      baseUrl: 'https://api.clickpesa.com',
      clientId: 'test-client',
      apiKey: 'test-key',
    });
    await provider.validateCredentials!();
    vi.clearAllMocks();

    mockFetch({
      success: true,
      billPayNumber: '55042914871932',
      billCustomerName: 'Jane Doe',
      billAmount: 50000,
    });

    const cn = await provider.createCustomerControlNumber({
      customerName: 'Jane Doe',
      phone: '255712345678',
      amount: 50000,
    });

    expect(cn.billCustomerName).toBe('Jane Doe');

    const body = JSON.parse(
      (fetch as ReturnType<typeof mockFetch>).mock.calls[0]?.[1]?.body as string,
    );
    expect(body.customerName).toBe('Jane Doe');
    expect(body.customerPhone).toBe('255712345678');
  });

  it('rejects customer control number without phone or email', async () => {
    mockFetch({ success: true, token: 'Bearer tok' });
    const provider = new ClickPesaProvider({
      baseUrl: 'https://api.clickpesa.com',
      clientId: 'test-client',
      apiKey: 'test-key',
    });
    await provider.validateCredentials!();

    await expect(
      provider.createCustomerControlNumber({ customerName: 'No Contact' }),
    ).rejects.toThrow();
  });

  it('gets BillPay details', async () => {
    mockFetch({ success: true, token: 'Bearer tok' });
    const provider = new ClickPesaProvider({
      baseUrl: 'https://api.clickpesa.com',
      clientId: 'test-client',
      apiKey: 'test-key',
    });
    await provider.validateCredentials!();
    vi.clearAllMocks();

    mockFetch({
      success: true,
      billPayNumber: '55042914871931',
      billStatus: 'ACTIVE',
      billAmount: 90900,
    });

    const details = await provider.getBillPayDetails('55042914871931');
    expect(details.billStatus).toBe('ACTIVE');

    const url = (fetch as ReturnType<typeof mockFetch>).mock.calls[0]?.[0] as string;
    expect(url).toContain('55042914871931');
  });

  it('updates a BillPay reference', async () => {
    mockFetch({ success: true, token: 'Bearer tok' });
    const provider = new ClickPesaProvider({
      baseUrl: 'https://api.clickpesa.com',
      clientId: 'test-client',
      apiKey: 'test-key',
    });
    await provider.validateCredentials!();
    vi.clearAllMocks();

    mockFetch({
      success: true,
      billPayNumber: '55042914871931',
      billAmount: 120000,
      billStatus: 'ACTIVE',
    });

    const updated = await provider.updateBillPayReference('55042914871931', {
      amount: 120000,
      status: 'ACTIVE',
    });

    expect(updated.billAmount).toBe(120000);

    const body = JSON.parse(
      (fetch as ReturnType<typeof mockFetch>).mock.calls[0]?.[1]?.body as string,
    );
    expect(body.billAmount).toBe(120000);
    expect(body.billStatus).toBe('ACTIVE');
  });

  it('convenience wrapper updateBillPayStatus sets status', async () => {
    mockFetch({ success: true, token: 'Bearer tok' });
    const provider = new ClickPesaProvider({
      baseUrl: 'https://api.clickpesa.com',
      clientId: 'test-client',
      apiKey: 'test-key',
    });
    await provider.validateCredentials!();
    vi.clearAllMocks();

    mockFetch({
      success: true,
      billPayNumber: '55042914871931',
      billStatus: 'INACTIVE',
    });

    const result = await provider.updateBillPayStatus('55042914871931', 'INACTIVE');
    expect(result.billStatus).toBe('INACTIVE');

    const body = JSON.parse(
      (fetch as ReturnType<typeof mockFetch>).mock.calls[0]?.[1]?.body as string,
    );
    expect(body.billStatus).toBe('INACTIVE');
  });

  // ── Hosted payout links ──────────────────────────────────────────

  it('generates a hosted payout link', async () => {
    mockFetch({ success: true, token: 'Bearer tok' });
    const provider = new ClickPesaProvider({
      baseUrl: 'https://api.clickpesa.com',
      clientId: 'test-client',
      apiKey: 'test-key',
    });
    await provider.validateCredentials!();
    vi.clearAllMocks();

    mockFetch({
      success: true,
      payoutLink: 'https://pay.clickpesa.com/payout/abc123',
      clientId: 'client_1',
    });

    const link = await provider.generatePayoutLink!(50000, 'payout_link_001');
    expect(link).toBe('https://pay.clickpesa.com/payout/abc123');

    const body = JSON.parse(
      (fetch as ReturnType<typeof mockFetch>).mock.calls[0]?.[1]?.body as string,
    );
    expect(body.amount).toBe('50000');
    expect(body.orderReference).toBe('payout_link_001');
  });

  // ── Exchange rates ───────────────────────────────────────────────

  it('fetches all exchange rates', async () => {
    mockFetch({ success: true, token: 'Bearer tok' });
    const provider = new ClickPesaProvider({
      baseUrl: 'https://api.clickpesa.com',
      clientId: 'test-client',
      apiKey: 'test-key',
    });
    await provider.validateCredentials!();
    vi.clearAllMocks();

    mockFetch([
      { source: 'USD', target: 'TZS', rate: 2510, date: '2026-06-28' },
      { source: 'EUR', target: 'TZS', rate: 2750, date: '2026-06-28' },
    ]);

    const rates = await provider.getExchangeRates!();
    expect(rates).toHaveLength(2);
    expect(rates[0]?.source).toBe('USD');
    expect(rates[0]?.rate).toBe(2510);
  });

  it('filters exchange rates by source and target', async () => {
    mockFetch({ success: true, token: 'Bearer tok' });
    const provider = new ClickPesaProvider({
      baseUrl: 'https://api.clickpesa.com',
      clientId: 'test-client',
      apiKey: 'test-key',
    });
    await provider.validateCredentials!();
    vi.clearAllMocks();

    mockFetch([{ source: 'USD', target: 'TZS', rate: 2510, date: '2026-06-28' }]);

    await provider.getExchangeRates!('USD', 'TZS');

    const url = (fetch as ReturnType<typeof mockFetch>).mock.calls[0]?.[0] as string;
    expect(url).toContain('source=USD');
    expect(url).toContain('target=TZS');
  });

  // ── Account statement ────────────────────────────────────────────

  it('fetches account statement with date filters', async () => {
    mockFetch({ success: true, token: 'Bearer tok' });
    const provider = new ClickPesaProvider({
      baseUrl: 'https://api.clickpesa.com',
      clientId: 'test-client',
      apiKey: 'test-key',
    });
    await provider.validateCredentials!();
    vi.clearAllMocks();

    mockFetch({
      success: true,
      accountDetails: { name: 'Bora Pesa Ltd', currency: 'TZS' },
      transactions: [
        { id: 'tx1', amount: 5000, type: 'CREDIT', date: '2026-06-01' },
        { id: 'tx2', amount: 15000, type: 'DEBIT', date: '2026-06-15' },
      ],
    });

    const statement = await provider.getAccountStatement!(
      'TZS',
      new Date('2026-06-01'),
      new Date('2026-06-30'),
    );

    expect(statement.transactions).toHaveLength(2);
    expect(statement.accountDetails.name).toBe('Bora Pesa Ltd');

    const url = (fetch as ReturnType<typeof mockFetch>).mock.calls[0]?.[0] as string;
    expect(url).toContain('currency=TZS');
    expect(url).toContain('startDate=2026-06-01');
    expect(url).toContain('endDate=2026-06-30');
  });
});
