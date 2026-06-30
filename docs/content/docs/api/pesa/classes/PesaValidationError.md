---
title: "Class: PesaValidationError"
---

Defined in: [packages/pesa/src/errors.ts:44](https://github.com/borapesa/pesa/blob/bb0341345be96209d9f1026440a10cf3f86d0e28/packages/pesa/src/errors.ts#L44)

Thrown when payload validation fails (client error).

## Extends

- [`PesaError`](PesaError)

## Constructors

### Constructor

```ts
new PesaValidationError(message): PesaValidationError;
```

Defined in: [packages/pesa/src/errors.ts:45](https://github.com/borapesa/pesa/blob/bb0341345be96209d9f1026440a10cf3f86d0e28/packages/pesa/src/errors.ts#L45)

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
| <a id="code"></a> `code` | `readonly` | `string` | [`PesaError`](PesaError).[`code`](PesaError.md#code) | [packages/pesa/src/errors.ts:12](https://github.com/borapesa/pesa/blob/bb0341345be96209d9f1026440a10cf3f86d0e28/packages/pesa/src/errors.ts#L12) |
