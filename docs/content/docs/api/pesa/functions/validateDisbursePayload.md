---
title: "Function: validateDisbursePayload()"
---

```ts
function validateDisbursePayload(payload): void;
```

Defined in: [packages/pesa/src/validate.ts:46](https://github.com/borapesa/pesa/blob/f7ac5b710a6494b0dc7ab450f968667f9f555cf6/packages/pesa/src/validate.ts#L46)

Validate a DisbursePayload before forwarding to the provider.
Throws PesaValidationError on invalid input.

## Parameters

| Parameter | Type |
| ------ | ------ |
| `payload` | [`DisbursePayload`](../interfaces/DisbursePayload) |

## Returns

`void`
