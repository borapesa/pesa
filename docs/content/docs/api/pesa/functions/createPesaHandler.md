---
title: "Function: createPesaHandler()"
---

```ts
function createPesaHandler(pesa): (request) => Promise<Response>;
```

Defined in: [packages/pesa/src/handler.ts:42](https://github.com/borapesa/pesa/blob/703ad04940b87d46533e9a8c6c257b94e3c1cbe3/packages/pesa/src/handler.ts#L42)

Creates a generic fetch-like handler that can be mounted on any framework.

Routes:
  POST /order           — create a payment order
  GET  /status/:orderId — query payment status
  POST /webhook         — receive provider webhooks

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
