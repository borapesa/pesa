import { PesaWebhookError } from './errors';
import type { PaymentEvent, PaymentEventType } from './types/event';
import type { CreateOrderPayload, OrderResult, PaymentStatus } from './types/order';
import { validateCreateOrderPayload } from './validate';

/**
 * Minimal interface for the pesa instance that the handler needs.
 * Defined here (not imported from pesa.ts) to avoid circular dependencies.
 */
export interface PesaHandlerTarget {
  createOrder(payload: CreateOrderPayload): Promise<OrderResult>;
  getPaymentStatus(orderId: string): Promise<PaymentStatus>;
  handleWebhook(rawBody: string | Buffer, headers: Record<string, string>): Promise<void>;
  on(event: PaymentEventType, handler: (event: PaymentEvent) => Promise<void> | void): void;
}

/**
 * Creates a generic fetch-like handler that can be mounted on any framework.
 *
 * All routes are namespaced under a base path to avoid collisions with
 * application routes — following the same convention as better-auth's `/auth/`.
 *
 * Routes:
 * ```
 *   POST {basePath}/order           — create a payment order
 *   GET  {basePath}/status/:orderId — query payment status
 *   POST {basePath}/webhook         — receive provider webhooks
 * ```
 *
 * @param basePath — defaults to `'/pesa'`
 *
 * Usage without a framework adapter:
 * ```js
 *   Bun.serve({ fetch: pesa.mount });
 *   http.createServer((req, res) => { ... pesa.mount(webRequest) });
 * ```
 *
 * @example
 * // Next.js App Router
 * export const { GET, POST } = toNextJsHandler(pesa);
 *
 * // Elysia
 * app.use(pesaPlugin(pesa, { prefix: '/api/pesa' }));
 *
 * // Express
 * app.use('/api/pesa', toPesaRouter(pesa));
 *
 * // Raw Bun
 * Bun.serve({ fetch: pesa.mount });
 */
export function createPesaHandler(
  pesa: PesaHandlerTarget,
  basePath = '/pesa',
): (request: Request) => Promise<Response> {
  return async (request: Request): Promise<Response> => {
    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // POST {basePath}/order — create a payment order
      const orderPath = `${basePath}/order`;
      if (request.method === 'POST' && (path === orderPath || path === `${orderPath}/`)) {
        const payload = (await request.json()) as CreateOrderPayload;
        validateCreateOrderPayload(payload);
        const result = await pesa.createOrder(payload);
        return Response.json(result, { status: 201 });
      }

      // GET {basePath}/status/:orderId — query payment status
      const statusPrefix = `${basePath}/status/`;
      if (request.method === 'GET' && path.startsWith(statusPrefix)) {
        const orderId = path.split(statusPrefix)[1]?.replace(/\/$/, '');
        if (!orderId) {
          return Response.json({ error: 'Missing orderId' }, { status: 400 });
        }
        const status = await pesa.getPaymentStatus(orderId);
        return Response.json({ status });
      }

      // POST {basePath}/webhook — receive provider webhook
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
