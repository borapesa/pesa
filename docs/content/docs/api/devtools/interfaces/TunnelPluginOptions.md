---
title: "Interface: TunnelPluginOptions"
---

Defined in: [packages/devtools/src/tunnel.ts:194](https://github.com/borapesa/pesa/blob/551532cd94bf0bd50a5389b05b48dbc5bf485d02/packages/devtools/src/tunnel.ts#L194)

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="binary"></a> `binary?` | `string` | Override the cloudflared binary path or name. Useful for testing with a mock binary that mimics cloudflared's I/O. **Default** `'cloudflared'` | [packages/devtools/src/tunnel.ts:212](https://github.com/borapesa/pesa/blob/551532cd94bf0bd50a5389b05b48dbc5bf485d02/packages/devtools/src/tunnel.ts#L212) |
| <a id="log"></a> `log?` | `boolean` | Whether to print the tunnel URL to the console. **Default** `true` | [packages/devtools/src/tunnel.ts:205](https://github.com/borapesa/pesa/blob/551532cd94bf0bd50a5389b05b48dbc5bf485d02/packages/devtools/src/tunnel.ts#L205) |
| <a id="port"></a> `port?` | `number` | The local port to expose via the tunnel. **Default** `3000` | [packages/devtools/src/tunnel.ts:199](https://github.com/borapesa/pesa/blob/551532cd94bf0bd50a5389b05b48dbc5bf485d02/packages/devtools/src/tunnel.ts#L199) |
| <a id="webhookpath"></a> `webhookPath?` | `string` | The webhook endpoint path on your server. Printed in the console as the webhook URL to use for provider callbacks. **Default** `'/pesa/webhook'` | [packages/devtools/src/tunnel.ts:219](https://github.com/borapesa/pesa/blob/551532cd94bf0bd50a5389b05b48dbc5bf485d02/packages/devtools/src/tunnel.ts#L219) |
