import type { PesaPlugin, ResponseContext } from './types';

interface RetryPluginOptions {
  /** Maximum retry attempts (default: 3). */
  maxAttempts?: number;
  /** Backoff strategy (default: 'exponential'). */
  backoff?: 'exponential' | 'linear' | 'fixed';
  /** Base delay in milliseconds (default: 1000). */
  baseDelayMs?: number;
}

/**
 * Retry plugin with configurable backoff.
 *
 * Retries on AMBIGUOUS / PROCESSING statuses and network errors.
 * Works with the idempotencyPlugin to prevent duplicate charges.
 */
export function retryPlugin(options: RetryPluginOptions = {}): PesaPlugin {
  const {
    maxAttempts = 3,
    backoff = 'exponential',
    baseDelayMs = 1000,
  } = options;

  const attempts = new Map<string, number>();

  function delayFor(attempt: number): number {
    switch (backoff) {
      case 'exponential': return baseDelayMs * Math.pow(2, attempt);
      case 'linear':      return baseDelayMs * (attempt + 1);
      case 'fixed':       return baseDelayMs;
    }
  }

  return {
    name: 'retry',

    async afterResponse(ctx: ResponseContext): Promise<ResponseContext> {
      const key = `${ctx.operation}:${JSON.stringify(ctx.payload)}`;
      const current = attempts.get(key) ?? 0;

      // Only retry on in-progress statuses or when explicitly flagged
      const status = (ctx.result as { status?: string }).status;
      const shouldRetry = ctx.retry ||
        status === 'AMBIGUOUS' ||
        status === 'PROCESSING' ||
        status === 'QUEUED';

      if (shouldRetry && current < maxAttempts) {
        const delay = delayFor(current);
        attempts.set(key, current + 1);

        ctx.metadata.retryAttempt = current + 1;
        ctx.metadata.retryDelayMs = delay;
        ctx.retry = true;
      } else {
        attempts.delete(key);
        ctx.retry = false;
      }

      return ctx;
    },
  };
}
