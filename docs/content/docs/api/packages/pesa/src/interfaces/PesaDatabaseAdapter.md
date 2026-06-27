---
title: "Interface: PesaDatabaseAdapter"
---

# Interface: PesaDatabaseAdapter

Defined in: [packages/pesa/src/db/adapter.ts:10](https://github.com/borapesa/pesa/blob/d5e3ce1bd76d0bcd3eae4880e0c1c2cb00933e6c/packages/pesa/src/db/adapter.ts#L10)

Database adapter interface for the event store.

The default SQLiteAdapter requires zero configuration and works in
any Node.js environment. Swap adapters for Turso/libSQL, PostgreSQL,
Prisma, or Drizzle via the `db` field in PesaConfig.

## Methods

### getEvent()

```ts
getEvent(id): Promise<PaymentEvent | null>;
```

Defined in: [packages/pesa/src/db/adapter.ts:15](https://github.com/borapesa/pesa/blob/d5e3ce1bd76d0bcd3eae4880e0c1c2cb00933e6c/packages/pesa/src/db/adapter.ts#L15)

Retrieve a single event by its UUID.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `id` | `string` |

#### Returns

`Promise`\<[`PaymentEvent`](PaymentEvent.md) \| `null`\>

***

### getEventsByOrderId()

```ts
getEventsByOrderId(orderId): Promise<PaymentEvent[]>;
```

Defined in: [packages/pesa/src/db/adapter.ts:21](https://github.com/borapesa/pesa/blob/d5e3ce1bd76d0bcd3eae4880e0c1c2cb00933e6c/packages/pesa/src/db/adapter.ts#L21)

Retrieve all events for a given provider order ID.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `orderId` | `string` |

#### Returns

`Promise`\<[`PaymentEvent`](PaymentEvent.md)[]\>

***

### getEventsByReference()

```ts
getEventsByReference(reference): Promise<PaymentEvent[]>;
```

Defined in: [packages/pesa/src/db/adapter.ts:18](https://github.com/borapesa/pesa/blob/d5e3ce1bd76d0bcd3eae4880e0c1c2cb00933e6c/packages/pesa/src/db/adapter.ts#L18)

Retrieve all events for a given merchant reference.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `reference` | `string` |

#### Returns

`Promise`\<[`PaymentEvent`](PaymentEvent.md)[]\>

***

### saveEvent()

```ts
saveEvent(event): Promise<void>;
```

Defined in: [packages/pesa/src/db/adapter.ts:12](https://github.com/borapesa/pesa/blob/d5e3ce1bd76d0bcd3eae4880e0c1c2cb00933e6c/packages/pesa/src/db/adapter.ts#L12)

Persist a verified PaymentEvent.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `event` | [`PaymentEvent`](PaymentEvent.md) |

#### Returns

`Promise`\<`void`\>
