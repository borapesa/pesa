---
title: "Interface: PesaPlugin"
---

Defined in: [packages/pesa/src/plugins/types.ts:36](https://github.com/borapesa/pesa/blob/7a2a3f8aafdb5924ee403a0a96f7d04dd7d2b7aa/packages/pesa/src/plugins/types.ts#L36)

Plugin lifecycle hooks.

Plugins are plain objects passed in the `plugins` array of PesaConfig.
They are composed in order at createPesa() time. No class inheritance.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="afterresponse"></a> `afterResponse?` | (`ctx`) => `Promise`\<[`ResponseContext`](ResponseContext)\> | Called after each response from a payment provider. Plugins can inspect the response and set `ctx.retry = true` to trigger a retry (handled by the retry plugin). | [packages/pesa/src/plugins/types.ts:51](https://github.com/borapesa/pesa/blob/7a2a3f8aafdb5924ee403a0a96f7d04dd7d2b7aa/packages/pesa/src/plugins/types.ts#L51) |
| <a id="beforerequest"></a> `beforeRequest?` | (`ctx`) => `Promise`\<[`RequestContext`](RequestContext)\> | Called before each outgoing request to a payment provider. Plugins can modify the request context (e.g., add idempotency keys). | [packages/pesa/src/plugins/types.ts:44](https://github.com/borapesa/pesa/blob/7a2a3f8aafdb5924ee403a0a96f7d04dd7d2b7aa/packages/pesa/src/plugins/types.ts#L44) |
| <a id="init"></a> `init?` | (`pesa`) => `void` | Called once at startup. Receives the pesa instance for extension. | [packages/pesa/src/plugins/types.ts:62](https://github.com/borapesa/pesa/blob/7a2a3f8aafdb5924ee403a0a96f7d04dd7d2b7aa/packages/pesa/src/plugins/types.ts#L62) |
| <a id="name"></a> `name` | `string` | Unique plugin name (used for logging and debugging). | [packages/pesa/src/plugins/types.ts:38](https://github.com/borapesa/pesa/blob/7a2a3f8aafdb5924ee403a0a96f7d04dd7d2b7aa/packages/pesa/src/plugins/types.ts#L38) |
| <a id="onpaymentevent"></a> `onPaymentEvent?` | (`event`) => `Promise`\<`void`\> | Called after a verified PaymentEvent is stored in the event store. Use for side effects: sending emails, updating your database, etc. | [packages/pesa/src/plugins/types.ts:57](https://github.com/borapesa/pesa/blob/7a2a3f8aafdb5924ee403a0a96f7d04dd7d2b7aa/packages/pesa/src/plugins/types.ts#L57) |
