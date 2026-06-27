---
title: "Interface: NameLookupResult"
---

Defined in: [packages/pesa/src/types/preview.ts:47](https://github.com/borapesa/pesa/blob/89c5b2383c6b1da743b0434254dc2d5edd11b0f2/packages/pesa/src/types/preview.ts#L47)

Result of a name lookup — resolves the account holder name
for a phone number or bank account before disbursing.

## Example

```ts
if (pesa.getNameLookup) {
  const lookup = await pesa.getNameLookup('255712345678');
  if (lookup.found) {
    console.log(`Account: ${lookup.accountName}`);
  }
}
```

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="accountname"></a> `accountName?` | `string` | Account holder's name, if found. | [packages/pesa/src/types/preview.ts:51](https://github.com/borapesa/pesa/blob/89c5b2383c6b1da743b0434254dc2d5edd11b0f2/packages/pesa/src/types/preview.ts#L51) |
| <a id="accountnumber"></a> `accountNumber?` | `string` | Account number / phone number. | [packages/pesa/src/types/preview.ts:53](https://github.com/borapesa/pesa/blob/89c5b2383c6b1da743b0434254dc2d5edd11b0f2/packages/pesa/src/types/preview.ts#L53) |
| <a id="found"></a> `found` | `boolean` | Whether the account was found. | [packages/pesa/src/types/preview.ts:49](https://github.com/borapesa/pesa/blob/89c5b2383c6b1da743b0434254dc2d5edd11b0f2/packages/pesa/src/types/preview.ts#L49) |
| <a id="message"></a> `message?` | `string` | Optional human-readable message. | [packages/pesa/src/types/preview.ts:57](https://github.com/borapesa/pesa/blob/89c5b2383c6b1da743b0434254dc2d5edd11b0f2/packages/pesa/src/types/preview.ts#L57) |
| <a id="provider"></a> `provider?` | `string` | Provider or network name (e.g., 'MPESA', 'CRDB'). | [packages/pesa/src/types/preview.ts:55](https://github.com/borapesa/pesa/blob/89c5b2383c6b1da743b0434254dc2d5edd11b0f2/packages/pesa/src/types/preview.ts#L55) |
| <a id="raw"></a> `raw?` | `unknown` | Raw provider response. | [packages/pesa/src/types/preview.ts:59](https://github.com/borapesa/pesa/blob/89c5b2383c6b1da743b0434254dc2d5edd11b0f2/packages/pesa/src/types/preview.ts#L59) |
