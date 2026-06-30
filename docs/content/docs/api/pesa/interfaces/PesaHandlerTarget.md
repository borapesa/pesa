---
title: "Interface: PesaHandlerTarget"
---

Defined in: [packages/pesa/src/handler.ts:7](https://github.com/borapesa/pesa/blob/fd0db8b0df993c6583d9e24a7ce47f1b6a556685/packages/pesa/src/handler.ts#L7)

Minimal interface for the pesa instance that the handler needs.

## Methods

### handleWebhook()

```ts
handleWebhook(rawBody, headers): Promise<void>;
```

Defined in: [packages/pesa/src/handler.ts:8](https://github.com/borapesa/pesa/blob/fd0db8b0df993c6583d9e24a7ce47f1b6a556685/packages/pesa/src/handler.ts#L8)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `rawBody` | `any` |
| `headers` | `Record`\<`string`, `string`\> |

#### Returns

`Promise`\<`void`\>

***

### on()

```ts
on(event, handler): void;
```

Defined in: [packages/pesa/src/handler.ts:9](https://github.com/borapesa/pesa/blob/fd0db8b0df993c6583d9e24a7ce47f1b6a556685/packages/pesa/src/handler.ts#L9)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `event` | [`PaymentEventType`](../type-aliases/PaymentEventType) |
| `handler` | (`event`) => `void` \| `Promise`\<`void`\> |

#### Returns

`void`
