import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
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
      amount: 15000, currency: 'TZS', reference: 'order_001', customer,
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
      amount: 15000, currency: 'TZS', reference: 'order_002', customer,
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
      { id: 'txn_1', status: 'SETTLED', orderReference: 'ref_1', collectedAmount: 5000, collectedCurrency: 'TZS' },
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
      amount: 50000, currency: 'TZS', reference: 'payout_001',
      recipient: { phone: '255754321098', name: 'Juma', network: 'MPESA' },
    });

    expect(result.status).toBe('SUCCESS');
    expect(result.disbursementId).toBe('disb_1');
  });
});
