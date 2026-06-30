import { describe, expect, it } from 'vitest';
import type { PesaHandlerTarget } from './handler';
import { createPesaHandler } from './handler';

function mockPesa(overrides: Partial<PesaHandlerTarget> = {}): PesaHandlerTarget {
  return {
    createOrder: async () => ({
      orderId: 'test_123',
      reference: 'ref_1',
      status: 'SUCCESS',
      ussdPushInitiated: true,
    }),
    getPaymentStatus: async () => 'SUCCESS',
    handleWebhook: async () => {},
    on: () => {},
    ...overrides,
  };
}

describe('createPesaHandler', () => {
  // ── POST /pesa/order ────────────────────────────────────────────

  it('routes POST {basePath}/order to createOrder and returns 201', async () => {
    const handler = createPesaHandler(mockPesa(), '/custom');

    const req = new Request('http://localhost/custom/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: 15000,
        currency: 'TZS',
        reference: 'ref_1',
        customer: { name: 'Juma', phone: '255712345678' },
      }),
    });

    const res = await handler(req);
    expect(res.status).toBe(201);
  });

  it('routes POST /pesa/order to createOrder and returns 201', async () => {
    const handler = createPesaHandler(mockPesa());

    const req = new Request('http://localhost/pesa/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: 15000,
        currency: 'TZS',
        reference: 'ref_1',
        customer: { name: 'Juma', phone: '255712345678' },
      }),
    });

    const res = await handler(req);
    expect(res.status).toBe(201);

    const body = (await res.json()) as { status: string };
    expect(body.status).toBe('SUCCESS');
  });

  // ── GET /pesa/status/:orderId ────────────────────────────────────

  it('routes GET /pesa/status/:orderId to getPaymentStatus', async () => {
    const handler = createPesaHandler(mockPesa());

    const req = new Request('http://localhost/pesa/status/test_123');
    const res = await handler(req);
    const body = (await res.json()) as { status: string };

    expect(res.status).toBe(200);
    expect(body.status).toBe('SUCCESS');
  });

  it('returns 400 for GET /pesa/status/ with no orderId', async () => {
    const handler = createPesaHandler(mockPesa());

    const req = new Request('http://localhost/pesa/status/');
    const res = await handler(req);

    expect(res.status).toBe(400);
  });

  // ── POST /pesa/webhook ───────────────────────────────────────────

  it('routes POST /pesa/webhook to handleWebhook and returns 200', async () => {
    const handler = createPesaHandler(mockPesa());

    const req = new Request('http://localhost/pesa/webhook', {
      method: 'POST',
      body: JSON.stringify({ event: 'PAYMENT SUCCESS', data: { status: 'SUCCESS' } }),
    });

    const res = await handler(req);
    expect(res.status).toBe(200);
  });

  it('handles webhook with custom headers', async () => {
    let receivedHeaders: Record<string, string> = {};
    const handler = createPesaHandler(
      mockPesa({
        handleWebhook: async (_body, headers) => {
          receivedHeaders = headers;
        },
      }),
    );

    const req = new Request('http://localhost/pesa/webhook', {
      method: 'POST',
      headers: { 'X-Signature': 'abc123', 'Content-Type': 'application/json' },
      body: JSON.stringify({ test: true }),
    });

    await handler(req);
    expect(receivedHeaders['x-signature']).toBe('abc123');
  });

  // ── Error handling ──────────────────────────────────────────────

  it('returns 401 when provider throws PesaWebhookError', async () => {
    const { PesaWebhookError } = await import('./errors');

    const handler = createPesaHandler(
      mockPesa({
        handleWebhook: async () => {
          throw new PesaWebhookError('bad signature');
        },
      }),
    );

    const req = new Request('http://localhost/pesa/webhook', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const res = await handler(req);
    expect(res.status).toBe(401);
  });

  it('returns 500 for unexpected errors', async () => {
    const handler = createPesaHandler(
      mockPesa({
        handleWebhook: async () => {
          throw new Error('boom');
        },
      }),
    );

    const req = new Request('http://localhost/pesa/webhook', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const res = await handler(req);
    expect(res.status).toBe(500);
  });

  it('returns generic 500 for non-Error throws', async () => {
    const handler = createPesaHandler(
      mockPesa({
        handleWebhook: async () => {
          throw 'raw string error';
        },
      }),
    );

    const req = new Request('http://localhost/pesa/webhook', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const res = await handler(req);
    expect(res.status).toBe(500);

    const body = (await res.json()) as { error: string };
    expect(body.error).toBe('Internal Server Error');
  });

  // ── Unknown routes ───────────────────────────────────────────────

  it('returns 404 for unknown routes', async () => {
    const handler = createPesaHandler(mockPesa());

    const req = new Request('http://localhost/unknown');
    const res = await handler(req);

    expect(res.status).toBe(404);
  });
});
