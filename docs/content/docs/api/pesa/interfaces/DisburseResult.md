---
title: "Interface: DisburseResult"
---

Defined in: [packages/pesa/src/types/disbursement.ts:79](https://github.com/borapesa/pesa/blob/e1b0c17945c282a80288d2c9b1806ce515062340/packages/pesa/src/types/disbursement.ts#L79)

Result returned after initiating a disbursement.

## Example

```ts
const result = await pesa.disburse({
  amount:    50000,
  currency:  'TZS',
  reference: 'payout_001',
  recipient: { phone: '255754321098', network: 'MPESA' },
});

if (result.status === 'SUCCESS') {
  console.log(`Disbursement ${result.disbursementId} sent`);
}
```

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="disbursementid"></a> `disbursementId` | `string` | Provider-assigned disbursement ID. | [packages/pesa/src/types/disbursement.ts:81](https://github.com/borapesa/pesa/blob/e1b0c17945c282a80288d2c9b1806ce515062340/packages/pesa/src/types/disbursement.ts#L81) |
| <a id="raw"></a> `raw?` | `unknown` | Raw provider response. Escape hatch. | [packages/pesa/src/types/disbursement.ts:92](https://github.com/borapesa/pesa/blob/e1b0c17945c282a80288d2c9b1806ce515062340/packages/pesa/src/types/disbursement.ts#L92) |
| <a id="reference"></a> `reference` | `string` | Your reference, echoed back. | [packages/pesa/src/types/disbursement.ts:83](https://github.com/borapesa/pesa/blob/e1b0c17945c282a80288d2c9b1806ce515062340/packages/pesa/src/types/disbursement.ts#L83) |
| <a id="status"></a> `status` | `"SUCCESS"` \| `"FAILED"` \| `"QUEUED"` | Disbursement status. - `SUCCESS` — funds sent - `QUEUED` — processing, poll for updates - `FAILED` — definitively failed | [packages/pesa/src/types/disbursement.ts:90](https://github.com/borapesa/pesa/blob/e1b0c17945c282a80288d2c9b1806ce515062340/packages/pesa/src/types/disbursement.ts#L90) |
