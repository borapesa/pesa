---
title: "Interface: PesaHandlerTarget"
---

Defined in: [packages/pesa/src/handler.ts:10](https://github.com/borapesa/pesa/blob/b07aee7503efdb35e9de5a2777ab7a4f391cf081/packages/pesa/src/handler.ts#L10)

Minimal interface for the pesa instance that the handler needs.
Defined here (not imported from pesa.ts) to avoid circular dependencies.

## Methods

### createOrder()

```ts
createOrder(payload): Promise<OrderResult>;
```

Defined in: [packages/pesa/src/handler.ts:11](https://github.com/borapesa/pesa/blob/b07aee7503efdb35e9de5a2777ab7a4f391cf081/packages/pesa/src/handler.ts#L11)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `payload` | [`CreateOrderPayload`](CreateOrderPayload) |

#### Returns

`Promise`\<[`OrderResult`](OrderResult)\>

***

### getPaymentStatus()

```ts
getPaymentStatus(orderId): Promise<PaymentStatus>;
```

Defined in: [packages/pesa/src/handler.ts:12](https://github.com/borapesa/pesa/blob/b07aee7503efdb35e9de5a2777ab7a4f391cf081/packages/pesa/src/handler.ts#L12)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `orderId` | `string` |

#### Returns

`Promise`\<[`PaymentStatus`](../type-aliases/PaymentStatus)\>

***

### handleWebhook()

```ts
handleWebhook(rawBody, headers): Promise<void>;
```

Defined in: [packages/pesa/src/handler.ts:13](https://github.com/borapesa/pesa/blob/b07aee7503efdb35e9de5a2777ab7a4f391cf081/packages/pesa/src/handler.ts#L13)

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

Defined in: [packages/pesa/src/handler.ts:14](https://github.com/borapesa/pesa/blob/b07aee7503efdb35e9de5a2777ab7a4f391cf081/packages/pesa/src/handler.ts#L14)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `event` | [`PaymentEventType`](../type-aliases/PaymentEventType) |
| `handler` | (`event`) => `void` \| `Promise`\<`void`\> |

#### Returns

`void`
