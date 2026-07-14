---
title: "Interface: DisbursePayload"
---

Defined in: [packages/pesa/src/types/disbursement.ts:36](https://github.com/borapesa/pesa/blob/c75801713de76259f5fc4269849309a91857c509/packages/pesa/src/types/disbursement.ts#L36)

Payload for sending a disbursement (B2C / wallet-out).

Pass this to [PesaInstance.disburse](PesaInstance.md#disburse) to send money to a
customer's mobile money wallet or bank account.

**Mobile money** — provide `recipient.phone`.
**Bank payout** — provide `recipient.accountNumber` + `recipient.bic`.

## Since

0.1.0 (mobile money), 0.2.0 (bank payout fields)

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="amount"></a> `amount` | `number` | Amount in whole TZS. Must be > 0. | [packages/pesa/src/types/disbursement.ts:38](https://github.com/borapesa/pesa/blob/c75801713de76259f5fc4269849309a91857c509/packages/pesa/src/types/disbursement.ts#L38) |
| <a id="currency"></a> `currency` | [`Currency`](../type-aliases/Currency) | Currency code. Currently only `'TZS'`. | [packages/pesa/src/types/disbursement.ts:40](https://github.com/borapesa/pesa/blob/c75801713de76259f5fc4269849309a91857c509/packages/pesa/src/types/disbursement.ts#L40) |
| <a id="recipient"></a> `recipient` | \{ `accountNumber?`: `string`; `bic?`: `string`; `name?`: `string`; `network?`: [`MobileNetwork`](../type-aliases/MobileNetwork); `phone?`: `string`; `transferType?`: `BankTransferType`; \} | Recipient details. | [packages/pesa/src/types/disbursement.ts:42](https://github.com/borapesa/pesa/blob/c75801713de76259f5fc4269849309a91857c509/packages/pesa/src/types/disbursement.ts#L42) |
| `recipient.accountNumber?` | `string` | Bank account number (for bank payouts). | [packages/pesa/src/types/disbursement.ts:50](https://github.com/borapesa/pesa/blob/c75801713de76259f5fc4269849309a91857c509/packages/pesa/src/types/disbursement.ts#L50) |
| `recipient.bic?` | `string` | Bank identifier code — fetch via `getBanks()` on supported providers. | [packages/pesa/src/types/disbursement.ts:52](https://github.com/borapesa/pesa/blob/c75801713de76259f5fc4269849309a91857c509/packages/pesa/src/types/disbursement.ts#L52) |
| `recipient.name?` | `string` | Recipient's full name (optional but recommended). | [packages/pesa/src/types/disbursement.ts:46](https://github.com/borapesa/pesa/blob/c75801713de76259f5fc4269849309a91857c509/packages/pesa/src/types/disbursement.ts#L46) |
| `recipient.network?` | [`MobileNetwork`](../type-aliases/MobileNetwork) | Target mobile money network. | [packages/pesa/src/types/disbursement.ts:48](https://github.com/borapesa/pesa/blob/c75801713de76259f5fc4269849309a91857c509/packages/pesa/src/types/disbursement.ts#L48) |
| `recipient.phone?` | `string` | Mobile money phone number in MSISDN format: `255XXXXXXXXX`. | [packages/pesa/src/types/disbursement.ts:44](https://github.com/borapesa/pesa/blob/c75801713de76259f5fc4269849309a91857c509/packages/pesa/src/types/disbursement.ts#L44) |
| `recipient.transferType?` | `BankTransferType` | Transfer type for bank payouts: `"ACH"` (default) or `"RTGS"`. | [packages/pesa/src/types/disbursement.ts:54](https://github.com/borapesa/pesa/blob/c75801713de76259f5fc4269849309a91857c509/packages/pesa/src/types/disbursement.ts#L54) |
| <a id="reference"></a> `reference` | `string` | Your internal reference. Must be unique. | [packages/pesa/src/types/disbursement.ts:57](https://github.com/borapesa/pesa/blob/c75801713de76259f5fc4269849309a91857c509/packages/pesa/src/types/disbursement.ts#L57) |
| <a id="remarks"></a> `remarks?` | `string` | Optional remarks / narration for the payout. | [packages/pesa/src/types/disbursement.ts:59](https://github.com/borapesa/pesa/blob/c75801713de76259f5fc4269849309a91857c509/packages/pesa/src/types/disbursement.ts#L59) |
