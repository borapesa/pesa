---
title: "Type Alias: Currency"
---

```ts
type Currency = "TZS";
```

Defined in: [packages/pesa/src/types/core.ts:44](https://github.com/borapesa/pesa/blob/703ad04940b87d46533e9a8c6c257b94e3c1cbe3/packages/pesa/src/types/core.ts#L44)

Supported currencies.

Currently TZS-only. Multi-currency support will be added post-v1.0
based on community demand. Extensible via module augmentation.

## Example

```ts
// Future expansion (post-v1):
// module augmentation in your app to add KES
declare module '@borapesa/pesa' {
  export type Currency = 'TZS' | 'KES';
}
```
