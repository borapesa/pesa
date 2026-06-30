---
title: "Interface: CreateOrderPayload"
---

Defined in: [packages/pesa/src/types/order.ts:53](https://github.com/borapesa/pesa/blob/b07aee7503efdb35e9de5a2777ab7a4f391cf081/packages/pesa/src/types/order.ts#L53)

Payload for creating a payment order.

Pass this to [PesaInstance.createOrder](PesaInstance.md#createorder) to initiate a payment.
The SDK validates required fields before forwarding to the provider.

## Example

```ts
const order = await pesa.createOrder({
  amount:    15000,
  currency:  'TZS',
  reference: 'order_abc123',
  customer:  {
    name:  'Juma Ali',
    phone: '255712345678',
    email: 'juma@example.com',
  },
  description: 'Monthly subscription',
});
```

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="amount"></a> `amount` | `number` | Amount in whole TZS. 15000 = TZS 15,000. Must be > 0. | [packages/pesa/src/types/order.ts:55](https://github.com/borapesa/pesa/blob/b07aee7503efdb35e9de5a2777ab7a4f391cf081/packages/pesa/src/types/order.ts#L55) |
| <a id="currency"></a> `currency` | [`Currency`](../type-aliases/Currency) | Currency code. Currently only `'TZS'`. | [packages/pesa/src/types/order.ts:57](https://github.com/borapesa/pesa/blob/b07aee7503efdb35e9de5a2777ab7a4f391cf081/packages/pesa/src/types/order.ts#L57) |
| <a id="customer"></a> `customer` | \{ `email?`: `string`; `name`: `string`; `phone`: `string`; \} | Customer details. | [packages/pesa/src/types/order.ts:66](https://github.com/borapesa/pesa/blob/b07aee7503efdb35e9de5a2777ab7a4f391cf081/packages/pesa/src/types/order.ts#L66) |
| `customer.email?` | `string` | Customer's email address (optional). | [packages/pesa/src/types/order.ts:75](https://github.com/borapesa/pesa/blob/b07aee7503efdb35e9de5a2777ab7a4f391cf081/packages/pesa/src/types/order.ts#L75) |
| `customer.name` | `string` | Customer's full name. | [packages/pesa/src/types/order.ts:68](https://github.com/borapesa/pesa/blob/b07aee7503efdb35e9de5a2777ab7a4f391cf081/packages/pesa/src/types/order.ts#L68) |
| `customer.phone` | `string` | Mobile money phone number in MSISDN format: `255XXXXXXXXX`. Local formats like `07XX` are rejected. | [packages/pesa/src/types/order.ts:73](https://github.com/borapesa/pesa/blob/b07aee7503efdb35e9de5a2777ab7a4f391cf081/packages/pesa/src/types/order.ts#L73) |
| <a id="description"></a> `description?` | `string` | Optional human-readable description of the order. | [packages/pesa/src/types/order.ts:64](https://github.com/borapesa/pesa/blob/b07aee7503efdb35e9de5a2777ab7a4f391cf081/packages/pesa/src/types/order.ts#L64) |
| <a id="metadata"></a> `metadata?` | `Record`\<`string`, `unknown`\> | Arbitrary metadata attached to the order. | [packages/pesa/src/types/order.ts:83](https://github.com/borapesa/pesa/blob/b07aee7503efdb35e9de5a2777ab7a4f391cf081/packages/pesa/src/types/order.ts#L83) |
| <a id="redirecturl"></a> `redirectUrl?` | `string` | Required for redirect-based providers (DPO, Pesapal). URL the customer is sent to after completing payment. | [packages/pesa/src/types/order.ts:81](https://github.com/borapesa/pesa/blob/b07aee7503efdb35e9de5a2777ab7a4f391cf081/packages/pesa/src/types/order.ts#L81) |
| <a id="reference"></a> `reference` | `string` | Your internal order identifier. Must be unique. Used for idempotency — the same reference won't be charged twice. | [packages/pesa/src/types/order.ts:62](https://github.com/borapesa/pesa/blob/b07aee7503efdb35e9de5a2777ab7a4f391cf081/packages/pesa/src/types/order.ts#L62) |
