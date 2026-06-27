import { describe, it, expect } from 'vitest';
import { idempotencyPlugin } from './idempotency';
import type { RequestContext } from './types';

function makeCtx(reference: string): RequestContext {
  return {
    operation: 'createOrder',
    payload: { reference, amount: 1000 },
    headers: {},
    metadata: {},
  };
}

describe('idempotencyPlugin', () => {
  it('adds X-Idempotency-Key header', async () => {
    const plugin = idempotencyPlugin();
    const ctx = await plugin.beforeRequest!(makeCtx('order_001'));

    expect(ctx.headers['X-Idempotency-Key']).toBe('createOrder:order_001');
  });

  it('throws on duplicate reference for same operation', async () => {
    const plugin = idempotencyPlugin();

    await plugin.beforeRequest!(makeCtx('order_dup'));
    await expect(plugin.beforeRequest!(makeCtx('order_dup'))).rejects.toThrow(
      'Duplicate request detected',
    );
  });

  it('allows same reference for different operations', async () => {
    const plugin = idempotencyPlugin();

    await plugin.beforeRequest!(makeCtx('shared_ref'));

    const ctx = await plugin.beforeRequest!({
      operation: 'disburse',
      payload: { reference: 'shared_ref', amount: 1000 },
      headers: {},
      metadata: {},
    });

    expect(ctx.headers['X-Idempotency-Key']).toBe('disburse:shared_ref');
  });

  it('skips if payload has no reference', async () => {
    const plugin = idempotencyPlugin();
    const ctx = await plugin.beforeRequest!({
      operation: 'createOrder',
      payload: {},
      headers: {},
      metadata: {},
    });

    expect(ctx.headers['X-Idempotency-Key']).toBeUndefined();
  });
});
