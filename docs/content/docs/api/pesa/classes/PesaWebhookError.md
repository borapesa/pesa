---
title: "Class: PesaWebhookError"
---

Defined in: [packages/pesa/src/errors.ts:28](https://github.com/borapesa/pesa/blob/e1b0c17945c282a80288d2c9b1806ce515062340/packages/pesa/src/errors.ts#L28)

Thrown when a webhook fails signature verification.

## Extends

- [`PesaError`](PesaError)

## Constructors

### Constructor

```ts
new PesaWebhookError(message): PesaWebhookError;
```

Defined in: [packages/pesa/src/errors.ts:29](https://github.com/borapesa/pesa/blob/e1b0c17945c282a80288d2c9b1806ce515062340/packages/pesa/src/errors.ts#L29)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `message` | `string` |

#### Returns

`PesaWebhookError`

#### Overrides

[`PesaError`](PesaError).[`constructor`](PesaError.md#constructor)

## Properties

| Property | Modifier | Type | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="code"></a> `code` | `readonly` | `string` | [`PesaError`](PesaError).[`code`](PesaError.md#code) | [packages/pesa/src/errors.ts:12](https://github.com/borapesa/pesa/blob/e1b0c17945c282a80288d2c9b1806ce515062340/packages/pesa/src/errors.ts#L12) |
