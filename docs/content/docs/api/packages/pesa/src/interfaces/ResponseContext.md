---
title: "Interface: ResponseContext"
---

# Interface: ResponseContext

Defined in: [packages/pesa/src/plugins/types.ts:21](https://github.com/borapesa/pesa/blob/d5e3ce1bd76d0bcd3eae4880e0c1c2cb00933e6c/packages/pesa/src/plugins/types.ts#L21)

Context passed to afterResponse hooks.
Allows plugins to inspect the provider response and decide on retries.

## Properties

| Property | Type | Defined in |
| ------ | ------ | ------ |
| <a id="durationms"></a> `durationMs` | `number` | [packages/pesa/src/plugins/types.ts:25](https://github.com/borapesa/pesa/blob/d5e3ce1bd76d0bcd3eae4880e0c1c2cb00933e6c/packages/pesa/src/plugins/types.ts#L25) |
| <a id="metadata"></a> `metadata` | `Record`\<`string`, `unknown`\> | [packages/pesa/src/plugins/types.ts:27](https://github.com/borapesa/pesa/blob/d5e3ce1bd76d0bcd3eae4880e0c1c2cb00933e6c/packages/pesa/src/plugins/types.ts#L27) |
| <a id="operation"></a> `operation` | `"createOrder"` \| `"disburse"` \| `"refund"` \| `"cancelOrder"` | [packages/pesa/src/plugins/types.ts:22](https://github.com/borapesa/pesa/blob/d5e3ce1bd76d0bcd3eae4880e0c1c2cb00933e6c/packages/pesa/src/plugins/types.ts#L22) |
| <a id="payload"></a> `payload` | \| [`CreateOrderPayload`](CreateOrderPayload.md) \| [`DisbursePayload`](DisbursePayload.md) \| `Record`\<`string`, `unknown`\> | [packages/pesa/src/plugins/types.ts:23](https://github.com/borapesa/pesa/blob/d5e3ce1bd76d0bcd3eae4880e0c1c2cb00933e6c/packages/pesa/src/plugins/types.ts#L23) |
| <a id="result"></a> `result` | \| [`OrderResult`](OrderResult.md) \| [`DisburseResult`](DisburseResult.md) \| `Record`\<`string`, `unknown`\> | [packages/pesa/src/plugins/types.ts:24](https://github.com/borapesa/pesa/blob/d5e3ce1bd76d0bcd3eae4880e0c1c2cb00933e6c/packages/pesa/src/plugins/types.ts#L24) |
| <a id="retry"></a> `retry` | `boolean` | [packages/pesa/src/plugins/types.ts:26](https://github.com/borapesa/pesa/blob/d5e3ce1bd76d0bcd3eae4880e0c1c2cb00933e6c/packages/pesa/src/plugins/types.ts#L26) |
