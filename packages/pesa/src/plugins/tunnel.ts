import { execFileSync, spawn } from 'node:child_process';
import { platform } from 'node:os';
import type { PesaPlugin } from './types';

// ── Cloudflared detection ──────────────────────────────────────────────

const INSTALL_INSTRUCTIONS: Record<string, string> = {
  darwin: 'brew install cloudflared',
  linux:
    'curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o /usr/local/bin/cloudflared && chmod +x /usr/local/bin/cloudflared',
  win32: 'winget install Cloudflare.cloudflared',
};

function which(command: string): string | null {
  try {
    return (
      execFileSync(platform() === 'win32' ? 'where' : 'which', [command], {
        encoding: 'utf-8',
        stdio: ['ignore', 'pipe', 'ignore'],
      }).trim() || null
    );
  } catch {
    return null;
  }
}

function assertCloudflared(): void {
  if (which('cloudflared')) return;

  const os = platform();
  const hint =
    INSTALL_INSTRUCTIONS[os] ??
    'Install cloudflared: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/';

  throw new Error(
    `@borapesa/tunnel requires cloudflared to be installed.\n\n` +
      `Install it:\n  ${hint}\n\n` +
      `cloudflared is free, open source, and requires no Cloudflare account.\n` +
      `It creates a temporary trycloudflare.com URL that tunnels to your localhost.`,
  );
}

// ── Tunnel lifecycle ───────────────────────────────────────────────────

export interface Tunnel {
  url: string;
  close: () => void;
}

function startTunnel(port: number): Promise<Tunnel> {
  return new Promise((resolve, reject) => {
    assertCloudflared();

    const child = spawn(
      'cloudflared',
      ['tunnel', '--url', `http://localhost:${port}`, '--no-autoupdate'],
      { stdio: ['ignore', 'pipe', 'pipe'] },
    );

    // Don't let cloudflared keep the parent process alive.
    // SIGINT/Ctrl+C should kill the whole process tree immediately.
    child.unref();

    let resolved = false;
    let stderr = '';

    const checkOutput = (output: string) => {
      const match = output.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
      if (match && !resolved) {
        resolved = true;
        clearTimeout(timeout);

        // Detach listeners — cloudflared keeps logging heartbeats
        // to stderr, which would drown out the server's own output.
        child.stdout?.removeAllListeners('data');
        child.stderr?.removeAllListeners('data');

        const url = match[0].replace(/\/$/, '');
        resolve({ url, close: () => child.kill('SIGKILL') });
      }
    };

    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        child.kill('SIGKILL');
        reject(new Error(`cloudflared tunnel timed out after 15s.\nStderr: ${stderr || '(none)'}`));
      }
    }, 15_000);

    child.stdout?.on('data', (data: Buffer) => {
      checkOutput(data.toString());
    });

    child.stderr?.on('data', (data: Buffer) => {
      const text = data.toString();
      stderr += text;
      checkOutput(text);
    });

    child.on('error', (err) => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeout);
        reject(new Error(`Failed to start cloudflared: ${err.message}`));
      }
    });

    child.on('exit', (code) => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeout);
        reject(new Error(`cloudflared exited with code ${code}.\nStderr: ${stderr || '(none)'}`));
      }
    });
  });
}

// ── Plugin ─────────────────────────────────────────────────────────────

export interface TunnelPluginOptions {
  /**
   * The local port to expose via the tunnel.
   * @default 3000
   */
  port?: number;

  /**
   * Whether to print the tunnel URL to the console.
   * @default true
   */
  log?: boolean;
}

/**
 * A borapesa plugin that starts a Cloudflare Quick Tunnel for local
 * webhook development.  Requires `cloudflared` on the system PATH
 * (free, no account needed).
 *
 * ```ts
 * import { createPesa } from '@borapesa/pesa';
 * import { tunnelPlugin } from '@borapesa/pesa/plugins';
 *
 * const pesa = createPesa({
 *   provider: new SelcomPaymentProvider({...}),
 *   plugins: [tunnelPlugin()],
 * });
 * // → Tunnel ready: https://random.trycloudflare.com
 * // → Webhook URL:  https://random.trycloudflare.com/pesa/webhook
 * ```
 */
export function tunnelPlugin(opts: TunnelPluginOptions = {}): PesaPlugin {
  const port = opts.port ?? 3000;
  const log = opts.log !== false;
  let tunnel: Tunnel | null = null;

  return {
    name: 'tunnel',

    init() {
      // Fire-and-forget — the tunnel starts in the background and logs
      // the webhook URL once it's ready.
      startTunnel(port)
        .then((t) => {
          tunnel = t;
          if (log) {
            console.log('');
            console.log('🛜  @borapesa/tunnel');
            console.log(`   Tunnel ready:  ${t.url}`);
            console.log(`   Webhook URL:   ${t.url}/pesa/webhook`);
            console.log('');
          }
        })
        .catch((err) => {
          if (log) {
            const message = err instanceof Error ? err.message : String(err);
            console.warn(`@borapesa/tunnel: ${message}`);
          }
        });

      const cleanup = () => tunnel?.close();
      process.on('exit', cleanup);
      process.on('SIGINT', cleanup);
      process.on('SIGTERM', cleanup);
    },
  };
}

export { isAvailable, startTunnel };

function isAvailable(): boolean {
  return which('cloudflared') !== null;
}
