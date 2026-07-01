---
title: "Interface: PesaHandlerTarget"
---

Defined in: [packages/pesa/src/handler.ts:7](https://github.com/borapesa/pesa/blob/551532cd94bf0bd50a5389b05b48dbc5bf485d02/packages/pesa/src/handler.ts#L7)

Minimal interface for the pesa instance that the handler needs.

## Methods

### handleWebhook()

```ts
handleWebhook(rawBody, headers): Promise<void>;
```

Defined in: [packages/pesa/src/handler.ts:8](https://github.com/borapesa/pesa/blob/551532cd94bf0bd50a5389b05b48dbc5bf485d02/packages/pesa/src/handler.ts#L8)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `rawBody` | `string` \| `Buffer`\<`ArrayBufferLike`\> |
| `headers` | `Record`\<`string`, `string`\> |

#### Returns

`Promise`\<`void`\>

***

### on()

```ts
on(event, handler): void;
```

Defined in: [packages/pesa/src/handler.ts:9](https://github.com/borapesa/pesa/blob/551532cd94bf0bd50a5389b05b48dbc5bf485d02/packages/pesa/src/handler.ts#L9)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `event` | [`PaymentEventType`](../type-aliases/PaymentEventType) |
| `handler` | (`event`) => `void` \| `Promise`\<`void`\> |

#### Returns

`void`
