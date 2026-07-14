---
title: "Interface: SnippeConfig"
---

Defined in: [providers/snippe/src/snippe.ts:36](https://github.com/borapesa/pesa/blob/c75801713de76259f5fc4269849309a91857c509/providers/snippe/src/snippe.ts#L36)

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="apikey"></a> `apiKey` | `string` | Snippe API key (`snp_...`). | [providers/snippe/src/snippe.ts:38](https://github.com/borapesa/pesa/blob/c75801713de76259f5fc4269849309a91857c509/providers/snippe/src/snippe.ts#L38) |
| <a id="baseurl"></a> `baseUrl?` | `string` | Base URL override. Defaults to https://api.snippe.sh. | [providers/snippe/src/snippe.ts:42](https://github.com/borapesa/pesa/blob/c75801713de76259f5fc4269849309a91857c509/providers/snippe/src/snippe.ts#L42) |
| <a id="cancelurl"></a> `cancelUrl?` | `string` | Cancel URL for card payments. The customer is sent here if they abandon the checkout. | [providers/snippe/src/snippe.ts:58](https://github.com/borapesa/pesa/blob/c75801713de76259f5fc4269849309a91857c509/providers/snippe/src/snippe.ts#L58) |
| <a id="redirecturl"></a> `redirectUrl?` | `string` | Default redirect URL for card payments. The customer is sent here after completing payment. Overridable per-payment via CreateOrderPayload.redirectUrl. | [providers/snippe/src/snippe.ts:53](https://github.com/borapesa/pesa/blob/c75801713de76259f5fc4269849309a91857c509/providers/snippe/src/snippe.ts#L53) |
| <a id="timeoutms"></a> `timeoutMs?` | `number` | Request timeout in milliseconds (default: 30_000). | [providers/snippe/src/snippe.ts:60](https://github.com/borapesa/pesa/blob/c75801713de76259f5fc4269849309a91857c509/providers/snippe/src/snippe.ts#L60) |
| <a id="webhooksecret"></a> `webhookSecret` | `string` | HMAC-SHA256 signing key for webhook verification. | [providers/snippe/src/snippe.ts:40](https://github.com/borapesa/pesa/blob/c75801713de76259f5fc4269849309a91857c509/providers/snippe/src/snippe.ts#L40) |
| <a id="webhookurl"></a> `webhookUrl?` | `string` | Default webhook URL applied to createOrder / disburse when the caller doesn't provide one. Provider callbacks POST here. | [providers/snippe/src/snippe.ts:47](https://github.com/borapesa/pesa/blob/c75801713de76259f5fc4269849309a91857c509/providers/snippe/src/snippe.ts#L47) |
