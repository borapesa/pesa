---
title: "Class: PesaUnsupportedError"
---

Defined in: [packages/pesa/src/errors.ts:20](https://github.com/borapesa/pesa/blob/e1b0c17945c282a80288d2c9b1806ce515062340/packages/pesa/src/errors.ts#L20)

Thrown when a provider does not implement an optional operation.

## Extends

- [`PesaError`](PesaError)

## Constructors

### Constructor

```ts
new PesaUnsupportedError(message): PesaUnsupportedError;
```

Defined in: [packages/pesa/src/errors.ts:21](https://github.com/borapesa/pesa/blob/e1b0c17945c282a80288d2c9b1806ce515062340/packages/pesa/src/errors.ts#L21)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `message` | `string` |

#### Returns

`PesaUnsupportedError`

#### Overrides

[`PesaError`](PesaError).[`constructor`](PesaError.md#constructor)

## Properties

| Property | Modifier | Type | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="code"></a> `code` | `readonly` | `string` | [`PesaError`](PesaError).[`code`](PesaError.md#code) | [packages/pesa/src/errors.ts:12](https://github.com/borapesa/pesa/blob/e1b0c17945c282a80288d2c9b1806ce515062340/packages/pesa/src/errors.ts#L12) |
