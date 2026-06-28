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
});
