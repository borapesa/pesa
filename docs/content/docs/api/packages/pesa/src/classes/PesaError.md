---
title: "Class: PesaError"
---

# Class: PesaError

Defined in: [packages/pesa/src/errors.ts:9](https://github.com/borapesa/pesa/blob/d5e3ce1bd76d0bcd3eae4880e0c1c2cb00933e6c/packages/pesa/src/errors.ts#L9)

Base error class for all Bora Pesa errors.

## Extends

- `Error`

## Extended by

- [`PesaNetworkError`](PesaNetworkError.md)
- [`PesaProviderError`](PesaProviderError.md)
- [`PesaUnsupportedError`](PesaUnsupportedError.md)
- [`PesaValidationError`](PesaValidationError.md)
- [`PesaWebhookError`](PesaWebhookError.md)

## Constructors

### Constructor

```ts
new PesaError(message, code): PesaError;
```

Defined in: [packages/pesa/src/errors.ts:10](https://github.com/borapesa/pesa/blob/d5e3ce1bd76d0bcd3eae4880e0c1c2cb00933e6c/packages/pesa/src/errors.ts#L10)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `message` | `string` |
| `code` | `string` |

#### Returns

`PesaError`

#### Overrides

```ts
Error.constructor
```

## Properties

| Property | Modifier | Type | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="code"></a> `code` | `readonly` | `string` | [packages/pesa/src/errors.ts:12](https://github.com/borapesa/pesa/blob/d5e3ce1bd76d0bcd3eae4880e0c1c2cb00933e6c/packages/pesa/src/errors.ts#L12) |
