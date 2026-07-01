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

Defined in: [packages/pesa/src/types/core.ts:64](https://github.com/borapesa/pesa/blob/551532cd94bf0bd50a5389b05b48dbc5bf485d02/packages/pesa/src/types/core.ts#L64)

All supported payment providers.

Extensible via module augmentation. The `'bogus'` provider is a
test double — it doesn't represent a real payment gateway.

## Example

```ts
import type { ProviderName } from '@borapesa/pesa';

const provider: ProviderName = 'selcom';
```
