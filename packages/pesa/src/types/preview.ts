import type { TZSAmount } from './core';

/** Result of a preview / dry-run validation before committing an action. */
export interface PreviewResult {
  valid: boolean;
  fee?: TZSAmount;
  message?: string;
  raw?: unknown;
}

/** Result of a name lookup (resolve account holder name for a phone or account number). */
export interface NameLookupResult {
  found: boolean;
  accountName?: string;
  accountNumber?: string;
  provider?: string;
  message?: string;
  raw?: unknown;
}
