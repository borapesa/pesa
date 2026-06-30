import { PesaWebhookError } from './errors';
import type { PaymentEvent, PaymentEventType } from './types/event';

/**
 * Minimal interface for the pesa instance that the handler needs.
 */
export interface PesaHandlerTarget {
  handleWebhook(rawBody: string | Buffer, headers: Record<string, string>): Promise<void>;
  on(event: PaymentEventType, handler: (event: PaymentEvent) => Promise<void> | void): void;
}

/**
 * Creates a webhook handler — the one route that must be publicly exposed.
 *
 * Mount this behind no auth so providers can POST callbacks:
 *
 * ```ts
 * Bun.serve({ fetch: pesa.mountWebhook });
 * ```
 *
 * For order creation and status queries, use `pesa.createOrder()` and
 * `pesa.getPaymentStatus()` in your own routes behind your own auth.
 *
 * @param basePath — defaults to `'/pesa'`
 */
export function createPesaWebhookHandler(
  pesa: PesaHandlerTarget,
  basePath = '/pesa',
): (request: Request) => Promise<Response> {
  return async (request: Request): Promise<Response> => {
    const url = new URL(request.url);
    const path = url.pathname;

    try {
      const webhookPath = `${basePath}/webhook`;

      if (request.method === 'POST' && (path === webhookPath || path === `${webhookPath}/`)) {
        const rawBody = await request.text();
        const headers: Record<string, string> = {};
        request.headers.forEach((value, key) => {
          headers[key] = value;
        });
        await pesa.handleWebhook(rawBody, headers);
        return new Response(null, { status: 200 });
      }

      return new Response('Not Found', { status: 404 });
    } catch (err) {
      if (err instanceof PesaWebhookError) {
        return Response.json({ error: 'Invalid webhook signature' }, { status: 401 });
      }

      console.error('[pesa] handler error:', err);
      return Response.json(
        { error: err instanceof Error ? err.message : 'Internal Server Error' },
        { status: 500 },
      );
    }
  };
}
