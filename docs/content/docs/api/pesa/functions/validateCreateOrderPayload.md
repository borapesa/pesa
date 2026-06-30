---
title: "Function: validateCreateOrderPayload()"
---

```ts
function validateCreateOrderPayload(payload): void;
```

Defined in: [packages/pesa/src/validate.ts:12](https://github.com/borapesa/pesa/blob/fd0db8b0df993c6583d9e24a7ce47f1b6a556685/packages/pesa/src/validate.ts#L12)

Validate a CreateOrderPayload before forwarding to the provider.
Throws PesaValidationError on invalid input.

## Parameters

| Parameter | Type |
| ------ | ------ |
| `payload` | [`CreateOrderPayload`](../interfaces/CreateOrderPayload) |

## Returns

`void`
