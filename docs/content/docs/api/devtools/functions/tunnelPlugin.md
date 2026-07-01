---
title: "Function: tunnelPlugin()"
---

```ts
function tunnelPlugin(opts?): PesaPlugin;
```

Defined in: [packages/devtools/src/tunnel.ts:247](https://github.com/borapesa/pesa/blob/5a6826bdcf9bdf66e849b708b5bc0fddc6567473/packages/devtools/src/tunnel.ts#L247)

A borapesa plugin that starts a Cloudflare Quick Tunnel for local
webhook development.  Requires `cloudflared` on the system PATH
(free, no account needed).

The tunnel persists across Bun/Node --watch reloads — the same URL
is reused between restarts so you don't need to reconfigure your
provider dashboard on every file change.

```ts
import { createPesa } from '@borapesa/pesa';
import { tunnelPlugin } from '@borapesa/devtools';

const pesa = createPesa({
  provider: new SelcomPaymentProvider({...}),
  plugins: [tunnelPlugin()],
});
// First launch:
// 🛜  @borapesa/tunnel
//    Tunnel ready:  https://xxx.trycloudflare.com
//    Webhook URL:   https://xxx.trycloudflare.com/pesa/webhook  (or custom webhookPath)
//
// Subsequent Bun --watch reloads: (silent — reuses same URL)
```

## Parameters

| Parameter | Type |
| ------ | ------ |
| `opts` | [`TunnelPluginOptions`](../interfaces/TunnelPluginOptions) |

## Returns

`PesaPlugin`
