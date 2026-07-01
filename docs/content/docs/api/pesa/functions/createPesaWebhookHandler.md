---
title: "Function: createPesaWebhookHandler()"
---

```ts
function createPesaWebhookHandler(pesa, basePath?): (request) => Promise<Response>;
```

Defined in: [packages/pesa/src/handler.ts:26](https://github.com/borapesa/pesa/blob/551532cd94bf0bd50a5389b05b48dbc5bf485d02/packages/pesa/src/handler.ts#L26)

Creates a webhook handler — the one route that must be publicly exposed.

Mount this behind no auth so providers can POST callbacks:

```ts
Bun.serve({ fetch: pesa.mountWebhook });
```

For order creation and status queries, use `pesa.createOrder()` and
`pesa.getPaymentStatus()` in your own routes behind your own auth.

## Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `pesa` | [`PesaHandlerTarget`](../interfaces/PesaHandlerTarget) | `undefined` | - |
| `basePath` | `string` | `'/pesa'` | — defaults to `'/pesa'` |

## Returns

(`request`) => `Promise`\<`Response`\>
