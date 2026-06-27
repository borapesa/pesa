---
title: "Interface: CancelOrderResult"
---

# Interface: CancelOrderResult

Defined in: [packages/pesa/src/types/order.ts:132](https://github.com/borapesa/pesa/blob/d5e3ce1bd76d0bcd3eae4880e0c1c2cb00933e6c/packages/pesa/src/types/order.ts#L132)

Result returned after cancelling a payment order.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="cancelled"></a> `cancelled` | `boolean` | Whether the cancellation succeeded. | [packages/pesa/src/types/order.ts:136](https://github.com/borapesa/pesa/blob/d5e3ce1bd76d0bcd3eae4880e0c1c2cb00933e6c/packages/pesa/src/types/order.ts#L136) |
| <a id="message"></a> `message?` | `string` | Optional human-readable message from the provider. | [packages/pesa/src/types/order.ts:138](https://github.com/borapesa/pesa/blob/d5e3ce1bd76d0bcd3eae4880e0c1c2cb00933e6c/packages/pesa/src/types/order.ts#L138) |
| <a id="orderid"></a> `orderId` | `string` | The cancelled order ID. | [packages/pesa/src/types/order.ts:134](https://github.com/borapesa/pesa/blob/d5e3ce1bd76d0bcd3eae4880e0c1c2cb00933e6c/packages/pesa/src/types/order.ts#L134) |
| <a id="raw"></a> `raw?` | `unknown` | Raw provider response. | [packages/pesa/src/types/order.ts:140](https://github.com/borapesa/pesa/blob/d5e3ce1bd76d0bcd3eae4880e0c1c2cb00933e6c/packages/pesa/src/types/order.ts#L140) |
