---
title: "Function: createPesaWebhookHandler()"
---

```ts
function createPesaWebhookHandler(pesa, basePath?): (request) => Promise<Response>;
```

Defined in: [packages/pesa/src/handler.ts:26](https://github.com/borapesa/pesa/blob/fd0db8b0df993c6583d9e24a7ce47f1b6a556685/packages/pesa/src/handler.ts#L26)

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
