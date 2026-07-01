import { createHmac } from 'node:crypto';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SnippePaymentProvider } from '../snippe';

const customer = { name: 'Juma Ali', phone: '255712345678' };

function mockFetch(response: unknown, status = 200) {
  return vi.spyOn(globalThis, 'fetch').mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    text: async () => JSON.stringify(response),
    json: async () => response,
  } as Response);
}

function snippeEnvelope<T>(data: T) {
  return { status: 'success', code: 0, data };
}

describe('SnippePaymentProvider', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ── Auth ──────────────────────────────────────────────────────────

  it('sends Bearer auth and Snippe-Version headers', async () => {
    mockFetch(
      snippeEnvelope({
        reference: 'pay_1',
        status: 'pending',
        payment_type: 'mobile',
        amount: { currency: 'TZS', value: 500 },
        expires_at: '2026-01-25T12:00:00Z',
      }),
    );

    const provider = new SnippePaymentProvider({
      apiKey: 'snp_test_key',
      webhookSecret: 'whsec_test',
    });

    await provider.createOrder({
      amount: 500,
      currency: 'TZS',
      reference: 'order_001',
      customer,
    });

    const headers = (fetch as ReturnType<typeof mockFetch>).mock.calls[0]?.[1]?.headers as
      | Record<string, string>
      | undefined;

    expect(headers?.Authorization).toBe('Bearer snp_test_key');
    expect(headers?.['Snippe-Version']).toBe('2026-01-25');
  });

  // ── createOrder (mobile) ──────────────────────────────────────────

  it('creates a mobile payment', async () => {
    mockFetch(
      snippeEnvelope({
        reference: 'pay_abc',
        status: 'pending',
        payment_type: 'mobile',
        amount: { currency: 'TZS', value: 15000 },
        expires_at: '2026-01-25T12:00:00Z',
      }),
    );

    const provider = new SnippePaymentProvider({
      apiKey: 'snp_test',
      webhookSecret: 'whsec_test',
    });

    const result = await provider.createOrder({
      amount: 15000,
      currency: 'TZS',
      reference: 'order_001',
      customer,
    });

    expect(result.orderId).toBe('pay_abc');
    expect(result.reference).toBe('order_001');
    expect(result.status).toBe('PENDING');

    const body = JSON.parse(
      (fetch as ReturnType<typeof mockFetch>).mock.calls[0]?.[1]?.body as string,
    );
    expect(body.payment_type).toBe('mobile');
    expect(body.details.amount).toBe(15000);
    expect(body.phone_number).toBe('255712345678');
  });

  // ── createOrder (card) ────────────────────────────────────────────

  it('creates a card payment when redirectUrl is present', async () => {
    mockFetch(
      snippeEnvelope({
        reference: 'pay_card',
        status: 'pending',
        payment_type: 'card',
        amount: { currency: 'TZS', value: 50000 },
        expires_at: '2026-01-25T12:00:00Z',
        payment_url: 'https://pay.snippe.sh/card/xyz',
      }),
    );

    const provider = new SnippePaymentProvider({
      apiKey: 'snp_test',
      webhookSecret: 'whsec_test',
    });

    const result = await provider.createOrder({
      amount: 50000,
      currency: 'TZS',
      reference: 'order_card',
      customer,
      redirectUrl: 'https://example.com/return',
    });

    expect(result.orderId).toBe('pay_card');
    expect(result.checkoutUrl).toBe('https://pay.snippe.sh/card/xyz');

    const body = JSON.parse(
      (fetch as ReturnType<typeof mockFetch>).mock.calls[0]?.[1]?.body as string,
    );
    expect(body.payment_type).toBe('card');
    expect(body.details.redirect_url).toBe('https://example.com/return');
  });

  // ── getPaymentStatus ──────────────────────────────────────────────

  it('returns SUCCESS for completed payment', async () => {
    mockFetch(
      snippeEnvelope({
        reference: 'pay_1',
        status: 'completed',
        payment_type: 'mobile',
        amount: { currency: 'TZS', value: 500 },
        expires_at: '2026-01-25T12:00:00Z',
      }),
    );

    const provider = new SnippePaymentProvider({
      apiKey: 'snp_test',
      webhookSecret: 'whsec_test',
    });

    const status = await provider.getPaymentStatus('pay_1');
    expect(status).toBe('SUCCESS');
  });

  it('returns PENDING for pending payment', async () => {
    mockFetch(
      snippeEnvelope({
        reference: 'pay_2',
        status: 'pending',
        payment_type: 'mobile',
        amount: { currency: 'TZS', value: 500 },
        expires_at: '2026-01-25T12:00:00Z',
      }),
    );

    const provider = new SnippePaymentProvider({
      apiKey: 'snp_test',
      webhookSecret: 'whsec_test',
    });

    const status = await provider.getPaymentStatus('pay_2');
    expect(status).toBe('PENDING');
  });

  it('returns FAILED for failed payment', async () => {
    mockFetch(
      snippeEnvelope({
        reference: 'pay_3',
        status: 'failed',
        payment_type: 'mobile',
        amount: { currency: 'TZS', value: 500 },
        expires_at: '2026-01-25T12:00:00Z',
      }),
    );

    const provider = new SnippePaymentProvider({
      apiKey: 'snp_test',
      webhookSecret: 'whsec_test',
    });

    const status = await provider.getPaymentStatus('pay_3');
    expect(status).toBe('FAILED');
  });

  // ── disburse (mobile) ─────────────────────────────────────────────

  it('sends a mobile payout', async () => {
    mockFetch(
      snippeEnvelope({
        reference: 'payout_1',
        status: 'pending',
        amount: { currency: 'TZS', value: 50000 },
        fees: { currency: 'TZS', value: 1000 },
        total: { currency: 'TZS', value: 51000 },
        channel: { type: 'mobile_money', provider: 'mpesa' },
        recipient: { name: 'Juma Ali', phone: '255754321098' },
      }),
    );

    const provider = new SnippePaymentProvider({
      apiKey: 'snp_test',
      webhookSecret: 'whsec_test',
    });

    const result = await provider.disburse({
      amount: 50000,
      currency: 'TZS',
      reference: 'payout_001',
      recipient: { phone: '255754321098', name: 'Juma Ali' },
    });

    expect(result.disbursementId).toBe('payout_1');
    expect(result.reference).toBe('payout_001');
    expect(result.status).toBe('QUEUED');

    const body = JSON.parse(
      (fetch as ReturnType<typeof mockFetch>).mock.calls[0]?.[1]?.body as string,
    );
    expect(body.channel).toBe('mobile');
    expect(body.amount).toBe(50000);
    expect(body.recipient_phone).toBe('255754321098');
  });

  // ── disburse (bank) ───────────────────────────────────────────────

  it('sends a bank payout', async () => {
    mockFetch(
      snippeEnvelope({
        reference: 'payout_bank_1',
        status: 'pending',
        amount: { currency: 'TZS', value: 100000 },
        fees: { currency: 'TZS', value: 2000 },
        total: { currency: 'TZS', value: 102000 },
        channel: { type: 'bank', bank: 'CRDB' },
        recipient: { name: 'Vendor Ltd', account: '0150000000000' },
      }),
    );

    const provider = new SnippePaymentProvider({
      apiKey: 'snp_test',
      webhookSecret: 'whsec_test',
    });

    const result = await provider.disburse({
      amount: 100000,
      currency: 'TZS',
      reference: 'payout_bank_001',
      recipient: { accountNumber: '0150000000000', bic: 'CRDB', name: 'Vendor Ltd' },
    });

    expect(result.disbursementId).toBe('payout_bank_1');
    expect(result.status).toBe('QUEUED');

    const body = JSON.parse(
      (fetch as ReturnType<typeof mockFetch>).mock.calls[0]?.[1]?.body as string,
    );
    expect(body.channel).toBe('bank');
    expect(body.recipient_bank).toBe('CRDB');
    expect(body.recipient_account).toBe('0150000000000');
  });

  // ── getBalance ────────────────────────────────────────────────────

  it('returns balance', async () => {
    mockFetch(
      snippeEnvelope({
        available: { currency: 'TZS', value: 500000 },
        balance: { currency: 'TZS', value: 750000 },
        object: 'balance',
      }),
    );

    const provider = new SnippePaymentProvider({
      apiKey: 'snp_test',
      webhookSecret: 'whsec_test',
    });

    const result = await provider.getBalance!();
    expect(result.balances[0]?.amount).toBe(500000);
    expect(result.balances[0]?.currency).toBe('TZS');
  });

  // ── validateCredentials ───────────────────────────────────────────

  it('returns valid when getBalance succeeds', async () => {
    mockFetch(
      snippeEnvelope({
        available: { currency: 'TZS', value: 100 },
        balance: { currency: 'TZS', value: 100 },
        object: 'balance',
      }),
    );

    const provider = new SnippePaymentProvider({
      apiKey: 'snp_test',
      webhookSecret: 'whsec_test',
    });

    const result = await provider.validateCredentials!();
    expect(result.valid).toBe(true);
  });

  it('returns invalid when getBalance fails', async () => {
    mockFetch({ status: 'error', code: 401, error_code: 'unauthorized', message: 'Bad key' }, 401);

    const provider = new SnippePaymentProvider({
      apiKey: 'snp_bad',
      webhookSecret: 'whsec_test',
    });

    const result = await provider.validateCredentials!();
    expect(result.valid).toBe(false);
  });

  // ── handleWebhook ─────────────────────────────────────────────────

  it('verifies webhook signature and parses payment.completed', async () => {
    const webhookSecret = 'whsec_test_secret';
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const payload = JSON.stringify({
      id: 'evt_1',
      type: 'payment.completed',
      api_version: '2026-01-25',
      created_at: '2026-01-25T12:00:00Z',
      data: {
        reference: 'pay_abc',
        external_reference: 'order_001',
        status: 'completed',
        amount: { currency: 'TZS', value: 15000 },
      },
    });

    const signature = createHmac('sha256', webhookSecret)
      .update(`${timestamp}.${payload}`)
      .digest('hex');

    const provider = new SnippePaymentProvider({
      apiKey: 'snp_test',
      webhookSecret,
    });

    const event = await provider.handleWebhook(payload, {
      'x-webhook-signature': signature,
      'x-webhook-timestamp': timestamp,
    });

    expect(event.id).toBe('evt_1');
    expect(event.type).toBe('PAYMENT_SUCCESS');
    expect(event.orderId).toBe('pay_abc');
    expect(event.reference).toBe('order_001');
    expect(event.amount).toBe(15000);
    expect(event.status).toBe('SUCCESS');
  });

  it('rejects webhook with invalid signature', async () => {
    const webhookSecret = 'whsec_test_secret';
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const payload = JSON.stringify({
      id: 'evt_2',
      type: 'payment.failed',
      api_version: '2026-01-25',
      created_at: '2026-01-25T12:00:00Z',
      data: { reference: 'pay_1', status: 'failed', amount: { currency: 'TZS', value: 500 } },
    });

    const provider = new SnippePaymentProvider({
      apiKey: 'snp_test',
      webhookSecret,
    });

    await expect(
      provider.handleWebhook(payload, {
        'x-webhook-signature': 'bad_signature',
        'x-webhook-timestamp': timestamp,
      }),
    ).rejects.toThrow('invalid signature');
  });

  it('rejects webhook with missing headers', async () => {
    const provider = new SnippePaymentProvider({
      apiKey: 'snp_test',
      webhookSecret: 'whsec_test',
    });

    await expect(provider.handleWebhook('{}', {})).rejects.toThrow(
      'missing signature or timestamp',
    );
  });

  it('rejects webhook with old timestamp (replay protection)', async () => {
    const webhookSecret = 'whsec_test_secret';
    const oldTimestamp = Math.floor(Date.now() / 1000 - 600).toString(); // 10 minutes ago
    const payload = '{}';

    const signature = createHmac('sha256', webhookSecret)
      .update(`${oldTimestamp}.${payload}`)
      .digest('hex');

    const provider = new SnippePaymentProvider({
      apiKey: 'snp_test',
      webhookSecret,
    });

    await expect(
      provider.handleWebhook(payload, {
        'x-webhook-signature': signature,
        'x-webhook-timestamp': oldTimestamp,
      }),
    ).rejects.toThrow('timestamp too old');
  });

  it('parses payout.completed as DISBURSEMENT_SUCCESS', async () => {
    const webhookSecret = 'whsec_test_secret';
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const payload = JSON.stringify({
      id: 'evt_3',
      type: 'payout.completed',
      api_version: '2026-01-25',
      created_at: '2026-01-25T12:00:00Z',
      data: {
        reference: 'payout_1',
        status: 'completed',
        amount: { currency: 'TZS', value: 50000 },
      },
    });

    const signature = createHmac('sha256', webhookSecret)
      .update(`${timestamp}.${payload}`)
      .digest('hex');

    const provider = new SnippePaymentProvider({
      apiKey: 'snp_test',
      webhookSecret,
    });

    const event = await provider.handleWebhook(payload, {
      'x-webhook-signature': signature,
      'x-webhook-timestamp': timestamp,
    });

    expect(event.type).toBe('DISBURSEMENT_SUCCESS');
  });
});
