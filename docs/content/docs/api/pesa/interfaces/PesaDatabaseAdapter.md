---
title: "Interface: PesaDatabaseAdapter"
---

Defined in: [packages/pesa/src/db/adapter.ts:10](https://github.com/borapesa/pesa/blob/bb0341345be96209d9f1026440a10cf3f86d0e28/packages/pesa/src/db/adapter.ts#L10)

Database adapter interface for the event store.

The default is an in-memory adapter (zero deps, dev/CI ready).
Swap for `@borapesa/sqlite`, or implement your own adapter via
the `db` field in PesaConfig — the four methods work with any database.

## Methods

### getEvent()

```ts
getEvent(id): Promise<PaymentEvent | null>;
```

Defined in: [packages/pesa/src/db/adapter.ts:15](https://github.com/borapesa/pesa/blob/bb0341345be96209d9f1026440a10cf3f86d0e28/packages/pesa/src/db/adapter.ts#L15)

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

Defined in: [packages/pesa/src/db/adapter.ts:21](https://github.com/borapesa/pesa/blob/bb0341345be96209d9f1026440a10cf3f86d0e28/packages/pesa/src/db/adapter.ts#L21)

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

Defined in: [packages/pesa/src/db/adapter.ts:18](https://github.com/borapesa/pesa/blob/bb0341345be96209d9f1026440a10cf3f86d0e28/packages/pesa/src/db/adapter.ts#L18)

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

Defined in: [packages/pesa/src/db/adapter.ts:12](https://github.com/borapesa/pesa/blob/bb0341345be96209d9f1026440a10cf3f86d0e28/packages/pesa/src/db/adapter.ts#L12)

Persist a verified PaymentEvent.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `event` | [`PaymentEvent`](PaymentEvent) |

#### Returns

`Promise`\<`void`\>
