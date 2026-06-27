---
title: "Interface: CancelOrderResult"
---

Defined in: [packages/pesa/src/types/order.ts:132](https://github.com/borapesa/pesa/blob/89c5b2383c6b1da743b0434254dc2d5edd11b0f2/packages/pesa/src/types/order.ts#L132)

Result returned after cancelling a payment order.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="cancelled"></a> `cancelled` | `boolean` | Whether the cancellation succeeded. | [packages/pesa/src/types/order.ts:136](https://github.com/borapesa/pesa/blob/89c5b2383c6b1da743b0434254dc2d5edd11b0f2/packages/pesa/src/types/order.ts#L136) |
| <a id="message"></a> `message?` | `string` | Optional human-readable message from the provider. | [packages/pesa/src/types/order.ts:138](https://github.com/borapesa/pesa/blob/89c5b2383c6b1da743b0434254dc2d5edd11b0f2/packages/pesa/src/types/order.ts#L138) |
| <a id="orderid"></a> `orderId` | `string` | The cancelled order ID. | [packages/pesa/src/types/order.ts:134](https://github.com/borapesa/pesa/blob/89c5b2383c6b1da743b0434254dc2d5edd11b0f2/packages/pesa/src/types/order.ts#L134) |
| <a id="raw"></a> `raw?` | `unknown` | Raw provider response. | [packages/pesa/src/types/order.ts:140](https://github.com/borapesa/pesa/blob/89c5b2383c6b1da743b0434254dc2d5edd11b0f2/packages/pesa/src/types/order.ts#L140) |
