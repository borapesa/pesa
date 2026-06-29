---
title: "Type Alias: ProviderName"
---

```ts
type ProviderName = "selcom" | "azampay" | "clickpesa" | "dpo" | "pesapal" | "bogus";
```

Defined in: [packages/pesa/src/types/core.ts:61](https://github.com/borapesa/pesa/blob/3de08d45a33185320b62b57cdb2941dba74b4d9f/packages/pesa/src/types/core.ts#L61)

All supported payment providers.

Extensible via module augmentation. The `'bogus'` provider is a
test double — it doesn't represent a real payment gateway.

## Example

```ts
import type { ProviderName } from '@borapesa/pesa';

const provider: ProviderName = 'selcom';
```
