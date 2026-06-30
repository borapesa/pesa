---
title: "Class: PesaValidationError"
---

Defined in: [packages/pesa/src/errors.ts:44](https://github.com/borapesa/pesa/blob/fd0db8b0df993c6583d9e24a7ce47f1b6a556685/packages/pesa/src/errors.ts#L44)

Thrown when payload validation fails (client error).

## Extends

- [`PesaError`](PesaError)

## Constructors

### Constructor

```ts
new PesaValidationError(message): PesaValidationError;
```

Defined in: [packages/pesa/src/errors.ts:45](https://github.com/borapesa/pesa/blob/fd0db8b0df993c6583d9e24a7ce47f1b6a556685/packages/pesa/src/errors.ts#L45)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `message` | `string` |

#### Returns

`PesaValidationError`

#### Overrides

[`PesaError`](PesaError).[`constructor`](PesaError.md#constructor)

## Properties

| Property | Modifier | Type | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="code"></a> `code` | `readonly` | `string` | [`PesaError`](PesaError).[`code`](PesaError.md#code) | [packages/pesa/src/errors.ts:12](https://github.com/borapesa/pesa/blob/fd0db8b0df993c6583d9e24a7ce47f1b6a556685/packages/pesa/src/errors.ts#L12) |
