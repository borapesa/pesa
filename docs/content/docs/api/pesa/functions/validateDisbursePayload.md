---
title: "Function: validateDisbursePayload()"
---

```ts
function validateDisbursePayload(payload): void;
```

Defined in: [packages/pesa/src/validate.ts:46](https://github.com/borapesa/pesa/blob/fd0db8b0df993c6583d9e24a7ce47f1b6a556685/packages/pesa/src/validate.ts#L46)

Validate a DisbursePayload before forwarding to the provider.
Throws PesaValidationError on invalid input.

## Parameters

| Parameter | Type |
| ------ | ------ |
| `payload` | [`DisbursePayload`](../interfaces/DisbursePayload) |

## Returns

`void`
