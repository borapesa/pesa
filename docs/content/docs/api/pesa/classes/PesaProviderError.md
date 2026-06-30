---
title: "Class: PesaProviderError"
---

Defined in: [packages/pesa/src/errors.ts:52](https://github.com/borapesa/pesa/blob/fd0db8b0df993c6583d9e24a7ce47f1b6a556685/packages/pesa/src/errors.ts#L52)

Thrown when the provider returns an error response (provider error).

## Extends

- [`PesaError`](PesaError)

## Constructors

### Constructor

```ts
new PesaProviderError(
   message, 
   statusCode, 
   providerRaw?): PesaProviderError;
```

Defined in: [packages/pesa/src/errors.ts:53](https://github.com/borapesa/pesa/blob/fd0db8b0df993c6583d9e24a7ce47f1b6a556685/packages/pesa/src/errors.ts#L53)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `message` | `string` |
| `statusCode` | `number` |
| `providerRaw?` | `unknown` |

#### Returns

`PesaProviderError`

#### Overrides

[`PesaError`](PesaError).[`constructor`](PesaError.md#constructor)

## Properties

| Property | Modifier | Type | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="code"></a> `code` | `readonly` | `string` | [`PesaError`](PesaError).[`code`](PesaError.md#code) | [packages/pesa/src/errors.ts:12](https://github.com/borapesa/pesa/blob/fd0db8b0df993c6583d9e24a7ce47f1b6a556685/packages/pesa/src/errors.ts#L12) |
| <a id="providerraw"></a> `providerRaw?` | `readonly` | `unknown` | - | [packages/pesa/src/errors.ts:56](https://github.com/borapesa/pesa/blob/fd0db8b0df993c6583d9e24a7ce47f1b6a556685/packages/pesa/src/errors.ts#L56) |
| <a id="statuscode"></a> `statusCode` | `readonly` | `number` | - | [packages/pesa/src/errors.ts:55](https://github.com/borapesa/pesa/blob/fd0db8b0df993c6583d9e24a7ce47f1b6a556685/packages/pesa/src/errors.ts#L55) |
