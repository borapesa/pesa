---
title: "@borapesa/pesa"
---

## Classes

| Class | Description |
| ------ | ------ |
| [BasePaymentProvider](classes/BasePaymentProvider) | Abstract base class every provider adapter must implement. |
| [MemoryAdapter](classes/MemoryAdapter) | In-memory event store — zero dependencies, perfect for dev and CI. |
| [PesaError](classes/PesaError) | Base error class for all Bora Pesa errors. |
| [PesaNetworkError](classes/PesaNetworkError) | Thrown when a provider API is unreachable or returns a network error. |
| [PesaProviderError](classes/PesaProviderError) | Thrown when the provider returns an error response (provider error). |
| [PesaUnsupportedError](classes/PesaUnsupportedError) | Thrown when a provider does not implement an optional operation. |
| [PesaValidationError](classes/PesaValidationError) | Thrown when payload validation fails (client error). |
| [PesaWebhookError](classes/PesaWebhookError) | Thrown when a webhook fails signature verification. |

## Interfaces

| Interface | Description |
| ------ | ------ |
| [BalanceEntry](interfaces/BalanceEntry) | A single currency balance entry. |
| [BalanceResult](interfaces/BalanceResult) | Result of a balance inquiry — returns available balances across all active currencies in the provider's wallet. |
| [CancelOrderPayload](interfaces/CancelOrderPayload) | Payload for cancelling a pending or in-progress order. |
| [CancelOrderResult](interfaces/CancelOrderResult) | Result returned after cancelling a payment order. |
| [CreateOrderPayload](interfaces/CreateOrderPayload) | Payload for creating a payment order. |
| [DisbursePayload](interfaces/DisbursePayload) | Payload for sending a disbursement (B2C / wallet-out). |
| [DisburseResult](interfaces/DisburseResult) | Result returned after initiating a disbursement. |
| [ListOrdersParams](interfaces/ListOrdersParams) | Parameters for listing payment orders. |
| [ListOrdersResult](interfaces/ListOrdersResult) | Result returned when listing orders. |
| [NameLookupResult](interfaces/NameLookupResult) | Result of a name lookup — resolves the account holder name for a phone number or bank account before disbursing. |
| [OrderResult](interfaces/OrderResult) | Result returned after initiating a payment. |
| [PaymentEvent](interfaces/PaymentEvent) | Normalized payment event — the **source of truth** for all payment activity. |
| [PesaConfig](interfaces/PesaConfig) | Configuration passed to [createPesa](functions/createPesa). |
| [PesaDatabaseAdapter](interfaces/PesaDatabaseAdapter) | Database adapter interface for the event store. |
| [PesaHandlerTarget](interfaces/PesaHandlerTarget) | Minimal interface for the pesa instance that the handler needs. |
| [PesaInstance](interfaces/PesaInstance) | Fully configured payments SDK instance — returned by [createPesa](functions/createPesa). |
| [PesaPlugin](interfaces/PesaPlugin) | Plugin lifecycle hooks. |
| [PreviewResult](interfaces/PreviewResult) | Result of a preview / dry-run validation before committing an action. |
| [RefundResult](interfaces/RefundResult) | Result returned after initiating a refund. |
| [RequestContext](interfaces/RequestContext) | Context passed to beforeRequest hooks. Allows plugins to inspect and modify the outgoing request. |
| [ResponseContext](interfaces/ResponseContext) | Context passed to afterResponse hooks. Allows plugins to inspect the provider response and decide on retries. |

## Type Aliases

| Type Alias | Description |
| ------ | ------ |
| [Currency](type-aliases/Currency) | Supported currencies. |
| [MobileNetwork](type-aliases/MobileNetwork) | Supported mobile money networks for disbursement (B2C payouts). |
| [PaymentEventType](type-aliases/PaymentEventType) | Event types emitted after webhook verification and persistence. |
| [PaymentStatus](type-aliases/PaymentStatus) | Payment lifecycle statuses. |
| [ProviderName](type-aliases/ProviderName) | All supported payment providers. |
| [TZSAmount](type-aliases/TZSAmount) | TZS amount as a whole integer. `15000` = TZS 15,000. |

## Functions

| Function | Description |
| ------ | ------ |
| [createPesa](functions/createPesa) | The single entry point for the entire Bora Pesa SDK. |
| [createPesaWebhookHandler](functions/createPesaWebhookHandler) | Creates a webhook handler — the one route that must be publicly exposed. |
| [normalisePhone](functions/normalisePhone) | Normalise a Tanzania phone number to canonical MSISDN format (255XXXXXXXXX). |
| [validateCreateOrderPayload](functions/validateCreateOrderPayload) | Validate a CreateOrderPayload before forwarding to the provider. Throws PesaValidationError on invalid input. |
| [validateDisbursePayload](functions/validateDisbursePayload) | Validate a DisbursePayload before forwarding to the provider. Throws PesaValidationError on invalid input. |
