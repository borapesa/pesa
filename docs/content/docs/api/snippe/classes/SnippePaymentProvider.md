---
title: "Class: SnippePaymentProvider"
---

Defined in: [providers/snippe/src/snippe.ts:123](https://github.com/borapesa/pesa/blob/d80176dbaeb846a33302a30c19d7d4eba629ed0c/providers/snippe/src/snippe.ts#L123)

## Extends

- `BasePaymentProvider`

## Constructors

### Constructor

```ts
new SnippePaymentProvider(config): SnippePaymentProvider;
```

Defined in: [providers/snippe/src/snippe.ts:128](https://github.com/borapesa/pesa/blob/d80176dbaeb846a33302a30c19d7d4eba629ed0c/providers/snippe/src/snippe.ts#L128)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `config` | [`SnippeConfig`](../interfaces/SnippeConfig) |

#### Returns

`SnippePaymentProvider`

#### Overrides

```ts
BasePaymentProvider.constructor
```

## Properties

| Property | Modifier | Type | Default value | Description | Overrides | Defined in |
| ------ | ------ | ------ | ------ | ------ | ------ | ------ |
| <a id="name"></a> `name` | `readonly` | `ProviderName` | `'snippe'` | Unique provider identifier. | `BasePaymentProvider.name` | [providers/snippe/src/snippe.ts:124](https://github.com/borapesa/pesa/blob/d80176dbaeb846a33302a30c19d7d4eba629ed0c/providers/snippe/src/snippe.ts#L124) |

## Methods

### cancelCheckoutSession()

```ts
cancelCheckoutSession(reference): Promise<SnippeCheckoutSession>;
```

Defined in: [providers/snippe/src/snippe.ts:660](https://github.com/borapesa/pesa/blob/d80176dbaeb846a33302a30c19d7d4eba629ed0c/providers/snippe/src/snippe.ts#L660)

Cancel a pending or active checkout session.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `reference` | `string` |

#### Returns

`Promise`\<`SnippeCheckoutSession`\>

***

### cancelOrder()?

```ts
optional cancelOrder(_orderId): Promise<CancelOrderResult>;
```

Defined in: packages/pesa/dist/providers/base.d.ts:100

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

### createCheckoutSession()

```ts
createCheckoutSession(params): Promise<SnippeCheckoutSession>;
```

Defined in: [providers/snippe/src/snippe.ts:610](https://github.com/borapesa/pesa/blob/d80176dbaeb846a33302a30c19d7d4eba629ed0c/providers/snippe/src/snippe.ts#L610)

Create a hosted checkout session.

Returns a `checkoutUrl` for embedding and a `paymentLinkUrl` for
sharing via SMS / WhatsApp.  The session expires after `expiresIn`
seconds (default 3600).

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `params` | \{ `amount`: `number`; `description?`: `string`; `expiresIn?`: `number`; `metadata?`: `Record`\<`string`, `unknown`\>; `redirectUrl?`: `string`; \} |
| `params.amount` | `number` |
| `params.description?` | `string` |
| `params.expiresIn?` | `number` |
| `params.metadata?` | `Record`\<`string`, `unknown`\> |
| `params.redirectUrl?` | `string` |

#### Returns

`Promise`\<`SnippeCheckoutSession`\>

***

### createOrder()

```ts
createOrder(payload): Promise<OrderResult>;
```

Defined in: [providers/snippe/src/snippe.ts:276](https://github.com/borapesa/pesa/blob/d80176dbaeb846a33302a30c19d7d4eba629ed0c/providers/snippe/src/snippe.ts#L276)

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

Defined in: [providers/snippe/src/snippe.ts:405](https://github.com/borapesa/pesa/blob/d80176dbaeb846a33302a30c19d7d4eba629ed0c/providers/snippe/src/snippe.ts#L405)

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

Defined in: [providers/snippe/src/snippe.ts:447](https://github.com/borapesa/pesa/blob/d80176dbaeb846a33302a30c19d7d4eba629ed0c/providers/snippe/src/snippe.ts#L447)

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

### getCheckoutSession()

```ts
getCheckoutSession(reference): Promise<SnippeCheckoutSession>;
```

Defined in: [providers/snippe/src/snippe.ts:636](https://github.com/borapesa/pesa/blob/d80176dbaeb846a33302a30c19d7d4eba629ed0c/providers/snippe/src/snippe.ts#L636)

Fetch a checkout session by reference.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `reference` | `string` |

#### Returns

`Promise`\<`SnippeCheckoutSession`\>

***

### getNameLookup()

```ts
getNameLookup(phoneOrAccount): Promise<NameLookupResult>;
```

Defined in: [providers/snippe/src/snippe.ts:538](https://github.com/borapesa/pesa/blob/d80176dbaeb846a33302a30c19d7d4eba629ed0c/providers/snippe/src/snippe.ts#L538)

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

Defined in: [providers/snippe/src/snippe.ts:321](https://github.com/borapesa/pesa/blob/d80176dbaeb846a33302a30c19d7d4eba629ed0c/providers/snippe/src/snippe.ts#L321)

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

Defined in: [providers/snippe/src/snippe.ts:334](https://github.com/borapesa/pesa/blob/d80176dbaeb846a33302a30c19d7d4eba629ed0c/providers/snippe/src/snippe.ts#L334)

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

### listCheckoutSessions()

```ts
listCheckoutSessions(params?): Promise<SnippeCheckoutSession[]>;
```

Defined in: [providers/snippe/src/snippe.ts:644](https://github.com/borapesa/pesa/blob/d80176dbaeb846a33302a30c19d7d4eba629ed0c/providers/snippe/src/snippe.ts#L644)

List checkout sessions (paginated).

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `params?` | \{ `limit?`: `number`; `offset?`: `number`; `status?`: `string`; \} |
| `params.limit?` | `number` |
| `params.offset?` | `number` |
| `params.status?` | `string` |

#### Returns

`Promise`\<`SnippeCheckoutSession`[]\>

***

### listOrders()

```ts
listOrders(params): Promise<ListOrdersResult>;
```

Defined in: [providers/snippe/src/snippe.ts:457](https://github.com/borapesa/pesa/blob/d80176dbaeb846a33302a30c19d7d4eba629ed0c/providers/snippe/src/snippe.ts#L457)

List payment orders for a date range.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `params` | `ListOrdersParams` & \{ `paymentType?`: `string`; `q?`: `string`; `status?`: `string`; \} |

#### Returns

`Promise`\<`ListOrdersResult`\>

#### Throws

`PesaUnsupportedError` — if the provider does not support listing orders.



#### Overrides

```ts
BasePaymentProvider.listOrders
```

***

### previewDisburse()

```ts
previewDisburse(payload): Promise<PreviewResult>;
```

Defined in: [providers/snippe/src/snippe.ts:565](https://github.com/borapesa/pesa/blob/d80176dbaeb846a33302a30c19d7d4eba629ed0c/providers/snippe/src/snippe.ts#L565)

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

### refund()

```ts
refund(orderId, _amount?): Promise<RefundResult>;
```

Defined in: [providers/snippe/src/snippe.ts:579](https://github.com/borapesa/pesa/blob/d80176dbaeb846a33302a30c19d7d4eba629ed0c/providers/snippe/src/snippe.ts#L579)

Refund a completed payment.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `orderId` | `string` |
| `_amount?` | `number` |

#### Returns

`Promise`\<`RefundResult`\>

#### Throws

`PesaUnsupportedError` — if the provider does not support refunds.



#### Overrides

```ts
BasePaymentProvider.refund
```

***

### retriggerPush()

```ts
retriggerPush(reference): Promise<OrderResult>;
```

Defined in: [providers/snippe/src/snippe.ts:521](https://github.com/borapesa/pesa/blob/d80176dbaeb846a33302a30c19d7d4eba629ed0c/providers/snippe/src/snippe.ts#L521)

Re-send the USSD push prompt for a pending mobile payment.
Returns the updated payment object.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `reference` | `string` |

#### Returns

`Promise`\<`OrderResult`\>

***

### validateCredentials()

```ts
validateCredentials(): Promise<{
  message?: string;
  valid: boolean;
}>;
```

Defined in: [providers/snippe/src/snippe.ts:503](https://github.com/borapesa/pesa/blob/d80176dbaeb846a33302a30c19d7d4eba629ed0c/providers/snippe/src/snippe.ts#L503)

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
