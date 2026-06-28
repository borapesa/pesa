---
title: "Type Alias: MobileNetwork"
---

```ts
type MobileNetwork = "MPESA" | "TIGOPESA" | "AIRTELMONEY" | "HALOPESA" | "AZAMPESA";
```

Defined in: [packages/pesa/src/types/disbursement.ts:20](https://github.com/borapesa/pesa/blob/a805b581d73bcc0f93f26e929b723955868c1bad/packages/pesa/src/types/disbursement.ts#L20)

Supported mobile money networks for disbursement (B2C payouts).

## Example

```ts
await pesa.disburse({
  amount:    50000,
  currency:  'TZS',
  reference: 'payout_001',
  recipient: {
    phone:   '255754321098',
    name:    'Juma Ali',
    network: 'MPESA',
  },
});
```
