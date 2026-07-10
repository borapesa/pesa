---
title: "Interface: PesaHandlerTarget"
---

Defined in: [packages/pesa/src/handler.ts:7](https://github.com/borapesa/pesa/blob/d80176dbaeb846a33302a30c19d7d4eba629ed0c/packages/pesa/src/handler.ts#L7)

Minimal interface for the pesa instance that the handler needs.

## Methods

### handleWebhook()

```ts
handleWebhook(rawBody, headers): Promise<void>;
```

Defined in: [packages/pesa/src/handler.ts:8](https://github.com/borapesa/pesa/blob/d80176dbaeb846a33302a30c19d7d4eba629ed0c/packages/pesa/src/handler.ts#L8)

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

Defined in: [packages/pesa/src/handler.ts:9](https://github.com/borapesa/pesa/blob/d80176dbaeb846a33302a30c19d7d4eba629ed0c/packages/pesa/src/handler.ts#L9)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `event` | [`PaymentEventType`](../type-aliases/PaymentEventType) |
| `handler` | (`event`) => `void` \| `Promise`\<`void`\> |

#### Returns

`void`
