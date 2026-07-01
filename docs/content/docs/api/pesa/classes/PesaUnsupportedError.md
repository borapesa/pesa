---
title: "Class: PesaUnsupportedError"
---

Defined in: [packages/pesa/src/errors.ts:20](https://github.com/borapesa/pesa/blob/f7f1079d11b2fc8432fd4be7b3c2a35c6c7f87ee/packages/pesa/src/errors.ts#L20)

Thrown when a provider does not implement an optional operation.

## Extends

- [`PesaError`](PesaError)

## Constructors

### Constructor

```ts
new PesaUnsupportedError(message): PesaUnsupportedError;
```

Defined in: [packages/pesa/src/errors.ts:21](https://github.com/borapesa/pesa/blob/f7f1079d11b2fc8432fd4be7b3c2a35c6c7f87ee/packages/pesa/src/errors.ts#L21)

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
| <a id="code"></a> `code` | `readonly` | `string` | [`PesaError`](PesaError).[`code`](PesaError.md#code) | [packages/pesa/src/errors.ts:12](https://github.com/borapesa/pesa/blob/f7f1079d11b2fc8432fd4be7b3c2a35c6c7f87ee/packages/pesa/src/errors.ts#L12) |
