---
title: "Function: validateCreateOrderPayload()"
---

```ts
function validateCreateOrderPayload(payload): void;
```

Defined in: [packages/pesa/src/validate.ts:57](https://github.com/borapesa/pesa/blob/5a6826bdcf9bdf66e849b708b5bc0fddc6567473/packages/pesa/src/validate.ts#L57)

Validate a CreateOrderPayload before forwarding to the provider.
Throws PesaValidationError on invalid input.

## Parameters

| Parameter | Type |
| ------ | ------ |
| `payload` | [`CreateOrderPayload`](../interfaces/CreateOrderPayload) |

## Returns

`void`
