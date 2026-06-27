import Database from 'better-sqlite3';
import type { PesaDatabaseAdapter } from './adapter';
import type { PaymentEvent } from '../types/event';

/**
 * SQLite event store adapter powered by better-sqlite3.
 *
 * This is the default adapter — zero configuration, no network required.
 * The database file is created at `./pesa.db` if it doesn't exist.
 *
 * For serverless / edge workloads, swap to LibSQLAdapter (@borapesa/libsql)
 * which targets Turso.
 */
export class SQLiteAdapter implements PesaDatabaseAdapter {
  private db: Database.Database;
  private ready: Promise<void>;

  constructor(dbPath = './pesa.db') {
    this.db = new Database(dbPath);
    this.db.pragma('journal_mode = WAL');
    this.ready = this.migrate();
  }

  private async migrate(): Promise<void> {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS payment_events (
        id         TEXT PRIMARY KEY,
        type       TEXT NOT NULL,
        order_id   TEXT NOT NULL,
        reference  TEXT NOT NULL,
        amount     INTEGER NOT NULL,
        currency   TEXT NOT NULL,
        status     TEXT NOT NULL,
        provider   TEXT NOT NULL,
        timestamp  TEXT NOT NULL,
        metadata   TEXT,
        raw        TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
      CREATE INDEX IF NOT EXISTS idx_events_reference ON payment_events(reference);
      CREATE INDEX IF NOT EXISTS idx_events_order_id ON payment_events(order_id);
      CREATE INDEX IF NOT EXISTS idx_events_type ON payment_events(type);
    `);
  }

  async saveEvent(event: PaymentEvent): Promise<void> {
    await this.ready;
    const stmt = this.db.prepare(`
      INSERT INTO payment_events (id, type, order_id, reference, amount, currency, status, provider, timestamp, metadata, raw)
      VALUES (@id, @type, @orderId, @reference, @amount, @currency, @status, @provider, @timestamp, @metadata, @raw)
    `);
    stmt.run({
      id: event.id,
      type: event.type,
      orderId: event.orderId,
      reference: event.reference,
      amount: event.amount,
      currency: event.currency,
      status: event.status,
      provider: event.provider,
      timestamp: event.timestamp.toISOString(),
      metadata: event.metadata ? JSON.stringify(event.metadata) : null,
      raw: event.raw ? JSON.stringify(event.raw) : null,
    });
  }

  async getEvent(id: string): Promise<PaymentEvent | null> {
    await this.ready;
    const row = this.db.prepare('SELECT * FROM payment_events WHERE id = ?').get(id) as Row | undefined;
    return row ? this.rowToEvent(row) : null;
  }

  async getEventsByReference(reference: string): Promise<PaymentEvent[]> {
    await this.ready;
    const rows = this.db.prepare(
      'SELECT * FROM payment_events WHERE reference = ? ORDER BY timestamp DESC',
    ).all(reference) as Row[];
    return rows.map((r) => this.rowToEvent(r));
  }

  async getEventsByOrderId(orderId: string): Promise<PaymentEvent[]> {
    await this.ready;
    const rows = this.db.prepare(
      'SELECT * FROM payment_events WHERE order_id = ? ORDER BY timestamp DESC',
    ).all(orderId) as Row[];
    return rows.map((r) => this.rowToEvent(r));
  }

  private rowToEvent(row: Row): PaymentEvent {
    return {
      id: row.id,
      type: row.type as PaymentEvent['type'],
      orderId: row.order_id,
      reference: row.reference,
      amount: row.amount,
      currency: row.currency as PaymentEvent['currency'],
      status: row.status as PaymentEvent['status'],
      provider: row.provider as PaymentEvent['provider'],
      timestamp: new Date(row.timestamp),
      metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
      raw: row.raw ? JSON.parse(row.raw) : undefined,
    };
  }
}

interface Row {
  id: string;
  type: string;
  order_id: string;
  reference: string;
  amount: number;
  currency: string;
  status: string;
  provider: string;
  timestamp: string;
  metadata: string | null;
  raw: string | null;
  created_at: string;
}
