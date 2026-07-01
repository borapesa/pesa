---
title: "Type Alias: Currency"
---

```ts
type Currency = "TZS" | "USD";
```

Defined in: [packages/pesa/src/types/core.ts:49](https://github.com/borapesa/pesa/blob/f7f1079d11b2fc8432fd4be7b3c2a35c6c7f87ee/packages/pesa/src/types/core.ts#L49)

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
