import type { PesaPlugin, RequestContext } from './types';

interface IdempotencyPluginOptions {
  /** Storage for idempotency keys (default: 'memory'). */
  store?: 'memory';
}

/**
 * Idempotency plugin — prevents duplicate charges on network retries.
 *
 * Attaches a unique idempotency key to each outgoing request.
 * The key is derived from the operation + the merchant reference,
 * ensuring the same logical payment is never sent to the provider twice.
 */
export function idempotencyPlugin(_options: IdempotencyPluginOptions = {}): PesaPlugin {
  const seen = new Set<string>();

  return {
    name: 'idempotency',

    async beforeRequest(ctx: RequestContext): Promise<RequestContext> {
      // Derive key from operation + merchant reference
      const ref = (ctx.payload as { reference?: string }).reference;
      if (!ref) return ctx;

      const key = `${ctx.operation}:${ref}`;

      if (seen.has(key)) {
        throw new Error(
          `Duplicate request detected for ${ctx.operation}:${ref}. ` +
            `This is likely a network retry — the original request may have succeeded.`,
        );
      }

      seen.add(key);
      ctx.headers['X-Idempotency-Key'] = key;
      return ctx;
    },
  };
}
