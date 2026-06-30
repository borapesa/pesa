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

Defined in: [packages/pesa/src/types/order.ts:24](https://github.com/borapesa/pesa/blob/bb0341345be96209d9f1026440a10cf3f86d0e28/packages/pesa/src/types/order.ts#L24)

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
