---
title: "Function: search()"
---

```ts
function search(
   index, 
   query, 
   limit?): SearchResult[];
```

Defined in: [packages/mcp/src/search.ts:95](https://github.com/borapesa/pesa/blob/c75801713de76259f5fc4269849309a91857c509/packages/mcp/src/search.ts#L95)

Rank docs against a keyword query.

Weights: title/description hits dominate, then headings and the page
path, then body term frequency. Guides outrank generated API reference
pages at equal score so agents land on conceptual pages first.

## Parameters

| Parameter | Type | Default value |
| ------ | ------ | ------ |
| `index` | [`SearchIndex`](../interfaces/SearchIndex) | `undefined` |
| `query` | `string` | `undefined` |
| `limit` | `number` | `8` |

## Returns

[`SearchResult`](../interfaces/SearchResult)[]
