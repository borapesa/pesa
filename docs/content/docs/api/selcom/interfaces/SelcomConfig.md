---
title: "Interface: SelcomConfig"
---

Defined in: [providers/selcom/src/selcom.ts:30](https://github.com/borapesa/pesa/blob/bb0341345be96209d9f1026440a10cf3f86d0e28/providers/selcom/src/selcom.ts#L30)

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="apikey"></a> `apiKey` | `string` | API key from Selcom. | [providers/selcom/src/selcom.ts:34](https://github.com/borapesa/pesa/blob/bb0341345be96209d9f1026440a10cf3f86d0e28/providers/selcom/src/selcom.ts#L34) |
| <a id="apisecret"></a> `apiSecret` | `string` | API secret for HMAC signing. | [providers/selcom/src/selcom.ts:36](https://github.com/borapesa/pesa/blob/bb0341345be96209d9f1026440a10cf3f86d0e28/providers/selcom/src/selcom.ts#L36) |
| <a id="baseurl"></a> `baseUrl?` | `string` | Base URL. Defaults to https://apigw.selcommobile.com. | [providers/selcom/src/selcom.ts:32](https://github.com/borapesa/pesa/blob/bb0341345be96209d9f1026440a10cf3f86d0e28/providers/selcom/src/selcom.ts#L32) |
| <a id="pin"></a> `pin` | `string` | Float account PIN — required for disbursement and balance queries. | [providers/selcom/src/selcom.ts:40](https://github.com/borapesa/pesa/blob/bb0341345be96209d9f1026440a10cf3f86d0e28/providers/selcom/src/selcom.ts#L40) |
| <a id="senderaccount"></a> `senderAccount?` | `string` | Source account number for Qwiksend bank transfers. Defaults to vendor if not set. | [providers/selcom/src/selcom.ts:45](https://github.com/borapesa/pesa/blob/bb0341345be96209d9f1026440a10cf3f86d0e28/providers/selcom/src/selcom.ts#L45) |
| <a id="sendername"></a> `senderName?` | `string` | Account holder display name for bank transfers. Defaults to vendor if not set. | [providers/selcom/src/selcom.ts:50](https://github.com/borapesa/pesa/blob/bb0341345be96209d9f1026440a10cf3f86d0e28/providers/selcom/src/selcom.ts#L50) |
| <a id="senderphone"></a> `senderPhone?` | `string` | Sender mobile number for bank transfers. | [providers/selcom/src/selcom.ts:54](https://github.com/borapesa/pesa/blob/bb0341345be96209d9f1026440a10cf3f86d0e28/providers/selcom/src/selcom.ts#L54) |
| <a id="vendor"></a> `vendor` | `string` | Float account / vendor identifier. | [providers/selcom/src/selcom.ts:38](https://github.com/borapesa/pesa/blob/bb0341345be96209d9f1026440a10cf3f86d0e28/providers/selcom/src/selcom.ts#L38) |
