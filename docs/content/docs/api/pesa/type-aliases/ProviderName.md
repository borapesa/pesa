---
title: "Type Alias: ProviderName"
---

```ts
type ProviderName = "selcom" | "azampay" | "clickpesa" | "dpo" | "pesapal" | "bogus";
```

Defined in: [packages/pesa/src/types/core.ts:59](https://github.com/borapesa/pesa/blob/89c5b2383c6b1da743b0434254dc2d5edd11b0f2/packages/pesa/src/types/core.ts#L59)

All supported payment providers.

Extensible via module augmentation. The `'bogus'` provider is a
test double — it doesn't represent a real payment gateway.

## Example

```ts
import type { ProviderName } from '@borapesa/pesa';

const provider: ProviderName = 'selcom';
```
