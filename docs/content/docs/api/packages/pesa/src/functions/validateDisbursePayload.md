---
title: "Function: validateDisbursePayload()"
---

# Function: validateDisbursePayload()

```ts
function validateDisbursePayload(payload): void;
```

Defined in: [packages/pesa/src/validate.ts:46](https://github.com/borapesa/pesa/blob/d5e3ce1bd76d0bcd3eae4880e0c1c2cb00933e6c/packages/pesa/src/validate.ts#L46)

Validate a DisbursePayload before forwarding to the provider.
Throws PesaValidationError on invalid input.

## Parameters

| Parameter | Type |
| ------ | ------ |
| `payload` | [`DisbursePayload`](../interfaces/DisbursePayload.md) |

## Returns

`void`
