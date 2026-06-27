---
title: "Type Alias: PaymentEventType"
---

```ts
type PaymentEventType = 
  | "PAYMENT_SUCCESS"
  | "PAYMENT_FAILED"
  | "PAYMENT_PENDING"
  | "DISBURSEMENT_SUCCESS"
  | "DISBURSEMENT_FAILED";
```

Defined in: [packages/pesa/src/types/event.ts:23](https://github.com/borapesa/pesa/blob/b650282517ee25488b2499acb1ca4114c3e14358/packages/pesa/src/types/event.ts#L23)

Event types emitted after webhook verification and persistence.

Use these with [PesaInstance.on](../interfaces/PesaInstance.md#on) to react to payment activity:

## Example

```ts
pesa.on('PAYMENT_SUCCESS', async (event) => {
  await db.orders.update({
    id:     event.reference,
    status: 'paid',
  });
});

pesa.on('DISBURSEMENT_FAILED', async (event) => {
  await notifySupport(event);
});
```
