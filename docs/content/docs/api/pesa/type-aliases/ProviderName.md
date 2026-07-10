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

Defined in: [packages/pesa/src/types/core.ts:64](https://github.com/borapesa/pesa/blob/d80176dbaeb846a33302a30c19d7d4eba629ed0c/packages/pesa/src/types/core.ts#L64)

All supported payment providers.

Extensible via module augmentation. The `'bogus'` provider is a
test double — it doesn't represent a real payment gateway.

## Example

```ts
import type { ProviderName } from '@borapesa/pesa';

const provider: ProviderName = 'selcom';
```
