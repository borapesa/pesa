import { PesaValidationError } from './errors';
import type { CreateOrderPayload } from './types/order';
import type { DisbursePayload } from './types/disbursement';

/** MSISDN pattern: 255 followed by 9 digits. */
const MSISDN_RE = /^255\d{9}$/;

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
  if (!payload.reference || typeof payload.reference !== 'string' || payload.reference.trim().length === 0) {
    throw new PesaValidationError('reference is required and must not be empty');
  }
  if (!payload.customer) {
    throw new PesaValidationError('customer is required');
  }
  if (!payload.customer.phone || !MSISDN_RE.test(payload.customer.phone)) {
    throw new PesaValidationError(
      `customer.phone must be in MSISDN format (255XXXXXXXXX), got: ${payload.customer.phone}`,
    );
  }
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
  if (!payload.reference || typeof payload.reference !== 'string' || payload.reference.trim().length === 0) {
    throw new PesaValidationError('reference is required and must not be empty');
  }
  if (!payload.recipient) {
    throw new PesaValidationError('recipient is required');
  }
  if (!payload.recipient.phone || !MSISDN_RE.test(payload.recipient.phone)) {
    throw new PesaValidationError(
      `recipient.phone must be in MSISDN format (255XXXXXXXXX), got: ${payload.recipient.phone}`,
    );
  }
}
