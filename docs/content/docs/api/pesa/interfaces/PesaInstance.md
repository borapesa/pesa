---
title: "Interface: PesaInstance"
---

Defined in: [packages/pesa/src/pesa.ts:86](https://github.com/borapesa/pesa/blob/b650282517ee25488b2499acb1ca4114c3e14358/packages/pesa/src/pesa.ts#L86)

Fully configured payments SDK instance — returned by [createPesa](../functions/createPesa).

## Core operations

```ts
// Initiate a payment
const order = await pesa.createOrder({
  amount:    15000,
  currency:  'TZS',
  reference: 'order_abc',
  customer:  { name: 'Juma Ali', phone: '255712345678' },
});

// Poll status
const status = await pesa.getPaymentStatus(order.orderId);

// Send money to a customer
await pesa.disburse({
  amount:    50000,
  currency:  'TZS',
  reference: 'payout_xyz',
  recipient: { phone: '255754321098', network: 'MPESA' },
});
```

## Events

```ts
// React to verified + persisted payment events
pesa.on('PAYMENT_SUCCESS', async (event) => {
  await db.orders.update({
    id:     event.reference,
    status: 'paid',
  });
});
```

## Optional operations (feature detection)

```ts
// Not all providers support these. Check before calling.
if (pesa.refund)     await pesa.refund('order_123', 5000);
if (pesa.previewOrder)  await pesa.previewOrder({ ... });
if (pesa.validateCredentials) await pesa.validateCredentials();
```

## HTTP mount

```ts
// Mount directly on any fetch-compatible server
Bun.serve({ fetch: pesa.mount });
// Or use a framework adapter:
// - @borapesa/nextjs → export const { GET, POST } = toNextJsHandler(pesa);
// - @borapesa/express → app.use('/api/pesa', toPesaRouter(pesa));
```

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="mount"></a> `mount` | (`request`) => `Promise`\<`Response`\> | Generic fetch-like handler. Works with any framework. Routes: `POST /order`, `GET /status/:orderId`, `POST /webhook`. | [packages/pesa/src/pesa.ts:171](https://github.com/borapesa/pesa/blob/b650282517ee25488b2499acb1ca4114c3e14358/packages/pesa/src/pesa.ts#L171) |
| <a id="provider"></a> `provider` | [`BasePaymentProvider`](../classes/BasePaymentProvider) | The underlying provider adapter. | [packages/pesa/src/pesa.ts:164](https://github.com/borapesa/pesa/blob/b650282517ee25488b2499acb1ca4114c3e14358/packages/pesa/src/pesa.ts#L164) |

## Methods

### cancelOrder()?

```ts
optional cancelOrder(orderId): Promise<CancelOrderResult>;
```

Defined in: [packages/pesa/src/pesa.ts:144](https://github.com/borapesa/pesa/blob/b650282517ee25488b2499acb1ca4114c3e14358/packages/pesa/src/pesa.ts#L144)

Cancel a pending or in-progress order. `undefined` if unsupported.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `orderId` | `string` |

#### Returns

`Promise`\<[`CancelOrderResult`](CancelOrderResult)\>

***

### createOrder()

```ts
createOrder(payload): Promise<OrderResult>;
```

Defined in: [packages/pesa/src/pesa.ts:99](https://github.com/borapesa/pesa/blob/b650282517ee25488b2499acb1ca4114c3e14358/packages/pesa/src/pesa.ts#L99)

Initiate a checkout / USSD push / redirect.

The SDK validates the payload before forwarding to the provider
(amount > 0, valid MSISDN phone, non-empty reference).

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `payload` | [`CreateOrderPayload`](CreateOrderPayload) |

#### Returns

`Promise`\<[`OrderResult`](OrderResult)\>

#### Throws

`PesaValidationError` — if the payload is invalid.



`PesaNetworkError` — if the provider is unreachable.



`PesaProviderError` — if the provider returns an error.



***

### disburse()

```ts
disburse(payload): Promise<DisburseResult>;
```

Defined in: [packages/pesa/src/pesa.ts:118](https://github.com/borapesa/pesa/blob/b650282517ee25488b2499acb1ca4114c3e14358/packages/pesa/src/pesa.ts#L118)

B2C / wallet-out disbursement.

The SDK validates the payload before forwarding to the provider.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `payload` | [`DisbursePayload`](DisbursePayload) |

#### Returns

`Promise`\<[`DisburseResult`](DisburseResult)\>

#### Throws

`PesaValidationError` — if the payload is invalid.



`PesaNetworkError` — if the provider is unreachable.



`PesaProviderError` — if the provider returns an error.



***

### getNameLookup()?

```ts
optional getNameLookup(phoneOrAccount): Promise<NameLookupResult>;
```

Defined in: [packages/pesa/src/pesa.ts:156](https://github.com/borapesa/pesa/blob/b650282517ee25488b2499acb1ca4114c3e14358/packages/pesa/src/pesa.ts#L156)

Resolve account holder name. `undefined` if unsupported.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `phoneOrAccount` | `string` |

#### Returns

`Promise`\<[`NameLookupResult`](NameLookupResult)\>

***

### getPaymentStatus()

```ts
getPaymentStatus(orderId): Promise<PaymentStatus>;
```

Defined in: [packages/pesa/src/pesa.ts:107](https://github.com/borapesa/pesa/blob/b650282517ee25488b2499acb1ca4114c3e14358/packages/pesa/src/pesa.ts#L107)

Poll or fetch current payment status.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `orderId` | `string` |

#### Returns

`Promise`\<[`PaymentStatus`](../type-aliases/PaymentStatus)\>

#### Throws

`PesaNetworkError` — if the provider is unreachable.



`PesaProviderError` — if the provider returns an error.



***

### handleWebhook()

```ts
handleWebhook(rawBody, headers): Promise<void>;
```

Defined in: [packages/pesa/src/pesa.ts:126](https://github.com/borapesa/pesa/blob/b650282517ee25488b2499acb1ca4114c3e14358/packages/pesa/src/pesa.ts#L126)

Handle an incoming webhook. Called by framework adapters.

Flow: provider verification → UUID assignment → plugin hooks
→ event persistence → user-registered handler emission.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `rawBody` | `string` \| `Buffer`\<`ArrayBufferLike`\> |
| `headers` | `Record`\<`string`, `string`\> |

#### Returns

`Promise`\<`void`\>

***

### listOrders()?

```ts
optional listOrders(params): Promise<ListOrdersResult>;
```

Defined in: [packages/pesa/src/pesa.ts:159](https://github.com/borapesa/pesa/blob/b650282517ee25488b2499acb1ca4114c3e14358/packages/pesa/src/pesa.ts#L159)

List payment orders. `undefined` if unsupported.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `params` | [`ListOrdersParams`](ListOrdersParams) |

#### Returns

`Promise`\<[`ListOrdersResult`](ListOrdersResult)\>

***

### on()

```ts
on(event, handler): void;
```

Defined in: [packages/pesa/src/pesa.ts:136](https://github.com/borapesa/pesa/blob/b650282517ee25488b2499acb1ca4114c3e14358/packages/pesa/src/pesa.ts#L136)

Register a handler for a payment event type.

Handlers fire **after** the event is verified and persisted.
Multiple handlers can be registered for the same event type.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `event` | [`PaymentEventType`](../type-aliases/PaymentEventType) |
| `handler` | (`event`) => `void` \| `Promise`\<`void`\> |

#### Returns

`void`

***

### previewDisburse()?

```ts
optional previewDisburse(payload): Promise<PreviewResult>;
```

Defined in: [packages/pesa/src/pesa.ts:153](https://github.com/borapesa/pesa/blob/b650282517ee25488b2499acb1ca4114c3e14358/packages/pesa/src/pesa.ts#L153)

Preview / dry-run a disbursement. `undefined` if unsupported.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `payload` | [`DisbursePayload`](DisbursePayload) |

#### Returns

`Promise`\<[`PreviewResult`](PreviewResult)\>

***

### previewOrder()?

```ts
optional previewOrder(payload): Promise<PreviewResult>;
```

Defined in: [packages/pesa/src/pesa.ts:150](https://github.com/borapesa/pesa/blob/b650282517ee25488b2499acb1ca4114c3e14358/packages/pesa/src/pesa.ts#L150)

Preview / dry-run a payment. `undefined` if unsupported.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `payload` | [`CreateOrderPayload`](CreateOrderPayload) |

#### Returns

`Promise`\<[`PreviewResult`](PreviewResult)\>

***

### refund()?

```ts
optional refund(orderId, amount?): Promise<RefundResult>;
```

Defined in: [packages/pesa/src/pesa.ts:141](https://github.com/borapesa/pesa/blob/b650282517ee25488b2499acb1ca4114c3e14358/packages/pesa/src/pesa.ts#L141)

Refund a completed payment. `undefined` if unsupported.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `orderId` | `string` |
| `amount?` | `number` |

#### Returns

`Promise`\<[`RefundResult`](RefundResult)\>

***

### validateCredentials()?

```ts
optional validateCredentials(): Promise<{
  message?: string;
  valid: boolean;
}>;
```

Defined in: [packages/pesa/src/pesa.ts:147](https://github.com/borapesa/pesa/blob/b650282517ee25488b2499acb1ca4114c3e14358/packages/pesa/src/pesa.ts#L147)

Validate provider credentials (health check). `undefined` if unsupported.

#### Returns

`Promise`\<\{
  `message?`: `string`;
  `valid`: `boolean`;
\}\>
