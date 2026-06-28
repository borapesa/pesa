import { unlinkSync } from 'node:fs';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { SQLiteAdapter } from './db/sqlite';
import { PesaNetworkError, PesaProviderError, PesaWebhookError } from './errors';
import { createPesa } from './pesa';
import { retryPlugin } from './plugins/retry';
import type { PesaPlugin } from './plugins/types';
import { BasePaymentProvider } from './providers/base';
import { BogusPaymentProvider } from './testing/bogus';
import type { PaymentEvent } from './types/event';
import type {
  CreateOrderPayload,
  DisbursePayload,
  DisburseResult,
  OrderResult,
  PaymentStatus,
  ProviderName,
} from './types/index';

const customer = { name: 'Juma Ali', phone: '255712345678' };
const TEST_DB = './test-factory.db';

describe('createPesa() factory', () => {
  let db: SQLiteAdapter;

  beforeEach(() => {
    db = new SQLiteAdapter(TEST_DB);
  });

  afterEach(() => {
    try {
      unlinkSync(TEST_DB);
    } catch {
      /* ok */
    }
    try {
      unlinkSync(`${TEST_DB}-wal`);
    } catch {
      /* ok */
    }
    try {
      unlinkSync(`${TEST_DB}-shm`);
    } catch {
      /* ok */
    }
  });

  // ── createOrder ────────────────────────────────────────────────

  it('initiates a payment and returns OrderResult', async () => {
    const pesa = createPesa({
      provider: new BogusPaymentProvider({ defaultBehavior: 'success', delay: 0 }),
      db,
    });

    const order = await pesa.createOrder({
      amount: 15000,
      currency: 'TZS',
      reference: 'order_abc',
      customer,
    });

    expect(order.status).toBe('SUCCESS');
    expect(order.reference).toBe('order_abc');
    expect(order.orderId).toMatch(/^bogus_/);
    expect(order.ussdPushInitiated).toBe(true);
  });

  it('returns FAILED when provider returns fail', async () => {
    const pesa = createPesa({
      provider: new BogusPaymentProvider({ defaultBehavior: 'fail', delay: 0 }),
      db,
    });

    const order = await pesa.createOrder({
      amount: 15000,
      currency: 'TZS',
      reference: 'order_fail',
      customer,
    });

    expect(order.status).toBe('FAILED');
  });

  // ── getPaymentStatus ───────────────────────────────────────────

  it('returns the stored payment status', async () => {
    const pesa = createPesa({
      provider: new BogusPaymentProvider({ delay: 0 }),
      db,
    });

    const order = await pesa.createOrder({
      amount: 15000,
      currency: 'TZS',
      reference: 'order_status',
      customer,
    });
    const status = await pesa.getPaymentStatus(order.orderId);

    expect(status).toBe('SUCCESS');
  });

  // ── disburse ───────────────────────────────────────────────────

  it('sends a disbursement', async () => {
    const pesa = createPesa({
      provider: new BogusPaymentProvider({ delay: 0 }),
      db,
    });

    const result = await pesa.disburse({
      amount: 50000,
      currency: 'TZS',
      reference: 'payout_001',
      recipient: { phone: '255754321098', network: 'MPESA' },
    });

    expect(result.status).toBe('SUCCESS');
    expect(result.reference).toBe('payout_001');
  });

  // ── handleWebhook → persist → emit ────────────────────────────

  it('processes a webhook: verify, persist, emit', async () => {
    const pesa = createPesa({
      provider: new BogusPaymentProvider({ delay: 0 }),
      db,
    });

    const events: PaymentEvent[] = [];
    pesa.on('PAYMENT_SUCCESS', (e: PaymentEvent) => {
      events.push(e);
    });

    const body = JSON.stringify({ reference: 'wh_test', status: 'SUCCESS', amount: 5000 });
    await pesa.handleWebhook(body, {});

    expect(events.length).toBe(1);
    expect(events[0]!.type).toBe('PAYMENT_SUCCESS');
    expect(events[0]!.reference).toBe('wh_test');

    // Verify persistence
    const stored = await db.getEvent(events[0]!.id);
    expect(stored).toBeTruthy();
    expect(stored!.reference).toBe('wh_test');
  });

  it('emits PAYMENT_FAILED for failed webhooks', async () => {
    const pesa = createPesa({
      provider: new BogusPaymentProvider({ delay: 0 }),
      db,
    });

    const events: PaymentEvent[] = [];
    pesa.on('PAYMENT_FAILED', (e: PaymentEvent) => {
      events.push(e);
    });

    const body = JSON.stringify({ reference: 'wh_fail', status: 'FAILED' });
    await pesa.handleWebhook(body, {});

    expect(events.length).toBe(1);
    expect(events[0]!.type).toBe('PAYMENT_FAILED');
  });

  it('persists events to the database', async () => {
    const pesa = createPesa({
      provider: new BogusPaymentProvider({ delay: 0 }),
      db,
    });

    const body1 = JSON.stringify({ reference: 'persist_1', status: 'SUCCESS', amount: 1000 });
    const body2 = JSON.stringify({ reference: 'persist_2', status: 'SUCCESS', amount: 2000 });

    await pesa.handleWebhook(body1, {});
    await pesa.handleWebhook(body2, {});

    const byRef = await db.getEventsByReference('persist_1');
    expect(byRef.length).toBe(1);
    expect(byRef[0]!.amount).toBe(1000);
  });

  // ── Event emitter ──────────────────────────────────────────────

  it('calls multiple handlers for the same event type', async () => {
    const pesa = createPesa({
      provider: new BogusPaymentProvider({ delay: 0 }),
      db,
    });

    let count = 0;
    pesa.on('PAYMENT_SUCCESS', () => {
      count++;
    });
    pesa.on('PAYMENT_SUCCESS', () => {
      count++;
    });

    const body = JSON.stringify({ reference: 'multi', status: 'SUCCESS' });
    await pesa.handleWebhook(body, {});

    expect(count).toBe(2);
  });

  // ── Optional operations (feature detection) ────────────────────

  it('exposes optional methods when provider supports them', async () => {
    const pesa = createPesa({
      provider: new BogusPaymentProvider({ delay: 0 }),
      db,
    });

    expect(pesa.refund).toBeDefined();
    expect(pesa.cancelOrder).toBeDefined();
    expect(pesa.validateCredentials).toBeDefined();
    expect(pesa.getBalance).toBeDefined();
    expect(pesa.previewOrder).toBeDefined();

    const refund = await pesa.refund!('order_1', 5000);
    expect(refund.status).toBe('SUCCESS');

    const creds = await pesa.validateCredentials!();
    expect(creds.valid).toBe(true);

    const balance = await pesa.getBalance!();
    expect(balance.balances).toHaveLength(2);
    expect(balance.balances[0]?.currency).toBe('TZS');

    const preview = await pesa.previewOrder!({
      amount: 10000,
      currency: 'TZS',
      reference: 'pv_1',
      customer,
    });
    expect(preview.valid).toBe(true);
    expect(preview.fee).toBe(100);
  });

  // ── Default SQLiteAdapter ──────────────────────────────────────

  it('defaults to SQLiteAdapter when no db is provided', async () => {
    // Use a clean DB path to avoid conflicts
    const pesa = createPesa({
      provider: new BogusPaymentProvider({ delay: 0 }),
    });

    const body = JSON.stringify({ reference: 'default_db', status: 'SUCCESS' });
    await pesa.handleWebhook(body, {});

    // Clean up the default DB
    try {
      unlinkSync('./pesa.db');
    } catch {
      /* ok */
    }
    try {
      unlinkSync('./pesa.db-wal');
    } catch {
      /* ok */
    }
    try {
      unlinkSync('./pesa.db-shm');
    } catch {
      /* ok */
    }
  }, 10000);

  // ── Error normalization ────────────────────────────────────────

  describe('error normalization', () => {
    class ThrowingProvider extends BogusPaymentProvider {
      constructor(private _error: unknown) {
        super({ delay: 0 });
      }
      override async createOrder(_p: CreateOrderPayload): Promise<OrderResult> {
        throw this._error;
      }
      override async getPaymentStatus(_orderId: string): Promise<PaymentStatus> {
        throw this._error;
      }
      override async disburse(_p: DisbursePayload): Promise<DisburseResult> {
        throw this._error;
      }
    }

    it('wraps TypeError with fetch message into PesaNetworkError', async () => {
      const pesa = createPesa({
        provider: new ThrowingProvider(new TypeError('fetch failed')),
        db,
      });

      await expect(
        pesa.createOrder({
          amount: 1000,
          currency: 'TZS',
          reference: 'net_err',
          customer,
        }),
      ).rejects.toThrow(PesaNetworkError);
    });

    it('wraps generic Error into PesaProviderError', async () => {
      const pesa = createPesa({
        provider: new ThrowingProvider(new Error('something broke')),
        db,
      });

      await expect(
        pesa.createOrder({
          amount: 1000,
          currency: 'TZS',
          reference: 'gen_err',
          customer,
        }),
      ).rejects.toThrow(PesaProviderError);
    });

    it('wraps non-Error throw into PesaProviderError', async () => {
      const pesa = createPesa({
        provider: new ThrowingProvider('just a string'),
        db,
      });

      await expect(
        pesa.createOrder({
          amount: 1000,
          currency: 'TZS',
          reference: 'str_err',
          customer,
        }),
      ).rejects.toThrow('Unknown provider error');
    });

    it('passes PesaWebhookError through unchanged', async () => {
      // Test via getPaymentStatus since handleWebhook has its own try/catch
      const pesa = createPesa({
        provider: new ThrowingProvider(new PesaWebhookError('bad sig')),
        db,
      });

      await expect(pesa.getPaymentStatus('any_id')).rejects.toThrow(PesaWebhookError);
    });

    it('normalizes errors from disburse too', async () => {
      const pesa = createPesa({
        provider: new ThrowingProvider(new Error('payout failed')),
        db,
      });

      await expect(
        pesa.disburse({
          amount: 1000,
          currency: 'TZS',
          reference: 'derr',
          recipient: { phone: '255754321098' },
        }),
      ).rejects.toThrow(PesaProviderError);
    });
  });

  // ── Retry loop (integration) ────────────────────────────────────

  describe('retry integration', () => {
    class AmbiguousThenSuccessProvider extends BogusPaymentProvider {
      private calls = 0;
      constructor() {
        super({ delay: 0 });
      }
      override async createOrder(payload: CreateOrderPayload): Promise<OrderResult> {
        this.calls++;
        if (this.calls === 1) {
          return {
            orderId: 'bogus_amb',
            reference: payload.reference,
            status: 'AMBIGUOUS',
            ussdPushInitiated: true,
          };
        }
        return {
          orderId: 'bogus_ok',
          reference: payload.reference,
          status: 'SUCCESS',
          ussdPushInitiated: true,
        };
      }
    }

    it('retries on AMBIGUOUS and succeeds on next attempt', async () => {
      const pesa = createPesa({
        provider: new AmbiguousThenSuccessProvider(),
        plugins: [retryPlugin({ maxAttempts: 3, baseDelayMs: 10, backoff: 'fixed' })],
        db,
      });

      const result = await pesa.createOrder({
        amount: 1000,
        currency: 'TZS',
        reference: 'retry_amb',
        customer,
      });

      expect(result.status).toBe('SUCCESS');
      expect(result.orderId).toBe('bogus_ok');
    });

    class AlwaysFailingProvider extends BogusPaymentProvider {
      constructor() {
        super({ delay: 0 });
      }
      override async createOrder(_payload: CreateOrderPayload): Promise<OrderResult> {
        throw new Error('permanent failure');
      }
    }

    it('stops retrying after maxAttempts on persistent errors', async () => {
      const pesa = createPesa({
        provider: new AlwaysFailingProvider(),
        plugins: [retryPlugin({ maxAttempts: 2, baseDelayMs: 10, backoff: 'fixed' })],
        db,
      });

      await expect(
        pesa.createOrder({
          amount: 1000,
          currency: 'TZS',
          reference: 'perm_fail',
          customer,
        }),
      ).rejects.toThrow(PesaProviderError);
    });
  });

  // ── Retry loop: disburse ────────────────────────────────────────

  describe('disburse retry integration', () => {
    class AmbiguousDisburseProvider extends BogusPaymentProvider {
      private calls = 0;
      constructor() {
        super({ delay: 0 });
      }
      override async disburse(payload: DisbursePayload): Promise<DisburseResult> {
        this.calls++;
        if (this.calls === 1) {
          return { disbursementId: 'b_amb', reference: payload.reference, status: 'QUEUED' };
        }
        return { disbursementId: 'b_ok', reference: payload.reference, status: 'SUCCESS' };
      }
    }

    it('retries QUEUED disbursement and succeeds', async () => {
      const pesa = createPesa({
        provider: new AmbiguousDisburseProvider(),
        plugins: [retryPlugin({ maxAttempts: 3, baseDelayMs: 10, backoff: 'fixed' })],
        db,
      });

      const result = await pesa.disburse({
        amount: 1000,
        currency: 'TZS',
        reference: 'd_retry',
        recipient: { phone: '255754321098' },
      });

      expect(result.status).toBe('SUCCESS');
      expect(result.disbursementId).toBe('b_ok');
    });

    class AlwaysQueuedDisburseProvider extends BogusPaymentProvider {
      constructor() {
        super({ delay: 0 });
      }
      override async disburse(payload: DisbursePayload): Promise<DisburseResult> {
        return { disbursementId: 'b_queue', reference: payload.reference, status: 'QUEUED' };
      }
    }

    it('gives up retrying disbursement after maxAttempts and returns last result', async () => {
      const pesa = createPesa({
        provider: new AlwaysQueuedDisburseProvider(),
        plugins: [retryPlugin({ maxAttempts: 1, baseDelayMs: 10, backoff: 'fixed' })],
        db,
      });

      const result = await pesa.disburse({
        amount: 1000,
        currency: 'TZS',
        reference: 'd_giveup',
        recipient: { phone: '255754321098' },
      });

      // After 1 retry, max is reached, returns last result with QUEUED status
      expect(result.status).toBe('QUEUED');
      expect(result.disbursementId).toBe('b_queue');
    });
  });

  // ── Optional not supported (falls to base class) ─────────────────

  describe('unsupported optional methods', () => {
    class MinimalProvider extends BasePaymentProvider {
      readonly name: ProviderName = 'bogus' as ProviderName;
      async createOrder(p: CreateOrderPayload): Promise<OrderResult> {
        return {
          orderId: 'min_1',
          reference: p.reference,
          status: 'SUCCESS',
          ussdPushInitiated: true,
        };
      }
      async getPaymentStatus(): Promise<PaymentStatus> {
        return 'SUCCESS';
      }
      async handleWebhook(): Promise<PaymentEvent> {
        return {
          id: 'ev_min',
          type: 'PAYMENT_SUCCESS',
          orderId: 'min_1',
          reference: 'min',
          amount: 0,
          currency: 'TZS',
          status: 'SUCCESS',
          provider: 'bogus',
          timestamp: new Date(),
        };
      }
      async disburse(): Promise<DisburseResult> {
        return { disbursementId: 'd_min', reference: 'min', status: 'SUCCESS' };
      }
      // Does NOT override refund, cancelOrder, previewOrder, etc.
    }

    it('throws PesaUnsupportedError for optional methods not overridden', () => {
      const pesa = createPesa({
        provider: new MinimalProvider(),
        db,
      });

      // Base class defaults throw synchronously (not async)
      expect(() => pesa.refund!('x')).toThrow('does not support refunds');
      expect(() => pesa.cancelOrder!('x')).toThrow('does not support cancelling orders');
      expect(() =>
        pesa.previewOrder!({
          amount: 1000,
          currency: 'TZS',
          reference: 'x',
          customer,
        }),
      ).toThrow('does not support payment preview');
    });

    it('still exposes supported operations', async () => {
      const pesa = createPesa({
        provider: new MinimalProvider(),
        db,
      });

      const order = await pesa.createOrder({
        amount: 1000,
        currency: 'TZS',
        reference: 'min_ok',
        customer,
      });
      expect(order.status).toBe('SUCCESS');

      const status = await pesa.getPaymentStatus(order.orderId);
      expect(status).toBe('SUCCESS');
    });
  });

  // ── Webhook error handling ────────────────────────────────────

  it('throws PesaWebhookError when provider verification fails', async () => {
    class WebhookFailingProvider extends BogusPaymentProvider {
      constructor() {
        super({ delay: 0 });
      }
      override async handleWebhook(): Promise<PaymentEvent> {
        throw new Error('invalid signature from provider');
      }
    }

    const pesa = createPesa({
      provider: new WebhookFailingProvider(),
      db,
    });

    await expect(pesa.handleWebhook('{}', {})).rejects.toThrow('Webhook verification failed');
  });

  // ── UUID assignment when provider returns event without id ─────

  it('assigns a UUID when provider event has no id', async () => {
    class NoIdProvider extends BogusPaymentProvider {
      constructor() {
        super({ delay: 0 });
      }
      override async handleWebhook(): Promise<PaymentEvent> {
        return {
          id: '', // empty — core should assign a UUID
          type: 'PAYMENT_SUCCESS',
          orderId: 'no_id_order',
          reference: 'no_id_ref',
          amount: 1000,
          currency: 'TZS',
          status: 'SUCCESS',
          provider: 'bogus',
          timestamp: new Date(),
        };
      }
    }

    const pesa = createPesa({ provider: new NoIdProvider(), db });

    const events: PaymentEvent[] = [];
    pesa.on('PAYMENT_SUCCESS', (e: PaymentEvent) => {
      events.push(e);
    });

    await pesa.handleWebhook(JSON.stringify({}), {});

    expect(events.length).toBe(1);
    expect(events[0]!.id).toBeTruthy();
    expect(events[0]!.id).toMatch(/^[0-9a-f-]{36}$/); // UUID format
    expect(events[0]!.reference).toBe('no_id_ref');

    // Verify it was persisted with the assigned UUID
    const stored = await db.getEvent(events[0]!.id);
    expect(stored).toBeTruthy();
  });

  // ── Plugin onPaymentEvent during webhook ───────────────────────

  it('calls plugin onPaymentEvent hooks during webhook processing', async () => {
    const pluginEvents: PaymentEvent[] = [];

    const recordingPlugin: PesaPlugin = {
      name: 'test-recorder',
      async onPaymentEvent(event: PaymentEvent) {
        pluginEvents.push(event);
      },
    };

    const pesa = createPesa({
      provider: new BogusPaymentProvider({ delay: 0 }),
      plugins: [recordingPlugin],
      db,
    });

    await pesa.handleWebhook(
      JSON.stringify({ reference: 'plugin_wh', status: 'SUCCESS', amount: 7777 }),
      {},
    );

    expect(pluginEvents.length).toBe(1);
    expect(pluginEvents[0]!.reference).toBe('plugin_wh');
    // plugin should fire BEFORE user-registered handlers (order matters)
  });

  it('fires plugin onPaymentEvent before user handlers', async () => {
    const order: string[] = [];

    const orderingPlugin: PesaPlugin = {
      name: 'order-check',
      async onPaymentEvent() {
        order.push('plugin');
        return undefined;
      },
    };

    const pesa = createPesa({
      provider: new BogusPaymentProvider({ delay: 0 }),
      plugins: [orderingPlugin],
      db,
    });

    pesa.on('PAYMENT_SUCCESS', () => {
      order.push('user');
    });

    await pesa.handleWebhook(JSON.stringify({ reference: 'order_test', status: 'SUCCESS' }), {});

    expect(order).toEqual(['plugin', 'user']);
  });

  // ── Plugin init hook ──────────────────────────────────────────

  it('calls plugin init with the pesa instance', () => {
    let capturedInstance: unknown = null;

    const initPlugin: PesaPlugin = {
      name: 'init-test',
      init(pesa) {
        capturedInstance = pesa;
      },
    };

    const pesa = createPesa({
      provider: new BogusPaymentProvider({ delay: 0 }),
      plugins: [initPlugin],
      db,
    });

    expect(capturedInstance).toBe(pesa);
    expect(typeof (capturedInstance as typeof pesa).createOrder).toBe('function');
  });
});
