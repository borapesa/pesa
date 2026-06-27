---
title: "Interface: ListOrdersResult"
---

# Interface: ListOrdersResult

Defined in: [packages/pesa/src/types/order.ts:156](https://github.com/borapesa/pesa/blob/d5e3ce1bd76d0bcd3eae4880e0c1c2cb00933e6c/packages/pesa/src/types/order.ts#L156)

Result returned when listing orders.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="orders"></a> `orders` | \{ `amount`: `number`; `createdAt`: `Date`; `currency`: `"TZS"`; `orderId`: `string`; `raw?`: `unknown`; `reference`: `string`; `status`: [`PaymentStatus`](../type-aliases/PaymentStatus.md); \}[] | Matching orders. | [packages/pesa/src/types/order.ts:158](https://github.com/borapesa/pesa/blob/d5e3ce1bd76d0bcd3eae4880e0c1c2cb00933e6c/packages/pesa/src/types/order.ts#L158) |
| <a id="total"></a> `total` | `number` | Total number of matching orders (before limit/offset). | [packages/pesa/src/types/order.ts:168](https://github.com/borapesa/pesa/blob/d5e3ce1bd76d0bcd3eae4880e0c1c2cb00933e6c/packages/pesa/src/types/order.ts#L168) |
