---
title: "Type Alias: PaymentStatus"
---

```ts
type PaymentStatus = 
  | "PENDING"
  | "PROCESSING"
  | "SUCCESS"
  | "FAILED"
  | "CANCELLED"
  | "AMBIGUOUS";
```

Defined in: [packages/pesa/src/types/order.ts:24](https://github.com/borapesa/pesa/blob/d80176dbaeb846a33302a30c19d7d4eba629ed0c/packages/pesa/src/types/order.ts#L24)

Payment lifecycle statuses.

These are the **normalized** statuses the SDK exposes. Each provider
adapter maps its native statuses to these values, so application
code never has to handle provider-specific status strings.

**`AMBIGUOUS`** is a first-class status — it is a real Selcom
response meaning the transaction outcome is unknown. Normalizing it
to `PENDING` or `FAILED` would lose information. Applications
should poll when they receive `AMBIGUOUS`.

## Example

```ts
pesa.on('PAYMENT_SUCCESS', (event) => {
  if (event.status === 'SUCCESS') {
    // funds confirmed
  }
});
```
