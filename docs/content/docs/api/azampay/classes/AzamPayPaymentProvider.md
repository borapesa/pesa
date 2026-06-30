---
title: "Class: AzamPayPaymentProvider"
---

Defined in: [providers/azampay/src/azampay.ts:148](https://github.com/borapesa/pesa/blob/bb0341345be96209d9f1026440a10cf3f86d0e28/providers/azampay/src/azampay.ts#L148)

## Extends

- `BasePaymentProvider`

## Constructors

### Constructor

```ts
new AzamPayPaymentProvider(config): AzamPayPaymentProvider;
```

Defined in: [providers/azampay/src/azampay.ts:166](https://github.com/borapesa/pesa/blob/bb0341345be96209d9f1026440a10cf3f86d0e28/providers/azampay/src/azampay.ts#L166)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `config` | [`AzamPayConfig`](../interfaces/AzamPayConfig) |

#### Returns

`AzamPayPaymentProvider`

#### Overrides

```ts
BasePaymentProvider.constructor
```

## Properties

| Property | Modifier | Type | Default value | Description | Overrides | Defined in |
| ------ | ------ | ------ | ------ | ------ | ------ | ------ |
| <a id="name"></a> `name` | `readonly` | `ProviderName` | `'azampay'` | Unique provider identifier. | `BasePaymentProvider.name` | [providers/azampay/src/azampay.ts:149](https://github.com/borapesa/pesa/blob/bb0341345be96209d9f1026440a10cf3f86d0e28/providers/azampay/src/azampay.ts#L149) |

## Methods

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

### createBankCheckout()

```ts
createBankCheckout(params): Promise<{
  success: boolean;
  transactionId: string;
}>;
```

Defined in: [providers/azampay/src/azampay.ts:680](https://github.com/borapesa/pesa/blob/bb0341345be96209d9f1026440a10cf3f86d0e28/providers/azampay/src/azampay.ts#L680)

Bank checkout — accepts OTP from the customer (obtained via USSD).

This is a two-step flow:
1. Customer dials `*150*03#` (CRDB) or `*150*66#` (NMB) to get OTP
2. Customer provides OTP to your app
3. Your app calls this method with the OTP

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `params` | \{ `amount`: `string`; `merchantAccountNumber`: `string`; `merchantMobileNumber`: `string`; `merchantName?`: `string`; `otp`: `string`; `provider`: `"CRDB"` \| `"NMB"`; `referenceId`: `string`; \} |
| `params.amount` | `string` |
| `params.merchantAccountNumber` | `string` |
| `params.merchantMobileNumber` | `string` |
| `params.merchantName?` | `string` |
| `params.otp` | `string` |
| `params.provider` | `"CRDB"` \| `"NMB"` |
| `params.referenceId` | `string` |

#### Returns

`Promise`\<\{
  `success`: `boolean`;
  `transactionId`: `string`;
\}\>

***

### createOrder()

```ts
createOrder(payload): Promise<OrderResult>;
```

Defined in: [providers/azampay/src/azampay.ts:373](https://github.com/borapesa/pesa/blob/bb0341345be96209d9f1026440a10cf3f86d0e28/providers/azampay/src/azampay.ts#L373)

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

### createPostCheckout()

```ts
createPostCheckout(params): Promise<string>;
```

Defined in: [providers/azampay/src/azampay.ts:706](https://github.com/borapesa/pesa/blob/bb0341345be96209d9f1026440a10cf3f86d0e28/providers/azampay/src/azampay.ts#L706)

Generate a hosted checkout page URL. Returns the URL to redirect to.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `params` | \{ `amount`: `string`; `currency`: `string`; `externalId`: `string`; `items?`: \{ `name`: `string`; \}[]; `language?`: `string`; `redirectFailURL`: `string`; `redirectSuccessURL`: `string`; `vendorId`: `string`; `vendorName`: `string`; \} |
| `params.amount` | `string` |
| `params.currency` | `string` |
| `params.externalId` | `string` |
| `params.items?` | \{ `name`: `string`; \}[] |
| `params.language?` | `string` |
| `params.redirectFailURL` | `string` |
| `params.redirectSuccessURL` | `string` |
| `params.vendorId` | `string` |
| `params.vendorName` | `string` |

#### Returns

`Promise`\<`string`\>

***

### disburse()

```ts
disburse(payload): Promise<DisburseResult>;
```

Defined in: [providers/azampay/src/azampay.ts:508](https://github.com/borapesa/pesa/blob/bb0341345be96209d9f1026440a10cf3f86d0e28/providers/azampay/src/azampay.ts#L508)

Disburse (B2C payout).

Uses the **disbursement** base URL per the OpenAPI spec.

Response uses `pgReferenceId` (spec field), not `data`.
`transferDetails.dateInEpoch` per spec (epoch seconds, not ISO string).
`bankName` fields use lowercase enum values (`tigo`, `airtel`, `azampesa`).

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

### getBalance()?

```ts
optional getBalance(): Promise<BalanceResult>;
```

Defined in: packages/pesa/dist/providers/base.d.ts:125

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

#### Inherited from

```ts
BasePaymentProvider.getBalance
```

***

### getNameLookup()

```ts
getNameLookup(phoneOrAccount): Promise<NameLookupResult>;
```

Defined in: [providers/azampay/src/azampay.ts:629](https://github.com/borapesa/pesa/blob/bb0341345be96209d9f1026440a10cf3f86d0e28/providers/azampay/src/azampay.ts#L629)

Name lookup.

Uses the **disbursement** base URL per the OpenAPI spec.
Accepts `status` field from the spec; falls back to `success` for
provider implementations that deviate from their own spec.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `phoneOrAccount` | `string` |

#### Returns

`Promise`\<`NameLookupResult`\>

#### Overrides

```ts
BasePaymentProvider.getNameLookup
```

***

### getPaymentPartners()

```ts
getPaymentPartners(): Promise<PartnerResponse[]>;
```

Defined in: [providers/azampay/src/azampay.ts:753](https://github.com/borapesa/pesa/blob/bb0341345be96209d9f1026440a10cf3f86d0e28/providers/azampay/src/azampay.ts#L753)

List available payment partners for the configured merchant.

The AzamPay spec returns a **bare JSON array** of partner objects,
not a `{ partners: [...] }` wrapper.

#### Returns

`Promise`\<`PartnerResponse`[]\>

***

### getPaymentStatus()

```ts
getPaymentStatus(orderId, providerName?): Promise<PaymentStatus>;
```

Defined in: [providers/azampay/src/azampay.ts:465](https://github.com/borapesa/pesa/blob/bb0341345be96209d9f1026440a10cf3f86d0e28/providers/azampay/src/azampay.ts#L465)

Query payment status.

Uses the **disbursement** base URL per the OpenAPI spec.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `orderId` | `string` | The AzamPay transaction ID returned by [createOrder](#createorder). |
| `providerName?` | `string` | The MNO name for the query (e.g. `'airtel'`, `'tigo'`, `'azampesa'`). When called through the SDK, this is resolved automatically from the order-to-provider mapping stored by [createOrder](#createorder). Callers who bypass `createOrder` must pass it explicitly. |

#### Returns

`Promise`\<`PaymentStatus`\>

#### Overrides

```ts
BasePaymentProvider.getPaymentStatus
```

***

### handleWebhook()

```ts
handleWebhook(rawBody, _headers): Promise<PaymentEvent>;
```

Defined in: [providers/azampay/src/azampay.ts:566](https://github.com/borapesa/pesa/blob/bb0341345be96209d9f1026440a10cf3f86d0e28/providers/azampay/src/azampay.ts#L566)

Parse and verify an incoming AzamPay callback (webhook).

Matches the `CallbackRequest` schema from the AzamPay OpenAPI spec:
`transactionstatus` (string), `transid`, `utilityref`, `operator`,
`externalreference`, `msisdn`, `mnoreference`, `amount` (string),
and `signature` (RSA base64).

**Signature verification:** AzamPay signs callbacks with an RSA
digital signature over
`{utilityref}{externalreference}{transactionstatus}{operator}`.
The public key is fetched from
`GET /azampay/v1/public-key?format=Pem` (cached 24 hours).
If the signature is absent (`null`), verification is skipped —
this is accepted in the spec but should be logged for production.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `rawBody` | `string` \| `Buffer`\<`ArrayBufferLike`\> |
| `_headers` | `Record`\<`string`, `string`\> |

#### Returns

`Promise`\<[`PaymentEvent`](/docs/api/pesa/interfaces/PaymentEvent)\>

#### Overrides

```ts
BasePaymentProvider.handleWebhook
```

***

### listOrders()?

```ts
optional listOrders(_params): Promise<ListOrdersResult>;
```

Defined in: packages/pesa/dist/providers/base.d.ts:153

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

Defined in: [providers/azampay/src/azampay.ts:658](https://github.com/borapesa/pesa/blob/bb0341345be96209d9f1026440a10cf3f86d0e28/providers/azampay/src/azampay.ts#L658)

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
