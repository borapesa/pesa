---
title: "Interface: RequestContext"
---

# Interface: RequestContext

Defined in: [packages/pesa/src/plugins/types.ts:10](https://github.com/borapesa/pesa/blob/d5e3ce1bd76d0bcd3eae4880e0c1c2cb00933e6c/packages/pesa/src/plugins/types.ts#L10)

Context passed to beforeRequest hooks.
Allows plugins to inspect and modify the outgoing request.

## Properties

| Property | Type | Defined in |
| ------ | ------ | ------ |
| <a id="headers"></a> `headers` | `Record`\<`string`, `string`\> | [packages/pesa/src/plugins/types.ts:13](https://github.com/borapesa/pesa/blob/d5e3ce1bd76d0bcd3eae4880e0c1c2cb00933e6c/packages/pesa/src/plugins/types.ts#L13) |
| <a id="metadata"></a> `metadata` | `Record`\<`string`, `unknown`\> | [packages/pesa/src/plugins/types.ts:14](https://github.com/borapesa/pesa/blob/d5e3ce1bd76d0bcd3eae4880e0c1c2cb00933e6c/packages/pesa/src/plugins/types.ts#L14) |
| <a id="operation"></a> `operation` | `"createOrder"` \| `"disburse"` \| `"refund"` \| `"cancelOrder"` | [packages/pesa/src/plugins/types.ts:11](https://github.com/borapesa/pesa/blob/d5e3ce1bd76d0bcd3eae4880e0c1c2cb00933e6c/packages/pesa/src/plugins/types.ts#L11) |
| <a id="payload"></a> `payload` | \| [`CreateOrderPayload`](CreateOrderPayload.md) \| [`DisbursePayload`](DisbursePayload.md) \| `Record`\<`string`, `unknown`\> | [packages/pesa/src/plugins/types.ts:12](https://github.com/borapesa/pesa/blob/d5e3ce1bd76d0bcd3eae4880e0c1c2cb00933e6c/packages/pesa/src/plugins/types.ts#L12) |
