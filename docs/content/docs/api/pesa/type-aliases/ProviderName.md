---
title: "Type Alias: ProviderName"
---

```ts
type ProviderName = "selcom" | "azampay" | "clickpesa" | "dpo" | "pesapal" | "bogus";
```

Defined in: [packages/pesa/src/types/core.ts:61](https://github.com/borapesa/pesa/blob/7a2a3f8aafdb5924ee403a0a96f7d04dd7d2b7aa/packages/pesa/src/types/core.ts#L61)

All supported payment providers.

Extensible via module augmentation. The `'bogus'` provider is a
test double — it doesn't represent a real payment gateway.

## Example

```ts
import type { ProviderName } from '@borapesa/pesa';

const provider: ProviderName = 'selcom';
```
