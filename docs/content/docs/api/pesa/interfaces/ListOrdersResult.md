---
title: "Interface: ListOrdersResult"
---

Defined in: [packages/pesa/src/types/order.ts:156](https://github.com/borapesa/pesa/blob/5a6826bdcf9bdf66e849b708b5bc0fddc6567473/packages/pesa/src/types/order.ts#L156)

Result returned when listing orders.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="orders"></a> `orders` | \{ `amount`: `number`; `createdAt`: `Date`; `currency`: [`Currency`](../type-aliases/Currency); `orderId`: `string`; `raw?`: `unknown`; `reference`: `string`; `status`: [`PaymentStatus`](../type-aliases/PaymentStatus); \}[] | Matching orders. | [packages/pesa/src/types/order.ts:158](https://github.com/borapesa/pesa/blob/5a6826bdcf9bdf66e849b708b5bc0fddc6567473/packages/pesa/src/types/order.ts#L158) |
| <a id="total"></a> `total` | `number` | Total number of matching orders (before limit/offset). | [packages/pesa/src/types/order.ts:168](https://github.com/borapesa/pesa/blob/5a6826bdcf9bdf66e849b708b5bc0fddc6567473/packages/pesa/src/types/order.ts#L168) |
