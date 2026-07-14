---
title: "Interface: PesaPlugin"
---

Defined in: [packages/pesa/src/plugins/types.ts:36](https://github.com/borapesa/pesa/blob/c75801713de76259f5fc4269849309a91857c509/packages/pesa/src/plugins/types.ts#L36)

Plugin lifecycle hooks.

Plugins are plain objects passed in the `plugins` array of PesaConfig.
They are composed in order at createPesa() time. No class inheritance.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="afterresponse"></a> `afterResponse?` | (`ctx`) => `Promise`\<[`ResponseContext`](ResponseContext)\> | Called after each response from a payment provider. Plugins can inspect the response and set `ctx.retry = true` to trigger a retry (handled by the retry plugin). | [packages/pesa/src/plugins/types.ts:51](https://github.com/borapesa/pesa/blob/c75801713de76259f5fc4269849309a91857c509/packages/pesa/src/plugins/types.ts#L51) |
| <a id="beforerequest"></a> `beforeRequest?` | (`ctx`) => `Promise`\<[`RequestContext`](RequestContext)\> | Called before each outgoing request to a payment provider. Plugins can modify the request context (e.g., add idempotency keys). | [packages/pesa/src/plugins/types.ts:44](https://github.com/borapesa/pesa/blob/c75801713de76259f5fc4269849309a91857c509/packages/pesa/src/plugins/types.ts#L44) |
| <a id="init"></a> `init?` | (`pesa`) => `void` | Called once at startup. Receives the pesa instance for extension. | [packages/pesa/src/plugins/types.ts:80](https://github.com/borapesa/pesa/blob/c75801713de76259f5fc4269849309a91857c509/packages/pesa/src/plugins/types.ts#L80) |
| <a id="name"></a> `name` | `string` | Unique plugin name (used for logging and debugging). | [packages/pesa/src/plugins/types.ts:38](https://github.com/borapesa/pesa/blob/c75801713de76259f5fc4269849309a91857c509/packages/pesa/src/plugins/types.ts#L38) |
| <a id="onerror"></a> `onError?` | (`error`, `ctx`) => `Promise`\<[`ResponseContext`](ResponseContext) \| `undefined`\> | Called when a provider request throws an error. Plugins can inspect the error and set `ctx.retry = true` + a delay in `ctx.metadata.retryDelayMs` to trigger a retry. If no plugin sets `retry = true`, the error is re-thrown. **Since** 0.6.0 | [packages/pesa/src/plugins/types.ts:62](https://github.com/borapesa/pesa/blob/c75801713de76259f5fc4269849309a91857c509/packages/pesa/src/plugins/types.ts#L62) |
| <a id="onpaymentevent"></a> `onPaymentEvent?` | (`event`) => `Promise`\<`void`\> | Called **before** a verified PaymentEvent is persisted to the event store. Throw to reject the event — it will bubble up as a webhook error and the event will not be saved. Do **not** query the event store for this event here — it hasn't been persisted yet. Use for: webhook deduplication, custom verification, spam filtering. For side effects after persistence, register a [PesaInstance.on](PesaInstance.md#on) handler instead. | [packages/pesa/src/plugins/types.ts:75](https://github.com/borapesa/pesa/blob/c75801713de76259f5fc4269849309a91857c509/packages/pesa/src/plugins/types.ts#L75) |
