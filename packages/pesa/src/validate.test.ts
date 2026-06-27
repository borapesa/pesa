import { describe, it, expect } from 'vitest';
import { validateCreateOrderPayload, validateDisbursePayload } from './validate';
import { PesaValidationError } from './errors';

const validOrder = {
  amount: 15000,
  currency: 'TZS' as const,
  reference: 'order_001',
  customer: { name: 'Juma Ali', phone: '255712345678' },
};

const validDisburse = {
  amount: 50000,
  currency: 'TZS' as const,
  reference: 'payout_001',
  recipient: { phone: '255754321098' },
};

describe('validateCreateOrderPayload', () => {
  it('accepts a valid payload', () => {
    expect(() => validateCreateOrderPayload(validOrder)).not.toThrow();
  });

  it('rejects non-finite amount', () => {
    expect(() => validateCreateOrderPayload({ ...validOrder, amount: NaN }))
      .toThrow(PesaValidationError);
    expect(() => validateCreateOrderPayload({ ...validOrder, amount: Infinity }))
      .toThrow(PesaValidationError);
  });

  it('rejects zero amount', () => {
    expect(() => validateCreateOrderPayload({ ...validOrder, amount: 0 }))
      .toThrow('amount must be greater than 0');
  });

  it('rejects negative amount', () => {
    expect(() => validateCreateOrderPayload({ ...validOrder, amount: -5000 }))
      .toThrow('amount must be greater than 0');
  });

  it('rejects non-integer amount', () => {
    expect(() => validateCreateOrderPayload({ ...validOrder, amount: 15000.5 }))
      .toThrow('amount must be a whole integer (TZS)');
  });

  it('rejects empty reference', () => {
    expect(() => validateCreateOrderPayload({ ...validOrder, reference: '' }))
      .toThrow('reference is required');
    expect(() => validateCreateOrderPayload({ ...validOrder, reference: '   ' }))
      .toThrow('reference is required');
  });

  it('rejects missing customer', () => {
    const { customer, ...rest } = validOrder;
    expect(() => validateCreateOrderPayload(rest as any)).toThrow('customer is required');
  });

  it('rejects invalid phone numbers', () => {
    expect(() => validateCreateOrderPayload({
      ...validOrder, customer: { name: 'Juma', phone: '0712345678' },
    })).toThrow('MSISDN format');

    expect(() => validateCreateOrderPayload({
      ...validOrder, customer: { name: 'Juma', phone: '' },
    })).toThrow('MSISDN format');

    expect(() => validateCreateOrderPayload({
      ...validOrder, customer: { name: 'Juma', phone: '254712345678' },
    })).toThrow('MSISDN format');
  });

  it('rejects empty customer name', () => {
    expect(() => validateCreateOrderPayload({
      ...validOrder, customer: { name: '', phone: '255712345678' },
    })).toThrow('customer.name is required');
  });
});

describe('validateDisbursePayload', () => {
  it('accepts a valid payload', () => {
    expect(() => validateDisbursePayload(validDisburse)).not.toThrow();
  });

  it('rejects zero amount', () => {
    expect(() => validateDisbursePayload({ ...validDisburse, amount: 0 }))
      .toThrow('amount must be greater than 0');
  });

  it('rejects empty reference', () => {
    expect(() => validateDisbursePayload({ ...validDisburse, reference: '' }))
      .toThrow('reference is required');
  });

  it('rejects missing recipient', () => {
    const { recipient, ...rest } = validDisburse;
    expect(() => validateDisbursePayload(rest as any)).toThrow('recipient is required');
  });

  it('rejects invalid recipient phone', () => {
    expect(() => validateDisbursePayload({
      ...validDisburse, recipient: { phone: '07xxxxxxxx' },
    })).toThrow('MSISDN format');
  });
});
