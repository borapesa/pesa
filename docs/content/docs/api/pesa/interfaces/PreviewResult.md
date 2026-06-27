---
title: "Interface: PreviewResult"
---

Defined in: [packages/pesa/src/types/preview.ts:22](https://github.com/borapesa/pesa/blob/f7ac5b710a6494b0dc7ab450f968667f9f555cf6/packages/pesa/src/types/preview.ts#L22)

Result of a preview / dry-run validation before committing an action.

Use `pesa.previewOrder()` or `pesa.previewDisburse()` to validate
payloads and check fees before initiating real transactions.

## Example

```ts
if (pesa.previewOrder) {
  const preview = await pesa.previewOrder({
    amount: 15000, currency: 'TZS', reference: 'pre_001',
    customer: { name: 'Juma', phone: '255712345678' },
  });

  console.log(`Fee: TZS ${preview.fee}`);
  console.log(`Total: TZS ${15000 + (preview.fee ?? 0)}`);
}
```

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="fee"></a> `fee?` | `number` | Expected transaction fee in TZS, if available. | [packages/pesa/src/types/preview.ts:26](https://github.com/borapesa/pesa/blob/f7ac5b710a6494b0dc7ab450f968667f9f555cf6/packages/pesa/src/types/preview.ts#L26) |
| <a id="message"></a> `message?` | `string` | Optional human-readable message (e.g., error details). | [packages/pesa/src/types/preview.ts:28](https://github.com/borapesa/pesa/blob/f7ac5b710a6494b0dc7ab450f968667f9f555cf6/packages/pesa/src/types/preview.ts#L28) |
| <a id="raw"></a> `raw?` | `unknown` | Raw provider response. | [packages/pesa/src/types/preview.ts:30](https://github.com/borapesa/pesa/blob/f7ac5b710a6494b0dc7ab450f968667f9f555cf6/packages/pesa/src/types/preview.ts#L30) |
| <a id="valid"></a> `valid` | `boolean` | Whether the payload is valid. | [packages/pesa/src/types/preview.ts:24](https://github.com/borapesa/pesa/blob/f7ac5b710a6494b0dc7ab450f968667f9f555cf6/packages/pesa/src/types/preview.ts#L24) |
