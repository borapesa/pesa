---
title: "Class: MemoryAdapter"
---

Defined in: [packages/pesa/src/db/memory.ts:11](https://github.com/borapesa/pesa/blob/bb0341345be96209d9f1026440a10cf3f86d0e28/packages/pesa/src/db/memory.ts#L11)

In-memory event store — zero dependencies, perfect for dev and CI.

This is the default adapter for borapesa. Events are stored in a Map
and lost on process exit. For production, swap to a persistent adapter
(e.g., `@borapesa/sqlite`, `@borapesa/postgres`).

## Implements

- [`PesaDatabaseAdapter`](../interfaces/PesaDatabaseAdapter)

## Constructors

### Constructor

```ts
new MemoryAdapter(): MemoryAdapter;
```

#### Returns

`MemoryAdapter`

## Methods

### getEvent()

```ts
getEvent(id): Promise<PaymentEvent | null>;
```

Defined in: [packages/pesa/src/db/memory.ts:18](https://github.com/borapesa/pesa/blob/bb0341345be96209d9f1026440a10cf3f86d0e28/packages/pesa/src/db/memory.ts#L18)

Retrieve a single event by its UUID.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `id` | `string` |

#### Returns

`Promise`\<[`PaymentEvent`](../interfaces/PaymentEvent) \| `null`\>

#### Implementation of

[`PesaDatabaseAdapter`](../interfaces/PesaDatabaseAdapter).[`getEvent`](../interfaces/PesaDatabaseAdapter.md#getevent)

***

### getEventsByOrderId()

```ts
getEventsByOrderId(orderId): Promise<PaymentEvent[]>;
```

Defined in: [packages/pesa/src/db/memory.ts:26](https://github.com/borapesa/pesa/blob/bb0341345be96209d9f1026440a10cf3f86d0e28/packages/pesa/src/db/memory.ts#L26)

Retrieve all events for a given provider order ID.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `orderId` | `string` |

#### Returns

`Promise`\<[`PaymentEvent`](../interfaces/PaymentEvent)[]\>

#### Implementation of

[`PesaDatabaseAdapter`](../interfaces/PesaDatabaseAdapter).[`getEventsByOrderId`](../interfaces/PesaDatabaseAdapter.md#geteventsbyorderid)

***

### getEventsByReference()

```ts
getEventsByReference(reference): Promise<PaymentEvent[]>;
```

Defined in: [packages/pesa/src/db/memory.ts:22](https://github.com/borapesa/pesa/blob/bb0341345be96209d9f1026440a10cf3f86d0e28/packages/pesa/src/db/memory.ts#L22)

Retrieve all events for a given merchant reference.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `reference` | `string` |

#### Returns

`Promise`\<[`PaymentEvent`](../interfaces/PaymentEvent)[]\>

#### Implementation of

[`PesaDatabaseAdapter`](../interfaces/PesaDatabaseAdapter).[`getEventsByReference`](../interfaces/PesaDatabaseAdapter.md#geteventsbyreference)

***

### saveEvent()

```ts
saveEvent(event): Promise<void>;
```

Defined in: [packages/pesa/src/db/memory.ts:14](https://github.com/borapesa/pesa/blob/bb0341345be96209d9f1026440a10cf3f86d0e28/packages/pesa/src/db/memory.ts#L14)

Persist a verified PaymentEvent.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `event` | [`PaymentEvent`](../interfaces/PaymentEvent) |

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`PesaDatabaseAdapter`](../interfaces/PesaDatabaseAdapter).[`saveEvent`](../interfaces/PesaDatabaseAdapter.md#saveevent)
