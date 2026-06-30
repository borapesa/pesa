---
title: "Interface: PesaDatabaseAdapter"
---

Defined in: [packages/pesa/src/db/adapter.ts:10](https://github.com/borapesa/pesa/blob/49ea5b664fa2d117c65866f1980324917cea45d1/packages/pesa/src/db/adapter.ts#L10)

Database adapter interface for the event store.

The default SQLiteAdapter requires zero configuration and works in
any Node.js environment. Swap adapters for Turso/libSQL, PostgreSQL,
Prisma, or Drizzle via the `db` field in PesaConfig.

## Methods

### getEvent()

```ts
getEvent(id): Promise<PaymentEvent | null>;
```

Defined in: [packages/pesa/src/db/adapter.ts:15](https://github.com/borapesa/pesa/blob/49ea5b664fa2d117c65866f1980324917cea45d1/packages/pesa/src/db/adapter.ts#L15)

Retrieve a single event by its UUID.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `id` | `string` |

#### Returns

`Promise`\<[`PaymentEvent`](PaymentEvent) \| `null`\>

***

### getEventsByOrderId()

```ts
getEventsByOrderId(orderId): Promise<PaymentEvent[]>;
```

Defined in: [packages/pesa/src/db/adapter.ts:21](https://github.com/borapesa/pesa/blob/49ea5b664fa2d117c65866f1980324917cea45d1/packages/pesa/src/db/adapter.ts#L21)

Retrieve all events for a given provider order ID.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `orderId` | `string` |

#### Returns

`Promise`\<[`PaymentEvent`](PaymentEvent)[]\>

***

### getEventsByReference()

```ts
getEventsByReference(reference): Promise<PaymentEvent[]>;
```

Defined in: [packages/pesa/src/db/adapter.ts:18](https://github.com/borapesa/pesa/blob/49ea5b664fa2d117c65866f1980324917cea45d1/packages/pesa/src/db/adapter.ts#L18)

Retrieve all events for a given merchant reference.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `reference` | `string` |

#### Returns

`Promise`\<[`PaymentEvent`](PaymentEvent)[]\>

***

### saveEvent()

```ts
saveEvent(event): Promise<void>;
```

Defined in: [packages/pesa/src/db/adapter.ts:12](https://github.com/borapesa/pesa/blob/49ea5b664fa2d117c65866f1980324917cea45d1/packages/pesa/src/db/adapter.ts#L12)

Persist a verified PaymentEvent.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `event` | [`PaymentEvent`](PaymentEvent) |

#### Returns

`Promise`\<`void`\>
