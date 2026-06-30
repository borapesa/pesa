import type { PaymentEvent } from '../types/event';
import type { PesaDatabaseAdapter } from './adapter';

/**
 * In-memory event store — zero dependencies, perfect for dev and CI.
 *
 * This is the default adapter for borapesa. Events are stored in a Map
 * and lost on process exit. For production, swap to a persistent adapter
 * (e.g., `@borapesa/sqlite`, `@borapesa/postgres`).
 */
export class MemoryAdapter implements PesaDatabaseAdapter {
  private events = new Map<string, PaymentEvent>();

  async saveEvent(event: PaymentEvent): Promise<void> {
    this.events.set(event.id, event);
  }

  async getEvent(id: string): Promise<PaymentEvent | null> {
    return this.events.get(id) ?? null;
  }

  async getEventsByReference(reference: string): Promise<PaymentEvent[]> {
    return [...this.events.values()].filter((e) => e.reference === reference);
  }

  async getEventsByOrderId(orderId: string): Promise<PaymentEvent[]> {
    return [...this.events.values()].filter((e) => e.orderId === orderId);
  }
}
