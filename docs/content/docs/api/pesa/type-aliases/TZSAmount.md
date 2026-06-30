---
title: "Type Alias: TZSAmount"
---

```ts
type TZSAmount = number;
```

Defined in: [packages/pesa/src/types/core.ts:27](https://github.com/borapesa/pesa/blob/2a2bfc77e53f612f2116dfed02985155a049cb84/packages/pesa/src/types/core.ts#L27)

TZS amount as a whole integer. `15000` = TZS 15,000.

**Never use floats.** TZS has cents (senti) but digital/mobile
payment providers don't support fractional amounts on the consumer
side. Whole integers prevent floating-point errors and match what
every Tanzanian payment API expects.

## Example

```ts
// ✅ Correct
const amount: TZSAmount = 15000;

// ❌ Wrong — will throw PesaValidationError
const amount: TZSAmount = 15000.50;
```
