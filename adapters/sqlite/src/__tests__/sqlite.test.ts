import { unlinkSync } from 'node:fs';
import type { PaymentEvent } from '@borapesa/pesa';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { SQLiteAdapter } from '../index';

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
    } catch {}
    try {
      unlinkSync(`${TEST_DB}-wal`);
    } catch {}
    try {
      unlinkSync(`${TEST_DB}-shm`);
    } catch {}
  });

  it('saves and retrieves an event', async () => {
    const event = makeEvent();
    await adapter.saveEvent(event);
    const stored = await adapter.getEvent('ev_test');
    expect(stored).toBeTruthy();
    expect(stored!.reference).toBe('ref_1');
    expect(stored!.amount).toBe(5000);
  });

  it('returns null for unknown event IDs', async () => {
    const stored = await adapter.getEvent('nonexistent');
    expect(stored).toBeNull();
  });

  it('retrieves events by reference', async () => {
    await adapter.saveEvent(makeEvent({ id: 'ev_1', reference: 'shared_ref', amount: 1000 }));
    await adapter.saveEvent(makeEvent({ id: 'ev_2', reference: 'shared_ref', amount: 2000 }));
    const results = await adapter.getEventsByReference('shared_ref');
    expect(results.length).toBe(2);
  });

  it('retrieves events by order ID', async () => {
    await adapter.saveEvent(makeEvent({ id: 'ev_a', orderId: 'order_x' }));
    await adapter.saveEvent(makeEvent({ id: 'ev_b', orderId: 'order_x' }));
    const results = await adapter.getEventsByOrderId('order_x');
    expect(results.length).toBe(2);
  });

  it('returns empty array for no matches', async () => {
    expect(await adapter.getEventsByReference('no_match')).toEqual([]);
    expect(await adapter.getEventsByOrderId('no_match')).toEqual([]);
  });
});
