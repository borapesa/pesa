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

function assertCloudflared(binary: string): void {
  if (which(binary)) return;

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

function isAlive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    // PID is alive, but could be reused by an unrelated process.
    // Double-check it's actually cloudflared (or our mock cloudflaredd).
    // Use args (full command line), not comm (binary name).  Scripts
    // run via shebang show as /bin/bash, but the full args include the
    // script name (cloudflared / cloudflaredd).
    const args = execFileSync('ps', ['-p', String(pid), '-o', 'args='], {
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    return args.includes('cloudflared');
  } catch {
    return false;
  }
}

function readState(port: number): TunnelState | null {
  try {
    const url = readFileSync(stateFile(port, 'url'), 'utf-8').trim();
    const pid = parseInt(readFileSync(stateFile(port, 'pid'), 'utf-8').trim(), 10);
    if (isAlive(pid)) {
      return { url, pid };
    }
    // Process is dead or PID reused — clean up stale files
    clearState(port);
    return null;
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

function startTunnel(port: number, binary = 'cloudflared'): Promise<Tunnel> {
  return new Promise((resolve, reject) => {
    assertCloudflared(binary);

    const logFile = stateFile(port, 'log');

    // Spawn detached in its own process group — Ctrl+C on the dev server
    // won't kill the tunnel, and SIGINT won't race with Bun's handler.
    // Use --logfile to capture the URL since detached disconnects stdio.
    const child = spawn(
      binary,
      ['tunnel', '--url', `http://localhost:${port}`, '--no-autoupdate', '--logfile', logFile],
      { stdio: 'ignore', detached: true },
    );
    child.unref();

    let resolved = false;
    const start = Date.now();

    const poll = () => {
      if (resolved) return;
      try {
        const content = readFileSync(logFile, 'utf-8');
        const match = content.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
        if (match) {
          resolved = true;
          const url = match[0].replace(/\/$/, '');
          resolve({
            url,
            pid: child.pid!,
            close: () => {
              child.kill('SIGKILL');
              clearState(port);
              try {
                unlinkSync(logFile);
              } catch {}
            },
          });
          return;
        }
      } catch {
        // log file not written yet — keep polling
      }

      if (Date.now() - start > 15_000) {
        resolved = true;
        child.kill('SIGKILL');
        try {
          unlinkSync(logFile);
        } catch {}
        reject(new Error('cloudflared tunnel timed out after 15s'));
        return;
      }

      setTimeout(poll, 200);
    };

    poll();

    child.on('error', (err) => {
      if (!resolved) {
        resolved = true;
        try {
          unlinkSync(logFile);
        } catch {}
        reject(new Error(`Failed to start cloudflared: ${err.message}`));
      }
    });

    child.on('exit', (code) => {
      if (!resolved) {
        resolved = true;
        try {
          unlinkSync(logFile);
        } catch {}
        reject(new Error(`cloudflared exited with code ${code}`));
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

  /**
   * Override the cloudflared binary path or name.
   * Useful for testing with a mock binary that mimics cloudflared's I/O.
   * @default 'cloudflared'
   */
  binary?: string;
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
  const binary = opts.binary ?? 'cloudflared';

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
      startTunnel(port, binary)
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
          // The tunnel is detached — it survives Bun --watch reloads
          // without us doing anything. We never kill it — it lives until
          // the machine reboots and we reuse it via the state file.
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

function isAvailable(binary = 'cloudflared'): boolean {
  return which(binary) !== null;
}
