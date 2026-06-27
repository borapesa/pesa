import { unlinkSync } from 'node:fs';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { PaymentEvent } from '../types/event';
import { SQLiteAdapter } from './sqlite';

const TEST_DB = './test-sqlite.db';

function makeEvent(overrides: Partial<PaymentEvent> = {}): PaymentEvent {
  return {
    id: 'ev_test',
    type: 'PAYMENT_SUCCESS',
    orderId: 'order_1',
    reference: 'ref_1',
    amount: 5000,
    currency: 'TZS',
    status: 'SUCCESS',
    provider: 'bogus',
    timestamp: new Date(),
    ...overrides,
  };
}

describe('SQLiteAdapter', () => {
  let adapter: SQLiteAdapter;

  beforeEach(() => {
    adapter = new SQLiteAdapter(TEST_DB);
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

  it('saves and retrieves an event', async () => {
    const event = makeEvent();
    await adapter.saveEvent(event);

    const stored = await adapter.getEvent('ev_test');
    expect(stored).toBeTruthy();
    expect(stored!.reference).toBe('ref_1');
    expect(stored!.amount).toBe(5000);
    expect(stored!.status).toBe('SUCCESS');
  });

  it('returns null for unknown event IDs', async () => {
    const stored = await adapter.getEvent('nonexistent');
    expect(stored).toBeNull();
  });

  it('retrieves events by reference', async () => {
    await adapter.saveEvent(makeEvent({ id: 'ev_1', reference: 'shared_ref', amount: 1000 }));
    await adapter.saveEvent(makeEvent({ id: 'ev_2', reference: 'shared_ref', amount: 2000 }));
    await adapter.saveEvent(makeEvent({ id: 'ev_3', reference: 'other_ref', amount: 3000 }));

    const results = await adapter.getEventsByReference('shared_ref');
    expect(results.length).toBe(2);
    expect(results.find((e) => e.id === 'ev_1')).toBeTruthy();
    expect(results.find((e) => e.id === 'ev_2')).toBeTruthy();
  });

  it('retrieves events by order ID', async () => {
    await adapter.saveEvent(makeEvent({ id: 'ev_a', orderId: 'order_x' }));
    await adapter.saveEvent(makeEvent({ id: 'ev_b', orderId: 'order_x' }));
    await adapter.saveEvent(makeEvent({ id: 'ev_c', orderId: 'order_y' }));

    const results = await adapter.getEventsByOrderId('order_x');
    expect(results.length).toBe(2);
  });

  it('returns empty array for no matches', async () => {
    const refs = await adapter.getEventsByReference('no_match');
    expect(refs).toEqual([]);

    const orders = await adapter.getEventsByOrderId('no_match');
    expect(orders).toEqual([]);
  });

  it('handles events with undefined metadata and raw', async () => {
    // rowToEvent should handle null/undefined for metadata and raw columns
    const event = makeEvent({
      id: 'ev_no_meta',
      metadata: undefined,
      raw: undefined,
    });
    await adapter.saveEvent(event);

    const stored = await adapter.getEvent('ev_no_meta');
    expect(stored).toBeTruthy();
    expect(stored!.metadata).toBeUndefined();
    expect(stored!.raw).toBeUndefined();
  });

  it('handles events with metadata and raw set to complex objects', async () => {
    const event = makeEvent({
      id: 'ev_complex',
      metadata: { ip: '1.2.3.4', count: 5 },
      raw: { providerResponse: { code: '000', msg: 'OK' } },
    });
    await adapter.saveEvent(event);

    const stored = await adapter.getEvent('ev_complex');
    expect(stored).toBeTruthy();
    expect(stored!.metadata).toEqual({ ip: '1.2.3.4', count: 5 });
    expect(stored!.raw).toEqual({ providerResponse: { code: '000', msg: 'OK' } });
  });

  it('stores and retrieves multiple event types', async () => {
    await adapter.saveEvent(makeEvent({ id: 'ev_s', type: 'PAYMENT_SUCCESS' }));
    await adapter.saveEvent(makeEvent({ id: 'ev_f', type: 'PAYMENT_FAILED' }));
    await adapter.saveEvent(makeEvent({ id: 'ev_d', type: 'DISBURSEMENT_SUCCESS' }));

    const success = await adapter.getEvent('ev_s');
    const failed = await adapter.getEvent('ev_f');
    const disburse = await adapter.getEvent('ev_d');

    expect(success!.type).toBe('PAYMENT_SUCCESS');
    expect(failed!.type).toBe('PAYMENT_FAILED');
    expect(disburse!.type).toBe('DISBURSEMENT_SUCCESS');
  });
});
