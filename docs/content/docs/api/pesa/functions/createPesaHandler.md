---
title: "Function: createPesaHandler()"
---

```ts
function createPesaHandler(pesa, basePath?): (request) => Promise<Response>;
```

Defined in: [packages/pesa/src/handler.ts:51](https://github.com/borapesa/pesa/blob/b07aee7503efdb35e9de5a2777ab7a4f391cf081/packages/pesa/src/handler.ts#L51)

Creates a generic fetch-like handler that can be mounted on any framework.

All routes are namespaced under a base path to avoid collisions with
application routes — following the same convention as better-auth's `/auth/`.

Routes:
```
  POST {basePath}/order           — create a payment order
  GET  {basePath}/status/:orderId — query payment status
  POST {basePath}/webhook         — receive provider webhooks
```

## Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `pesa` | [`PesaHandlerTarget`](../interfaces/PesaHandlerTarget) | `undefined` | - |
| `basePath` | `string` | `'/pesa'` | — defaults to `'/pesa'` Usage without a framework adapter: `Bun.serve({ fetch: pesa.mount }); http.createServer((req, res) => { ... pesa.mount(webRequest) });` |

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
