/**
 * Foundation types for Bora Pesa.
 * Everything in the SDK imports from here — keep it minimal.
 */

/**
 * TZS amount as a whole integer. 15000 = TZS 15,000. Never use floats.
 *
 * TZS has cents (senti) but digital/mobile payment providers don't
 * support fractional amounts on the consumer side.
 */
export type TZSAmount = number;

/**
 * Supported currencies. Extensible via module augmentation.
 */
export type Currency = 'TZS';

/**
 * All supported payment providers. Extensible via module augmentation.
 */
export type ProviderName = 'selcom' | 'azampay' | 'clickpesa' | 'dpo' | 'pesapal' | 'bogus';
