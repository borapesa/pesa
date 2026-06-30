import type { PaymentEvent } from '../types/event';

/**
 * Database adapter interface for the event store.
 *
 * The default is an in-memory adapter (zero deps, dev/CI ready).
 * Swap for `@borapesa/sqlite`, PostgreSQL, or your own adapter via
 * the `db` field in PesaConfig.
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
