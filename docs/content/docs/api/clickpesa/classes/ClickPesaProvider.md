---
title: "Class: ClickPesaProvider"
---

Defined in: [providers/clickpesa/src/clickpesa.ts:162](https://github.com/borapesa/pesa/blob/d80176dbaeb846a33302a30c19d7d4eba629ed0c/providers/clickpesa/src/clickpesa.ts#L162)

## Extends

- `BasePaymentProvider`

## Constructors

### Constructor

```ts
new ClickPesaProvider(config): ClickPesaProvider;
```

Defined in: [providers/clickpesa/src/clickpesa.ts:178](https://github.com/borapesa/pesa/blob/d80176dbaeb846a33302a30c19d7d4eba629ed0c/providers/clickpesa/src/clickpesa.ts#L178)

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
| <a id="name"></a> `name` | `readonly` | `ProviderName` | `'clickpesa'` | Unique provider identifier. | `BasePaymentProvider.name` | [providers/clickpesa/src/clickpesa.ts:163](https://github.com/borapesa/pesa/blob/d80176dbaeb846a33302a30c19d7d4eba629ed0c/providers/clickpesa/src/clickpesa.ts#L163) |

## Methods

### bulkCreateCustomerNumbers()

```ts
bulkCreateCustomerNumbers(controlNumbers): Promise<BillPayBulkResult>;
```

Defined in: [providers/clickpesa/src/clickpesa.ts:854](https://github.com/borapesa/pesa/blob/d80176dbaeb846a33302a30c19d7d4eba629ed0c/providers/clickpesa/src/clickpesa.ts#L854)

Bulk-create up to 50 customer control numbers in a single request.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `controlNumbers` | `Record`\<`string`, `unknown`\>[] |

#### Returns

`Promise`\<`BillPayBulkResult`\>

***

### bulkCreateOrderNumbers()

```ts
bulkCreateOrderNumbers(controlNumbers): Promise<BillPayBulkResult>;
```

Defined in: [providers/clickpesa/src/clickpesa.ts:841](https://github.com/borapesa/pesa/blob/d80176dbaeb846a33302a30c19d7d4eba629ed0c/providers/clickpesa/src/clickpesa.ts#L841)

Bulk-create up to 50 order control numbers in a single request.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `controlNumbers` | `Record`\<`string`, `unknown`\>[] |

#### Returns

`Promise`\<`BillPayBulkResult`\>

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

### createChecksum()

```ts
createChecksum(payload): string;
```

Defined in: [providers/clickpesa/src/clickpesa.ts:923](https://github.com/borapesa/pesa/blob/d80176dbaeb846a33302a30c19d7d4eba629ed0c/providers/clickpesa/src/clickpesa.ts#L923)

**`Internal`**

Create a ClickPesa-compatible HMAC-SHA256 checksum for a request body.

Algorithm (per ClickPesa docs):
1. Canonicalize — recursively sort all object keys alphabetically.
2. Serialize to compact JSON (no whitespace).
3. Return hex digest of HMAC-SHA256(key, json_string).

 Exposed for testing via the provider instance.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `payload` | `Record`\<`string`, `unknown`\> |

#### Returns

`string`

***

### createCustomerControlNumber()

```ts
createCustomerControlNumber(params): Promise<BillPayControlNumber>;
```

Defined in: [providers/clickpesa/src/clickpesa.ts:815](https://github.com/borapesa/pesa/blob/d80176dbaeb846a33302a30c19d7d4eba629ed0c/providers/clickpesa/src/clickpesa.ts#L815)

Generate a persistent control number tied to a specific customer.
At least one of `phone` or `email` must be supplied.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `params` | \{ `amount?`: `number`; `billReference?`: `string`; `customerName`: `string`; `description?`: `string`; `email?`: `string`; `paymentMode?`: `"ALLOW_PARTIAL_AND_OVER_PAYMENT"` \| `"EXACT"`; `phone?`: `string`; \} |
| `params.amount?` | `number` |
| `params.billReference?` | `string` |
| `params.customerName` | `string` |
| `params.description?` | `string` |
| `params.email?` | `string` |
| `params.paymentMode?` | `"ALLOW_PARTIAL_AND_OVER_PAYMENT"` \| `"EXACT"` |
| `params.phone?` | `string` |

#### Returns

`Promise`\<`BillPayControlNumber`\>

***

### createOrder()

```ts
createOrder(payload): Promise<OrderResult>;
```

Defined in: [providers/clickpesa/src/clickpesa.ts:306](https://github.com/borapesa/pesa/blob/d80176dbaeb846a33302a30c19d7d4eba629ed0c/providers/clickpesa/src/clickpesa.ts#L306)

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

### createOrderControlNumber()

```ts
createOrderControlNumber(params?): Promise<BillPayControlNumber>;
```

Defined in: [providers/clickpesa/src/clickpesa.ts:794](https://github.com/borapesa/pesa/blob/d80176dbaeb846a33302a30c19d7d4eba629ed0c/providers/clickpesa/src/clickpesa.ts#L794)

Generate a one-time order control number.

Customers pay this number via mobile money, SIM banking, or CRDB Wakala.
All fields are optional — the API auto-generates a reference if omitted.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `params?` | \{ `amount?`: `number`; `billReference?`: `string`; `description?`: `string`; `paymentMode?`: `"ALLOW_PARTIAL_AND_OVER_PAYMENT"` \| `"EXACT"`; \} |
| `params.amount?` | `number` |
| `params.billReference?` | `string` |
| `params.description?` | `string` |
| `params.paymentMode?` | `"ALLOW_PARTIAL_AND_OVER_PAYMENT"` \| `"EXACT"` |

#### Returns

`Promise`\<`BillPayControlNumber`\>

***

### disburse()

```ts
disburse(payload): Promise<DisburseResult>;
```

Defined in: [providers/clickpesa/src/clickpesa.ts:473](https://github.com/borapesa/pesa/blob/d80176dbaeb846a33302a30c19d7d4eba629ed0c/providers/clickpesa/src/clickpesa.ts#L473)

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

### generatePayoutLink()

```ts
generatePayoutLink(amount, orderId): Promise<string>;
```

Defined in: [providers/clickpesa/src/clickpesa.ts:651](https://github.com/borapesa/pesa/blob/d80176dbaeb846a33302a30c19d7d4eba629ed0c/providers/clickpesa/src/clickpesa.ts#L651)

Generate a hosted payout link.

The recipient uses the link to enter their own bank or mobile-money
details — you don't need to collect them yourself.  Returns a URL
you redirect the recipient to.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `amount` | `number` |
| `orderId` | `string` |

#### Returns

`Promise`\<`string`\>

***

### getAccountStatement()

```ts
getAccountStatement(
   currency?, 
   startDate?, 
   endDate?): Promise<{
  accountDetails: Record<string, unknown>;
  transactions: Record<string, unknown>[];
}>;
```

Defined in: [providers/clickpesa/src/clickpesa.ts:698](https://github.com/borapesa/pesa/blob/d80176dbaeb846a33302a30c19d7d4eba629ed0c/providers/clickpesa/src/clickpesa.ts#L698)

Fetch a transaction statement for a given currency.

#### Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `currency` | `string` | `'TZS'` | — `"TZS"` (default) or `"USD"`. |
| `startDate?` | `Date` | `undefined` | — Optional filter: start date. |
| `endDate?` | `Date` | `undefined` | — Optional filter: end date. |

#### Returns

`Promise`\<\{
  `accountDetails`: `Record`\<`string`, `unknown`\>;
  `transactions`: `Record`\<`string`, `unknown`\>[];
\}\>

***

### getBalance()

```ts
getBalance(): Promise<BalanceResult>;
```

Defined in: [providers/clickpesa/src/clickpesa.ts:536](https://github.com/borapesa/pesa/blob/d80176dbaeb846a33302a30c19d7d4eba629ed0c/providers/clickpesa/src/clickpesa.ts#L536)

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

### getBanks()

```ts
getBanks(): Promise<{
  bic: string;
  name: string;
  value?: string;
}[]>;
```

Defined in: [providers/clickpesa/src/clickpesa.ts:684](https://github.com/borapesa/pesa/blob/d80176dbaeb846a33302a30c19d7d4eba629ed0c/providers/clickpesa/src/clickpesa.ts#L684)

#### Returns

`Promise`\<\{
  `bic`: `string`;
  `name`: `string`;
  `value?`: `string`;
\}[]\>

***

### getBillPayDetails()

```ts
getBillPayDetails(billPayNumber): Promise<BillPayControlNumber>;
```

Defined in: [providers/clickpesa/src/clickpesa.ts:867](https://github.com/borapesa/pesa/blob/d80176dbaeb846a33302a30c19d7d4eba629ed0c/providers/clickpesa/src/clickpesa.ts#L867)

Query details of a specific control number.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `billPayNumber` | `string` |

#### Returns

`Promise`\<`BillPayControlNumber`\>

***

### getExchangeRates()

```ts
getExchangeRates(source?, target?): Promise<{
  date: string;
  rate: number;
  source: string;
  target: string;
}[]>;
```

Defined in: [providers/clickpesa/src/clickpesa.ts:671](https://github.com/borapesa/pesa/blob/d80176dbaeb846a33302a30c19d7d4eba629ed0c/providers/clickpesa/src/clickpesa.ts#L671)

Fetch the latest exchange rates.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `source?` | `string` | — ISO 4217 source currency (e.g. `"USD"`). All sources when omitted. |
| `target?` | `string` | — ISO 4217 target currency (e.g. `"TZS"`). All targets when omitted. |

#### Returns

`Promise`\<\{
  `date`: `string`;
  `rate`: `number`;
  `source`: `string`;
  `target`: `string`;
\}[]\>

***

### getNameLookup()

```ts
getNameLookup(phoneOrAccount): Promise<NameLookupResult>;
```

Defined in: [providers/clickpesa/src/clickpesa.ts:716](https://github.com/borapesa/pesa/blob/d80176dbaeb846a33302a30c19d7d4eba629ed0c/providers/clickpesa/src/clickpesa.ts#L716)

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

Defined in: [providers/clickpesa/src/clickpesa.ts:399](https://github.com/borapesa/pesa/blob/d80176dbaeb846a33302a30c19d7d4eba629ed0c/providers/clickpesa/src/clickpesa.ts#L399)

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

Defined in: [providers/clickpesa/src/clickpesa.ts:418](https://github.com/borapesa/pesa/blob/d80176dbaeb846a33302a30c19d7d4eba629ed0c/providers/clickpesa/src/clickpesa.ts#L418)

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

Defined in: [providers/clickpesa/src/clickpesa.ts:739](https://github.com/borapesa/pesa/blob/d80176dbaeb846a33302a30c19d7d4eba629ed0c/providers/clickpesa/src/clickpesa.ts#L739)

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

### previewDisburse()

```ts
previewDisburse(payload): Promise<PreviewResult>;
```

Defined in: [providers/clickpesa/src/clickpesa.ts:598](https://github.com/borapesa/pesa/blob/d80176dbaeb846a33302a30c19d7d4eba629ed0c/providers/clickpesa/src/clickpesa.ts#L598)

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

Defined in: [providers/clickpesa/src/clickpesa.ts:551](https://github.com/borapesa/pesa/blob/d80176dbaeb846a33302a30c19d7d4eba629ed0c/providers/clickpesa/src/clickpesa.ts#L551)

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

### updateBillPayReference()

```ts
updateBillPayReference(billPayNumber, params): Promise<BillPayControlNumber>;
```

Defined in: [providers/clickpesa/src/clickpesa.ts:877](https://github.com/borapesa/pesa/blob/d80176dbaeb846a33302a30c19d7d4eba629ed0c/providers/clickpesa/src/clickpesa.ts#L877)

Partially update a BillPay reference. At least one field besides
`billPayNumber` must be provided.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `billPayNumber` | `string` |
| `params` | \{ `amount?`: `number`; `description?`: `string`; `paymentMode?`: `"ALLOW_PARTIAL_AND_OVER_PAYMENT"` \| `"EXACT"`; `status?`: `"ACTIVE"` \| `"INACTIVE"`; \} |
| `params.amount?` | `number` |
| `params.description?` | `string` |
| `params.paymentMode?` | `"ALLOW_PARTIAL_AND_OVER_PAYMENT"` \| `"EXACT"` |
| `params.status?` | `"ACTIVE"` \| `"INACTIVE"` |

#### Returns

`Promise`\<`BillPayControlNumber`\>

***

### updateBillPayStatus()

```ts
updateBillPayStatus(billPayNumber, status): Promise<BillPayControlNumber>;
```

Defined in: [providers/clickpesa/src/clickpesa.ts:901](https://github.com/borapesa/pesa/blob/d80176dbaeb846a33302a30c19d7d4eba629ed0c/providers/clickpesa/src/clickpesa.ts#L901)

Activate or deactivate a control number (convenience wrapper).

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `billPayNumber` | `string` |
| `status` | `"ACTIVE"` \| `"INACTIVE"` |

#### Returns

`Promise`\<`BillPayControlNumber`\>

***

### validateCredentials()

```ts
validateCredentials(): Promise<{
  message?: string;
  valid: boolean;
}>;
```

Defined in: [providers/clickpesa/src/clickpesa.ts:527](https://github.com/borapesa/pesa/blob/d80176dbaeb846a33302a30c19d7d4eba629ed0c/providers/clickpesa/src/clickpesa.ts#L527)

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
