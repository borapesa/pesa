---
title: "Type Alias: Currency"
---

```ts
type Currency = "TZS";
```

Defined in: [packages/pesa/src/types/core.ts:44](https://github.com/borapesa/pesa/blob/f7ac5b710a6494b0dc7ab450f968667f9f555cf6/packages/pesa/src/types/core.ts#L44)

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
