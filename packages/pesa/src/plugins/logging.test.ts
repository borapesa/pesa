import { describe, it, expect } from 'vitest';
import { loggingPlugin } from './logging';
import type { RequestContext, ResponseContext } from './types';

describe('loggingPlugin', () => {
  it('redacts phone and email from payload before logging', async () => {
    const logs: string[] = [];
    const plugin = loggingPlugin({
      logger: { debug: () => {}, info: (m) => logs.push(m), warn: () => {}, error: () => {} },
    });

    const ctx: RequestContext = {
      operation: 'createOrder',
      payload: {
        reference: 'test',
        amount: 1000,
        phone: '255712345678',
        customer: { name: 'Juma', phone: '255712345678', email: 'juma@example.com' },
      },
      headers: {},
      metadata: {},
    };

    await plugin.beforeRequest!(ctx);

    expect(logs.length).toBe(1);
    const parsed = JSON.parse(logs[0]!);
    const p = parsed.payload as Record<string, unknown>;
    expect(p.phone).toBe('***');

    const cust = p.customer as Record<string, unknown>;
    expect(cust.phone).toBe('***');
    expect(cust.email).toBe('***');
  });

  it('logs response duration and status', async () => {
    const logs: string[] = [];
    const plugin = loggingPlugin({
      logger: { debug: () => {}, info: (m) => logs.push(m), warn: () => {}, error: () => {} },
    });

    const rCtx: ResponseContext = {
      operation: 'createOrder',
      payload: { reference: 'test' },
      result: { status: 'SUCCESS' },
      durationMs: 150,
      retry: false,
      metadata: {},
    };

    await plugin.afterResponse!(rCtx);

    expect(logs.length).toBe(1);
    const parsed = JSON.parse(logs[0]!);
    expect(parsed.status).toBe('SUCCESS');
    expect(parsed.durationMs).toBeGreaterThan(0);
  });

  it('computes duration from startTime metadata when set', async () => {
    const logs: string[] = [];
    const plugin = loggingPlugin({
      logger: { debug: () => {}, info: (m) => logs.push(m), warn: () => {}, error: () => {} },
    });

    const rCtx: ResponseContext = {
      operation: 'createOrder',
      payload: { reference: 'test2' },
      result: { status: 'SUCCESS' },
      durationMs: 0,
      retry: false,
      metadata: { startTime: Date.now() - 300 },
    };

    await plugin.afterResponse!(rCtx);

    expect(logs.length).toBe(1);
    const parsed = JSON.parse(logs[0]!);
    expect(parsed.status).toBe('SUCCESS');
    expect(parsed.durationMs).toBeGreaterThanOrEqual(250); // allow small timer drift
  });

  it('uses "unknown" status when result has no status field', async () => {
    const logs: string[] = [];
    const plugin = loggingPlugin({
      logger: { debug: () => {}, info: (m) => logs.push(m), warn: () => {}, error: () => {} },
    });

    const rCtx: ResponseContext = {
      operation: 'refund',
      payload: { reference: 'no_status' },
      result: {}, // no status field at all
      durationMs: 50,
      retry: false,
      metadata: {},
    };

    await plugin.afterResponse!(rCtx);

    expect(logs.length).toBe(1);
    const parsed = JSON.parse(logs[0]!);
    expect(parsed.status).toBe('unknown');
  });

  it('logs errors at error level', async () => {
    const logs: string[] = [];
    const plugin = loggingPlugin({
      logger: { debug: () => {}, info: () => {}, warn: () => {}, error: (m) => logs.push(m) },
    });

    const rCtx: ResponseContext = {
      operation: 'createOrder',
      payload: { reference: 'test' },
      result: { status: 'FAILED' },
      durationMs: 100,
      retry: false,
      metadata: {},
    };

    await plugin.afterResponse!(rCtx);

    expect(logs.length).toBe(1);
    const parsed = JSON.parse(logs[0]!);
    expect(parsed.level).toBe('error');
  });

  it('logs payment events via onPaymentEvent', async () => {
    const logs: string[] = [];
    const plugin = loggingPlugin({
      logger: { debug: () => {}, info: (m) => logs.push(m), warn: () => {}, error: () => {} },
    });

    await plugin.onPaymentEvent!({
      id: 'ev_log',
      type: 'PAYMENT_SUCCESS',
      orderId: 'order_log',
      reference: 'ref_log',
      amount: 5000,
      currency: 'TZS',
      status: 'SUCCESS',
      provider: 'bogus',
      timestamp: new Date(),
    });

    expect(logs.length).toBe(1);
    const parsed = JSON.parse(logs[0]!);
    expect(parsed.type).toBe('PAYMENT_SUCCESS');
    expect(parsed.orderId).toBe('order_log');
    expect(parsed.amount).toBe(5000);
    expect(parsed.provider).toBe('bogus');
  });

  it('respects log level threshold', async () => {
    const logs: string[] = [];
    const plugin = loggingPlugin({
      level: 'warn',
      logger: { debug: () => {}, info: (m) => logs.push(m), warn: () => {}, error: () => {} },
    });

    const ctx: RequestContext = {
      operation: 'createOrder',
      payload: { reference: 'test' },
      headers: {},
      metadata: {},
    };

    await plugin.beforeRequest!(ctx);
    // log level is 'warn', but we log at 'info' — should be filtered out
    expect(logs.length).toBe(0);
  });
});
