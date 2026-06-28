---
title: "Interface: SelcomConfig"
---

Defined in: [providers/selcom/src/selcom.ts:29](https://github.com/borapesa/pesa/blob/baa979229e12b20ccff1c404ff60a42226191e08/providers/selcom/src/selcom.ts#L29)

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="apikey"></a> `apiKey` | `string` | API key from Selcom. | [providers/selcom/src/selcom.ts:33](https://github.com/borapesa/pesa/blob/baa979229e12b20ccff1c404ff60a42226191e08/providers/selcom/src/selcom.ts#L33) |
| <a id="apisecret"></a> `apiSecret` | `string` | API secret for HMAC signing. | [providers/selcom/src/selcom.ts:35](https://github.com/borapesa/pesa/blob/baa979229e12b20ccff1c404ff60a42226191e08/providers/selcom/src/selcom.ts#L35) |
| <a id="baseurl"></a> `baseUrl?` | `string` | Base URL. Defaults to https://apigw.selcommobile.com. | [providers/selcom/src/selcom.ts:31](https://github.com/borapesa/pesa/blob/baa979229e12b20ccff1c404ff60a42226191e08/providers/selcom/src/selcom.ts#L31) |
| <a id="pin"></a> `pin` | `string` | Float account PIN — required for disbursement and balance queries. | [providers/selcom/src/selcom.ts:39](https://github.com/borapesa/pesa/blob/baa979229e12b20ccff1c404ff60a42226191e08/providers/selcom/src/selcom.ts#L39) |
| <a id="senderaccount"></a> `senderAccount?` | `string` | Source account number for Qwiksend bank transfers. Defaults to vendor if not set. | [providers/selcom/src/selcom.ts:44](https://github.com/borapesa/pesa/blob/baa979229e12b20ccff1c404ff60a42226191e08/providers/selcom/src/selcom.ts#L44) |
| <a id="sendername"></a> `senderName?` | `string` | Account holder display name for bank transfers. Defaults to vendor if not set. | [providers/selcom/src/selcom.ts:49](https://github.com/borapesa/pesa/blob/baa979229e12b20ccff1c404ff60a42226191e08/providers/selcom/src/selcom.ts#L49) |
| <a id="senderphone"></a> `senderPhone?` | `string` | Sender mobile number for bank transfers. | [providers/selcom/src/selcom.ts:53](https://github.com/borapesa/pesa/blob/baa979229e12b20ccff1c404ff60a42226191e08/providers/selcom/src/selcom.ts#L53) |
| <a id="vendor"></a> `vendor` | `string` | Float account / vendor identifier. | [providers/selcom/src/selcom.ts:37](https://github.com/borapesa/pesa/blob/baa979229e12b20ccff1c404ff60a42226191e08/providers/selcom/src/selcom.ts#L37) |
