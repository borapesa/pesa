---
title: "Type Alias: ProviderName"
---

```ts
type ProviderName = "selcom" | "azampay" | "clickpesa" | "dpo" | "pesapal" | "bogus";
```

Defined in: [packages/pesa/src/types/core.ts:59](https://github.com/borapesa/pesa/blob/f7ac5b710a6494b0dc7ab450f968667f9f555cf6/packages/pesa/src/types/core.ts#L59)

All supported payment providers.

Extensible via module augmentation. The `'bogus'` provider is a
test double — it doesn't represent a real payment gateway.

## Example

```ts
import type { ProviderName } from '@borapesa/pesa';

const provider: ProviderName = 'selcom';
```
