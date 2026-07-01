import { describe, expect, it } from 'vitest';
import { PesaValidationError } from './errors';
import { normalisePhone, validateCreateOrderPayload, validateDisbursePayload } from './validate';

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

// ── normalisePhone ──────────────────────────────────────────────────

describe('normalisePhone', () => {
  it('passes through canonical MSISDN', () => {
    expect(normalisePhone('255712345678')).toBe('255712345678');
  });

  it('strips + prefix', () => {
    expect(normalisePhone('+255712345678')).toBe('255712345678');
  });

  it('converts local 0XX format', () => {
    expect(normalisePhone('0712345678')).toBe('255712345678');
  });

  it('converts bare 9-digit format', () => {
    expect(normalisePhone('712345678')).toBe('255712345678');
  });

  it('strips whitespace', () => {
    expect(normalisePhone('255 712 345 678')).toBe('255712345678');
  });

  it('strips dashes', () => {
    expect(normalisePhone('255-712-345-678')).toBe('255712345678');
  });

  it('strips parentheses', () => {
    expect(normalisePhone('(255) 712 345 678')).toBe('255712345678');
  });

  it('accepts carrier prefix 6', () => {
    expect(normalisePhone('0612345678')).toBe('255612345678');
    expect(normalisePhone('612345678')).toBe('255612345678');
  });

  it('accepts carrier prefix 8', () => {
    expect(normalisePhone('0812345678')).toBe('255812345678');
    expect(normalisePhone('812345678')).toBe('255812345678');
  });

  it('rejects empty string', () => {
    expect(() => normalisePhone('')).toThrow(PesaValidationError);
  });

  it('rejects non-string input', () => {
    // @ts-expect-error testing invalid input
    expect(() => normalisePhone(undefined)).toThrow(PesaValidationError);
  });

  it('rejects non-TZ numbers', () => {
    expect(() => normalisePhone('254712345678')).toThrow(PesaValidationError);
  });

  it('rejects too-short numbers', () => {
    expect(() => normalisePhone('071234567')).toThrow(PesaValidationError);
  });

  it('rejects numbers with invalid carrier prefix', () => {
    expect(() => normalisePhone('0512345678')).toThrow(PesaValidationError);
  });
});

// ── validateCreateOrderPayload ──────────────────────────────────────

describe('validateCreateOrderPayload', () => {
  it('accepts a valid payload', () => {
    expect(() => validateCreateOrderPayload(validOrder)).not.toThrow();
  });

  it('normalises phone and mutates payload', () => {
    const payload = { ...validOrder, customer: { ...validOrder.customer, phone: '0712345678' } };
    validateCreateOrderPayload(payload);
    expect(payload.customer.phone).toBe('255712345678');
  });

  it('rejects non-finite amount', () => {
    expect(() => validateCreateOrderPayload({ ...validOrder, amount: NaN })).toThrow(
      PesaValidationError,
    );
    expect(() => validateCreateOrderPayload({ ...validOrder, amount: Infinity })).toThrow(
      PesaValidationError,
    );
  });

  it('rejects zero amount', () => {
    expect(() => validateCreateOrderPayload({ ...validOrder, amount: 0 })).toThrow(
      'amount must be greater than 0',
    );
  });

  it('rejects negative amount', () => {
    expect(() => validateCreateOrderPayload({ ...validOrder, amount: -5000 })).toThrow(
      'amount must be greater than 0',
    );
  });

  it('rejects non-integer amount', () => {
    expect(() => validateCreateOrderPayload({ ...validOrder, amount: 15000.5 })).toThrow(
      'amount must be a whole integer (TZS)',
    );
  });

  it('rejects empty reference', () => {
    expect(() => validateCreateOrderPayload({ ...validOrder, reference: '' })).toThrow(
      'reference is required',
    );
    expect(() => validateCreateOrderPayload({ ...validOrder, reference: '   ' })).toThrow(
      'reference is required',
    );
  });

  it('rejects missing customer', () => {
    const { customer, ...rest } = validOrder;
    // biome-ignore lint/suspicious/noExplicitAny: destructured rest in test
    expect(() => validateCreateOrderPayload(rest as any)).toThrow('customer is required');
  });

  it('rejects invalid phone numbers', () => {
    expect(() =>
      validateCreateOrderPayload({
        ...validOrder,
        customer: { name: 'Juma', phone: '' },
      }),
    ).toThrow(PesaValidationError);

    expect(() =>
      validateCreateOrderPayload({
        ...validOrder,
        customer: { name: 'Juma', phone: '254712345678' },
      }),
    ).toThrow(PesaValidationError);
  });

  it('rejects empty customer name', () => {
    expect(() =>
      validateCreateOrderPayload({
        ...validOrder,
        customer: { name: '', phone: '255712345678' },
      }),
    ).toThrow('customer.name is required');
  });
});

// ── validateDisbursePayload ─────────────────────────────────────────

describe('validateDisbursePayload', () => {
  it('accepts a valid payload', () => {
    expect(() => validateDisbursePayload(validDisburse)).not.toThrow();
  });

  it('normalises recipient phone and mutates payload', () => {
    const payload = { ...validDisburse, recipient: { phone: '0754321098' } };
    validateDisbursePayload(payload);
    expect(payload.recipient.phone).toBe('255754321098');
  });

  it('rejects zero amount', () => {
    expect(() => validateDisbursePayload({ ...validDisburse, amount: 0 })).toThrow(
      'amount must be greater than 0',
    );
  });

  it('rejects empty reference', () => {
    expect(() => validateDisbursePayload({ ...validDisburse, reference: '' })).toThrow(
      'reference is required',
    );
  });

  it('rejects missing recipient', () => {
    const { recipient, ...rest } = validDisburse;
    // biome-ignore lint/suspicious/noExplicitAny: destructured rest in test
    expect(() => validateDisbursePayload(rest as any)).toThrow('recipient is required');
  });

  it('rejects invalid recipient phone', () => {
    expect(() =>
      validateDisbursePayload({
        ...validDisburse,
        recipient: { phone: '254712345678' },
      }),
    ).toThrow(PesaValidationError);
  });

  it('rejects non-finite amount', () => {
    expect(() => validateDisbursePayload({ ...validDisburse, amount: NaN })).toThrow(
      PesaValidationError,
    );
    expect(() => validateDisbursePayload({ ...validDisburse, amount: Infinity })).toThrow(
      PesaValidationError,
    );
  });

  it('rejects negative amount', () => {
    expect(() => validateDisbursePayload({ ...validDisburse, amount: -5000 })).toThrow(
      'amount must be greater than 0',
    );
  });

  it('rejects non-integer amount', () => {
    expect(() => validateDisbursePayload({ ...validDisburse, amount: 15000.5 })).toThrow(
      'amount must be a whole integer (TZS)',
    );
  });

  it('requires bic when accountNumber is present for bank payout', () => {
    expect(() =>
      validateDisbursePayload({
        amount: 50000,
        currency: 'TZS',
        reference: 'payout_bank',
        recipient: { accountNumber: '1234567890' },
      }),
    ).toThrow('recipient.bic is required for bank payouts');
  });

  it('accepts valid bank payout payload', () => {
    expect(() =>
      validateDisbursePayload({
        amount: 50000,
        currency: 'TZS',
        reference: 'payout_bank',
        recipient: { accountNumber: '1234567890', bic: 'NMBTZTZ' },
      }),
    ).not.toThrow();
  });

  it('rejects missing phone when no accountNumber is present', () => {
    expect(() =>
      validateDisbursePayload({
        amount: 50000,
        currency: 'TZS',
        reference: 'payout_nophone',
        recipient: {} as any,
      }),
    ).toThrow(PesaValidationError);
  });
});
