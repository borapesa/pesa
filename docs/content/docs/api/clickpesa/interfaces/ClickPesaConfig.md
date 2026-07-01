---
title: "Interface: ClickPesaConfig"
---

Defined in: [providers/clickpesa/src/clickpesa.ts:31](https://github.com/borapesa/pesa/blob/551532cd94bf0bd50a5389b05b48dbc5bf485d02/providers/clickpesa/src/clickpesa.ts#L31)

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="apikey"></a> `apiKey` | `string` | API key from ClickPesa dashboard. | [providers/clickpesa/src/clickpesa.ts:35](https://github.com/borapesa/pesa/blob/551532cd94bf0bd50a5389b05b48dbc5bf485d02/providers/clickpesa/src/clickpesa.ts#L35) |
| <a id="baseurl"></a> `baseUrl?` | `string` | Explicit base URL override. Takes precedence over `sandbox`. You rarely need this — prefer `sandbox: true` for testing and `sandbox: false` for production. | [providers/clickpesa/src/clickpesa.ts:60](https://github.com/borapesa/pesa/blob/551532cd94bf0bd50a5389b05b48dbc5bf485d02/providers/clickpesa/src/clickpesa.ts#L60) |
| <a id="checksumkey"></a> `checksumKey?` | `string` | Optional checksum key for HMAC-SHA256 signing. When set, every POST/PUT/PATCH request body is automatically signed with a `checksum` field. Also used for verifying incoming webhook signatures. Generate this in the ClickPesa dashboard. | [providers/clickpesa/src/clickpesa.ts:43](https://github.com/borapesa/pesa/blob/551532cd94bf0bd50a5389b05b48dbc5bf485d02/providers/clickpesa/src/clickpesa.ts#L43) |
| <a id="clientid"></a> `clientId` | `string` | Client ID from ClickPesa dashboard. | [providers/clickpesa/src/clickpesa.ts:33](https://github.com/borapesa/pesa/blob/551532cd94bf0bd50a5389b05b48dbc5bf485d02/providers/clickpesa/src/clickpesa.ts#L33) |
| <a id="redirecturl"></a> `redirectUrl?` | `string` | Default redirect URL for hosted checkout. The customer is sent here after completing payment. Overridable per-payment via CreateOrderPayload.redirectUrl. | [providers/clickpesa/src/clickpesa.ts:66](https://github.com/borapesa/pesa/blob/551532cd94bf0bd50a5389b05b48dbc5bf485d02/providers/clickpesa/src/clickpesa.ts#L66) |
| <a id="sandbox"></a> `sandbox?` | `boolean` | Target the sandbox environment. When `true`, defaults to `https://api-sandbox.clickpesa.com`. When `false` (default), uses `https://api.clickpesa.com`. Set `baseUrl` directly to override both — useful for local proxies or staging environments. | [providers/clickpesa/src/clickpesa.ts:53](https://github.com/borapesa/pesa/blob/551532cd94bf0bd50a5389b05b48dbc5bf485d02/providers/clickpesa/src/clickpesa.ts#L53) |
