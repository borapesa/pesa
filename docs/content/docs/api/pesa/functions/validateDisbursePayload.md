---
title: "Function: validateDisbursePayload()"
---

```ts
function validateDisbursePayload(payload): void;
```

Defined in: [packages/pesa/src/validate.ts:46](https://github.com/borapesa/pesa/blob/baa979229e12b20ccff1c404ff60a42226191e08/packages/pesa/src/validate.ts#L46)

Validate a DisbursePayload before forwarding to the provider.
Throws PesaValidationError on invalid input.

## Parameters

| Parameter | Type |
| ------ | ------ |
| `payload` | [`DisbursePayload`](../interfaces/DisbursePayload) |

## Returns

`void`
