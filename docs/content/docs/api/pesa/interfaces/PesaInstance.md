---
title: "Interface: PesaInstance"
---

Defined in: [packages/pesa/src/pesa.ts:90](https://github.com/borapesa/pesa/blob/3de08d45a33185320b62b57cdb2941dba74b4d9f/packages/pesa/src/pesa.ts#L90)

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
// Mount directly on any fetch-compatible server
Bun.serve({ fetch: pesa.mount });
// Or use a framework adapter:
// - @borapesa/nextjs → export const { GET, POST } = toNextJsHandler(pesa);
// - @borapesa/express → app.use('/api/pesa', toPesaRouter(pesa));
```

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="mount"></a> `mount` | (`request`) => `Promise`\<`Response`\> | Generic fetch-like handler. Works with any framework. Routes: `POST /order`, `GET /status/:orderId`, `POST /webhook`. | [packages/pesa/src/pesa.ts:178](https://github.com/borapesa/pesa/blob/3de08d45a33185320b62b57cdb2941dba74b4d9f/packages/pesa/src/pesa.ts#L178) |
| <a id="provider"></a> `provider` | [`BasePaymentProvider`](../classes/BasePaymentProvider) | The underlying provider adapter. | [packages/pesa/src/pesa.ts:171](https://github.com/borapesa/pesa/blob/3de08d45a33185320b62b57cdb2941dba74b4d9f/packages/pesa/src/pesa.ts#L171) |

## Methods

### cancelOrder()?

```ts
optional cancelOrder(orderId): Promise<CancelOrderResult>;
```

Defined in: [packages/pesa/src/pesa.ts:148](https://github.com/borapesa/pesa/blob/3de08d45a33185320b62b57cdb2941dba74b4d9f/packages/pesa/src/pesa.ts#L148)

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

Defined in: [packages/pesa/src/pesa.ts:103](https://github.com/borapesa/pesa/blob/3de08d45a33185320b62b57cdb2941dba74b4d9f/packages/pesa/src/pesa.ts#L103)

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

Defined in: [packages/pesa/src/pesa.ts:122](https://github.com/borapesa/pesa/blob/3de08d45a33185320b62b57cdb2941dba74b4d9f/packages/pesa/src/pesa.ts#L122)

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

### getBalance()?

```ts
optional getBalance(): Promise<BalanceResult>;
```

Defined in: [packages/pesa/src/pesa.ts:154](https://github.com/borapesa/pesa/blob/3de08d45a33185320b62b57cdb2941dba74b4d9f/packages/pesa/src/pesa.ts#L154)

Retrieve wallet balances across currencies. `undefined` if unsupported.

#### Returns

`Promise`\<[`BalanceResult`](BalanceResult)\>

***

### getNameLookup()?

```ts
optional getNameLookup(phoneOrAccount): Promise<NameLookupResult>;
```

Defined in: [packages/pesa/src/pesa.ts:163](https://github.com/borapesa/pesa/blob/3de08d45a33185320b62b57cdb2941dba74b4d9f/packages/pesa/src/pesa.ts#L163)

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

Defined in: [packages/pesa/src/pesa.ts:111](https://github.com/borapesa/pesa/blob/3de08d45a33185320b62b57cdb2941dba74b4d9f/packages/pesa/src/pesa.ts#L111)

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

Defined in: [packages/pesa/src/pesa.ts:130](https://github.com/borapesa/pesa/blob/3de08d45a33185320b62b57cdb2941dba74b4d9f/packages/pesa/src/pesa.ts#L130)

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

Defined in: [packages/pesa/src/pesa.ts:166](https://github.com/borapesa/pesa/blob/3de08d45a33185320b62b57cdb2941dba74b4d9f/packages/pesa/src/pesa.ts#L166)

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

Defined in: [packages/pesa/src/pesa.ts:140](https://github.com/borapesa/pesa/blob/3de08d45a33185320b62b57cdb2941dba74b4d9f/packages/pesa/src/pesa.ts#L140)

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

Defined in: [packages/pesa/src/pesa.ts:160](https://github.com/borapesa/pesa/blob/3de08d45a33185320b62b57cdb2941dba74b4d9f/packages/pesa/src/pesa.ts#L160)

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

Defined in: [packages/pesa/src/pesa.ts:157](https://github.com/borapesa/pesa/blob/3de08d45a33185320b62b57cdb2941dba74b4d9f/packages/pesa/src/pesa.ts#L157)

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

Defined in: [packages/pesa/src/pesa.ts:145](https://github.com/borapesa/pesa/blob/3de08d45a33185320b62b57cdb2941dba74b4d9f/packages/pesa/src/pesa.ts#L145)

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

Defined in: [packages/pesa/src/pesa.ts:151](https://github.com/borapesa/pesa/blob/3de08d45a33185320b62b57cdb2941dba74b4d9f/packages/pesa/src/pesa.ts#L151)

Validate provider credentials (health check). `undefined` if unsupported.

#### Returns

`Promise`\<\{
  `message?`: `string`;
  `valid`: `boolean`;
\}\>
