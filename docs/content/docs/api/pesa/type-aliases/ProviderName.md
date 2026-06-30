---
title: "Type Alias: ProviderName"
---

```ts
type ProviderName = "selcom" | "azampay" | "clickpesa" | "dpo" | "pesapal" | "bogus";
```

Defined in: [packages/pesa/src/types/core.ts:64](https://github.com/borapesa/pesa/blob/fd0db8b0df993c6583d9e24a7ce47f1b6a556685/packages/pesa/src/types/core.ts#L64)

All supported payment providers.

Extensible via module augmentation. The `'bogus'` provider is a
test double — it doesn't represent a real payment gateway.

## Example

```ts
import type { ProviderName } from '@borapesa/pesa';

const provider: ProviderName = 'selcom';
```
