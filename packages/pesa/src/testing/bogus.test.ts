import { describe, expect, it } from 'vitest';
import { BogusPaymentProvider } from './bogus';

const customer = { name: 'Juma Ali', phone: '255712345678' };

describe('BogusPaymentProvider', () => {
  // ── Required methods ─────────────────────────────────────────

  describe('createOrder', () => {
    it('returns SUCCESS by default with ussdPushInitiated', async () => {
      const provider = new BogusPaymentProvider();
      const result = await provider.createOrder({
        amount: 15000,
        currency: 'TZS',
        reference: 'order_001',
        customer,
      });

      expect(result.status).toBe('SUCCESS');
      expect(result.reference).toBe('order_001');
      expect(result.orderId).toMatch(/^bogus_/);
      expect(result.ussdPushInitiated).toBe(true);
    });

    it('returns FAILED when defaultBehavior is fail', async () => {
      const provider = new BogusPaymentProvider({ defaultBehavior: 'fail' });
      const result = await provider.createOrder({
        amount: 15000,
        currency: 'TZS',
        reference: 'order_002',
        customer,
      });

      expect(result.status).toBe('FAILED');
    });

    it('returns AMBIGUOUS with checkoutUrl', async () => {
      const provider = new BogusPaymentProvider({ defaultBehavior: 'ambiguous' });
      const result = await provider.createOrder({
        amount: 15000,
        currency: 'TZS',
        reference: 'order_003',
        customer,
      });

      expect(result.status).toBe('AMBIGUOUS');
      expect(result.checkoutUrl).toBe('https://bogus.pesa/checkout');
    });

    it('respects scripted per-reference behavior', async () => {
      const provider = new BogusPaymentProvider({
        defaultBehavior: 'success',
        script: [
          { reference: 'order_fail', behavior: 'fail' },
          { reference: 'order_pending', behavior: 'pending' },
        ],
      });

      const fail = await provider.createOrder({
        amount: 1000,
        currency: 'TZS',
        reference: 'order_fail',
        customer,
      });
      const pending = await provider.createOrder({
        amount: 1000,
        currency: 'TZS',
        reference: 'order_pending',
        customer,
      });
      const ok = await provider.createOrder({
        amount: 1000,
        currency: 'TZS',
        reference: 'order_unscripted',
        customer,
      });

      expect(fail.status).toBe('FAILED');
      expect(pending.status).toBe('PENDING');
      expect(ok.status).toBe('SUCCESS');
    });

    it('supports after:N for delayed scripted behavior', async () => {
      const provider = new BogusPaymentProvider({
        script: [{ reference: 'delay', behavior: 'fail', after: 3 }],
      });

      // First two calls: success (before threshold)
      const r1 = await provider.createOrder({
        amount: 1000,
        currency: 'TZS',
        reference: 'delay',
        customer,
      });
      const r2 = await provider.createOrder({
        amount: 1000,
        currency: 'TZS',
        reference: 'delay',
        customer,
      });
      expect(r1.status).toBe('SUCCESS');
      expect(r2.status).toBe('SUCCESS');

      // Third call: fail (threshold hit)
      const r3 = await provider.createOrder({
        amount: 1000,
        currency: 'TZS',
        reference: 'delay',
        customer,
      });
      expect(r3.status).toBe('FAILED');
    });
  });

  describe('getPaymentStatus', () => {
    it('returns the stored order status', async () => {
      const provider = new BogusPaymentProvider();
      const order = await provider.createOrder({
        amount: 15000,
        currency: 'TZS',
        reference: 'order_004',
        customer,
      });

      const status = await provider.getPaymentStatus(order.orderId);
      expect(status).toBe('SUCCESS');
    });

    it('returns PENDING for unknown order IDs', async () => {
      const provider = new BogusPaymentProvider();
      const status = await provider.getPaymentStatus('nonexistent');
      expect(status).toBe('PENDING');
    });
  });

  describe('handleWebhook', () => {
    it('normalizes a valid JSON webhook into a PaymentEvent', async () => {
      const provider = new BogusPaymentProvider();
      const body = JSON.stringify({ reference: 'wh_001', status: 'SUCCESS', amount: 5000 });
      const event = await provider.handleWebhook(body, {});

      expect(event.type).toBe('PAYMENT_SUCCESS');
      expect(event.reference).toBe('wh_001');
      expect(event.status).toBe('SUCCESS');
      expect(event.provider).toBe('bogus');
      expect(event.id).toBeTruthy();
    });

    it('handles Buffer input (framework adapter raw body path)', async () => {
      const provider = new BogusPaymentProvider();
      const buffer = Buffer.from(JSON.stringify({ reference: 'wh_buf', status: 'FAILED' }));
      const event = await provider.handleWebhook(buffer, {});

      expect(event.reference).toBe('wh_buf');
      expect(event.status).toBe('FAILED');
      expect(event.type).toBe('PAYMENT_FAILED');
    });

    it('handles non-JSON raw bodies gracefully', async () => {
      const provider = new BogusPaymentProvider();
      const event = await provider.handleWebhook('just a string', {});

      expect(event.reference).toBe('bogus_ref');
      expect(event.status).toBe('SUCCESS');
    });
  });

  describe('disburse', () => {
    it('returns SUCCESS by default', async () => {
      const provider = new BogusPaymentProvider();
      const result = await provider.disburse({
        amount: 50000,
        currency: 'TZS',
        reference: 'payout_001',
        recipient: { phone: '255754321098', network: 'MPESA' },
      });

      expect(result.status).toBe('SUCCESS');
      expect(result.reference).toBe('payout_001');
      expect(result.disbursementId).toMatch(/^bogus_disburse_/);
    });

    it('respects behavior overrides for disbursement', async () => {
      const provider = new BogusPaymentProvider({ defaultBehavior: 'fail' });
      const result = await provider.disburse({
        amount: 50000,
        currency: 'TZS',
        reference: 'payout_fail',
        recipient: { phone: '255754321098' },
      });

      expect(result.status).toBe('FAILED');
    });
  });

  // ── Optional methods ──────────────────────────────────────────

  describe('refund', () => {
    it('returns a successful refund', async () => {
      const provider = new BogusPaymentProvider();
      const result = await provider.refund!('bogus_order_123', 5000);

      expect(result.status).toBe('SUCCESS');
      expect(result.orderId).toBe('bogus_order_123');
      expect(result.amount).toBe(5000);
    });
  });

  describe('cancelOrder', () => {
    it('marks the order as CANCELLED', async () => {
      const provider = new BogusPaymentProvider();
      const order = await provider.createOrder({
        amount: 15000,
        currency: 'TZS',
        reference: 'to_cancel',
        customer,
      });

      const result = await provider.cancelOrder!(order.orderId);
      expect(result.cancelled).toBe(true);

      const status = await provider.getPaymentStatus(order.orderId);
      expect(status).toBe('CANCELLED');
    });

    it('returns cancelled=true even for non-existent orders', async () => {
      const provider = new BogusPaymentProvider();
      const result = await provider.cancelOrder!('nonexistent');

      // No order to update, but still reports cancelled (idempotent)
      expect(result.cancelled).toBe(true);
      expect(result.orderId).toBe('nonexistent');
    });
  });

  describe('validateCredentials', () => {
    it('always returns valid', async () => {
      const provider = new BogusPaymentProvider();
      const result = await provider.validateCredentials!();
      expect(result.valid).toBe(true);
    });
  });

  describe('previewOrder', () => {
    it('returns valid with 1% fee', async () => {
      const provider = new BogusPaymentProvider();
      const result = await provider.previewOrder!({
        amount: 10000,
        currency: 'TZS',
        reference: 'preview_001',
        customer,
      });

      expect(result.valid).toBe(true);
      expect(result.fee).toBe(100); // 1% of 10000
    });
  });

  describe('previewDisburse', () => {
    it('returns valid with 0.5% fee', async () => {
      const provider = new BogusPaymentProvider();
      const result = await provider.previewDisburse!({
        amount: 10000,
        currency: 'TZS',
        reference: 'pvw_001',
        recipient: { phone: '255754321098' },
      });

      expect(result.valid).toBe(true);
      expect(result.fee).toBe(50); // 0.5% of 10000
    });
  });

  describe('getNameLookup', () => {
    it('returns Bogus User for any input', async () => {
      const provider = new BogusPaymentProvider();
      const result = await provider.getNameLookup!('255712345678');

      expect(result.found).toBe(true);
      expect(result.accountName).toBe('Bogus User');
      expect(result.provider).toBe('BOGUS');
    });
  });

  describe('listOrders', () => {
    it('returns all created orders', async () => {
      const provider = new BogusPaymentProvider();
      await provider.createOrder({
        amount: 1000,
        currency: 'TZS',
        reference: 'list_1',
        customer,
      });
      await provider.createOrder({
        amount: 2000,
        currency: 'TZS',
        reference: 'list_2',
        customer,
      });

      const result = await provider.listOrders!({});
      expect(result.total).toBeGreaterThanOrEqual(2);
      expect(result.orders.find((o) => o.reference === 'list_1')).toBeTruthy();
    });
  });

  // ── Behavior ──────────────────────────────────────────────────

  describe('delay', () => {
    it('respects the configured delay', async () => {
      const provider = new BogusPaymentProvider({ delay: 100 });
      const start = Date.now();
      await provider.createOrder({
        amount: 15000,
        currency: 'TZS',
        reference: 'timed',
        customer,
      });
      const elapsed = Date.now() - start;

      expect(elapsed).toBeGreaterThanOrEqual(50); // allow some timer jitter
    });
  });

  describe('provider name', () => {
    it('returns bogus', () => {
      const provider = new BogusPaymentProvider();
      expect(provider.name).toBe('bogus');
    });
  });
});
