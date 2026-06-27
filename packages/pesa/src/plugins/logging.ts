import type { PesaPlugin, RequestContext, ResponseContext } from './types';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggingPluginOptions {
  /** Minimum log level (default: 'info'). */
  level?: LogLevel;
  /** Custom logger (default: console). */
  logger?: Pick<typeof console, 'debug' | 'info' | 'warn' | 'error'>;
}

const LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info:  1,
  warn:  2,
  error: 3,
};

/**
 * Structured logging plugin for all SDK operations.
 *
 * Logs every provider request and response including duration and status.
 * Defaults to `console` — swap for Pino, Winston, or any compatible logger.
 */
export function loggingPlugin(options: LoggingPluginOptions = {}): PesaPlugin {
  const { level = 'info', logger = console } = options;
  const threshold = LEVELS[level];

  function log(lvl: LogLevel, msg: string, data?: Record<string, unknown>) {
    if (LEVELS[lvl] >= threshold) {
      logger[lvl](JSON.stringify({ plugin: 'logging', level: lvl, msg, ...data }));
    }
  }

  return {
    name: 'logging',

    async beforeRequest(ctx: RequestContext): Promise<RequestContext> {
      ctx.metadata.startTime = Date.now();
      log('info', `${ctx.operation}: request`, {
        operation: ctx.operation,
        payload: stripSensitive(ctx.payload),
      });
      return ctx;
    },

    async afterResponse(ctx: ResponseContext): Promise<ResponseContext> {
      const duration = (ctx.metadata.startTime as number)
        ? Date.now() - (ctx.metadata.startTime as number)
        : ctx.durationMs;

      const status = (ctx.result as { status?: string }).status ?? 'unknown';
      const lvl = status === 'FAILED' ? 'error' : 'info';

      log(lvl, `${ctx.operation}: response`, {
        operation: ctx.operation,
        status,
        durationMs: duration,
      });

      ctx.metadata.durationMs = duration;
      return ctx;
    },

    async onPaymentEvent(event) {
      log('info', 'payment event', {
        type: event.type,
        orderId: event.orderId,
        reference: event.reference,
        amount: event.amount,
        provider: event.provider,
      });
    },
  };
}

/** Strip sensitive fields before logging. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function stripSensitive(payload: any): any {
  const safe = { ...payload };
  if ('phone' in safe) safe.phone = '***';
  if (safe.customer && typeof safe.customer === 'object') {
    const cust = { ...(safe.customer as Record<string, unknown>) };
    if ('phone' in cust) cust.phone = '***';
    if ('email' in cust) cust.email = '***';
    safe.customer = cust;
  }
  return safe;
}
