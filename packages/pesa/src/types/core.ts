/**
 * Foundation types for Bora Pesa.
 *
 * Every module in the SDK imports from here. These types form the
 * canonical contract that all providers and adapters must implement.
 *
 * @module types/core
 */

/**
 * TZS amount as a whole integer. `15000` = TZS 15,000.
 *
 * **Never use floats.** TZS has cents (senti) but digital/mobile
 * payment providers don't support fractional amounts on the consumer
 * side. Whole integers prevent floating-point errors and match what
 * every Tanzanian payment API expects.
 *
 * @example
 * ```ts
 * // ✅ Correct
 * const amount: TZSAmount = 15000;
 *
 * // ❌ Wrong — will throw PesaValidationError
 * const amount: TZSAmount = 15000.50;
 * ```
 */
export type TZSAmount = number;

/**
 * Supported currencies.
 *
 * Extensible via module augmentation.
 *
 * @since 0.1.0 — `'TZS'`
 * @since 0.2.0 — `'USD'` (card payments via ClickPesa)
 *
 * @example
 * ```ts
 * // Future expansion:
 * // module augmentation in your app to add KES
 * declare module '@borapesa/pesa' {
 *   export type Currency = 'TZS' | 'USD' | 'KES';
 * }
 * ```
 */
export type Currency = 'TZS' | 'USD';

/**
 * All supported payment providers.
 *
 * Extensible via module augmentation. The `'bogus'` provider is a
 * test double — it doesn't represent a real payment gateway.
 *
 * @example
 * ```ts
 * import type { ProviderName } from '@borapesa/pesa';
 *
 * const provider: ProviderName = 'selcom';
 * ```
 */
export type ProviderName = 'selcom' | 'azampay' | 'clickpesa' | 'dpo' | 'pesapal' | 'bogus';
