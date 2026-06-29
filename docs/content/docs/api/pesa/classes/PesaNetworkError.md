---
title: "Class: PesaNetworkError"
---

Defined in: [packages/pesa/src/errors.ts:36](https://github.com/borapesa/pesa/blob/d892f187ba44a1149cf97cf1dee8e873c4c12f3b/packages/pesa/src/errors.ts#L36)

Thrown when a provider API is unreachable or returns a network error.

## Extends

- [`PesaError`](PesaError)

## Constructors

### Constructor

```ts
new PesaNetworkError(message): PesaNetworkError;
```

Defined in: [packages/pesa/src/errors.ts:37](https://github.com/borapesa/pesa/blob/d892f187ba44a1149cf97cf1dee8e873c4c12f3b/packages/pesa/src/errors.ts#L37)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `message` | `string` |

#### Returns

`PesaNetworkError`

#### Overrides

[`PesaError`](PesaError).[`constructor`](PesaError.md#constructor)

## Properties

| Property | Modifier | Type | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="code"></a> `code` | `readonly` | `string` | [`PesaError`](PesaError).[`code`](PesaError.md#code) | [packages/pesa/src/errors.ts:12](https://github.com/borapesa/pesa/blob/d892f187ba44a1149cf97cf1dee8e873c4c12f3b/packages/pesa/src/errors.ts#L12) |
