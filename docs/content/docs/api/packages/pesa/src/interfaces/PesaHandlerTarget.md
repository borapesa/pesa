---
title: "Interface: PesaHandlerTarget"
---

# Interface: PesaHandlerTarget

Defined in: [packages/pesa/src/handler.ts:10](https://github.com/borapesa/pesa/blob/d5e3ce1bd76d0bcd3eae4880e0c1c2cb00933e6c/packages/pesa/src/handler.ts#L10)

Minimal interface for the pesa instance that the handler needs.
Defined here (not imported from pesa.ts) to avoid circular dependencies.

## Methods

### createOrder()

```ts
createOrder(payload): Promise<OrderResult>;
```

Defined in: [packages/pesa/src/handler.ts:11](https://github.com/borapesa/pesa/blob/d5e3ce1bd76d0bcd3eae4880e0c1c2cb00933e6c/packages/pesa/src/handler.ts#L11)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `payload` | [`CreateOrderPayload`](CreateOrderPayload.md) |

#### Returns

`Promise`\<[`OrderResult`](OrderResult.md)\>

***

### getPaymentStatus()

```ts
getPaymentStatus(orderId): Promise<PaymentStatus>;
```

Defined in: [packages/pesa/src/handler.ts:12](https://github.com/borapesa/pesa/blob/d5e3ce1bd76d0bcd3eae4880e0c1c2cb00933e6c/packages/pesa/src/handler.ts#L12)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `orderId` | `string` |

#### Returns

`Promise`\<[`PaymentStatus`](../type-aliases/PaymentStatus.md)\>

***

### handleWebhook()

```ts
handleWebhook(rawBody, headers): Promise<void>;
```

Defined in: [packages/pesa/src/handler.ts:13](https://github.com/borapesa/pesa/blob/d5e3ce1bd76d0bcd3eae4880e0c1c2cb00933e6c/packages/pesa/src/handler.ts#L13)

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

Defined in: [packages/pesa/src/handler.ts:14](https://github.com/borapesa/pesa/blob/d5e3ce1bd76d0bcd3eae4880e0c1c2cb00933e6c/packages/pesa/src/handler.ts#L14)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `event` | [`PaymentEventType`](../type-aliases/PaymentEventType.md) |
| `handler` | (`event`) => `void` \| `Promise`\<`void`\> |

#### Returns

`void`
