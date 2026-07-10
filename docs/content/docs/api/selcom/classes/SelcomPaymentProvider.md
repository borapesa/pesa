---
title: "Class: SelcomPaymentProvider"
---

Defined in: [providers/selcom/src/selcom.ts:87](https://github.com/borapesa/pesa/blob/d80176dbaeb846a33302a30c19d7d4eba629ed0c/providers/selcom/src/selcom.ts#L87)

## Extends

- `BasePaymentProvider`

## Constructors

### Constructor

```ts
new SelcomPaymentProvider(config): SelcomPaymentProvider;
```

Defined in: [providers/selcom/src/selcom.ts:113](https://github.com/borapesa/pesa/blob/d80176dbaeb846a33302a30c19d7d4eba629ed0c/providers/selcom/src/selcom.ts#L113)

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
| <a id="name"></a> `name` | `readonly` | `ProviderName` | `'selcom'` | Unique provider identifier. | `BasePaymentProvider.name` | [providers/selcom/src/selcom.ts:88](https://github.com/borapesa/pesa/blob/d80176dbaeb846a33302a30c19d7d4eba629ed0c/providers/selcom/src/selcom.ts#L88) |

## Methods

### agentCashout()

```ts
agentCashout(
   msisdn, 
   amount, 
   name?): Promise<{
  message: string;
  reference: string;
  status: string;
  transid: string;
}>;
```

Defined in: [providers/selcom/src/selcom.ts:868](https://github.com/borapesa/pesa/blob/d80176dbaeb846a33302a30c19d7d4eba629ed0c/providers/selcom/src/selcom.ts#L868)

Send funds to a customer for cash pickup at any Selcom Huduma agent.

The customer dials `*150*50#`, selects Huduma Cashout, enters the
agent code and amount to complete the withdrawal.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `msisdn` | `string` | — customer mobile number (receives the cashout token). |
| `amount` | `number` | — amount in TZS. |
| `name?` | `string` | — customer name (optional). |

#### Returns

`Promise`\<\{
  `message`: `string`;
  `reference`: `string`;
  `status`: `string`;
  `transid`: `string`;
\}\>

***

### cancelOrder()

```ts
cancelOrder(orderId): Promise<{
  cancelled: boolean;
  message?: string;
  orderId: string;
}>;
```

Defined in: [providers/selcom/src/selcom.ts:558](https://github.com/borapesa/pesa/blob/d80176dbaeb846a33302a30c19d7d4eba629ed0c/providers/selcom/src/selcom.ts#L558)

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

### checkoutWalletPayment()

```ts
checkoutWalletPayment(orderId, msisdn): Promise<{
  reference: string;
  status: string;
  transid: string;
}>;
```

Defined in: [providers/selcom/src/selcom.ts:672](https://github.com/borapesa/pesa/blob/d80176dbaeb846a33302a30c19d7d4eba629ed0c/providers/selcom/src/selcom.ts#L672)

Trigger a USSD push from an existing checkout order.

Use this for in-app payments where the customer is already on your
checkout page and you want to trigger a mobile money PIN prompt
without redirecting to Selcom's payment gateway.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `orderId` | `string` |
| `msisdn` | `string` |

#### Returns

`Promise`\<\{
  `reference`: `string`;
  `status`: `string`;
  `transid`: `string`;
\}\>

***

### createOrder()

```ts
createOrder(payload): Promise<OrderResult>;
```

Defined in: [providers/selcom/src/selcom.ts:264](https://github.com/borapesa/pesa/blob/d80176dbaeb846a33302a30c19d7d4eba629ed0c/providers/selcom/src/selcom.ts#L264)

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

### deleteStoredCard()

```ts
deleteStoredCard(id, gatewayBuyerUuid): Promise<{
  message: string;
  status: string;
}>;
```

Defined in: [providers/selcom/src/selcom.ts:942](https://github.com/borapesa/pesa/blob/d80176dbaeb846a33302a30c19d7d4eba629ed0c/providers/selcom/src/selcom.ts#L942)

Delete a stored card token.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `id` | `string` |
| `gatewayBuyerUuid` | `string` |

#### Returns

`Promise`\<\{
  `message`: `string`;
  `status`: `string`;
\}\>

***

### disburse()

```ts
disburse(payload): Promise<DisburseResult>;
```

Defined in: [providers/selcom/src/selcom.ts:378](https://github.com/borapesa/pesa/blob/d80176dbaeb846a33302a30c19d7d4eba629ed0c/providers/selcom/src/selcom.ts#L378)

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

### fetchStoredCards()

```ts
fetchStoredCards(gatewayBuyerUuid, buyerUserid): Promise<{
  cards: {
     cardToken: string;
     cardType: string;
     creationDate: string;
     id: string;
     maskedCard: string;
     name: string;
  }[];
}>;
```

Defined in: [providers/selcom/src/selcom.ts:909](https://github.com/borapesa/pesa/blob/d80176dbaeb846a33302a30c19d7d4eba629ed0c/providers/selcom/src/selcom.ts#L909)

Fetch stored (tokenized) cards for a buyer.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `gatewayBuyerUuid` | `string` | — returned from the first create-order call for this buyer (`raw.data[0].gateway_buyer_uuid`). |
| `buyerUserid` | `string` | — your internal user ID for the buyer. |

#### Returns

`Promise`\<\{
  `cards`: \{
     `cardToken`: `string`;
     `cardType`: `string`;
     `creationDate`: `string`;
     `id`: `string`;
     `maskedCard`: `string`;
     `name`: `string`;
  \}[];
\}\>

***

### getBalance()

```ts
getBalance(): Promise<BalanceResult>;
```

Defined in: [providers/selcom/src/selcom.ts:602](https://github.com/borapesa/pesa/blob/d80176dbaeb846a33302a30c19d7d4eba629ed0c/providers/selcom/src/selcom.ts#L602)

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

Defined in: [providers/selcom/src/selcom.ts:623](https://github.com/borapesa/pesa/blob/d80176dbaeb846a33302a30c19d7d4eba629ed0c/providers/selcom/src/selcom.ts#L623)

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

Defined in: [providers/selcom/src/selcom.ts:353](https://github.com/borapesa/pesa/blob/d80176dbaeb846a33302a30c19d7d4eba629ed0c/providers/selcom/src/selcom.ts#L353)

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

Defined in: [providers/selcom/src/selcom.ts:485](https://github.com/borapesa/pesa/blob/d80176dbaeb846a33302a30c19d7d4eba629ed0c/providers/selcom/src/selcom.ts#L485)

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

Defined in: [providers/selcom/src/selcom.ts:572](https://github.com/borapesa/pesa/blob/d80176dbaeb846a33302a30c19d7d4eba629ed0c/providers/selcom/src/selcom.ts#L572)

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

### lookupUtility()

```ts
lookupUtility(utilitycode, utilityref): Promise<{
  data: unknown[];
  message: string;
  reference: string;
  status: string;
  transid: string;
}>;
```

Defined in: [providers/selcom/src/selcom.ts:743](https://github.com/borapesa/pesa/blob/d80176dbaeb846a33302a30c19d7d4eba629ed0c/providers/selcom/src/selcom.ts#L743)

Look up a utility account before payment.

Returns the account holder name and (for some utilities) amount due.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `utilitycode` | `string` |
| `utilityref` | `string` |

#### Returns

`Promise`\<\{
  `data`: `unknown`[];
  `message`: `string`;
  `reference`: `string`;
  `status`: `string`;
  `transid`: `string`;
\}\>

***

### payUtility()

```ts
payUtility(params): Promise<{
  message: string;
  reference: string;
  status: string;
  transid: string;
}>;
```

Defined in: [providers/selcom/src/selcom.ts:705](https://github.com/borapesa/pesa/blob/d80176dbaeb846a33302a30c19d7d4eba629ed0c/providers/selcom/src/selcom.ts#L705)

Pay a utility bill (electricity, water, TV, airtime, etc.).

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `params` | \{ `amount`: `number`; `msisdn?`: `string`; `utilitycode`: `string`; `utilityref`: `string`; \} |
| `params.amount` | `number` |
| `params.msisdn?` | `string` |
| `params.utilitycode` | `string` |
| `params.utilityref` | `string` |

#### Returns

`Promise`\<\{
  `message`: `string`;
  `reference`: `string`;
  `status`: `string`;
  `transid`: `string`;
\}\>

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

### queryUtilityStatus()

```ts
queryUtilityStatus(transid): Promise<{
  data: unknown[];
  message: string;
  reference: string;
  status: string;
}>;
```

Defined in: [providers/selcom/src/selcom.ts:772](https://github.com/borapesa/pesa/blob/d80176dbaeb846a33302a30c19d7d4eba629ed0c/providers/selcom/src/selcom.ts#L772)

Query the status of a utility payment.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `transid` | `string` |

#### Returns

`Promise`\<\{
  `data`: `unknown`[];
  `message`: `string`;
  `reference`: `string`;
  `status`: `string`;
\}\>

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

### selcomPesaCashin()

```ts
selcomPesaCashin(
   utilityref, 
   amount, 
   msisdn?): Promise<{
  message: string;
  reference: string;
  status: string;
  transid: string;
}>;
```

Defined in: [providers/selcom/src/selcom.ts:799](https://github.com/borapesa/pesa/blob/d80176dbaeb846a33302a30c19d7d4eba629ed0c/providers/selcom/src/selcom.ts#L799)

Send funds to a Selcom Pesa account.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `utilityref` | `string` | — Selcom Pesa account number or mobile number. |
| `amount` | `number` | — amount in TZS. |
| `msisdn?` | `string` | — sender mobile number (optional). |

#### Returns

`Promise`\<\{
  `message`: `string`;
  `reference`: `string`;
  `status`: `string`;
  `transid`: `string`;
\}\>

***

### selcomPesaNameLookup()

```ts
selcomPesaNameLookup(utilityref): Promise<{
  message: string;
  name?: string;
  reference: string;
  status: string;
  transid: string;
}>;
```

Defined in: [providers/selcom/src/selcom.ts:833](https://github.com/borapesa/pesa/blob/d80176dbaeb846a33302a30c19d7d4eba629ed0c/providers/selcom/src/selcom.ts#L833)

Look up a Selcom Pesa account holder name.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `utilityref` | `string` |

#### Returns

`Promise`\<\{
  `message`: `string`;
  `name?`: `string`;
  `reference`: `string`;
  `status`: `string`;
  `transid`: `string`;
\}\>

***

### validateCredentials()

```ts
validateCredentials(): Promise<{
  message?: string;
  valid: boolean;
}>;
```

Defined in: [providers/selcom/src/selcom.ts:644](https://github.com/borapesa/pesa/blob/d80176dbaeb846a33302a30c19d7d4eba629ed0c/providers/selcom/src/selcom.ts#L644)

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
