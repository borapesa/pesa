/**
 * Curated, runnable code examples for common Bora Pesa tasks.
 *
 * Every snippet is verified against the current public API. When the SDK
 * surface changes, update these alongside the docs.
 */

export interface Example {
  topic: string;
  title: string;
  description: string;
  /** Docs page with the full explanation, e.g. `getting-started`. */
  docsPath: string;
  code: string;
}

export const EXAMPLES: Example[] = [
  {
    topic: 'quickstart',
    title: 'First payment with zero config',
    description:
      'Create a pesa instance with the built-in test provider and initiate a payment. No credentials or network needed.',
    docsPath: 'getting-started',
    code: `import { createPesa } from '@borapesa/pesa';
import { BogusPaymentProvider } from '@borapesa/pesa/testing';

const pesa = createPesa({
  provider: new BogusPaymentProvider({ defaultBehavior: 'success' }),
});

const order = await pesa.createOrder({
  amount: 15000, // TZS 15,000. Whole integers only, never floats.
  currency: 'TZS',
  reference: 'order_abc123', // Your internal order ID. Must be unique.
  customer: {
    name: 'Juma Ali',
    phone: '255712345678', // MSISDN format: 255XXXXXXXXX. Local 07XX is rejected.
  },
});

console.log(order.status); // 'SUCCESS'
console.log(order.orderId); // Provider-assigned transaction ID`,
  },
  {
    topic: 'production-setup',
    title: 'Production instance with a real provider',
    description:
      'Wire a real provider, a persistent SQLite event store, and the built-in plugins. Only `provider` is required; everything else has defaults.',
    docsPath: 'getting-started',
    code: `import { createPesa } from '@borapesa/pesa';
import { idempotencyPlugin, loggingPlugin, retryPlugin } from '@borapesa/pesa/plugins';
import { ClickPesaProvider } from '@borapesa/clickpesa';
import { SQLiteAdapter } from '@borapesa/sqlite';

export const pesa = createPesa({
  provider: new ClickPesaProvider({
    clientId: process.env.CLICKPESA_CLIENT_ID!,
    apiKey: process.env.CLICKPESA_API_KEY!,
    checksumKey: process.env.CLICKPESA_CHECKSUM_KEY, // enables webhook verification
  }),
  db: new SQLiteAdapter('./pesa.db'),
  plugins: [
    idempotencyPlugin(),
    retryPlugin({ maxAttempts: 3 }),
    loggingPlugin({ level: 'info' }),
  ],
});`,
  },
  {
    topic: 'create-order',
    title: 'Create an order (collect a payment)',
    description:
      'Initiate a customer payment. Depending on the provider this triggers a USSD push or returns a checkoutUrl to redirect the customer to.',
    docsPath: 'getting-started',
    code: `const order = await pesa.createOrder({
  amount: 25000,
  currency: 'TZS',
  reference: 'inv_2024_0042',
  description: 'Invoice 42',
  customer: {
    name: 'Asha Mrema',
    phone: '255754111222',
    email: 'asha@example.com', // optional
  },
  redirectUrl: 'https://shop.example.com/thank-you', // optional, card checkouts
  metadata: { cartId: 'cart_99' }, // optional, echoed back on events
});

if (order.checkoutUrl) {
  // Card / hosted checkout: redirect the customer
} else if (order.ussdPushInitiated) {
  // Mobile money: customer confirms on their phone, webhook fires later
}`,
  },
  {
    topic: 'payment-status',
    title: 'Query payment status',
    description:
      "Poll a payment by the provider's orderId. Statuses: PENDING, PROCESSING, SUCCESS, FAILED, CANCELLED, AMBIGUOUS (Selcom only, keep polling).",
    docsPath: 'getting-started',
    code: `const status = await pesa.getPaymentStatus(order.orderId);

if (status === 'SUCCESS') {
  // funds received
} else if (status === 'AMBIGUOUS') {
  // Selcom-specific: outcome unknown, poll again later
}`,
  },
  {
    topic: 'webhook-mount',
    title: 'Mount the webhook handler',
    description:
      'pesa.mountWebhook is a standard fetch handler: (Request) => Promise<Response>. It serves POST {basePath}/webhook (basePath defaults to /pesa). Mount it publicly with no auth so providers can POST callbacks.',
    docsPath: 'integrations',
    code: `// Bun
Bun.serve({ fetch: pesa.mountWebhook });

// Deno
Deno.serve(pesa.mountWebhook);

// Hono
new Hono().mount('/pesa', pesa.mountWebhook);

// Next.js App Router: app/pesa/webhook/route.ts
export const POST = pesa.mountWebhook;

// Node native http
import { createServer } from 'node:http';

const server = createServer(async (req, res) => {
  const webRequest = new Request(\`http://\${req.headers.host}\${req.url}\`, {
    method: req.method,
    headers: req.headers as Record<string, string>,
    body: req.method !== 'GET' && req.method !== 'HEAD' ? req : undefined,
  });
  const webResponse = await pesa.mountWebhook(webRequest);
  res.writeHead(webResponse.status, Object.fromEntries(webResponse.headers));
  res.end(await webResponse.text());
});
server.listen(3000);`,
  },
  {
    topic: 'events',
    title: 'React to payment events',
    description:
      'Every verified webhook is persisted to the event store and emitted as a typed event. Types: PAYMENT_SUCCESS, PAYMENT_FAILED, PAYMENT_PENDING, DISBURSEMENT_SUCCESS, DISBURSEMENT_FAILED.',
    docsPath: 'events',
    code: `pesa.on('PAYMENT_SUCCESS', async (event) => {
  // event.reference: your order ID
  // event.orderId:   provider transaction ID
  // event.amount:    TZS integer
  // event.provider:  which provider processed it
  await markOrderPaid(event.reference);
});

pesa.on('PAYMENT_FAILED', async (event) => {
  await notifyCustomer(event.reference);
});`,
  },
  {
    topic: 'disburse',
    title: 'Send money out (B2C disbursement)',
    description: 'Pay out to a mobile wallet or bank account. Same payload shape across providers.',
    docsPath: 'getting-started',
    code: `const result = await pesa.disburse({
  amount: 50000,
  currency: 'TZS',
  recipient: {
    phone: '255712345678',
    name: 'Juma Ali',
  },
});

console.log(result.status);

// Bank transfer variants (provider-dependent) use accountNumber + bic:
await pesa.disburse({
  amount: 100000,
  currency: 'TZS',
  recipient: {
    accountNumber: '0150211111100',
    name: 'Asha Mrema',
    bic: 'CORUTZTZ',
  },
});`,
  },
  {
    topic: 'plugins',
    title: 'Built-in and custom plugins',
    description:
      'Plugins compose in order around every provider call. Built-ins: retryPlugin, idempotencyPlugin, loggingPlugin. A plugin is an object with optional beforeRequest / afterResponse hooks.',
    docsPath: 'plugins',
    code: `import { idempotencyPlugin, loggingPlugin, retryPlugin } from '@borapesa/pesa/plugins';
import type { PesaPlugin } from '@borapesa/pesa';

const metricsPlugin = (): PesaPlugin => ({
  name: 'metrics',
  async beforeRequest(ctx) {
    console.time(\`pesa:\${ctx.operation}\`);
    return ctx;
  },
  async afterResponse(ctx) {
    console.timeEnd(\`pesa:\${ctx.operation}\`);
    return ctx;
  },
});

const pesa = createPesa({
  provider,
  plugins: [idempotencyPlugin(), retryPlugin({ maxAttempts: 3 }), metricsPlugin()],
});`,
  },
  {
    topic: 'sqlite-store',
    title: 'Persistent event store with SQLite',
    description:
      'The default event store is in-memory and lost on restart. @borapesa/sqlite persists events to a local file with zero config.',
    docsPath: 'adapters',
    code: `import { SQLiteAdapter } from '@borapesa/sqlite';

const pesa = createPesa({
  provider,
  db: new SQLiteAdapter('./pesa.db'), // path defaults to './pesa.db'
});

// Any class implementing PesaDatabaseAdapter works as an event store.
// See the adapters docs page for the interface.`,
  },
  {
    topic: 'nextjs',
    title: 'Next.js App Router integration',
    description:
      'Keep the pesa instance in a server-only module. Mount the webhook as a route handler and call createOrder from your own authenticated routes or server actions.',
    docsPath: 'integrations',
    code: `// lib/pesa.ts (server-only)
import { createPesa } from '@borapesa/pesa';
import { SelcomPaymentProvider } from '@borapesa/selcom';

export const pesa = createPesa({
  provider: new SelcomPaymentProvider({
    apiKey: process.env.SELCOM_API_KEY!,
    apiSecret: process.env.SELCOM_API_SECRET!,
    vendor: process.env.SELCOM_VENDOR!,
    pin: process.env.SELCOM_PIN!,
  }),
});

// app/pesa/webhook/route.ts
import { pesa } from '@/lib/pesa';
export const POST = pesa.mountWebhook;

// app/api/checkout/route.ts (your own auth in front)
import { pesa } from '@/lib/pesa';

export async function POST(request: Request) {
  const { amount, reference, customer } = await request.json();
  const order = await pesa.createOrder({ amount, currency: 'TZS', reference, customer });
  return Response.json(order);
}`,
  },
  {
    topic: 'testing',
    title: 'Testing with the BogusPaymentProvider',
    description:
      'Deterministic tests without network calls. The Bogus provider implements every method and lets you script outcomes.',
    docsPath: 'testing',
    code: `import { describe, expect, it } from 'vitest';
import { createPesa } from '@borapesa/pesa';
import { BogusPaymentProvider } from '@borapesa/pesa/testing';

describe('checkout flow', () => {
  it('marks the order paid on success', async () => {
    const pesa = createPesa({
      provider: new BogusPaymentProvider({ defaultBehavior: 'success' }),
    });

    const order = await pesa.createOrder({
      amount: 1000,
      currency: 'TZS',
      reference: 'test_1',
      customer: { name: 'Test', phone: '255700000001' },
    });

    expect(order.status).toBe('SUCCESS');
  });
});`,
  },
  {
    topic: 'error-handling',
    title: 'Handling the PesaError hierarchy',
    description:
      'All errors extend PesaError. Subclasses: PesaValidationError (bad input, do not retry), PesaProviderError (upstream 4xx/5xx), PesaNetworkError (transport failure, safe to retry), PesaWebhookError (bad signature/payload), PesaUnsupportedError (method not supported by this provider).',
    docsPath: 'errors',
    code: `import {
  PesaError,
  PesaNetworkError,
  PesaProviderError,
  PesaValidationError,
} from '@borapesa/pesa';

try {
  await pesa.createOrder(payload);
} catch (error) {
  if (error instanceof PesaValidationError) {
    // Bad input (e.g. local 07XX phone instead of 255XXXXXXXXX). Fix, do not retry.
  } else if (error instanceof PesaNetworkError) {
    // Transport failure. Safe to retry; retryPlugin does this automatically.
  } else if (error instanceof PesaProviderError) {
    // Provider rejected the request. Inspect error.message and status.
  } else if (error instanceof PesaError) {
    // Any other SDK error.
  }
  throw error;
}`,
  },
  {
    topic: 'custom-provider',
    title: 'Writing a custom provider',
    description:
      'Extend BasePaymentProvider and implement the 4 required methods: createOrder, getPaymentStatus, disburse, handleWebhook. Optional methods (refund, getBalance, listOrders, ...) surface on the pesa instance automatically when implemented.',
    docsPath: 'providers',
    code: `import type {
  CreateOrderPayload,
  DisbursePayload,
  DisburseResult,
  OrderResult,
  PaymentEvent,
  PaymentStatus,
  ProviderName,
} from '@borapesa/pesa';
import { BasePaymentProvider } from '@borapesa/pesa';

export class MyGatewayProvider extends BasePaymentProvider {
  readonly name: ProviderName = 'mygateway' as ProviderName;

  async createOrder(payload: CreateOrderPayload): Promise<OrderResult> {
    // call your gateway, map its response to OrderResult
    throw new Error('implement me');
  }

  async getPaymentStatus(orderId: string): Promise<PaymentStatus> {
    throw new Error('implement me');
  }

  async disburse(payload: DisbursePayload): Promise<DisburseResult> {
    throw new Error('implement me');
  }

  async handleWebhook(
    rawBody: string | Buffer,
    headers: Record<string, string>,
  ): Promise<PaymentEvent> {
    // verify the signature, then map the callback to a PaymentEvent
    throw new Error('implement me');
  }
}`,
  },
];

export function getExample(topic: string): Example | undefined {
  return EXAMPLES.find((e) => e.topic === topic.toLowerCase());
}

export function exampleTopics(): string[] {
  return EXAMPLES.map((e) => e.topic);
}
