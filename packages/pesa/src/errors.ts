/**
 * Error hierarchy for Bora Pesa.
 *
 * All errors extend PesaError so consumers can do `instanceof PesaError`
 * to catch anything the SDK throws.
 */

/** Base error class for all Bora Pesa errors. */
export class PesaError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = 'PesaError';
  }
}

/** Thrown when a provider does not implement an optional operation. */
export class PesaUnsupportedError extends PesaError {
  constructor(message: string) {
    super(message, 'UNSUPPORTED');
    this.name = 'PesaUnsupportedError';
  }
}

/** Thrown when a webhook fails signature verification. */
export class PesaWebhookError extends PesaError {
  constructor(message: string) {
    super(message, 'WEBHOOK_ERROR');
    this.name = 'PesaWebhookError';
  }
}

/** Thrown when a provider API is unreachable or returns a network error. */
export class PesaNetworkError extends PesaError {
  constructor(message: string) {
    super(message, 'NETWORK_ERROR');
    this.name = 'PesaNetworkError';
  }
}

/** Thrown when payload validation fails (client error). */
export class PesaValidationError extends PesaError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR');
    this.name = 'PesaValidationError';
  }
}

/** Thrown when the provider returns an error response (provider error). */
export class PesaProviderError extends PesaError {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly providerRaw?: unknown,
  ) {
    super(message, 'PROVIDER_ERROR');
    this.name = 'PesaProviderError';
  }
}
