---
title: "Type Alias: Currency"
---

```ts
type Currency = "TZS" | "USD";
```

Defined in: [packages/pesa/src/types/core.ts:46](https://github.com/borapesa/pesa/blob/49ea5b664fa2d117c65866f1980324917cea45d1/packages/pesa/src/types/core.ts#L46)

Supported currencies.

Extensible via module augmentation.

## Since

0.1.0 — `'TZS'`

## Since

0.2.0 — `'USD'` (card payments via ClickPesa)

## Example

```ts
// Future expansion:
// module augmentation in your app to add KES
declare module '@borapesa/pesa' {
  export type Currency = 'TZS' | 'USD' | 'KES';
}
```
