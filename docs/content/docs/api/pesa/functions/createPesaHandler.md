---
title: "Function: createPesaHandler()"
---

```ts
function createPesaHandler(pesa): (request) => Promise<Response>;
```

Defined in: [packages/pesa/src/handler.ts:45](https://github.com/borapesa/pesa/blob/7a2a3f8aafdb5924ee403a0a96f7d04dd7d2b7aa/packages/pesa/src/handler.ts#L45)

Creates a generic fetch-like handler that can be mounted on any framework.

All routes are namespaced under `/pesa/` to avoid collisions with
application routes — following the same convention as better-auth's `/auth/`.

Routes:
  POST /pesa/order           — create a payment order
  GET  /pesa/status/:orderId — query payment status
  POST /pesa/webhook         — receive provider webhooks

Usage without a framework adapter:
  Bun.serve({ fetch: pesa.mount });
  http.createServer((req, res) => { ... pesa.mount(webRequest) });

## Parameters

| Parameter | Type |
| ------ | ------ |
| `pesa` | [`PesaHandlerTarget`](../interfaces/PesaHandlerTarget) |

## Returns

(`request`) => `Promise`\<`Response`\>

## Example

```ts
// Next.js App Router
export const { GET, POST } = toNextJsHandler(pesa);

// Elysia
app.use(pesaPlugin(pesa, { prefix: '/api/pesa' }));

// Express
app.use('/api/pesa', toPesaRouter(pesa));

// Raw Bun
Bun.serve({ fetch: pesa.mount });
```
