---
title: "Interface: AzamPayConfig"
---

Defined in: [providers/azampay/src/azampay.ts:32](https://github.com/borapesa/pesa/blob/fd0db8b0df993c6583d9e24a7ce47f1b6a556685/providers/azampay/src/azampay.ts#L32)

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="apikey"></a> `apiKey` | `string` | API key from AzamPay dashboard. | [providers/azampay/src/azampay.ts:40](https://github.com/borapesa/pesa/blob/fd0db8b0df993c6583d9e24a7ce47f1b6a556685/providers/azampay/src/azampay.ts#L40) |
| <a id="appname"></a> `appName` | `string` | App name from AzamPay dashboard. | [providers/azampay/src/azampay.ts:34](https://github.com/borapesa/pesa/blob/fd0db8b0df993c6583d9e24a7ce47f1b6a556685/providers/azampay/src/azampay.ts#L34) |
| <a id="authbaseurl"></a> `authBaseUrl?` | `string` | Override auth base URL. | [providers/azampay/src/azampay.ts:48](https://github.com/borapesa/pesa/blob/fd0db8b0df993c6583d9e24a7ce47f1b6a556685/providers/azampay/src/azampay.ts#L48) |
| <a id="checkoutbaseurl"></a> `checkoutBaseUrl?` | `string` | Override checkout base URL. | [providers/azampay/src/azampay.ts:50](https://github.com/borapesa/pesa/blob/fd0db8b0df993c6583d9e24a7ce47f1b6a556685/providers/azampay/src/azampay.ts#L50) |
| <a id="clientid"></a> `clientId` | `string` | Client ID from AzamPay dashboard. | [providers/azampay/src/azampay.ts:36](https://github.com/borapesa/pesa/blob/fd0db8b0df993c6583d9e24a7ce47f1b6a556685/providers/azampay/src/azampay.ts#L36) |
| <a id="clientsecret"></a> `clientSecret` | `string` | Client secret from AzamPay dashboard. | [providers/azampay/src/azampay.ts:38](https://github.com/borapesa/pesa/blob/fd0db8b0df993c6583d9e24a7ce47f1b6a556685/providers/azampay/src/azampay.ts#L38) |
| <a id="disbursementbaseurl"></a> `disbursementBaseUrl?` | `string` | Override disbursement base URL. The AzamPay API uses a **separate host** for disbursement endpoints (`disburse`, `getNameLookup`, `getPaymentStatus`). Defaults to `https://api-disbursement-sandbox.azampay.co.tz` (sandbox) or `https://api-disbursement.azampay.co.tz` (production). | [providers/azampay/src/azampay.ts:59](https://github.com/borapesa/pesa/blob/fd0db8b0df993c6583d9e24a7ce47f1b6a556685/providers/azampay/src/azampay.ts#L59) |
| <a id="sandbox"></a> `sandbox?` | `boolean` | Target sandbox (default: true). | [providers/azampay/src/azampay.ts:46](https://github.com/borapesa/pesa/blob/fd0db8b0df993c6583d9e24a7ce47f1b6a556685/providers/azampay/src/azampay.ts#L46) |
| <a id="senderbank"></a> `senderBank?` | `string` | Sender/merchant bank name for disbursement (default: "AzamPay"). | [providers/azampay/src/azampay.ts:44](https://github.com/borapesa/pesa/blob/fd0db8b0df993c6583d9e24a7ce47f1b6a556685/providers/azampay/src/azampay.ts#L44) |
| <a id="sendername"></a> `senderName` | `string` | Sender/merchant display name for disbursement transfers. | [providers/azampay/src/azampay.ts:42](https://github.com/borapesa/pesa/blob/fd0db8b0df993c6583d9e24a7ce47f1b6a556685/providers/azampay/src/azampay.ts#L42) |
