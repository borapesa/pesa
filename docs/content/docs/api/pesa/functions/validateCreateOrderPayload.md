---
title: "Function: validateCreateOrderPayload()"
---

```ts
function validateCreateOrderPayload(payload): void;
```

Defined in: [packages/pesa/src/validate.ts:57](https://github.com/borapesa/pesa/blob/d80176dbaeb846a33302a30c19d7d4eba629ed0c/packages/pesa/src/validate.ts#L57)

Validate a CreateOrderPayload before forwarding to the provider.
Throws PesaValidationError on invalid input.

## Parameters

| Parameter | Type |
| ------ | ------ |
| `payload` | [`CreateOrderPayload`](../interfaces/CreateOrderPayload) |

## Returns

`void`
