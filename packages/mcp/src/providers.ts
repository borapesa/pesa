/**
 * Structured registry of every Bora Pesa payment provider.
 *
 * Hand-curated from the provider source code so agents can answer
 * "which provider should I use and how do I configure it" without
 * reading the full docs. Keep in sync when provider configs change.
 */

export interface ConfigField {
  name: string;
  required: boolean;
  description: string;
}

export interface ProviderInfo {
  id: string;
  package: string;
  className: string;
  status: 'available' | 'planned' | 'testing-only';
  summary: string;
  auth: string;
  sandbox: string;
  webhookVerification: string;
  configFields: ConfigField[];
  /** The 4 methods every provider implements. */
  coreCapabilities: string[];
  /** Optional PesaInstance methods this provider supports. */
  optionalCapabilities: string[];
  /** Provider-specific methods beyond the shared interface. */
  providerSpecific: string[];
  importExample: string;
}

const CORE = ['createOrder', 'getPaymentStatus', 'disburse', 'handleWebhook'];

export const PROVIDERS: ProviderInfo[] = [
  {
    id: 'bogus',
    package: '@borapesa/pesa (subpath: @borapesa/pesa/testing)',
    className: 'BogusPaymentProvider',
    status: 'testing-only',
    summary:
      'In-memory test double shipped with the core package. No credentials, no network. Use it for local development and automated tests.',
    auth: 'None',
    sandbox: 'The provider itself is the sandbox.',
    webhookVerification: 'Simulated. Emits events like a real provider.',
    configFields: [
      {
        name: 'defaultBehavior',
        required: false,
        description: "How simulated payments resolve: 'success' (default), 'failure', etc.",
      },
    ],
    coreCapabilities: CORE,
    optionalCapabilities: ['all optional methods are implemented for testing'],
    providerSpecific: [],
    importExample: "import { BogusPaymentProvider } from '@borapesa/pesa/testing';",
  },
  {
    id: 'selcom',
    package: '@borapesa/selcom',
    className: 'SelcomPaymentProvider',
    status: 'available',
    summary:
      'Selcom payment gateway (apigw.selcommobile.com). Checkout orders, Qwiksend disbursements, utility payments, and agent cashout.',
    auth: 'HMAC-SHA256 request signing with apiKey + apiSecret.',
    sandbox: 'No sandbox flag. Point baseUrl at a test gateway if Selcom gives you one.',
    webhookVerification: 'Built in. Selcom POSTs to the webhookUrl you configure.',
    configFields: [
      { name: 'apiKey', required: true, description: 'API key from Selcom.' },
      { name: 'apiSecret', required: true, description: 'API secret for HMAC signing.' },
      { name: 'vendor', required: true, description: 'Float account / vendor identifier.' },
      {
        name: 'pin',
        required: true,
        description: 'Float account PIN. Required for disbursement and balance queries.',
      },
      {
        name: 'baseUrl',
        required: false,
        description: 'Defaults to https://apigw.selcommobile.com.',
      },
      {
        name: 'senderAccount',
        required: false,
        description: 'Source account for Qwiksend bank transfers. Defaults to vendor.',
      },
      {
        name: 'senderName',
        required: false,
        description: 'Account holder display name for bank transfers. Defaults to vendor.',
      },
      { name: 'senderPhone', required: false, description: 'Sender mobile for bank transfers.' },
      {
        name: 'redirectUrl',
        required: false,
        description: 'Where the customer lands after completing checkout.',
      },
      {
        name: 'cancelUrl',
        required: false,
        description: 'Where the customer lands after abandoning checkout.',
      },
      {
        name: 'webhookUrl',
        required: false,
        description: 'Public URL Selcom POSTs payment results to. Point it at pesa.mountWebhook.',
      },
    ],
    coreCapabilities: CORE,
    optionalCapabilities: [
      'cancelOrder',
      'listOrders',
      'getBalance',
      'getNameLookup',
      'validateCredentials',
    ],
    providerSpecific: [
      'checkoutWalletPayment',
      'payUtility',
      'lookupUtility',
      'queryUtilityStatus',
      'selcomPesaCashin',
      'selcomPesaNameLookup',
      'agentCashout',
      'fetchStoredCards',
      'deleteStoredCard',
    ],
    importExample: "import { SelcomPaymentProvider } from '@borapesa/selcom';",
  },
  {
    id: 'azampay',
    package: '@borapesa/azampay',
    className: 'AzamPayPaymentProvider',
    status: 'available',
    summary:
      'AzamPay gateway with separate checkout and disbursement hosts. MNO checkout, bank checkout, and disbursement.',
    auth: 'Token auth: clientId + clientSecret exchange, plus an apiKey header.',
    sandbox: 'sandbox: true (the default) targets sandbox.azampay.co.tz hosts.',
    webhookVerification: 'Built in via handleWebhook.',
    configFields: [
      { name: 'appName', required: true, description: 'App name from the AzamPay dashboard.' },
      { name: 'clientId', required: true, description: 'Client ID from the AzamPay dashboard.' },
      {
        name: 'clientSecret',
        required: true,
        description: 'Client secret from the AzamPay dashboard.',
      },
      { name: 'apiKey', required: true, description: 'API key from the AzamPay dashboard.' },
      {
        name: 'senderName',
        required: true,
        description: 'Sender/merchant display name for disbursement transfers.',
      },
      {
        name: 'senderBank',
        required: false,
        description: 'Sender bank name for disbursement. Defaults to "AzamPay".',
      },
      { name: 'sandbox', required: false, description: 'Target sandbox hosts. Defaults to true.' },
      { name: 'authBaseUrl', required: false, description: 'Override the auth base URL.' },
      { name: 'checkoutBaseUrl', required: false, description: 'Override the checkout base URL.' },
      {
        name: 'disbursementBaseUrl',
        required: false,
        description:
          'Override the disbursement host. AzamPay uses a separate host for disburse, name lookup, and payment status.',
      },
    ],
    coreCapabilities: CORE,
    optionalCapabilities: ['getNameLookup', 'validateCredentials'],
    providerSpecific: ['createBankCheckout', 'createPostCheckout', 'getPaymentPartners'],
    importExample: "import { AzamPayPaymentProvider } from '@borapesa/azampay';",
  },
  {
    id: 'clickpesa',
    package: '@borapesa/clickpesa',
    className: 'ClickPesaProvider',
    status: 'available',
    summary:
      'ClickPesa gateway (api.clickpesa.com). USSD push and card checkout, payouts, previews, exchange rates, and bill-pay control numbers.',
    auth: 'Token auth with clientId + apiKey. Optional HMAC-SHA256 checksum signing.',
    sandbox: 'sandbox: true targets api-sandbox.clickpesa.com. Defaults to production.',
    webhookVerification:
      'Requires checksumKey. Without it incoming webhooks are accepted unverified.',
    configFields: [
      { name: 'clientId', required: true, description: 'Client ID from the ClickPesa dashboard.' },
      { name: 'apiKey', required: true, description: 'API key from the ClickPesa dashboard.' },
      {
        name: 'checksumKey',
        required: false,
        description:
          'HMAC-SHA256 signing key. Signs outgoing POST/PUT/PATCH bodies and verifies incoming webhooks. Generate it in the ClickPesa dashboard. Strongly recommended for production: without it, incoming webhooks are accepted unverified.',
      },
      {
        name: 'sandbox',
        required: false,
        description: 'Target the sandbox environment. Defaults to false (production).',
      },
      {
        name: 'baseUrl',
        required: false,
        description: 'Explicit base URL override. Takes precedence over sandbox.',
      },
    ],
    coreCapabilities: CORE,
    optionalCapabilities: [
      'validateCredentials',
      'getBalance',
      'previewOrder',
      'previewDisburse',
      'getNameLookup',
      'listOrders',
    ],
    providerSpecific: [
      'generatePayoutLink',
      'getExchangeRates',
      'getBanks',
      'getAccountStatement',
      'createOrderControlNumber',
      'createCustomerControlNumber',
      'bulkCreateOrderNumbers',
      'bulkCreateCustomerNumbers',
      'getBillPayDetails',
      'updateBillPayReference',
      'updateBillPayStatus',
    ],
    importExample: "import { ClickPesaProvider } from '@borapesa/clickpesa';",
  },
  {
    id: 'snippe',
    package: '@borapesa/snippe',
    className: 'SnippePaymentProvider',
    status: 'available',
    summary:
      'Snippe gateway (api.snippe.sh). Mobile money and card payments, payouts, refunds, and hosted checkout sessions. Minimum payment TZS 500, minimum payout TZS 5000.',
    auth: 'Bearer apiKey (snp_...).',
    sandbox: 'No sandbox flag. Override baseUrl for staging environments.',
    webhookVerification: 'HMAC-SHA256 with the required webhookSecret.',
    configFields: [
      { name: 'apiKey', required: true, description: 'Snippe API key (snp_...).' },
      {
        name: 'webhookSecret',
        required: true,
        description: 'HMAC-SHA256 signing key for webhook verification.',
      },
      { name: 'baseUrl', required: false, description: 'Defaults to https://api.snippe.sh.' },
      {
        name: 'webhookUrl',
        required: false,
        description: 'Default webhook URL applied to createOrder / disburse.',
      },
      {
        name: 'redirectUrl',
        required: false,
        description: 'Where the customer lands after card payments.',
      },
      {
        name: 'cancelUrl',
        required: false,
        description: 'Where the customer lands after abandoning checkout.',
      },
      {
        name: 'timeoutMs',
        required: false,
        description: 'Request timeout in milliseconds. Defaults to 30000.',
      },
    ],
    coreCapabilities: CORE,
    optionalCapabilities: [
      'getBalance',
      'listOrders',
      'validateCredentials',
      'getNameLookup',
      'previewDisburse',
      'refund',
    ],
    providerSpecific: [
      'retriggerPush',
      'createCheckoutSession',
      'getCheckoutSession',
      'listCheckoutSessions',
      'cancelCheckoutSession',
    ],
    importExample: "import { SnippePaymentProvider } from '@borapesa/snippe';",
  },
  {
    id: 'dpo',
    package: '@borapesa/dpo',
    className: 'DpoPaymentProvider',
    status: 'planned',
    summary: 'DPO Group adapter. Planned, not yet published.',
    auth: 'TBD',
    sandbox: 'TBD',
    webhookVerification: 'TBD',
    configFields: [],
    coreCapabilities: [],
    optionalCapabilities: [],
    providerSpecific: [],
    importExample: '',
  },
  {
    id: 'pesapal',
    package: '@borapesa/pesapal',
    className: 'PesapalPaymentProvider',
    status: 'planned',
    summary: 'Pesapal adapter. Planned, not yet published.',
    auth: 'TBD',
    sandbox: 'TBD',
    webhookVerification: 'TBD',
    configFields: [],
    coreCapabilities: [],
    optionalCapabilities: [],
    providerSpecific: [],
    importExample: '',
  },
];

export function getProvider(id: string): ProviderInfo | undefined {
  return PROVIDERS.find((p) => p.id === id.toLowerCase());
}
