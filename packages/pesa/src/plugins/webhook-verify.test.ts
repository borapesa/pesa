import { describe, it, expect } from 'vitest';
import { webhookVerifyPlugin } from './webhook-verify';

describe('webhookVerifyPlugin', () => {
  it('does not throw when secret is set', async () => {
    const plugin = webhookVerifyPlugin('test-secret');

    await expect(
      plugin.onPaymentEvent!({
        id: 'ev_1',
        type: 'PAYMENT_SUCCESS',
        orderId: 'order_1',
        reference: 'ref_1',
        amount: 1000,
        currency: 'TZS',
        status: 'SUCCESS',
        provider: 'bogus',
        timestamp: new Date(),
      }),
    ).resolves.toBeUndefined();
  });

  it('warns when secret is missing in development', async () => {
    // Temporarily unset env
    const prev = process.env.BORAPESA_WEBHOOK_SECRET;
    delete process.env.BORAPESA_WEBHOOK_SECRET;
    process.env.NODE_ENV = 'development';

    const plugin = webhookVerifyPlugin();

    await expect(
      plugin.onPaymentEvent!({
        id: 'ev_2', type: 'PAYMENT_SUCCESS', orderId: 'o2', reference: 'r2',
        amount: 0, currency: 'TZS', status: 'SUCCESS', provider: 'bogus', timestamp: new Date(),
      }),
    ).resolves.toBeUndefined();

    process.env.BORAPESA_WEBHOOK_SECRET = prev;
    delete process.env.NODE_ENV;
  });

  it('throws when secret is missing in production', async () => {
    const prev = process.env.BORAPESA_WEBHOOK_SECRET;
    delete process.env.BORAPESA_WEBHOOK_SECRET;
    process.env.NODE_ENV = 'production';

    const plugin = webhookVerifyPlugin();

    await expect(
      plugin.onPaymentEvent!({
        id: 'ev_3', type: 'PAYMENT_SUCCESS', orderId: 'o3', reference: 'r3',
        amount: 0, currency: 'TZS', status: 'SUCCESS', provider: 'bogus', timestamp: new Date(),
      }),
    ).rejects.toThrow('BORAPESA_WEBHOOK_SECRET');

    process.env.BORAPESA_WEBHOOK_SECRET = prev;
    delete process.env.NODE_ENV;
  });

  it('falls back to BORAPESA_WEBHOOK_SECRET env var', async () => {
    const prev = process.env.BORAPESA_WEBHOOK_SECRET;
    process.env.BORAPESA_WEBHOOK_SECRET = 'env-secret';

    const plugin = webhookVerifyPlugin();

    await expect(
      plugin.onPaymentEvent!({
        id: 'ev_4', type: 'PAYMENT_SUCCESS', orderId: 'o4', reference: 'r4',
        amount: 0, currency: 'TZS', status: 'SUCCESS', provider: 'bogus', timestamp: new Date(),
      }),
    ).resolves.toBeUndefined();

    process.env.BORAPESA_WEBHOOK_SECRET = prev;
  });
});
