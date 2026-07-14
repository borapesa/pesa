---
title: "Interface: DocStore"
---

Defined in: [packages/mcp/src/content.ts:21](https://github.com/borapesa/pesa/blob/c75801713de76259f5fc4269849309a91857c509/packages/mcp/src/content.ts#L21)

## Properties

| Property | Type | Defined in |
| ------ | ------ | ------ |
| <a id="entries"></a> `entries` | [`DocEntry`](DocEntry)[] | [packages/mcp/src/content.ts:22](https://github.com/borapesa/pesa/blob/c75801713de76259f5fc4269849309a91857c509/packages/mcp/src/content.ts#L22) |

## Methods

### allDocs()

```ts
allDocs(): Doc[];
```

Defined in: [packages/mcp/src/content.ts:26](https://github.com/borapesa/pesa/blob/c75801713de76259f5fc4269849309a91857c509/packages/mcp/src/content.ts#L26)

Load every page (cached after first call).

#### Returns

[`Doc`](Doc)[]

***

### getDoc()

```ts
getDoc(path): Doc;
```

Defined in: [packages/mcp/src/content.ts:24](https://github.com/borapesa/pesa/blob/c75801713de76259f5fc4269849309a91857c509/packages/mcp/src/content.ts#L24)

Load a single page by manifest path. Throws on unknown paths.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `path` | `string` |

#### Returns

[`Doc`](Doc)
