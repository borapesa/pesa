---
title: "Function: createPesaHandler()"
---

```ts
function createPesaHandler(pesa): (request) => Promise<Response>;
```

Defined in: [packages/pesa/src/handler.ts:49](https://github.com/borapesa/pesa/blob/d892f187ba44a1149cf97cf1dee8e873c4c12f3b/packages/pesa/src/handler.ts#L49)

Creates a generic fetch-like handler that can be mounted on any framework.

All routes are namespaced under `/pesa/` to avoid collisions with
application routes — following the same convention as better-auth's `/auth/`.

Routes:
```
  POST /pesa/order           — create a payment order
  GET  /pesa/status/:orderId — query payment status
  POST /pesa/webhook         — receive provider webhooks
```

Usage without a framework adapter:
```js
  Bun.serve({ fetch: pesa.mount });
  http.createServer((req, res) => { ... pesa.mount(webRequest) });
```

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
