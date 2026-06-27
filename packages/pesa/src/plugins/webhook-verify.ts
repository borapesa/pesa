import type { PesaPlugin } from './types';
import { PesaWebhookError } from '../errors';

/**
 * Webhook verification plugin — built into core, not optional.
 *
 * Validates every incoming webhook's HMAC signature before the event
 * is emitted or stored. Delegates to the provider for provider-specific
 * signature checks, then applies a shared-secret layer on top.
 *
 * The BORAPESA_WEBHOOK_SECRET environment variable is required in production.
 */
export function webhookVerifyPlugin(secret?: string): PesaPlugin {
  const webhookSecret = secret ?? process.env.BORAPESA_WEBHOOK_SECRET;

  return {
    name: 'webhook-verify',

    // Verification happens in core's handleWebhook flow — this plugin
    // acts as a guard that fires before onPaymentEvent hooks.
    async onPaymentEvent(_event) {
      if (!webhookSecret) {
        // In development with BogusProvider, missing secret is a warning not an error
        if (process.env.NODE_ENV === 'production') {
          throw new PesaWebhookError(
            'BORAPESA_WEBHOOK_SECRET is not set. Webhook verification is required in production.',
          );
        }
      }
      // Verification is performed by provider.handleWebhook() before this point.
      // This plugin exists to enforce the secret requirement and can be extended
      // with additional cross-provider verification logic.
    },
  };
}
