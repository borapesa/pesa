---
title: "Abstract Class: BasePaymentProvider"
---

Defined in: [packages/pesa/src/providers/base.ts:75](https://github.com/borapesa/pesa/blob/5a6826bdcf9bdf66e849b708b5bc0fddc6567473/packages/pesa/src/providers/base.ts#L75)

Abstract base class every provider adapter must implement.

## Since

0.1.0

The SDK calls only these methods — no provider-specific logic ever
leaks into application code.

## Required methods (must implement)

- [createOrder](#createorder) — initiate a checkout / USSD push / redirect
- [getPaymentStatus](#getpaymentstatus) — poll or fetch current payment status
- [handleWebhook](#handlewebhook) — parse + verify an incoming webhook
- [disburse](#disburse) — B2C / wallet-out disbursement

## Optional methods (override to enable)

Default implementations throw [PesaUnsupportedError](PesaUnsupportedError).
Applications can feature-detect capability:

```ts
if (pesa.getBalance) {
  const { balances } = await pesa.getBalance();
  console.log(`TZS balance: ${balances.find(b => b.currency === 'TZS')?.amount}`);
}
```

## Writing a provider adapter

```ts
import { BasePaymentProvider } from '@borapesa/pesa';
import type { ProviderName, CreateOrderPayload, OrderResult } from '@borapesa/pesa';

export class MyProvider extends BasePaymentProvider {
  readonly name: ProviderName = 'selcom';

  async createOrder(payload: CreateOrderPayload): Promise<OrderResult> {
    // Call your provider's API
    const res = await fetch('https://api.provider.com/order', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    return {
      orderId:   data.transactionId,
      reference: payload.reference,
      status:    'PENDING',
    };
  }

  async getPaymentStatus(orderId: string): Promise<PaymentStatus> { ... }
  async handleWebhook(rawBody, headers): Promise<PaymentEvent> { ... }
  async disburse(payload): Promise<DisburseResult> { ... }
}
```

## Constructors

### Constructor

```ts
new BasePaymentProvider(): BasePaymentProvider;
```

#### Returns

`BasePaymentProvider`

## Properties

| Property | Modifier | Type | Description | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="name"></a> `name` | `abstract` | [`ProviderName`](../type-aliases/ProviderName) | Unique provider identifier. | [packages/pesa/src/providers/base.ts:77](https://github.com/borapesa/pesa/blob/5a6826bdcf9bdf66e849b708b5bc0fddc6567473/packages/pesa/src/providers/base.ts#L77) |

## Methods

### cancelOrder()?

```ts
optional cancelOrder(_orderId): Promise<CancelOrderResult>;
```

Defined in: [packages/pesa/src/providers/base.ts:132](https://github.com/borapesa/pesa/blob/5a6826bdcf9bdf66e849b708b5bc0fddc6567473/packages/pesa/src/providers/base.ts#L132)

Cancel a pending or in-progress order.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `_orderId` | `string` |

#### Returns

`Promise`\<[`CancelOrderResult`](../interfaces/CancelOrderResult)\>

#### Throws

`PesaUnsupportedError` — if the provider does not support cancellation.



***

### createOrder()

```ts
abstract createOrder(payload): Promise<OrderResult>;
```

Defined in: [packages/pesa/src/providers/base.ts:88](https://github.com/borapesa/pesa/blob/5a6826bdcf9bdf66e849b708b5bc0fddc6567473/packages/pesa/src/providers/base.ts#L88)

Initiate a checkout / USSD push / redirect.

The SDK calls `validateCreateOrderPayload()` before this,
so you can assume `amount > 0`, `reference` is non-empty,
and `customer.phone` is in MSISDN format.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `payload` | [`CreateOrderPayload`](../interfaces/CreateOrderPayload) |

#### Returns

`Promise`\<[`OrderResult`](../interfaces/OrderResult)\>

***

### disburse()

```ts
abstract disburse(payload): Promise<DisburseResult>;
```

Defined in: [packages/pesa/src/providers/base.ts:114](https://github.com/borapesa/pesa/blob/5a6826bdcf9bdf66e849b708b5bc0fddc6567473/packages/pesa/src/providers/base.ts#L114)

B2C / wallet-out disbursement.

The SDK calls `validateDisbursePayload()` before this.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `payload` | [`DisbursePayload`](../interfaces/DisbursePayload) |

#### Returns

`Promise`\<[`DisburseResult`](../interfaces/DisburseResult)\>

***

### getBalance()?

```ts
optional getBalance(): Promise<BalanceResult>;
```

Defined in: [packages/pesa/src/providers/base.ts:160](https://github.com/borapesa/pesa/blob/5a6826bdcf9bdf66e849b708b5bc0fddc6567473/packages/pesa/src/providers/base.ts#L160)

Retrieve available balances across all active currencies.

Useful for dashboards, pre-disbursement checks, and wallet health
monitoring.  Returns per-currency balance entries with raw provider
data for advanced use.

#### Returns

`Promise`\<[`BalanceResult`](../interfaces/BalanceResult)\>

`{ balances: [...] }` with per-currency entries.

#### Throws

`PesaUnsupportedError` — if the provider does not expose balance data.



#### Since

0.2.0

***

### getNameLookup()?

```ts
optional getNameLookup(_phoneOrAccount): Promise<NameLookupResult>;
```

Defined in: [packages/pesa/src/providers/base.ts:191](https://github.com/borapesa/pesa/blob/5a6826bdcf9bdf66e849b708b5bc0fddc6567473/packages/pesa/src/providers/base.ts#L191)

Resolve the account holder name for a phone or account number.

Useful for verifying recipient identity before disbursing.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `_phoneOrAccount` | `string` |

#### Returns

`Promise`\<[`NameLookupResult`](../interfaces/NameLookupResult)\>

#### Throws

`PesaUnsupportedError` — if the provider does not support name lookup.



***

### getPaymentStatus()

```ts
abstract getPaymentStatus(orderId): Promise<PaymentStatus>;
```

Defined in: [packages/pesa/src/providers/base.ts:91](https://github.com/borapesa/pesa/blob/5a6826bdcf9bdf66e849b708b5bc0fddc6567473/packages/pesa/src/providers/base.ts#L91)

Poll or fetch the current payment status for an order.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `orderId` | `string` |

#### Returns

`Promise`\<[`PaymentStatus`](../type-aliases/PaymentStatus)\>

***

### handleWebhook()

```ts
abstract handleWebhook(rawBody, headers): Promise<PaymentEvent>;
```

Defined in: [packages/pesa/src/providers/base.ts:104](https://github.com/borapesa/pesa/blob/5a6826bdcf9bdf66e849b708b5bc0fddc6567473/packages/pesa/src/providers/base.ts#L104)

Parse + verify an incoming webhook.

The provider must:
1. Verify its own cryptographic signature (HMAC, checksum, etc.)
2. Parse the raw body into structured data
3. Return a normalized [PaymentEvent](../interfaces/PaymentEvent)

The SDK handles UUID assignment, event persistence, plugin hooks,
and user-registered handler emission after this method returns.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `rawBody` | `string` \| `Buffer`\<`ArrayBufferLike`\> |
| `headers` | `Record`\<`string`, `string`\> |

#### Returns

`Promise`\<[`PaymentEvent`](../interfaces/PaymentEvent)\>

***

### listOrders()?

```ts
optional listOrders(_params): Promise<ListOrdersResult>;
```

Defined in: [packages/pesa/src/providers/base.ts:200](https://github.com/borapesa/pesa/blob/5a6826bdcf9bdf66e849b708b5bc0fddc6567473/packages/pesa/src/providers/base.ts#L200)

List payment orders for a date range.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `_params` | [`ListOrdersParams`](../interfaces/ListOrdersParams) |

#### Returns

`Promise`\<[`ListOrdersResult`](../interfaces/ListOrdersResult)\>

#### Throws

`PesaUnsupportedError` — if the provider does not support listing orders.



***

### previewDisburse()?

```ts
optional previewDisburse(_payload): Promise<PreviewResult>;
```

Defined in: [packages/pesa/src/providers/base.ts:180](https://github.com/borapesa/pesa/blob/5a6826bdcf9bdf66e849b708b5bc0fddc6567473/packages/pesa/src/providers/base.ts#L180)

Preview / dry-run a disbursement before committing.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `_payload` | [`DisbursePayload`](../interfaces/DisbursePayload) |

#### Returns

`Promise`\<[`PreviewResult`](../interfaces/PreviewResult)\>

#### Throws

`PesaUnsupportedError` — if the provider does not support preview.



***

### previewOrder()?

```ts
optional previewOrder(_payload): Promise<PreviewResult>;
```

Defined in: [packages/pesa/src/providers/base.ts:171](https://github.com/borapesa/pesa/blob/5a6826bdcf9bdf66e849b708b5bc0fddc6567473/packages/pesa/src/providers/base.ts#L171)

Preview / dry-run a payment before committing.

Returns expected fees and validity without charging the customer.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `_payload` | [`CreateOrderPayload`](../interfaces/CreateOrderPayload) |

#### Returns

`Promise`\<[`PreviewResult`](../interfaces/PreviewResult)\>

#### Throws

`PesaUnsupportedError` — if the provider does not support preview.



***

### refund()?

```ts
optional refund(_orderId, _amount?): Promise<RefundResult>;
```

Defined in: [packages/pesa/src/providers/base.ts:123](https://github.com/borapesa/pesa/blob/5a6826bdcf9bdf66e849b708b5bc0fddc6567473/packages/pesa/src/providers/base.ts#L123)

Refund a completed payment.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `_orderId` | `string` |
| `_amount?` | `number` |

#### Returns

`Promise`\<[`RefundResult`](../interfaces/RefundResult)\>

#### Throws

`PesaUnsupportedError` — if the provider does not support refunds.



***

### validateCredentials()?

```ts
optional validateCredentials(): Promise<{
  message?: string;
  valid: boolean;
}>;
```

Defined in: [packages/pesa/src/providers/base.ts:144](https://github.com/borapesa/pesa/blob/5a6826bdcf9bdf66e849b708b5bc0fddc6567473/packages/pesa/src/providers/base.ts#L144)

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


