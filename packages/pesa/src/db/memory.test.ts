import { beforeEach, describe, expect, it } from 'vitest';
import type { PaymentEvent } from '../types/event';
import { MemoryAdapter } from './memory';

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

describe('MemoryAdapter', () => {
  let adapter: MemoryAdapter;

  beforeEach(() => {
    adapter = new MemoryAdapter();
  });

  it('saves and retrieves an event', async () => {
    await adapter.saveEvent(makeEvent());
    const stored = await adapter.getEvent('ev_test');
    expect(stored).toBeTruthy();
    expect(stored!.reference).toBe('ref_1');
    expect(stored!.amount).toBe(5000);
  });

  it('returns null for unknown event IDs', async () => {
    expect(await adapter.getEvent('nonexistent')).toBeNull();
  });

  it('retrieves events by reference', async () => {
    await adapter.saveEvent(makeEvent({ id: 'ev_1', reference: 'shared' }));
    await adapter.saveEvent(makeEvent({ id: 'ev_2', reference: 'shared' }));
    await adapter.saveEvent(makeEvent({ id: 'ev_3', reference: 'other' }));
    expect((await adapter.getEventsByReference('shared')).length).toBe(2);
  });

  it('retrieves events by order ID', async () => {
    await adapter.saveEvent(makeEvent({ id: 'ev_a', orderId: 'order_x' }));
    await adapter.saveEvent(makeEvent({ id: 'ev_b', orderId: 'order_x' }));
    expect((await adapter.getEventsByOrderId('order_x')).length).toBe(2);
  });

  it('returns empty array for no matches', async () => {
    expect(await adapter.getEventsByReference('none')).toEqual([]);
  });

  it('does not share state across instances', async () => {
    const a2 = new MemoryAdapter();
    await adapter.saveEvent(makeEvent({ id: 'only_in_a1' }));
    expect(await a2.getEvent('only_in_a1')).toBeNull();
  });
});
