---
title: "Function: tokenize()"
---

```ts
function tokenize(text): string[];
```

Defined in: [packages/mcp/src/search.ts:32](https://github.com/borapesa/pesa/blob/c75801713de76259f5fc4269849309a91857c509/packages/mcp/src/search.ts#L32)

Lowercase alphanumeric tokens, minimum two characters.

Trailing-s stemming (webhooks -> webhook) is applied identically to the
index and the query, so plural and singular forms always match. Stems are
prefixes of the original word, which keeps snippet lookup working.

## Parameters

| Parameter | Type |
| ------ | ------ |
| `text` | `string` |

## Returns

`string`[]
