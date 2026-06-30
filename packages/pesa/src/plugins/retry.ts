import { PesaNetworkError } from '../errors';
import type { PesaPlugin, RequestContext, ResponseContext } from './types';

interface RetryPluginOptions {
  /** Maximum retry attempts (default: 3). */
  maxAttempts?: number;
  /** Backoff strategy (default: 'exponential'). */
  backoff?: 'exponential' | 'linear' | 'fixed';
  /** Base delay in milliseconds (default: 1000). */
  baseDelayMs?: number;
}

const MAX_MAP_SIZE = 1000;

/**
 * Retry plugin with configurable backoff.
 *
 * Retries on:
 * - Transient payment statuses (AMBIGUOUS / PROCESSING / QUEUED)
 * - Network errors (PesaNetworkError, fetch failures, 5xx)
 *
 * Does NOT retry on validation errors or provider errors with 4xx codes
 * (these are permanent and retrying won't help).
 *
 * Works with the idempotencyPlugin to prevent duplicate charges.
 */
export function retryPlugin(options: RetryPluginOptions = {}): PesaPlugin {
  const { maxAttempts = 3, backoff = 'exponential', baseDelayMs = 1000 } = options;

  const attempts = new Map<string, number>();

  function delayFor(attempt: number): number {
    switch (backoff) {
      case 'exponential':
        return baseDelayMs * 2 ** attempt;
      case 'linear':
        return baseDelayMs * (attempt + 1);
      case 'fixed':
        return baseDelayMs;
    }
  }

  function keyFor(ctx: RequestContext | ResponseContext): string {
    const payload = ctx.payload as { reference?: string };
    return `${ctx.operation}:${payload.reference ?? 'unknown'}`;
  }

  function track(key: string): { attempt: number; delay: number; shouldRetry: boolean } {
    // Prevent unbounded memory growth
    if (attempts.size >= MAX_MAP_SIZE) attempts.clear();

    const current = attempts.get(key) ?? 0;
    if (current < maxAttempts) {
      const delay = delayFor(current);
      attempts.set(key, current + 1);
      return { attempt: current + 1, delay, shouldRetry: true };
    }
    attempts.delete(key);
    return { attempt: current, delay: 0, shouldRetry: false };
  }

  return {
    name: 'retry',

    async afterResponse(ctx: ResponseContext): Promise<ResponseContext> {
      const status = (ctx.result as { status?: string }).status;
      const shouldRetry =
        ctx.retry || status === 'AMBIGUOUS' || status === 'PROCESSING' || status === 'QUEUED';

      if (!shouldRetry) {
        ctx.retry = false;
        return ctx;
      }

      const { attempt, delay, shouldRetry: ok } = track(keyFor(ctx));
      if (ok) {
        ctx.metadata.retryAttempt = attempt;
        ctx.metadata.retryDelayMs = delay;
        ctx.retry = true;
      } else {
        ctx.retry = false;
      }

      return ctx;
    },

    async onError(error: Error, ctx: RequestContext): Promise<ResponseContext | undefined> {
      // Only retry transient errors — not validation or auth failures
      if (
        error instanceof PesaNetworkError ||
        (error instanceof Error &&
          'statusCode' in error &&
          typeof (error as { statusCode: unknown }).statusCode === 'number' &&
          (error as { statusCode: number }).statusCode >= 500)
      ) {
        const { attempt, delay, shouldRetry } = track(keyFor(ctx));
        if (shouldRetry) {
          return {
            operation: ctx.operation,
            payload: ctx.payload,
            result: {} as Record<string, unknown>,
            durationMs: 0,
            retry: true,
            metadata: { retryAttempt: attempt, retryDelayMs: delay },
          };
        }
      }
      return undefined; // don't retry — let the error propagate
    },
  };
}
