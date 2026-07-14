---
title: "Class: SQLiteAdapter"
---

Defined in: [adapters/sqlite/src/index.ts:19](https://github.com/borapesa/pesa/blob/c75801713de76259f5fc4269849309a91857c509/adapters/sqlite/src/index.ts#L19)

SQLite event store adapter powered by better-sqlite3.

The database file is created at the given path if it doesn't exist.

```ts
import { createPesa } from '@borapesa/pesa';
import { SQLiteAdapter } from '@borapesa/sqlite';

const pesa = createPesa({
  provider: new SelcomPaymentProvider({...}),
  db: new SQLiteAdapter('./pesa.db'),
});
```

## Implements

- `PesaDatabaseAdapter`

## Constructors

### Constructor

```ts
new SQLiteAdapter(dbPath?): SQLiteAdapter;
```

Defined in: [adapters/sqlite/src/index.ts:23](https://github.com/borapesa/pesa/blob/c75801713de76259f5fc4269849309a91857c509/adapters/sqlite/src/index.ts#L23)

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

Defined in: [adapters/sqlite/src/index.ts:72](https://github.com/borapesa/pesa/blob/c75801713de76259f5fc4269849309a91857c509/adapters/sqlite/src/index.ts#L72)

Retrieve a single event by its UUID.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `id` | `string` |

#### Returns

`Promise`\<[`PaymentEvent`](/docs/api/pesa/interfaces/PaymentEvent) \| `null`\>

#### Implementation of

```ts
PesaDatabaseAdapter.getEvent
```

***

### getEventsByOrderId()

```ts
getEventsByOrderId(orderId): Promise<PaymentEvent[]>;
```

Defined in: [adapters/sqlite/src/index.ts:88](https://github.com/borapesa/pesa/blob/c75801713de76259f5fc4269849309a91857c509/adapters/sqlite/src/index.ts#L88)

Retrieve all events for a given provider order ID.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `orderId` | `string` |

#### Returns

`Promise`\<[`PaymentEvent`](/docs/api/pesa/interfaces/PaymentEvent)[]\>

#### Implementation of

```ts
PesaDatabaseAdapter.getEventsByOrderId
```

***

### getEventsByReference()

```ts
getEventsByReference(reference): Promise<PaymentEvent[]>;
```

Defined in: [adapters/sqlite/src/index.ts:80](https://github.com/borapesa/pesa/blob/c75801713de76259f5fc4269849309a91857c509/adapters/sqlite/src/index.ts#L80)

Retrieve all events for a given merchant reference.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `reference` | `string` |

#### Returns

`Promise`\<[`PaymentEvent`](/docs/api/pesa/interfaces/PaymentEvent)[]\>

#### Implementation of

```ts
PesaDatabaseAdapter.getEventsByReference
```

***

### saveEvent()

```ts
saveEvent(event): Promise<void>;
```

Defined in: [adapters/sqlite/src/index.ts:51](https://github.com/borapesa/pesa/blob/c75801713de76259f5fc4269849309a91857c509/adapters/sqlite/src/index.ts#L51)

Persist a verified PaymentEvent.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `event` | [`PaymentEvent`](/docs/api/pesa/interfaces/PaymentEvent) |

#### Returns

`Promise`\<`void`\>

#### Implementation of

```ts
PesaDatabaseAdapter.saveEvent
```
