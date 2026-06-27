---
title: "Interface: DisbursePayload"
---

# Interface: DisbursePayload

Defined in: [packages/pesa/src/types/disbursement.ts:28](https://github.com/borapesa/pesa/blob/d5e3ce1bd76d0bcd3eae4880e0c1c2cb00933e6c/packages/pesa/src/types/disbursement.ts#L28)

Payload for sending a disbursement (B2C / wallet-out).

Pass this to [PesaInstance.disburse](PesaInstance.md#disburse) to send money to a
customer's mobile money wallet.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="amount"></a> `amount` | `number` | Amount in whole TZS. Must be > 0. | [packages/pesa/src/types/disbursement.ts:30](https://github.com/borapesa/pesa/blob/d5e3ce1bd76d0bcd3eae4880e0c1c2cb00933e6c/packages/pesa/src/types/disbursement.ts#L30) |
| <a id="currency"></a> `currency` | `"TZS"` | Currency code. Currently only `'TZS'`. | [packages/pesa/src/types/disbursement.ts:32](https://github.com/borapesa/pesa/blob/d5e3ce1bd76d0bcd3eae4880e0c1c2cb00933e6c/packages/pesa/src/types/disbursement.ts#L32) |
| <a id="recipient"></a> `recipient` | \{ `name?`: `string`; `network?`: [`MobileNetwork`](../type-aliases/MobileNetwork.md); `phone`: `string`; \} | Recipient details. | [packages/pesa/src/types/disbursement.ts:34](https://github.com/borapesa/pesa/blob/d5e3ce1bd76d0bcd3eae4880e0c1c2cb00933e6c/packages/pesa/src/types/disbursement.ts#L34) |
| `recipient.name?` | `string` | Recipient's full name (optional but recommended). | [packages/pesa/src/types/disbursement.ts:38](https://github.com/borapesa/pesa/blob/d5e3ce1bd76d0bcd3eae4880e0c1c2cb00933e6c/packages/pesa/src/types/disbursement.ts#L38) |
| `recipient.network?` | [`MobileNetwork`](../type-aliases/MobileNetwork.md) | Target mobile money network. | [packages/pesa/src/types/disbursement.ts:40](https://github.com/borapesa/pesa/blob/d5e3ce1bd76d0bcd3eae4880e0c1c2cb00933e6c/packages/pesa/src/types/disbursement.ts#L40) |
| `recipient.phone` | `string` | Mobile money phone number in MSISDN format: `255XXXXXXXXX`. | [packages/pesa/src/types/disbursement.ts:36](https://github.com/borapesa/pesa/blob/d5e3ce1bd76d0bcd3eae4880e0c1c2cb00933e6c/packages/pesa/src/types/disbursement.ts#L36) |
| <a id="reference"></a> `reference` | `string` | Your internal reference. Must be unique. | [packages/pesa/src/types/disbursement.ts:43](https://github.com/borapesa/pesa/blob/d5e3ce1bd76d0bcd3eae4880e0c1c2cb00933e6c/packages/pesa/src/types/disbursement.ts#L43) |
| <a id="remarks"></a> `remarks?` | `string` | Optional remarks / narration for the payout. | [packages/pesa/src/types/disbursement.ts:45](https://github.com/borapesa/pesa/blob/d5e3ce1bd76d0bcd3eae4880e0c1c2cb00933e6c/packages/pesa/src/types/disbursement.ts#L45) |
