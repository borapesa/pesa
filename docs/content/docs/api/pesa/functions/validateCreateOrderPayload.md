---
title: "Function: validateCreateOrderPayload()"
---

```ts
function validateCreateOrderPayload(payload): void;
```

Defined in: [packages/pesa/src/validate.ts:57](https://github.com/borapesa/pesa/blob/551532cd94bf0bd50a5389b05b48dbc5bf485d02/packages/pesa/src/validate.ts#L57)

Validate a CreateOrderPayload before forwarding to the provider.
Throws PesaValidationError on invalid input.

## Parameters

| Parameter | Type |
| ------ | ------ |
| `payload` | [`CreateOrderPayload`](../interfaces/CreateOrderPayload) |

## Returns

`void`
