---
title: "Class: SelcomPaymentProvider"
---

Defined in: [providers/selcom/src/selcom.ts:76](https://github.com/borapesa/pesa/blob/551532cd94bf0bd50a5389b05b48dbc5bf485d02/providers/selcom/src/selcom.ts#L76)

## Extends

- `BasePaymentProvider`

## Constructors

### Constructor

```ts
new SelcomPaymentProvider(config): SelcomPaymentProvider;
```

Defined in: [providers/selcom/src/selcom.ts:86](https://github.com/borapesa/pesa/blob/551532cd94bf0bd50a5389b05b48dbc5bf485d02/providers/selcom/src/selcom.ts#L86)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `config` | [`SelcomConfig`](../interfaces/SelcomConfig) |

#### Returns

`SelcomPaymentProvider`

#### Overrides

```ts
BasePaymentProvider.constructor
```

## Properties

| Property | Modifier | Type | Default value | Description | Overrides | Defined in |
| ------ | ------ | ------ | ------ | ------ | ------ | ------ |
| <a id="name"></a> `name` | `readonly` | `ProviderName` | `'selcom'` | Unique provider identifier. | `BasePaymentProvider.name` | [providers/selcom/src/selcom.ts:77](https://github.com/borapesa/pesa/blob/551532cd94bf0bd50a5389b05b48dbc5bf485d02/providers/selcom/src/selcom.ts#L77) |

## Methods

### cancelOrder()

```ts
cancelOrder(orderId): Promise<{
  cancelled: boolean;
  message?: string;
  orderId: string;
}>;
```

Defined in: [providers/selcom/src/selcom.ts:497](https://github.com/borapesa/pesa/blob/551532cd94bf0bd50a5389b05b48dbc5bf485d02/providers/selcom/src/selcom.ts#L497)

Cancel a pending or in-progress order.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `orderId` | `string` |

#### Returns

`Promise`\<\{
  `cancelled`: `boolean`;
  `message?`: `string`;
  `orderId`: `string`;
\}\>

#### Throws

`PesaUnsupportedError` — if the provider does not support cancellation.



#### Overrides

```ts
BasePaymentProvider.cancelOrder
```

***

### createOrder()

```ts
createOrder(payload): Promise<OrderResult>;
```

Defined in: [providers/selcom/src/selcom.ts:235](https://github.com/borapesa/pesa/blob/551532cd94bf0bd50a5389b05b48dbc5bf485d02/providers/selcom/src/selcom.ts#L235)

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

Defined in: [providers/selcom/src/selcom.ts:317](https://github.com/borapesa/pesa/blob/551532cd94bf0bd50a5389b05b48dbc5bf485d02/providers/selcom/src/selcom.ts#L317)

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

### getBalance()

```ts
getBalance(): Promise<BalanceResult>;
```

Defined in: [providers/selcom/src/selcom.ts:541](https://github.com/borapesa/pesa/blob/551532cd94bf0bd50a5389b05b48dbc5bf485d02/providers/selcom/src/selcom.ts#L541)

Retrieve available balances across all active currencies.

Useful for dashboards, pre-disbursement checks, and wallet health
monitoring.  Returns per-currency balance entries with raw provider
data for advanced use.

#### Returns

`Promise`\<`BalanceResult`\>

`{ balances: [...] }` with per-currency entries.

#### Throws

`PesaUnsupportedError` — if the provider does not expose balance data.



#### Since

0.2.0

#### Overrides

```ts
BasePaymentProvider.getBalance
```

***

### getNameLookup()

```ts
getNameLookup(phoneOrAccount): Promise<NameLookupResult>;
```

Defined in: [providers/selcom/src/selcom.ts:562](https://github.com/borapesa/pesa/blob/551532cd94bf0bd50a5389b05b48dbc5bf485d02/providers/selcom/src/selcom.ts#L562)

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

Defined in: [providers/selcom/src/selcom.ts:303](https://github.com/borapesa/pesa/blob/551532cd94bf0bd50a5389b05b48dbc5bf485d02/providers/selcom/src/selcom.ts#L303)

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

Defined in: [providers/selcom/src/selcom.ts:424](https://github.com/borapesa/pesa/blob/551532cd94bf0bd50a5389b05b48dbc5bf485d02/providers/selcom/src/selcom.ts#L424)

Parse + verify an incoming webhook.

The provider must:
1. Verify its own cryptographic signature (HMAC, checksum, etc.)
2. Parse the raw body into structured data
3. Return a normalized [PaymentEvent](/docs/api/pesa/interfaces/PaymentEvent)

The SDK handles UUID assignment, event persistence, plugin hooks,
and user-registered handler emission after this method returns.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `rawBody` | `string` \| `Buffer`\<`ArrayBufferLike`\> |
| `headers` | `Record`\<`string`, `string`\> |

#### Returns

`Promise`\<[`PaymentEvent`](/docs/api/pesa/interfaces/PaymentEvent)\>

#### Overrides

```ts
BasePaymentProvider.handleWebhook
```

***

### listOrders()

```ts
listOrders(params): Promise<ListOrdersResult>;
```

Defined in: [providers/selcom/src/selcom.ts:511](https://github.com/borapesa/pesa/blob/551532cd94bf0bd50a5389b05b48dbc5bf485d02/providers/selcom/src/selcom.ts#L511)

List payment orders for a date range.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `params` | `ListOrdersParams` |

#### Returns

`Promise`\<`ListOrdersResult`\>

#### Throws

`PesaUnsupportedError` — if the provider does not support listing orders.



#### Overrides

```ts
BasePaymentProvider.listOrders
```

***

### previewDisburse()?

```ts
optional previewDisburse(_payload): Promise<PreviewResult>;
```

Defined in: packages/pesa/dist/providers/base.d.ts:139

Preview / dry-run a disbursement before committing.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `_payload` | `DisbursePayload` |

#### Returns

`Promise`\<`PreviewResult`\>

#### Throws

`PesaUnsupportedError` — if the provider does not support preview.



#### Inherited from

```ts
BasePaymentProvider.previewDisburse
```

***

### previewOrder()?

```ts
optional previewOrder(_payload): Promise<PreviewResult>;
```

Defined in: packages/pesa/dist/providers/base.d.ts:133

Preview / dry-run a payment before committing.

Returns expected fees and validity without charging the customer.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `_payload` | `CreateOrderPayload` |

#### Returns

`Promise`\<`PreviewResult`\>

#### Throws

`PesaUnsupportedError` — if the provider does not support preview.



#### Inherited from

```ts
BasePaymentProvider.previewOrder
```

***

### refund()?

```ts
optional refund(_orderId, _amount?): Promise<RefundResult>;
```

Defined in: packages/pesa/dist/providers/base.d.ts:94

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

Defined in: [providers/selcom/src/selcom.ts:583](https://github.com/borapesa/pesa/blob/551532cd94bf0bd50a5389b05b48dbc5bf485d02/providers/selcom/src/selcom.ts#L583)

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
