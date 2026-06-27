---
title: "Function: validateCreateOrderPayload()"
---

```ts
function validateCreateOrderPayload(payload): void;
```

Defined in: [packages/pesa/src/validate.ts:12](https://github.com/borapesa/pesa/blob/f7ac5b710a6494b0dc7ab450f968667f9f555cf6/packages/pesa/src/validate.ts#L12)

Validate a CreateOrderPayload before forwarding to the provider.
Throws PesaValidationError on invalid input.

## Parameters

| Parameter | Type |
| ------ | ------ |
| `payload` | [`CreateOrderPayload`](../interfaces/CreateOrderPayload) |

## Returns

`void`
