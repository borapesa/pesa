---
title: "Function: validateCreateOrderPayload()"
---

# Function: validateCreateOrderPayload()

```ts
function validateCreateOrderPayload(payload): void;
```

Defined in: [packages/pesa/src/validate.ts:12](https://github.com/borapesa/pesa/blob/d5e3ce1bd76d0bcd3eae4880e0c1c2cb00933e6c/packages/pesa/src/validate.ts#L12)

Validate a CreateOrderPayload before forwarding to the provider.
Throws PesaValidationError on invalid input.

## Parameters

| Parameter | Type |
| ------ | ------ |
| `payload` | [`CreateOrderPayload`](../interfaces/CreateOrderPayload.md) |

## Returns

`void`
