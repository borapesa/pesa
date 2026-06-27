import type { PaymentEvent } from '../types/event';

/**
 * Database adapter interface for the event store.
 *
 * The default SQLiteAdapter requires zero configuration and works in
 * any Node.js environment. Swap adapters for Turso/libSQL, PostgreSQL,
 * Prisma, or Drizzle via the `db` field in PesaConfig.
 */
export interface PesaDatabaseAdapter {
  /** Persist a verified PaymentEvent. */
  saveEvent(event: PaymentEvent): Promise<void>;

  /** Retrieve a single event by its UUID. */
  getEvent(id: string): Promise<PaymentEvent | null>;

  /** Retrieve all events for a given merchant reference. */
  getEventsByReference(reference: string): Promise<PaymentEvent[]>;

  /** Retrieve all events for a given provider order ID. */
  getEventsByOrderId(orderId: string): Promise<PaymentEvent[]>;
}
