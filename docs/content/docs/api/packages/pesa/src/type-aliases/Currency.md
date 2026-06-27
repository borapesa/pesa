---
title: "Type Alias: Currency"
---

# Type Alias: Currency

```ts
type Currency = "TZS";
```

Defined in: [packages/pesa/src/types/core.ts:44](https://github.com/borapesa/pesa/blob/d5e3ce1bd76d0bcd3eae4880e0c1c2cb00933e6c/packages/pesa/src/types/core.ts#L44)

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
