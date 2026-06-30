---
title: "Interface: RefundResult"
---

Defined in: [packages/pesa/src/types/refund.ts:19](https://github.com/borapesa/pesa/blob/49ea5b664fa2d117c65866f1980324917cea45d1/packages/pesa/src/types/refund.ts#L19)

Result returned after initiating a refund.

Not all providers support refunds. Check capability via
`pesa.refund !== undefined` before calling.

## Example

```ts
if (pesa.refund) {
  const result = await pesa.refund('order_123', 5000);
  if (result.status === 'SUCCESS') {
    console.log(`Refund ${result.refundId} processed`);
  }
}
```

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="amount"></a> `amount` | `number` | Amount refunded in whole TZS. | [packages/pesa/src/types/refund.ts:25](https://github.com/borapesa/pesa/blob/49ea5b664fa2d117c65866f1980324917cea45d1/packages/pesa/src/types/refund.ts#L25) |
| <a id="message"></a> `message?` | `string` | Optional human-readable message from the provider. | [packages/pesa/src/types/refund.ts:34](https://github.com/borapesa/pesa/blob/49ea5b664fa2d117c65866f1980324917cea45d1/packages/pesa/src/types/refund.ts#L34) |
| <a id="orderid"></a> `orderId` | `string` | The original order ID being refunded. | [packages/pesa/src/types/refund.ts:23](https://github.com/borapesa/pesa/blob/49ea5b664fa2d117c65866f1980324917cea45d1/packages/pesa/src/types/refund.ts#L23) |
| <a id="raw"></a> `raw?` | `unknown` | Raw provider response. | [packages/pesa/src/types/refund.ts:36](https://github.com/borapesa/pesa/blob/49ea5b664fa2d117c65866f1980324917cea45d1/packages/pesa/src/types/refund.ts#L36) |
| <a id="refundid"></a> `refundId` | `string` | Provider-assigned refund ID. | [packages/pesa/src/types/refund.ts:21](https://github.com/borapesa/pesa/blob/49ea5b664fa2d117c65866f1980324917cea45d1/packages/pesa/src/types/refund.ts#L21) |
| <a id="status"></a> `status` | `"SUCCESS"` \| `"FAILED"` \| `"QUEUED"` | Refund status. - `SUCCESS` — refund processed - `QUEUED` — refund initiated, poll for updates - `FAILED` — refund failed | [packages/pesa/src/types/refund.ts:32](https://github.com/borapesa/pesa/blob/49ea5b664fa2d117c65866f1980324917cea45d1/packages/pesa/src/types/refund.ts#L32) |
