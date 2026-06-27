---
title: "Class: PesaUnsupportedError"
---

# Class: PesaUnsupportedError

Defined in: [packages/pesa/src/errors.ts:20](https://github.com/borapesa/pesa/blob/d5e3ce1bd76d0bcd3eae4880e0c1c2cb00933e6c/packages/pesa/src/errors.ts#L20)

Thrown when a provider does not implement an optional operation.

## Extends

- [`PesaError`](PesaError.md)

## Constructors

### Constructor

```ts
new PesaUnsupportedError(message): PesaUnsupportedError;
```

Defined in: [packages/pesa/src/errors.ts:21](https://github.com/borapesa/pesa/blob/d5e3ce1bd76d0bcd3eae4880e0c1c2cb00933e6c/packages/pesa/src/errors.ts#L21)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `message` | `string` |

#### Returns

`PesaUnsupportedError`

#### Overrides

[`PesaError`](PesaError.md).[`constructor`](PesaError.md#constructor)

## Properties

| Property | Modifier | Type | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="code"></a> `code` | `readonly` | `string` | [`PesaError`](PesaError.md).[`code`](PesaError.md#code) | [packages/pesa/src/errors.ts:12](https://github.com/borapesa/pesa/blob/d5e3ce1bd76d0bcd3eae4880e0c1c2cb00933e6c/packages/pesa/src/errors.ts#L12) |
