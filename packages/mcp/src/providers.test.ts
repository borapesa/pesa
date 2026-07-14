import { describe, expect, it } from 'vitest';
import { getProvider, PROVIDERS } from './providers';

describe('provider registry', () => {
  it('has unique ids', () => {
    const ids = PROVIDERS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('covers every published provider plus the test double', () => {
    const ids = PROVIDERS.map((p) => p.id);
    for (const expected of ['bogus', 'selcom', 'azampay', 'clickpesa', 'snippe']) {
      expect(ids).toContain(expected);
    }
  });

  it('scopes every package under @borapesa/', () => {
    for (const provider of PROVIDERS) {
      expect(provider.package).toMatch(/^@borapesa\//);
    }
  });

  it('lists the 4 core capabilities for every available provider', () => {
    const available = PROVIDERS.filter((p) => p.status === 'available');
    expect(available.length).toBeGreaterThanOrEqual(4);
    for (const provider of available) {
      expect(provider.coreCapabilities).toEqual([
        'createOrder',
        'getPaymentStatus',
        'disburse',
        'handleWebhook',
      ]);
      expect(provider.configFields.some((f) => f.required)).toBe(true);
      expect(provider.importExample).toContain(provider.className);
    }
  });

  it('marks planned providers with empty config', () => {
    for (const provider of PROVIDERS.filter((p) => p.status === 'planned')) {
      expect(provider.configFields).toEqual([]);
    }
  });

  it('looks up providers case-insensitively', () => {
    expect(getProvider('Selcom')?.id).toBe('selcom');
    expect(getProvider('AZAMPAY')?.id).toBe('azampay');
    expect(getProvider('unknown')).toBeUndefined();
  });
});
