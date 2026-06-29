import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// ── Mocks ───────────────────────────────────────────────────────────────

let spawnMock = vi.fn();
let execFileSyncMock = vi.fn();

vi.mock('node:child_process', () => ({
  execFileSync: vi.fn().mockImplementation((...args: unknown[]) => execFileSyncMock(...args)),
  spawn: vi.fn().mockImplementation((...args: unknown[]) => spawnMock(...args)),
}));

vi.mock('node:os', () => ({
  platform: () => 'darwin',
}));

// ── Helpers ─────────────────────────────────────────────────────────────

function mockCloudflaredAvailable() {
  execFileSyncMock.mockReturnValue('/usr/local/bin/cloudflared\n');
}

function mockCloudflaredMissing() {
  execFileSyncMock.mockImplementation(() => {
    throw new Error('not found');
  });
}

function mockTunnelOutput(url: string) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { EventEmitter } = require('node:events') as typeof import('node:events');

  const child = new EventEmitter() as any;
  child.stdout = new EventEmitter();
  child.stderr = new EventEmitter();
  child.kill = vi.fn();
  child.unref = vi.fn();
  spawnMock.mockReturnValue(child);

  // Emit the URL after a tick
  setImmediate(() => {
    child.stdout.emit(
      'data',
      Buffer.from(
        `2024-01-01T00:00:00Z INF Requesting new quick Tunnel on trycloudflare.com...\n2024-01-01T00:00:00Z INF ${url}\n`,
      ),
    );
  });

  return child;
}

function waitForTunnel() {
  return new Promise<void>((resolve) => setImmediate(resolve));
}

// ── Tests ───────────────────────────────────────────────────────────────

describe('tunnelPlugin', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    spawnMock = vi.fn();
    execFileSyncMock = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ── Plugin structure ────────────────────────────────────────────────

  it('returns a plugin with name "tunnel"', async () => {
    const { tunnelPlugin } = await import('./tunnel');
    const plugin = tunnelPlugin();
    expect(plugin.name).toBe('tunnel');
  });

  it('has a sync init hook', async () => {
    const { tunnelPlugin } = await import('./tunnel');
    const plugin = tunnelPlugin();
    expect(typeof plugin.init).toBe('function');
  });

  it('does not expose request lifecycle hooks', async () => {
    const { tunnelPlugin } = await import('./tunnel');
    const plugin = tunnelPlugin();
    expect(plugin.beforeRequest).toBeUndefined();
    expect(plugin.afterResponse).toBeUndefined();
    expect(plugin.onPaymentEvent).toBeUndefined();
  });

  // ── Successful tunnel ───────────────────────────────────────────────

  it('starts a tunnel and logs the webhook URL', async () => {
    const { tunnelPlugin } = await import('./tunnel');
    mockCloudflaredAvailable();
    mockTunnelOutput('https://cool-fox.trycloudflare.com');

    const plugin = tunnelPlugin({ port: 3001 });
    plugin.init!({} as any);

    await waitForTunnel();

    const calls = (console.log as ReturnType<typeof vi.fn>).mock.calls.flat().join(' ');

    expect(calls).toContain('cool-fox.trycloudflare.com');
    expect(calls).toContain('/pesa/webhook');
  });

  it('uses port 3000 by default', async () => {
    const { tunnelPlugin } = await import('./tunnel');
    mockCloudflaredAvailable();
    mockTunnelOutput('https://default-fox.trycloudflare.com');

    tunnelPlugin().init!({} as any);

    const args = spawnMock.mock.calls[0]?.[1] as string[];
    expect(args).toContain('http://localhost:3000');
  });

  it('respects custom port', async () => {
    const { tunnelPlugin } = await import('./tunnel');
    mockCloudflaredAvailable();
    mockTunnelOutput('https://custom-fox.trycloudflare.com');

    tunnelPlugin({ port: 8080 }).init!({} as any);

    const args = spawnMock.mock.calls[0]?.[1] as string[];
    expect(args).toContain('http://localhost:8080');
  });

  // ── Missing cloudflared ──────────────────────────────────────────────

  it('warns gracefully when cloudflared is not installed', async () => {
    const { tunnelPlugin } = await import('./tunnel');
    mockCloudflaredMissing();

    tunnelPlugin().init!({} as any);

    await waitForTunnel();

    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('requires cloudflared'));
  });

  it('prints macOS install instructions', async () => {
    const { tunnelPlugin } = await import('./tunnel');
    mockCloudflaredMissing();

    tunnelPlugin().init!({} as any);

    await waitForTunnel();

    const calls = (console.warn as ReturnType<typeof vi.fn>).mock.calls.flat().join(' ');

    expect(calls).toContain('brew install cloudflared');
  });

  // ── Silent mode ─────────────────────────────────────────────────────

  it('does not log when log option is false', async () => {
    const { tunnelPlugin } = await import('./tunnel');
    mockCloudflaredAvailable();
    mockTunnelOutput('https://silent-fox.trycloudflare.com');

    tunnelPlugin({ log: false }).init!({} as any);

    await waitForTunnel();

    expect(console.log).not.toHaveBeenCalled();
    expect(console.warn).not.toHaveBeenCalled();
  });

  // ── Process error ───────────────────────────────────────────────────

  it('logs a warning when cloudflared fails to start', async () => {
    const { tunnelPlugin } = await import('./tunnel');
    mockCloudflaredAvailable();
    const { EventEmitter } = await import('node:events');
    const child = new EventEmitter() as any;
    child.stdout = new EventEmitter();
    child.stderr = new EventEmitter();
    child.kill = vi.fn();
    child.unref = vi.fn();
    spawnMock.mockReturnValue(child);

    tunnelPlugin().init!({} as any);

    child.emit('error', new Error('spawn ENOENT'));

    await waitForTunnel();

    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('spawn ENOENT'));
  });

  // ── Cleanup ──────────────────────────────────────────────────────────

  it('returns a close function that kills the tunnel', async () => {
    const { startTunnel } = await import('./tunnel');
    mockCloudflaredAvailable();
    const child = mockTunnelOutput('https://cleanup-fox.trycloudflare.com');

    const tunnel = await startTunnel(3000);
    tunnel.close();

    expect(child.kill).toHaveBeenCalled();
  });

  // ── isAvailable ─────────────────────────────────────────────────────

  it('reports true when cloudflared is on PATH', async () => {
    const { isAvailable } = await import('./tunnel');
    mockCloudflaredAvailable();
    expect(isAvailable()).toBe(true);
  });

  it('reports false when cloudflared is not on PATH', async () => {
    const { isAvailable } = await import('./tunnel');
    mockCloudflaredMissing();
    expect(isAvailable()).toBe(false);
  });
});
