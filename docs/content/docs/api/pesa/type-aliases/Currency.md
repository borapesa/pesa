---
title: "Type Alias: Currency"
---

```ts
type Currency = "TZS" | "USD";
```

Defined in: [packages/pesa/src/types/core.ts:49](https://github.com/borapesa/pesa/blob/e1b0c17945c282a80288d2c9b1806ce515062340/packages/pesa/src/types/core.ts#L49)

Supported currencies.

Extensible via module augmentation.

Currently only `'TZS'` is fully supported. `'USD'` is available
experimentally via ClickPesa card payments but multi-currency is
not yet a stable v1 feature.

## Since

0.1.0 — `'TZS'`

## Example

```ts
// Future expansion:
// module augmentation in your app to add KES
declare module '@borapesa/pesa' {
  export type Currency = 'TZS' | 'USD' | 'KES';
}
```
