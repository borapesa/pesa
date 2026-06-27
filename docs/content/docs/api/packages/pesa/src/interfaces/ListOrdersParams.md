---
title: "Interface: ListOrdersParams"
---

# Interface: ListOrdersParams

Defined in: [packages/pesa/src/types/order.ts:144](https://github.com/borapesa/pesa/blob/d5e3ce1bd76d0bcd3eae4880e0c1c2cb00933e6c/packages/pesa/src/types/order.ts#L144)

Parameters for listing payment orders.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="fromdate"></a> `fromDate?` | `Date` | Filter orders created on or after this date. | [packages/pesa/src/types/order.ts:146](https://github.com/borapesa/pesa/blob/d5e3ce1bd76d0bcd3eae4880e0c1c2cb00933e6c/packages/pesa/src/types/order.ts#L146) |
| <a id="limit"></a> `limit?` | `number` | Maximum number of orders to return. | [packages/pesa/src/types/order.ts:150](https://github.com/borapesa/pesa/blob/d5e3ce1bd76d0bcd3eae4880e0c1c2cb00933e6c/packages/pesa/src/types/order.ts#L150) |
| <a id="offset"></a> `offset?` | `number` | Number of orders to skip (for pagination). | [packages/pesa/src/types/order.ts:152](https://github.com/borapesa/pesa/blob/d5e3ce1bd76d0bcd3eae4880e0c1c2cb00933e6c/packages/pesa/src/types/order.ts#L152) |
| <a id="todate"></a> `toDate?` | `Date` | Filter orders created on or before this date. | [packages/pesa/src/types/order.ts:148](https://github.com/borapesa/pesa/blob/d5e3ce1bd76d0bcd3eae4880e0c1c2cb00933e6c/packages/pesa/src/types/order.ts#L148) |
