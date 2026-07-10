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

Defined in: [packages/pesa/src/types/event.ts:23](https://github.com/borapesa/pesa/blob/d80176dbaeb846a33302a30c19d7d4eba629ed0c/packages/pesa/src/types/event.ts#L23)

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
