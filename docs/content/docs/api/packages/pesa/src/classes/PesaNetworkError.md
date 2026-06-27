---
title: "Class: PesaNetworkError"
---

# Class: PesaNetworkError

Defined in: [packages/pesa/src/errors.ts:36](https://github.com/borapesa/pesa/blob/d5e3ce1bd76d0bcd3eae4880e0c1c2cb00933e6c/packages/pesa/src/errors.ts#L36)

Thrown when a provider API is unreachable or returns a network error.

## Extends

- [`PesaError`](PesaError.md)

## Constructors

### Constructor

```ts
new PesaNetworkError(message): PesaNetworkError;
```

Defined in: [packages/pesa/src/errors.ts:37](https://github.com/borapesa/pesa/blob/d5e3ce1bd76d0bcd3eae4880e0c1c2cb00933e6c/packages/pesa/src/errors.ts#L37)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `message` | `string` |

#### Returns

`PesaNetworkError`

#### Overrides

[`PesaError`](PesaError.md).[`constructor`](PesaError.md#constructor)

## Properties

| Property | Modifier | Type | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="code"></a> `code` | `readonly` | `string` | [`PesaError`](PesaError.md).[`code`](PesaError.md#code) | [packages/pesa/src/errors.ts:12](https://github.com/borapesa/pesa/blob/d5e3ce1bd76d0bcd3eae4880e0c1c2cb00933e6c/packages/pesa/src/errors.ts#L12) |
