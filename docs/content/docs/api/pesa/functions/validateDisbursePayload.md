---
title: "Function: validateDisbursePayload()"
---

```ts
function validateDisbursePayload(payload): void;
```

Defined in: [packages/pesa/src/validate.ts:46](https://github.com/borapesa/pesa/blob/7a2a3f8aafdb5924ee403a0a96f7d04dd7d2b7aa/packages/pesa/src/validate.ts#L46)

Validate a DisbursePayload before forwarding to the provider.
Throws PesaValidationError on invalid input.

## Parameters

| Parameter | Type |
| ------ | ------ |
| `payload` | [`DisbursePayload`](../interfaces/DisbursePayload) |

## Returns

`void`
