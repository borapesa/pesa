---
title: "Type Alias: ProviderName"
---

# Type Alias: ProviderName

```ts
type ProviderName = "selcom" | "azampay" | "clickpesa" | "dpo" | "pesapal" | "bogus";
```

Defined in: [packages/pesa/src/types/core.ts:59](https://github.com/borapesa/pesa/blob/d5e3ce1bd76d0bcd3eae4880e0c1c2cb00933e6c/packages/pesa/src/types/core.ts#L59)

All supported payment providers.

Extensible via module augmentation. The `'bogus'` provider is a
test double — it doesn't represent a real payment gateway.

## Example

```ts
import type { ProviderName } from '@borapesa/pesa';

const provider: ProviderName = 'selcom';
```
