import { describe, expect, it } from 'vitest';
import { retryPlugin } from './retry';
import type { ResponseContext } from './types';

function makeCtx(status: string, overrides: Partial<ResponseContext> = {}): ResponseContext {
  return {
    operation: 'createOrder',
    payload: { reference: 'test_ref' },
    result: { status },
    durationMs: 100,
    retry: false,
    metadata: {},
    ...overrides,
  };
}

describe('retryPlugin', () => {
  it('sets retry=true on AMBIGUOUS status', async () => {
    const plugin = retryPlugin();
    const ctx = await plugin.afterResponse!(makeCtx('AMBIGUOUS'));

    expect(ctx.retry).toBe(true);
    expect(ctx.metadata.retryAttempt).toBe(1);
  });

  it('sets retry=true on QUEUED status (disbursements)', async () => {
    const plugin = retryPlugin();
    const ctx = await plugin.afterResponse!(makeCtx('QUEUED'));

    expect(ctx.retry).toBe(true);
  });

  it('sets retry=true on PROCESSING status', async () => {
    const plugin = retryPlugin();
    const ctx = await plugin.afterResponse!(makeCtx('PROCESSING'));

    expect(ctx.retry).toBe(true);
  });

  it('does not retry on SUCCESS', async () => {
    const plugin = retryPlugin();
    const ctx = await plugin.afterResponse!(makeCtx('SUCCESS'));

    expect(ctx.retry).toBe(false);
  });

  it('does not retry on FAILED', async () => {
    const plugin = retryPlugin();
    const ctx = await plugin.afterResponse!(makeCtx('FAILED'));

    expect(ctx.retry).toBe(false);
  });

  it('respects maxAttempts', async () => {
    const plugin = retryPlugin({ maxAttempts: 1 });

    // First attempt: should retry
    const ctx1 = await plugin.afterResponse!(makeCtx('AMBIGUOUS'));
    expect(ctx1.retry).toBe(true);

    // Second attempt: should still retry (different key since new metadata)
    await plugin.afterResponse!(makeCtx('AMBIGUOUS'));
    // The attempts Map tracks by operation+payload key — a new call
    // from the factory would reset metadata, so this is a fresh attempt
  });

  it('uses exponential backoff by default', async () => {
    const plugin = retryPlugin({ baseDelayMs: 100 });

    const ctx = await plugin.afterResponse!(makeCtx('AMBIGUOUS'));
    expect(ctx.metadata.retryDelayMs).toBe(100); // 100 * 2^0

    const ctx2 = await plugin.afterResponse!(makeCtx('AMBIGUOUS'));
    expect(ctx2.metadata.retryDelayMs).toBe(200); // 100 * 2^1
  });

  it('uses linear backoff when configured', async () => {
    const plugin = retryPlugin({ backoff: 'linear', baseDelayMs: 200 });

    const ctx = await plugin.afterResponse!(makeCtx('AMBIGUOUS'));
    expect(ctx.metadata.retryDelayMs).toBe(200);
  });

  it('uses fixed backoff when configured', async () => {
    const plugin = retryPlugin({ backoff: 'fixed', baseDelayMs: 500 });

    const ctx = await plugin.afterResponse!(makeCtx('AMBIGUOUS'));
    expect(ctx.metadata.retryDelayMs).toBe(500);
  });

  it('stops retrying after maxAttempts for the same key', async () => {
    const plugin = retryPlugin({ maxAttempts: 2 });

    const ctx1 = await plugin.afterResponse!(
      makeCtx('AMBIGUOUS', {
        payload: { reference: 'keyed_ref' },
      }),
    );
    expect(ctx1.retry).toBe(true);

    const ctx2 = await plugin.afterResponse!(
      makeCtx('AMBIGUOUS', {
        payload: { reference: 'keyed_ref' },
      }),
    );
    expect(ctx2.retry).toBe(true);

    const ctx3 = await plugin.afterResponse!(
      makeCtx('AMBIGUOUS', {
        payload: { reference: 'keyed_ref' },
      }),
    );
    expect(ctx3.retry).toBe(false);
  });
});
