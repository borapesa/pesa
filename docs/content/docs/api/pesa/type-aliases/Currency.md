---
title: "Type Alias: Currency"
---

```ts
type Currency = "TZS" | "USD";
```

Defined in: [packages/pesa/src/types/core.ts:46](https://github.com/borapesa/pesa/blob/a805b581d73bcc0f93f26e929b723955868c1bad/packages/pesa/src/types/core.ts#L46)

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
