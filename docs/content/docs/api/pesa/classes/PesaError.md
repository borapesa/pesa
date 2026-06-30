---
title: "Class: PesaError"
---

Defined in: [packages/pesa/src/errors.ts:9](https://github.com/borapesa/pesa/blob/0b5f9dc84f728a559f636e4b78cea49ddb18b7ab/packages/pesa/src/errors.ts#L9)

Base error class for all Bora Pesa errors.

## Extends

- `Error`

## Extended by

- [`PesaNetworkError`](PesaNetworkError)
- [`PesaProviderError`](PesaProviderError)
- [`PesaUnsupportedError`](PesaUnsupportedError)
- [`PesaValidationError`](PesaValidationError)
- [`PesaWebhookError`](PesaWebhookError)

## Constructors

### Constructor

```ts
new PesaError(message, code): PesaError;
```

Defined in: [packages/pesa/src/errors.ts:10](https://github.com/borapesa/pesa/blob/0b5f9dc84f728a559f636e4b78cea49ddb18b7ab/packages/pesa/src/errors.ts#L10)

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
| <a id="code"></a> `code` | `readonly` | `string` | [packages/pesa/src/errors.ts:12](https://github.com/borapesa/pesa/blob/0b5f9dc84f728a559f636e4b78cea49ddb18b7ab/packages/pesa/src/errors.ts#L12) |
