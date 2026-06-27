import { describe, it, expect } from 'vitest';
import {
  PesaError,
  PesaUnsupportedError,
  PesaWebhookError,
  PesaNetworkError,
  PesaValidationError,
  PesaProviderError,
} from './errors';

describe('error hierarchy', () => {
  it('all errors are instanceof PesaError', () => {
    expect(new PesaUnsupportedError('nope')).toBeInstanceOf(PesaError);
    expect(new PesaWebhookError('bad sig')).toBeInstanceOf(PesaError);
    expect(new PesaNetworkError('down')).toBeInstanceOf(PesaError);
    expect(new PesaValidationError('bad input')).toBeInstanceOf(PesaError);
    expect(new PesaProviderError('api error', 500)).toBeInstanceOf(PesaError);
  });

  it('each error has the correct name', () => {
    expect(new PesaError('base', 'TEST').name).toBe('PesaError');
    expect(new PesaUnsupportedError('x').name).toBe('PesaUnsupportedError');
    expect(new PesaWebhookError('x').name).toBe('PesaWebhookError');
    expect(new PesaNetworkError('x').name).toBe('PesaNetworkError');
    expect(new PesaValidationError('x').name).toBe('PesaValidationError');
    expect(new PesaProviderError('x', 400).name).toBe('PesaProviderError');
  });

  it('each error has a code', () => {
    expect(new PesaError('x', 'TEST').code).toBe('TEST');
    expect(new PesaUnsupportedError('x').code).toBe('UNSUPPORTED');
    expect(new PesaWebhookError('x').code).toBe('WEBHOOK_ERROR');
    expect(new PesaNetworkError('x').code).toBe('NETWORK_ERROR');
    expect(new PesaValidationError('x').code).toBe('VALIDATION_ERROR');
    expect(new PesaProviderError('x', 400).code).toBe('PROVIDER_ERROR');
  });

  it('PesaProviderError includes status code and raw', () => {
    const err = new PesaProviderError('fail', 502, { detail: 'boom' });
    expect(err.statusCode).toBe(502);
    expect(err.providerRaw).toEqual({ detail: 'boom' });
  });

  it('errors are instanceof Error', () => {
    expect(new PesaError('x', 'X')).toBeInstanceOf(Error);
    expect(new PesaUnsupportedError('x')).toBeInstanceOf(Error);
  });
});
