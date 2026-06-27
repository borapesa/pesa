---
title: "Interface: DisburseResult"
---

Defined in: [packages/pesa/src/types/disbursement.ts:65](https://github.com/borapesa/pesa/blob/89c5b2383c6b1da743b0434254dc2d5edd11b0f2/packages/pesa/src/types/disbursement.ts#L65)

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
| <a id="disbursementid"></a> `disbursementId` | `string` | Provider-assigned disbursement ID. | [packages/pesa/src/types/disbursement.ts:67](https://github.com/borapesa/pesa/blob/89c5b2383c6b1da743b0434254dc2d5edd11b0f2/packages/pesa/src/types/disbursement.ts#L67) |
| <a id="raw"></a> `raw?` | `unknown` | Raw provider response. Escape hatch. | [packages/pesa/src/types/disbursement.ts:78](https://github.com/borapesa/pesa/blob/89c5b2383c6b1da743b0434254dc2d5edd11b0f2/packages/pesa/src/types/disbursement.ts#L78) |
| <a id="reference"></a> `reference` | `string` | Your reference, echoed back. | [packages/pesa/src/types/disbursement.ts:69](https://github.com/borapesa/pesa/blob/89c5b2383c6b1da743b0434254dc2d5edd11b0f2/packages/pesa/src/types/disbursement.ts#L69) |
| <a id="status"></a> `status` | `"SUCCESS"` \| `"FAILED"` \| `"QUEUED"` | Disbursement status. - `SUCCESS` — funds sent - `QUEUED` — processing, poll for updates - `FAILED` — definitively failed | [packages/pesa/src/types/disbursement.ts:76](https://github.com/borapesa/pesa/blob/89c5b2383c6b1da743b0434254dc2d5edd11b0f2/packages/pesa/src/types/disbursement.ts#L76) |
