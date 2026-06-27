---
title: "packages/pesa/src"
---

# packages/pesa/src

## Classes

| Class | Description |
| ------ | ------ |
| [BasePaymentProvider](classes/BasePaymentProvider.md) | Abstract base class every provider adapter must implement. |
| [PesaError](classes/PesaError.md) | Base error class for all Bora Pesa errors. |
| [PesaNetworkError](classes/PesaNetworkError.md) | Thrown when a provider API is unreachable or returns a network error. |
| [PesaProviderError](classes/PesaProviderError.md) | Thrown when the provider returns an error response (provider error). |
| [PesaUnsupportedError](classes/PesaUnsupportedError.md) | Thrown when a provider does not implement an optional operation. |
| [PesaValidationError](classes/PesaValidationError.md) | Thrown when payload validation fails (client error). |
| [PesaWebhookError](classes/PesaWebhookError.md) | Thrown when a webhook fails signature verification. |
| [SQLiteAdapter](classes/SQLiteAdapter.md) | SQLite event store adapter powered by better-sqlite3. |

## Interfaces

| Interface | Description |
| ------ | ------ |
| [CancelOrderPayload](interfaces/CancelOrderPayload.md) | Payload for cancelling a pending or in-progress order. |
| [CancelOrderResult](interfaces/CancelOrderResult.md) | Result returned after cancelling a payment order. |
| [CreateOrderPayload](interfaces/CreateOrderPayload.md) | Payload for creating a payment order. |
| [DisbursePayload](interfaces/DisbursePayload.md) | Payload for sending a disbursement (B2C / wallet-out). |
| [DisburseResult](interfaces/DisburseResult.md) | Result returned after initiating a disbursement. |
| [ListOrdersParams](interfaces/ListOrdersParams.md) | Parameters for listing payment orders. |
| [ListOrdersResult](interfaces/ListOrdersResult.md) | Result returned when listing orders. |
| [NameLookupResult](interfaces/NameLookupResult.md) | Result of a name lookup — resolves the account holder name for a phone number or bank account before disbursing. |
| [OrderResult](interfaces/OrderResult.md) | Result returned after initiating a payment. |
| [PaymentEvent](interfaces/PaymentEvent.md) | Normalized payment event — the **source of truth** for all payment activity. |
| [PesaConfig](interfaces/PesaConfig.md) | Configuration passed to [createPesa](functions/createPesa.md). |
| [PesaDatabaseAdapter](interfaces/PesaDatabaseAdapter.md) | Database adapter interface for the event store. |
| [PesaHandlerTarget](interfaces/PesaHandlerTarget.md) | Minimal interface for the pesa instance that the handler needs. Defined here (not imported from pesa.ts) to avoid circular dependencies. |
| [PesaInstance](interfaces/PesaInstance.md) | Fully configured payments SDK instance — returned by [createPesa](functions/createPesa.md). |
| [PesaPlugin](interfaces/PesaPlugin.md) | Plugin lifecycle hooks. |
| [PreviewResult](interfaces/PreviewResult.md) | Result of a preview / dry-run validation before committing an action. |
| [RefundResult](interfaces/RefundResult.md) | Result returned after initiating a refund. |
| [RequestContext](interfaces/RequestContext.md) | Context passed to beforeRequest hooks. Allows plugins to inspect and modify the outgoing request. |
| [ResponseContext](interfaces/ResponseContext.md) | Context passed to afterResponse hooks. Allows plugins to inspect the provider response and decide on retries. |

## Type Aliases

| Type Alias | Description |
| ------ | ------ |
| [Currency](type-aliases/Currency.md) | Supported currencies. |
| [MobileNetwork](type-aliases/MobileNetwork.md) | Supported mobile money networks for disbursement (B2C payouts). |
| [PaymentEventType](type-aliases/PaymentEventType.md) | Event types emitted after webhook verification and persistence. |
| [PaymentStatus](type-aliases/PaymentStatus.md) | Payment lifecycle statuses. |
| [ProviderName](type-aliases/ProviderName.md) | All supported payment providers. |
| [TZSAmount](type-aliases/TZSAmount.md) | TZS amount as a whole integer. `15000` = TZS 15,000. |

## Functions

| Function | Description |
| ------ | ------ |
| [createPesa](functions/createPesa.md) | The single entry point for the entire Bora Pesa SDK. |
| [createPesaHandler](functions/createPesaHandler.md) | Creates a generic fetch-like handler that can be mounted on any framework. |
| [validateCreateOrderPayload](functions/validateCreateOrderPayload.md) | Validate a CreateOrderPayload before forwarding to the provider. Throws PesaValidationError on invalid input. |
| [validateDisbursePayload](functions/validateDisbursePayload.md) | Validate a DisbursePayload before forwarding to the provider. Throws PesaValidationError on invalid input. |
