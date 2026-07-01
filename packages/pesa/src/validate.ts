import { PesaValidationError } from './errors';
import type { DisbursePayload } from './types/disbursement';
import type { CreateOrderPayload } from './types/order';

/** MSISDN pattern: 255 + carrier prefix (6/7/8) + 8 digits. */
const MSISDN_RE = /^255[678]\d{8}$/;

/**
 * Normalise a Tanzania phone number to canonical MSISDN format (255XXXXXXXXX).
 *
 * Accepts common local formats:
 *   "255781000000"  → "255781000000"
 *   "+255781000000" → "255781000000"
 *   "0781000000"    → "255781000000"
 *   "781000000"     → "255781000000"
 *
 * Whitespace, dashes, and parentheses are stripped before validation.
 * The result is validated against the MSISDN regex before returning.
 *
 * @throws PesaValidationError if the number cannot be coerced to MSISDN.
 */
export function normalisePhone(input: string): string {
  if (typeof input !== 'string' || input.length === 0) {
    throw new PesaValidationError('phone number must be a non-empty string');
  }

  const cleaned = input.replace(/[\s\-()]/g, '');

  let digits: string;
  if (cleaned.startsWith('+255')) {
    digits = cleaned.slice(1);
  } else if (cleaned.startsWith('255')) {
    digits = cleaned;
  } else if (cleaned.startsWith('0') && cleaned.length === 10) {
    digits = `255${cleaned.slice(1)}`;
  } else if (/^[678]\d{8}$/.test(cleaned)) {
    digits = `255${cleaned}`;
  } else {
    throw new PesaValidationError(
      `invalid Tanzania phone number "${input}": expected 255XXXXXXXXX, +255XXXXXXXXX, 0XXXXXXXXX, or XXXXXXXXX`,
    );
  }

  if (!MSISDN_RE.test(digits)) {
    throw new PesaValidationError(
      `invalid Tanzania phone number "${input}": must be a 12-digit MSISDN (255 + carrier prefix 6/7/8 + 8 digits)`,
    );
  }

  return digits;
}

/**
 * Validate a CreateOrderPayload before forwarding to the provider.
 * Throws PesaValidationError on invalid input.
 */
export function validateCreateOrderPayload(payload: CreateOrderPayload): void {
  if (typeof payload.amount !== 'number' || !Number.isFinite(payload.amount)) {
    throw new PesaValidationError('amount must be a finite number');
  }
  if (payload.amount <= 0) {
    throw new PesaValidationError('amount must be greater than 0');
  }
  if (!Number.isInteger(payload.amount)) {
    throw new PesaValidationError('amount must be a whole integer (TZS)');
  }
  if (
    !payload.reference ||
    typeof payload.reference !== 'string' ||
    payload.reference.trim().length === 0
  ) {
    throw new PesaValidationError('reference is required and must not be empty');
  }
  if (!payload.customer) {
    throw new PesaValidationError('customer is required');
  }
  payload.customer.phone = normalisePhone(payload.customer.phone);
  if (!payload.customer.name || payload.customer.name.trim().length === 0) {
    throw new PesaValidationError('customer.name is required');
  }
}

/**
 * Validate a DisbursePayload before forwarding to the provider.
 * Throws PesaValidationError on invalid input.
 */
export function validateDisbursePayload(payload: DisbursePayload): void {
  if (typeof payload.amount !== 'number' || !Number.isFinite(payload.amount)) {
    throw new PesaValidationError('amount must be a finite number');
  }
  if (payload.amount <= 0) {
    throw new PesaValidationError('amount must be greater than 0');
  }
  if (!Number.isInteger(payload.amount)) {
    throw new PesaValidationError('amount must be a whole integer (TZS)');
  }
  if (
    !payload.reference ||
    typeof payload.reference !== 'string' ||
    payload.reference.trim().length === 0
  ) {
    throw new PesaValidationError('reference is required and must not be empty');
  }
  if (!payload.recipient) {
    throw new PesaValidationError('recipient is required');
  }

  // Bank payout: accountNumber + bic required
  if (payload.recipient.accountNumber) {
    if (!payload.recipient.accountNumber || payload.recipient.accountNumber.trim().length === 0) {
      throw new PesaValidationError('recipient.accountNumber must not be empty');
    }
    if (!payload.recipient.bic || payload.recipient.bic.trim().length === 0) {
      throw new PesaValidationError('recipient.bic is required for bank payouts');
    }
    return;
  }

  // Mobile money: phone required
  if (!payload.recipient.phone) {
    throw new PesaValidationError('recipient.phone is required for mobile payouts');
  }
  payload.recipient.phone = normalisePhone(payload.recipient.phone);
}
