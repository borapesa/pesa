---
title: "Type Alias: ProviderName"
---

```ts
type ProviderName = 
  | "selcom"
  | "azampay"
  | "clickpesa"
  | "snippe"
  | "dpo"
  | "pesapal"
  | "bogus";
```

Defined in: [packages/pesa/src/types/core.ts:64](https://github.com/borapesa/pesa/blob/f7f1079d11b2fc8432fd4be7b3c2a35c6c7f87ee/packages/pesa/src/types/core.ts#L64)

All supported payment providers.

Extensible via module augmentation. The `'bogus'` provider is a
test double — it doesn't represent a real payment gateway.

## Example

```ts
import type { ProviderName } from '@borapesa/pesa';

const provider: ProviderName = 'selcom';
```
