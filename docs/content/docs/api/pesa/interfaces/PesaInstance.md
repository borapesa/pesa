---
title: "Interface: PesaInstance"
---

Defined in: [packages/pesa/src/pesa.ts:89](https://github.com/borapesa/pesa/blob/f7f1079d11b2fc8432fd4be7b3c2a35c6c7f87ee/packages/pesa/src/pesa.ts#L89)

Fully configured payments SDK instance — returned by [createPesa](../functions/createPesa).

## Since

0.1.0

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
if (pesa.getBalance)   await pesa.getBalance();
if (pesa.refund)       await pesa.refund('order_123', 5000);
if (pesa.previewOrder) await pesa.previewOrder({ ... });
if (pesa.validateCredentials) await pesa.validateCredentials();
```

## HTTP mount

```ts
// Mount the webhook handler — the one route that must be public
Bun.serve({ fetch: pesa.mountWebhook });
// For orders/status, use pesa.createOrder() and pesa.getPaymentStatus()
// in your own routes behind your own auth middleware.
```

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="mountwebhook"></a> `mountWebhook` | (`request`) => `Promise`\<`Response`\> | Webhook handler — mount this publicly so providers can POST callbacks. Route: `POST {basePath}/webhook` For order creation and status queries, use [createOrder](#createorder) and [getPaymentStatus](#getpaymentstatus) in your own routes behind your own auth. | [packages/pesa/src/pesa.ts:183](https://github.com/borapesa/pesa/blob/f7f1079d11b2fc8432fd4be7b3c2a35c6c7f87ee/packages/pesa/src/pesa.ts#L183) |
| <a id="provider"></a> `provider` | [`BasePaymentProvider`](../classes/BasePaymentProvider) | The underlying provider adapter. | [packages/pesa/src/pesa.ts:173](https://github.com/borapesa/pesa/blob/f7f1079d11b2fc8432fd4be7b3c2a35c6c7f87ee/packages/pesa/src/pesa.ts#L173) |

## Methods

### cancelOrder()?

```ts
optional cancelOrder(orderId): Promise<CancelOrderResult>;
```

Defined in: [packages/pesa/src/pesa.ts:150](https://github.com/borapesa/pesa/blob/f7f1079d11b2fc8432fd4be7b3c2a35c6c7f87ee/packages/pesa/src/pesa.ts#L150)

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

Defined in: [packages/pesa/src/pesa.ts:102](https://github.com/borapesa/pesa/blob/f7f1079d11b2fc8432fd4be7b3c2a35c6c7f87ee/packages/pesa/src/pesa.ts#L102)

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

Defined in: [packages/pesa/src/pesa.ts:124](https://github.com/borapesa/pesa/blob/f7f1079d11b2fc8432fd4be7b3c2a35c6c7f87ee/packages/pesa/src/pesa.ts#L124)

B2C / wallet-out disbursement.

The SDK validates the payload before forwarding to the provider.

Returns a [DisburseResult](DisburseResult) whose `status` is `'QUEUED'`
(processing — poll for updates), `'SUCCESS'`, or `'FAILED'`.

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

### getBalance()?

```ts
optional getBalance(): Promise<BalanceResult>;
```

Defined in: [packages/pesa/src/pesa.ts:156](https://github.com/borapesa/pesa/blob/f7f1079d11b2fc8432fd4be7b3c2a35c6c7f87ee/packages/pesa/src/pesa.ts#L156)

Retrieve wallet balances across currencies. `undefined` if unsupported.

#### Returns

`Promise`\<[`BalanceResult`](BalanceResult)\>

***

### getNameLookup()?

```ts
optional getNameLookup(phoneOrAccount): Promise<NameLookupResult>;
```

Defined in: [packages/pesa/src/pesa.ts:165](https://github.com/borapesa/pesa/blob/f7f1079d11b2fc8432fd4be7b3c2a35c6c7f87ee/packages/pesa/src/pesa.ts#L165)

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

Defined in: [packages/pesa/src/pesa.ts:110](https://github.com/borapesa/pesa/blob/f7f1079d11b2fc8432fd4be7b3c2a35c6c7f87ee/packages/pesa/src/pesa.ts#L110)

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

Defined in: [packages/pesa/src/pesa.ts:132](https://github.com/borapesa/pesa/blob/f7f1079d11b2fc8432fd4be7b3c2a35c6c7f87ee/packages/pesa/src/pesa.ts#L132)

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

Defined in: [packages/pesa/src/pesa.ts:168](https://github.com/borapesa/pesa/blob/f7f1079d11b2fc8432fd4be7b3c2a35c6c7f87ee/packages/pesa/src/pesa.ts#L168)

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

Defined in: [packages/pesa/src/pesa.ts:142](https://github.com/borapesa/pesa/blob/f7f1079d11b2fc8432fd4be7b3c2a35c6c7f87ee/packages/pesa/src/pesa.ts#L142)

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

Defined in: [packages/pesa/src/pesa.ts:162](https://github.com/borapesa/pesa/blob/f7f1079d11b2fc8432fd4be7b3c2a35c6c7f87ee/packages/pesa/src/pesa.ts#L162)

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

Defined in: [packages/pesa/src/pesa.ts:159](https://github.com/borapesa/pesa/blob/f7f1079d11b2fc8432fd4be7b3c2a35c6c7f87ee/packages/pesa/src/pesa.ts#L159)

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

Defined in: [packages/pesa/src/pesa.ts:147](https://github.com/borapesa/pesa/blob/f7f1079d11b2fc8432fd4be7b3c2a35c6c7f87ee/packages/pesa/src/pesa.ts#L147)

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

Defined in: [packages/pesa/src/pesa.ts:153](https://github.com/borapesa/pesa/blob/f7f1079d11b2fc8432fd4be7b3c2a35c6c7f87ee/packages/pesa/src/pesa.ts#L153)

Validate provider credentials (health check). `undefined` if unsupported.

#### Returns

`Promise`\<\{
  `message?`: `string`;
  `valid`: `boolean`;
\}\>
