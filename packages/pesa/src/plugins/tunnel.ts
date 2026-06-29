import { execFileSync, spawn } from 'node:child_process';
import { readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { platform, tmpdir } from 'node:os';
import { join } from 'node:path';
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

// ── Persistence ────────────────────────────────────────────────────────

interface TunnelState {
  url: string;
  pid: number;
}

function stateFile(port: number, suffix: string): string {
  return join(tmpdir(), `borapesa-tunnel-${port}.${suffix}`);
}

function readState(port: number): TunnelState | null {
  try {
    const url = readFileSync(stateFile(port, 'url'), 'utf-8').trim();
    const pid = parseInt(readFileSync(stateFile(port, 'pid'), 'utf-8').trim(), 10);
    // Verify the process is still running
    try {
      process.kill(pid, 0); // signal 0 just checks existence
      return { url, pid };
    } catch {
      // Process is dead — clean up stale files
      clearState(port);
      return null;
    }
  } catch {
    return null;
  }
}

function writeState(port: number, state: TunnelState): void {
  writeFileSync(stateFile(port, 'url'), state.url, 'utf-8');
  writeFileSync(stateFile(port, 'pid'), String(state.pid), 'utf-8');
}

function clearState(port: number): void {
  try {
    unlinkSync(stateFile(port, 'url'));
    unlinkSync(stateFile(port, 'pid'));
  } catch {
    // already cleaned up
  }
}

// ── Tunnel lifecycle ───────────────────────────────────────────────────

export interface Tunnel {
  url: string;
  pid: number;
  close: () => void;
}

function startTunnel(port: number): Promise<Tunnel> {
  return new Promise((resolve, reject) => {
    assertCloudflared();

    // Spawn detached — survives parent process restarts (Bun --watch reloads).
    // This means the tunnel persists across hot reloads and we reuse the same URL.
    const child = spawn(
      'cloudflared',
      ['tunnel', '--url', `http://localhost:${port}`, '--no-autoupdate'],
      { stdio: ['ignore', 'pipe', 'pipe'], detached: true },
    );

    let resolved = false;
    let stderr = '';

    const noop = () => {};

    const checkOutput = (output: string) => {
      const match = output.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
      if (match && !resolved) {
        resolved = true;
        clearTimeout(timeout);

        // Swap listeners to no-op so the pipe keeps draining (prevents
        // backpressure blocking the event loop) without printing noise.
        child.stdout?.removeAllListeners('data');
        child.stderr?.removeAllListeners('data');
        child.stdout?.on('data', noop);
        child.stderr?.on('data', noop);

        const url = match[0].replace(/\/$/, '');
        resolve({
          url,
          pid: child.pid!,
          close: () => {
            child.kill('SIGKILL');
            clearState(port);
          },
        });
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
 * The tunnel persists across Bun/Node --watch reloads — the same URL
 * is reused between restarts so you don't need to reconfigure your
 * provider dashboard on every file change.
 *
 * ```ts
 * import { createPesa } from '@borapesa/pesa';
 * import { tunnelPlugin } from '@borapesa/pesa/plugins';
 *
 * const pesa = createPesa({
 *   provider: new SelcomPaymentProvider({...}),
 *   plugins: [tunnelPlugin()],
 * });
 * // First launch:
 * // 🛜  @borapesa/tunnel
 * //    Tunnel ready:  https://xxx.trycloudflare.com
 * //    Webhook URL:   https://xxx.trycloudflare.com/pesa/webhook
 * //
 * // Subsequent Bun --watch reloads: (silent — reuses same URL)
 * ```
 */
export function tunnelPlugin(opts: TunnelPluginOptions = {}): PesaPlugin {
  const port = opts.port ?? 3000;
  const log = opts.log !== false;

  return {
    name: 'tunnel',

    init() {
      // Check for existing tunnel (persisted across Bun --watch reloads)
      const existing = readState(port);

      if (existing) {
        // Tunnel is still alive — reuse silently
        if (log) {
          console.log('');
          console.log('🛜  @borapesa/tunnel');
          console.log(`   Tunnel ready:  ${existing.url}`);
          console.log(`   Webhook URL:   ${existing.url}/pesa/webhook`);
          console.log('   (reused from previous launch)');
          console.log('');
        }
        return;
      }

      // Start a new tunnel
      startTunnel(port)
        .then((t) => {
          // Store the tunnel process PID so it can be checked after reload.
          writeState(port, { url: t.url, pid: t.pid });
          if (log) {
            console.log('');
            console.log('🛜  @borapesa/tunnel');
            console.log(`   Tunnel ready:  ${t.url}`);
            console.log(`   Webhook URL:   ${t.url}/pesa/webhook`);
            console.log('');
          }
          // Signal cleanup — tunnel is detached and should survive
          // Bun --watch reloads. Only clear state on actual shutdown.
          process.on('SIGTERM', () => {
            t.close();
            clearState(port);
          });
          // on reload the state file persists so the new process
          // finds the still-running tunnel and reuses the URL.
        })
        .catch((err) => {
          if (log) {
            const message = err instanceof Error ? err.message : String(err);
            console.warn(`@borapesa/tunnel: ${message}`);
          }
        });
    },
  };
}

export { isAvailable, startTunnel };

function isAvailable(): boolean {
  return which('cloudflared') !== null;
}
