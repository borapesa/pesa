---
title: "Class: ClickPesaProvider"
---

Defined in: [providers/clickpesa/src/clickpesa.ts:84](https://github.com/borapesa/pesa/blob/703ad04940b87d46533e9a8c6c257b94e3c1cbe3/providers/clickpesa/src/clickpesa.ts#L84)

## Extends

- `BasePaymentProvider`

## Constructors

### Constructor

```ts
new ClickPesaProvider(config): ClickPesaProvider;
```

Defined in: [providers/clickpesa/src/clickpesa.ts:91](https://github.com/borapesa/pesa/blob/703ad04940b87d46533e9a8c6c257b94e3c1cbe3/providers/clickpesa/src/clickpesa.ts#L91)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `config` | [`ClickPesaConfig`](../interfaces/ClickPesaConfig) |

#### Returns

`ClickPesaProvider`

#### Overrides

```ts
BasePaymentProvider.constructor
```

## Properties

| Property | Modifier | Type | Default value | Description | Overrides | Defined in |
| ------ | ------ | ------ | ------ | ------ | ------ | ------ |
| <a id="name"></a> `name` | `readonly` | `ProviderName` | `'clickpesa'` | Unique provider identifier. | `BasePaymentProvider.name` | [providers/clickpesa/src/clickpesa.ts:85](https://github.com/borapesa/pesa/blob/703ad04940b87d46533e9a8c6c257b94e3c1cbe3/providers/clickpesa/src/clickpesa.ts#L85) |

## Methods

### cancelOrder()?

```ts
optional cancelOrder(_orderId): Promise<CancelOrderResult>;
```

Defined in: packages/pesa/dist/providers/base.d.ts:97

Cancel a pending or in-progress order.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `_orderId` | `string` |

#### Returns

`Promise`\<`CancelOrderResult`\>

#### Throws

`PesaUnsupportedError` — if the provider does not support cancellation.



#### Inherited from

```ts
BasePaymentProvider.cancelOrder
```

***

### createOrder()

```ts
createOrder(payload): Promise<OrderResult>;
```

Defined in: [providers/clickpesa/src/clickpesa.ts:200](https://github.com/borapesa/pesa/blob/703ad04940b87d46533e9a8c6c257b94e3c1cbe3/providers/clickpesa/src/clickpesa.ts#L200)

Initiate a checkout / USSD push / redirect.

The SDK calls `validateCreateOrderPayload()` before this,
so you can assume `amount > 0`, `reference` is non-empty,
and `customer.phone` is in MSISDN format.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `payload` | `CreateOrderPayload` |

#### Returns

`Promise`\<`OrderResult`\>

#### Overrides

```ts
BasePaymentProvider.createOrder
```

***

### disburse()

```ts
disburse(payload): Promise<DisburseResult>;
```

Defined in: [providers/clickpesa/src/clickpesa.ts:346](https://github.com/borapesa/pesa/blob/703ad04940b87d46533e9a8c6c257b94e3c1cbe3/providers/clickpesa/src/clickpesa.ts#L346)

B2C / wallet-out disbursement.

The SDK calls `validateDisbursePayload()` before this.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `payload` | `DisbursePayload` |

#### Returns

`Promise`\<`DisburseResult`\>

#### Overrides

```ts
BasePaymentProvider.disburse
```

***

### getNameLookup()

```ts
getNameLookup(phoneOrAccount): Promise<NameLookupResult>;
```

Defined in: [providers/clickpesa/src/clickpesa.ts:429](https://github.com/borapesa/pesa/blob/703ad04940b87d46533e9a8c6c257b94e3c1cbe3/providers/clickpesa/src/clickpesa.ts#L429)

Resolve the account holder name for a phone or account number.

Useful for verifying recipient identity before disbursing.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `phoneOrAccount` | `string` |

#### Returns

`Promise`\<`NameLookupResult`\>

#### Throws

`PesaUnsupportedError` — if the provider does not support name lookup.



#### Overrides

```ts
BasePaymentProvider.getNameLookup
```

***

### getPaymentStatus()

```ts
getPaymentStatus(orderId): Promise<PaymentStatus>;
```

Defined in: [providers/clickpesa/src/clickpesa.ts:261](https://github.com/borapesa/pesa/blob/703ad04940b87d46533e9a8c6c257b94e3c1cbe3/providers/clickpesa/src/clickpesa.ts#L261)

Poll or fetch the current payment status for an order.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `orderId` | `string` |

#### Returns

`Promise`\<`PaymentStatus`\>

#### Overrides

```ts
BasePaymentProvider.getPaymentStatus
```

***

### handleWebhook()

```ts
handleWebhook(rawBody, headers): Promise<PaymentEvent>;
```

Defined in: [providers/clickpesa/src/clickpesa.ts:285](https://github.com/borapesa/pesa/blob/703ad04940b87d46533e9a8c6c257b94e3c1cbe3/providers/clickpesa/src/clickpesa.ts#L285)

Parse + verify an incoming webhook.

The provider must:
1. Verify its own cryptographic signature (HMAC, checksum, etc.)
2. Parse the raw body into structured data
3. Return a normalized PaymentEvent

The SDK handles UUID assignment, event persistence, plugin hooks,
and user-registered handler emission after this method returns.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `rawBody` | `string` \| `Buffer`\<`ArrayBufferLike`\> |
| `headers` | `Record`\<`string`, `string`\> |

#### Returns

`Promise`\<`PaymentEvent`\>

#### Overrides

```ts
BasePaymentProvider.handleWebhook
```

***

### listOrders()?

```ts
optional listOrders(_params): Promise<ListOrdersResult>;
```

Defined in: packages/pesa/dist/providers/base.d.ts:137

List payment orders for a date range.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `_params` | `ListOrdersParams` |

#### Returns

`Promise`\<`ListOrdersResult`\>

#### Throws

`PesaUnsupportedError` — if the provider does not support listing orders.



#### Inherited from

```ts
BasePaymentProvider.listOrders
```

***

### previewDisburse()

```ts
previewDisburse(payload): Promise<PreviewResult>;
```

Defined in: [providers/clickpesa/src/clickpesa.ts:408](https://github.com/borapesa/pesa/blob/703ad04940b87d46533e9a8c6c257b94e3c1cbe3/providers/clickpesa/src/clickpesa.ts#L408)

Preview / dry-run a disbursement before committing.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `payload` | `DisbursePayload` |

#### Returns

`Promise`\<`PreviewResult`\>

#### Throws

`PesaUnsupportedError` — if the provider does not support preview.



#### Overrides

```ts
BasePaymentProvider.previewDisburse
```

***

### previewOrder()

```ts
previewOrder(payload): Promise<PreviewResult>;
```

Defined in: [providers/clickpesa/src/clickpesa.ts:387](https://github.com/borapesa/pesa/blob/703ad04940b87d46533e9a8c6c257b94e3c1cbe3/providers/clickpesa/src/clickpesa.ts#L387)

Preview / dry-run a payment before committing.

Returns expected fees and validity without charging the customer.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `payload` | `CreateOrderPayload` |

#### Returns

`Promise`\<`PreviewResult`\>

#### Throws

`PesaUnsupportedError` — if the provider does not support preview.



#### Overrides

```ts
BasePaymentProvider.previewOrder
```

***

### refund()?

```ts
optional refund(_orderId, _amount?): Promise<RefundResult>;
```

Defined in: packages/pesa/dist/providers/base.d.ts:91

Refund a completed payment.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `_orderId` | `string` |
| `_amount?` | `number` |

#### Returns

`Promise`\<`RefundResult`\>

#### Throws

`PesaUnsupportedError` — if the provider does not support refunds.



#### Inherited from

```ts
BasePaymentProvider.refund
```

***

### validateCredentials()

```ts
validateCredentials(): Promise<{
  message?: string;
  valid: boolean;
}>;
```

Defined in: [providers/clickpesa/src/clickpesa.ts:378](https://github.com/borapesa/pesa/blob/703ad04940b87d46533e9a8c6c257b94e3c1cbe3/providers/clickpesa/src/clickpesa.ts#L378)

Validate that a provider config works (health check).

Useful for startup checks or `/health` endpoints.

#### Returns

`Promise`\<\{
  `message?`: `string`;
  `valid`: `boolean`;
\}\>

`{ valid: true }` if credentials are correct.

#### Throws

`PesaUnsupportedError` — if the provider does not support validation.



#### Overrides

```ts
BasePaymentProvider.validateCredentials
```
