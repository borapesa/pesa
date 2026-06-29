---
title: "Interface: OrderResult"
---

Defined in: [packages/pesa/src/types/order.ts:104](https://github.com/borapesa/pesa/blob/7a2a3f8aafdb5924ee403a0a96f7d04dd7d2b7aa/packages/pesa/src/types/order.ts#L104)

Result returned after initiating a payment.

The shape varies by provider. Redirect-based providers (DPO, Pesapal)
return `checkoutUrl`. USSD push providers (Selcom, ClickPesa) set
`ussdPushInitiated: true`.

## Example

```ts
const order = await pesa.createOrder({ ... });

if (order.checkoutUrl) {
  // Redirect-based flow: send customer to the URL
  return redirect(order.checkoutUrl);
}
// USSD push flow: customer receives a PIN prompt on their phone
```

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="checkouturl"></a> `checkoutUrl?` | `string` | Redirect URL for DPO / Pesapal redirect flows. | [packages/pesa/src/types/order.ts:115](https://github.com/borapesa/pesa/blob/7a2a3f8aafdb5924ee403a0a96f7d04dd7d2b7aa/packages/pesa/src/types/order.ts#L115) |
| <a id="orderid"></a> `orderId` | `string` | Provider-assigned transaction ID. Use this to query status via [PesaInstance.getPaymentStatus](PesaInstance.md#getpaymentstatus). | [packages/pesa/src/types/order.ts:109](https://github.com/borapesa/pesa/blob/7a2a3f8aafdb5924ee403a0a96f7d04dd7d2b7aa/packages/pesa/src/types/order.ts#L109) |
| <a id="raw"></a> `raw?` | `unknown` | Raw provider response. **Escape hatch — never rely on this.** Use the normalized fields instead. | [packages/pesa/src/types/order.ts:122](https://github.com/borapesa/pesa/blob/7a2a3f8aafdb5924ee403a0a96f7d04dd7d2b7aa/packages/pesa/src/types/order.ts#L122) |
| <a id="reference"></a> `reference` | `string` | Your reference, echoed back. | [packages/pesa/src/types/order.ts:111](https://github.com/borapesa/pesa/blob/7a2a3f8aafdb5924ee403a0a96f7d04dd7d2b7aa/packages/pesa/src/types/order.ts#L111) |
| <a id="status"></a> `status` | [`PaymentStatus`](../type-aliases/PaymentStatus) | Current payment status. | [packages/pesa/src/types/order.ts:113](https://github.com/borapesa/pesa/blob/7a2a3f8aafdb5924ee403a0a96f7d04dd7d2b7aa/packages/pesa/src/types/order.ts#L113) |
| <a id="ussdpushinitiated"></a> `ussdPushInitiated?` | `boolean` | Whether a USSD push was initiated (Selcom / MNO push flows). | [packages/pesa/src/types/order.ts:117](https://github.com/borapesa/pesa/blob/7a2a3f8aafdb5924ee403a0a96f7d04dd7d2b7aa/packages/pesa/src/types/order.ts#L117) |
