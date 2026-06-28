import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SelcomPaymentProvider } from '../selcom';

const customer = { name: 'Juma Ali', phone: '255712345678' };

function mockFetch(response: unknown, status = 200) {
  return vi.spyOn(globalThis, 'fetch').mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    text: async () => JSON.stringify(response),
    json: async () => response,
  } as Response);
}

describe('SelcomPaymentProvider', () => {
  beforeEach(() => {
    vi.useFakeTimers({ now: new Date('2026-06-28T14:00:00+03:00') });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  // ── Auth signing ─────────────────────────────────────────────────

  it('sends Selcom auth headers on requests', async () => {
    mockFetch({
      transid: 'txn_1',
      reference: 'ref_1',
      resultcode: '000',
      result: 'SUCCESS',
      message: 'Order creation successful',
      data: [
        {
          gateway_buyer_uuid: 'uuid_1',
          payment_token: 'tok_1',
          qr: 'QR',
          payment_gateway_url: Buffer.from('https://pay.selcom.com/checkout').toString('base64'),
        },
      ],
    });

    const provider = new SelcomPaymentProvider({
      apiKey: 'test-api-key',
      apiSecret: 'test-api-secret',
      vendor: 'VENDOR001',
      pin: '1234',
    });

    await provider.createOrder({
      amount: 8000,
      currency: 'TZS',
      reference: 'order_001',
      customer,
      redirectUrl: 'https://mysite.com/callback',
    });

    const headers = (fetch as ReturnType<typeof mockFetch>).mock.calls[0]?.[1]?.headers as
      | Record<string, string>
      | undefined;

    expect(headers?.Authorization).toContain('SELCOM ');
    expect(headers?.['Digest-Method']).toBe('HS256');
    expect(headers?.Digest).toBeDefined();
    expect(headers?.Timestamp).toBeDefined();
    expect(headers?.['Signed-Fields']).toBeDefined();
  });

  // ── createOrder routing ─────────────────────────────────────────

  it('creates checkout order when redirectUrl is set', async () => {
    mockFetch({
      transid: 'txn_1',
      reference: 'ref_1',
      resultcode: '000',
      result: 'SUCCESS',
      message: 'Order creation successful',
      data: [
        {
          gateway_buyer_uuid: 'uuid_1',
          payment_token: 'tok_1',
          qr: 'QR',
          payment_gateway_url: Buffer.from('https://pay.selcom.com/checkout').toString('base64'),
        },
      ],
    });

    const provider = new SelcomPaymentProvider({
      apiKey: 'test-api-key',
      apiSecret: 'test-api-secret',
      vendor: 'VENDOR001',
      pin: '1234',
    });

    const order = await provider.createOrder({
      amount: 8000,
      currency: 'TZS',
      reference: 'order_001',
      customer,
      redirectUrl: 'https://mysite.com/callback',
    });

    expect(order.checkoutUrl).toBe('https://pay.selcom.com/checkout');
    expect(order.status).toBe('PENDING');
    expect(order.orderId).toBe('order_001');

    const url = (fetch as ReturnType<typeof mockFetch>).mock.calls[0]?.[0] as string;
    expect(url).toContain('create-order-minimal');
  });

  it('uses USSD push when no redirectUrl', async () => {
    mockFetch({
      transid: 'txn_ussd',
      reference: 'ref_1',
      resultcode: '000',
      result: 'SUCCESS',
      message: 'Push USSD successful',
      data: [],
    });

    const provider = new SelcomPaymentProvider({
      apiKey: 'test-api-key',
      apiSecret: 'test-api-secret',
      vendor: 'VENDOR001',
      pin: '1234',
    });

    const order = await provider.createOrder({
      amount: 8000,
      currency: 'TZS',
      reference: 'order_001',
      customer,
    });

    expect(order.ussdPushInitiated).toBe(true);
    const url = (fetch as ReturnType<typeof mockFetch>).mock.calls[0]?.[0] as string;
    expect(url).toContain('pushussd');
  });

  // ── getPaymentStatus ────────────────────────────────────────────

  it('normalizes payment status from Selcom', async () => {
    mockFetch({
      transid: 'txn_1',
      reference: 'ref_1',
      resultcode: '000',
      result: 'SUCCESS',
      message: 'Order fetch successful',
      data: [
        {
          order_id: 'order_001',
          creation_date: '2026-06-28 14:00:00',
          amount: '8000',
          payment_status: 'COMPLETED',
          transid: 'T123',
          channel: 'VODACOM',
          reference: 'PG_REF_001',
          phone: '255712345678',
        },
      ],
    });

    const provider = new SelcomPaymentProvider({
      apiKey: 'test-api-key',
      apiSecret: 'test-api-secret',
      vendor: 'VENDOR001',
      pin: '1234',
    });

    const status = await provider.getPaymentStatus('order_001');
    expect(status).toBe('SUCCESS');

    const url = (fetch as ReturnType<typeof mockFetch>).mock.calls[0]?.[0] as string;
    expect(url).toContain('order_id=order_001');
  });

  // ── disburse routing ────────────────────────────────────────────

  it('disburses to mobile wallet via walletcashin', async () => {
    mockFetch({
      transid: 'disb_001',
      reference: 'ref_disb',
      resultcode: '000',
      result: 'SUCCESS',
      message: 'Cashin successful',
      data: [],
    });

    const provider = new SelcomPaymentProvider({
      apiKey: 'test-api-key',
      apiSecret: 'test-api-secret',
      vendor: 'VENDOR001',
      pin: '1234',
    });

    const result = await provider.disburse({
      amount: 50000,
      currency: 'TZS',
      reference: 'payout_001',
      recipient: { phone: '255754321098', name: 'Juma', network: 'MPESA' },
    });

    expect(result.status).toBe('SUCCESS');

    const url = (fetch as ReturnType<typeof mockFetch>).mock.calls[0]?.[0] as string;
    expect(url).toContain('walletcashin/process');

    const body = JSON.parse(
      (fetch as ReturnType<typeof mockFetch>).mock.calls[0]?.[1]?.body as string,
    );
    expect(body.utilitycode).toBe('VMCASHIN'); // MPESA → VMCASHIN
  });

  it('disburses to bank via qwiksend', async () => {
    mockFetch({
      transid: 'disb_bank',
      reference: 'ref_bank',
      resultcode: '000',
      result: 'SUCCESS',
      message: 'Bank transfer successful',
      data: [],
    });

    const provider = new SelcomPaymentProvider({
      apiKey: 'test-api-key',
      apiSecret: 'test-api-secret',
      vendor: 'VENDOR001',
      pin: '1234',
    });

    const result = await provider.disburse({
      amount: 500000,
      currency: 'TZS',
      reference: 'bank_payout_001',
      recipient: {
        name: 'Jane Doe',
        accountNumber: '1234567890',
        bic: 'NMBTZTZ',
        phone: '255712345678',
      },
    });

    expect(result.status).toBe('SUCCESS');

    const url = (fetch as ReturnType<typeof mockFetch>).mock.calls[0]?.[0] as string;
    expect(url).toContain('qwiksend/process');
  });

  it('defaults to CASHIN for unknown wallet networks', async () => {
    mockFetch({
      transid: 'disb_003',
      reference: 'ref_disb3',
      resultcode: '000',
      result: 'SUCCESS',
      message: 'Cashin successful',
      data: [],
    });

    const provider = new SelcomPaymentProvider({
      apiKey: 'test-api-key',
      apiSecret: 'test-api-secret',
      vendor: 'VENDOR001',
      pin: '1234',
    });

    await provider.disburse({
      amount: 10000,
      currency: 'TZS',
      reference: 'payout_003',
      recipient: { phone: '255754321098' },
    });

    const body = JSON.parse(
      (fetch as ReturnType<typeof mockFetch>).mock.calls[0]?.[1]?.body as string,
    );
    expect(body.utilitycode).toBe('CASHIN'); // default auto-route
  });

  // ── handleWebhook ───────────────────────────────────────────────

  it('parses checkout webhook callback', async () => {
    const provider = new SelcomPaymentProvider({
      apiKey: 'test-api-key',
      apiSecret: 'test-api-secret',
      vendor: 'VENDOR001',
      pin: '1234',
    });

    const body = JSON.stringify({
      transid: 'T123442',
      reference: '028912121',
      order_id: 'order_wh',
      result: 'SUCCESS',
      resultcode: '000',
      payment_status: 'COMPLETED',
    });

    const event = await provider.handleWebhook(body, {});
    expect(event.type).toBe('PAYMENT_SUCCESS');
    expect(event.orderId).toBe('order_wh');
    expect(event.provider).toBe('selcom');
  });

  // ── cancelOrder ─────────────────────────────────────────────────

  it('cancels an order', async () => {
    mockFetch({
      transid: 'cancel_001',
      reference: 'ref_cancel',
      resultcode: '000',
      result: 'SUCCESS',
      message: 'Order cancellation successful',
      data: [],
    });

    const provider = new SelcomPaymentProvider({
      apiKey: 'test-api-key',
      apiSecret: 'test-api-secret',
      vendor: 'VENDOR001',
      pin: '1234',
    });

    const result = await provider.cancelOrder!('order_cancel');
    expect(result.cancelled).toBe(true);

    const url = (fetch as ReturnType<typeof mockFetch>).mock.calls[0]?.[0] as string;
    expect(url).toContain('cancel-order');
    expect(url).toContain('order_id=order_cancel');
  });

  // ── listOrders ──────────────────────────────────────────────────

  it('lists orders with date range', async () => {
    mockFetch({
      transid: 'list_001',
      reference: 'ref_list',
      resultcode: '000',
      result: 'SUCCESS',
      message: 'Order fetch successful',
      data: [
        {
          order_id: 'ord_1',
          creation_date: '2026-06-01 12:00:00',
          amount: '5000',
          payment_status: 'COMPLETED',
        },
        {
          order_id: 'ord_2',
          creation_date: '2026-06-15 15:00:00',
          amount: '15000',
          payment_status: 'PENDING',
        },
      ],
    });

    const provider = new SelcomPaymentProvider({
      apiKey: 'test-api-key',
      apiSecret: 'test-api-secret',
      vendor: 'VENDOR001',
      pin: '1234',
    });

    const result = await provider.listOrders!({
      fromDate: new Date('2026-06-01'),
      toDate: new Date('2026-06-30'),
    });

    expect(result.orders).toHaveLength(2);
    expect(result.orders[0]?.status).toBe('SUCCESS');
    expect(result.orders[1]?.status).toBe('PENDING');
  });

  // ── getBalance ──────────────────────────────────────────────────

  it('fetches float balance', async () => {
    mockFetch({
      reference: '6927759116',
      transid: '10001',
      resultcode: '000',
      result: 'SUCCESS',
      message: 'Balance successful',
      data: [{ balance: '1000000' }],
    });

    const provider = new SelcomPaymentProvider({
      apiKey: 'test-api-key',
      apiSecret: 'test-api-secret',
      vendor: 'VENDOR001',
      pin: '1234',
    });

    const result = await provider.getBalance!();
    expect(result.balances[0]?.currency).toBe('TZS');
    expect(result.balances[0]?.amount).toBe(1000000);
  });

  // ── getNameLookup ───────────────────────────────────────────────

  it('resolves wallet holder name via namelookup', async () => {
    mockFetch({
      reference: '6927759116',
      transid: '10001',
      resultcode: '000',
      result: 'SUCCESS',
      message: 'Name fetch successful',
      data: [{ name: 'FIROZ MOH' }],
    });

    const provider = new SelcomPaymentProvider({
      apiKey: 'test-api-key',
      apiSecret: 'test-api-secret',
      vendor: 'VENDOR001',
      pin: '1234',
    });

    const result = await provider.getNameLookup!('255712345678');
    expect(result.found).toBe(true);
    expect(result.accountName).toBe('FIROZ MOH');
  });

  it('returns not found on failed name lookup', async () => {
    mockFetch(
      {
        reference: 'err',
        transid: '10002',
        resultcode: '403',
        result: 'FAIL',
        message: 'Not found',
        data: [],
      },
      200,
    );

    // getNameLookup catches errors and returns found: false
    const provider = new SelcomPaymentProvider({
      apiKey: 'test-api-key',
      apiSecret: 'test-api-secret',
      vendor: 'VENDOR001',
      pin: '1234',
    });

    // Mock fetch to throw on error response
    vi.restoreAllMocks();
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 404,
      text: async () => 'not found',
      json: async () => ({}),
    } as Response);

    const result = await provider.getNameLookup!('255000000000');
    expect(result.found).toBe(false);
  });

  // ── validateCredentials ─────────────────────────────────────────

  it('validates credentials via balance check', async () => {
    mockFetch({
      reference: 'vc',
      transid: 'vc_001',
      resultcode: '000',
      result: 'SUCCESS',
      message: 'Balance successful',
      data: [{ balance: '500000' }],
    });

    const provider = new SelcomPaymentProvider({
      apiKey: 'test-api-key',
      apiSecret: 'test-api-secret',
      vendor: 'VENDOR001',
      pin: '1234',
    });

    const creds = await provider.validateCredentials!();
    expect(creds.valid).toBe(true);
  });

  // ── Edge cases ───────────────────────────────────────────────────

  it('throws on Selcom error response', async () => {
    mockFetch({
      transid: 'err_001',
      reference: 'ref_err',
      resultcode: '403',
      result: 'FAIL',
      message: 'Insufficient float balance',
      data: [],
    });

    const provider = new SelcomPaymentProvider({
      apiKey: 'test-api-key',
      apiSecret: 'test-api-secret',
      vendor: 'VENDOR001',
      pin: '1234',
    });

    await expect(
      provider.disburse({
        amount: 50000,
        currency: 'TZS',
        reference: 'payout_fail',
        recipient: { phone: '255754321098' },
      }),
    ).rejects.toThrow('Insufficient float balance');
  });

  it('handles INPROGRESS status', async () => {
    mockFetch({
      transid: 'txn_ip',
      reference: 'ref_ip',
      resultcode: '111',
      result: 'INPROGRESS',
      message: 'Transaction in progress',
      data: [],
    });

    const provider = new SelcomPaymentProvider({
      apiKey: 'test-api-key',
      apiSecret: 'test-api-secret',
      vendor: 'VENDOR001',
      pin: '1234',
    });

    await expect(
      provider.disburse({
        amount: 50000,
        currency: 'TZS',
        reference: 'payout_ip',
        recipient: { phone: '255754321098' },
      }),
    ).rejects.toThrow('Selcom: INPROGRESS');
  });

  it('handles AMBIGUOUS status', async () => {
    mockFetch({
      transid: 'txn_amb',
      reference: 'ref_amb',
      resultcode: '999',
      result: 'AMBIGUOUS',
      message: 'Transaction outcome unknown',
      data: [],
    });

    const provider = new SelcomPaymentProvider({
      apiKey: 'test-api-key',
      apiSecret: 'test-api-secret',
      vendor: 'VENDOR001',
      pin: '1234',
    });

    await expect(provider.getPaymentStatus('order_amb')).rejects.toThrow('Selcom: AMBIGUOUS');
  });

  it('returns PAYMENT_PENDING for non-terminal webhook status', async () => {
    const provider = new SelcomPaymentProvider({
      apiKey: 'test-api-key',
      apiSecret: 'test-api-secret',
      vendor: 'VENDOR001',
      pin: '1234',
    });

    const body = JSON.stringify({
      transid: 'T123',
      order_id: 'order_pend',
      result: 'INPROGRESS',
      resultcode: '111',
      payment_status: 'INPROGRESS',
    });

    const event = await provider.handleWebhook(body, {});
    expect(event.type).toBe('PAYMENT_PENDING');
  });

  it('throws on network failure', async () => {
    vi.restoreAllMocks();
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('ECONNREFUSED'));

    const provider = new SelcomPaymentProvider({
      apiKey: 'test-api-key',
      apiSecret: 'test-api-secret',
      vendor: 'VENDOR001',
      pin: '1234',
    });

    await expect(provider.getPaymentStatus('order_net')).rejects.toThrow(/Selcom|PesaNetworkError/);
  });
});
