---
title: "Function: normalisePhone()"
---

```ts
function normalisePhone(input): string;
```

Defined in: [packages/pesa/src/validate.ts:22](https://github.com/borapesa/pesa/blob/551532cd94bf0bd50a5389b05b48dbc5bf485d02/packages/pesa/src/validate.ts#L22)

Normalise a Tanzania phone number to canonical MSISDN format (255XXXXXXXXX).

Accepts common local formats:
  "255781000000"  → "255781000000"
  "+255781000000" → "255781000000"
  "0781000000"    → "255781000000"
  "781000000"     → "255781000000"

Whitespace, dashes, and parentheses are stripped before validation.
The result is validated against the MSISDN regex before returning.

## Parameters

| Parameter | Type |
| ------ | ------ |
| `input` | `string` |

## Returns

`string`

## Throws

PesaValidationError if the number cannot be coerced to MSISDN.
