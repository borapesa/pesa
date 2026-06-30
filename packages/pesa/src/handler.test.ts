import { describe, expect, it } from 'vitest';
import type { PesaHandlerTarget } from './handler';
import { createPesaWebhookHandler } from './handler';

function mockPesa(overrides: Partial<PesaHandlerTarget> = {}): PesaHandlerTarget {
  return {
    handleWebhook: async () => {},
    on: () => {},
    ...overrides,
  };
}

describe('createPesaWebhookHandler', () => {
  // ── POST {basePath}/webhook ───────────────────────────────────────

  it('routes POST /pesa/webhook to handleWebhook and returns 200', async () => {
    const handler = createPesaWebhookHandler(mockPesa());

    const req = new Request('http://localhost/pesa/webhook', {
      method: 'POST',
      body: JSON.stringify({ event: 'PAYMENT SUCCESS', data: { status: 'SUCCESS' } }),
    });

    const res = await handler(req);
    expect(res.status).toBe(200);
  });

  it('routes POST with trailing slash /pesa/webhook/', async () => {
    const handler = createPesaWebhookHandler(mockPesa());

    const req = new Request('http://localhost/pesa/webhook/', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const res = await handler(req);
    expect(res.status).toBe(200);
  });

  it('routes POST with custom basePath', async () => {
    const handler = createPesaWebhookHandler(mockPesa(), '/api/payments');

    const req = new Request('http://localhost/api/payments/webhook', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const res = await handler(req);
    expect(res.status).toBe(200);
  });

  it('passes headers to handleWebhook', async () => {
    let receivedHeaders: Record<string, string> = {};
    const handler = createPesaWebhookHandler(
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

    const handler = createPesaWebhookHandler(
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
    const handler = createPesaWebhookHandler(
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
    const handler = createPesaWebhookHandler(
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

  it('returns 404 for non-webhook routes', async () => {
    const handler = createPesaWebhookHandler(mockPesa());

    const req = new Request('http://localhost/pesa/order', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const res = await handler(req);
    expect(res.status).toBe(404);
  });

  it('returns 404 for GET requests', async () => {
    const handler = createPesaWebhookHandler(mockPesa());

    const req = new Request('http://localhost/pesa/webhook');

    const res = await handler(req);
    expect(res.status).toBe(404);
  });
});
