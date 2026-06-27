---
title: "Class: SQLiteAdapter"
---

Defined in: [packages/pesa/src/db/sqlite.ts:14](https://github.com/borapesa/pesa/blob/f7ac5b710a6494b0dc7ab450f968667f9f555cf6/packages/pesa/src/db/sqlite.ts#L14)

SQLite event store adapter powered by better-sqlite3.

This is the default adapter — zero configuration, no network required.
The database file is created at `./pesa.db` if it doesn't exist.

For serverless / edge workloads, swap to LibSQLAdapter (@borapesa/libsql)
which targets Turso.

## Implements

- [`PesaDatabaseAdapter`](../interfaces/PesaDatabaseAdapter)

## Constructors

### Constructor

```ts
new SQLiteAdapter(dbPath?): SQLiteAdapter;
```

Defined in: [packages/pesa/src/db/sqlite.ts:18](https://github.com/borapesa/pesa/blob/f7ac5b710a6494b0dc7ab450f968667f9f555cf6/packages/pesa/src/db/sqlite.ts#L18)

#### Parameters

| Parameter | Type | Default value |
| ------ | ------ | ------ |
| `dbPath` | `string` | `'./pesa.db'` |

#### Returns

`SQLiteAdapter`

## Methods

### getEvent()

```ts
getEvent(id): Promise<PaymentEvent | null>;
```

Defined in: [packages/pesa/src/db/sqlite.ts:67](https://github.com/borapesa/pesa/blob/f7ac5b710a6494b0dc7ab450f968667f9f555cf6/packages/pesa/src/db/sqlite.ts#L67)

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

Defined in: [packages/pesa/src/db/sqlite.ts:83](https://github.com/borapesa/pesa/blob/f7ac5b710a6494b0dc7ab450f968667f9f555cf6/packages/pesa/src/db/sqlite.ts#L83)

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

Defined in: [packages/pesa/src/db/sqlite.ts:75](https://github.com/borapesa/pesa/blob/f7ac5b710a6494b0dc7ab450f968667f9f555cf6/packages/pesa/src/db/sqlite.ts#L75)

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

Defined in: [packages/pesa/src/db/sqlite.ts:46](https://github.com/borapesa/pesa/blob/f7ac5b710a6494b0dc7ab450f968667f9f555cf6/packages/pesa/src/db/sqlite.ts#L46)

Persist a verified PaymentEvent.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `event` | [`PaymentEvent`](../interfaces/PaymentEvent) |

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`PesaDatabaseAdapter`](../interfaces/PesaDatabaseAdapter).[`saveEvent`](../interfaces/PesaDatabaseAdapter.md#saveevent)
