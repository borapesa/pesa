import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

let execFileSyncMock = vi.fn();
let spawnMock = vi.fn();
let readFileSyncMock = vi.fn();
let writeFileSyncMock = vi.fn();
let unlinkSyncMock = vi.fn();

vi.mock('node:child_process', () => ({
  execFileSync: vi.fn().mockImplementation((...args: unknown[]) => execFileSyncMock(...args)),
  spawn: vi.fn().mockImplementation((...args: unknown[]) => spawnMock(...args)),
}));

vi.mock('node:fs', () => ({
  readFileSync: vi.fn().mockImplementation((...args: unknown[]) => readFileSyncMock(...args)),
  writeFileSync: vi.fn().mockImplementation((...args: unknown[]) => writeFileSyncMock(...args)),
  unlinkSync: vi.fn().mockImplementation((...args: unknown[]) => unlinkSyncMock(...args)),
}));

vi.mock('node:os', () => ({
  platform: () => 'darwin',
  tmpdir: () => '/tmp',
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

function mockNoExistingTunnel() {
  readFileSyncMock.mockImplementation(() => {
    throw new Error('ENOENT');
  });
}

function mockSpawn() {
  const { EventEmitter } = require('node:events') as typeof import('node:events');
  const child = new EventEmitter() as any;
  child.pid = 99999;
  child.kill = vi.fn();
  child.unref = vi.fn();
  spawnMock.mockReturnValue(child);
  return child;
}

function mockLogContainsUrl(url: string) {
  readFileSyncMock.mockImplementation((filePath: unknown) => {
    if (typeof filePath === 'string' && filePath.includes('log')) {
      return `INF Requesting new quick Tunnel on trycloudflare.com...\nINF ${url}\n`;
    }
    throw new Error('ENOENT');
  });
}

function waitForTunnel() {
  return new Promise<void>((resolve) => setTimeout(resolve, 500));
}

// ── Tests ───────────────────────────────────────────────────────────────

describe('tunnelPlugin', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    execFileSyncMock = vi.fn();
    spawnMock = vi.fn();
    readFileSyncMock = vi.fn();
    writeFileSyncMock = vi.fn();
    unlinkSyncMock = vi.fn();
    mockNoExistingTunnel();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns a plugin with name "tunnel"', async () => {
    const { tunnelPlugin } = await import('./tunnel');
    expect(tunnelPlugin().name).toBe('tunnel');
  });

  it('has a sync init hook', async () => {
    const { tunnelPlugin } = await import('./tunnel');
    expect(typeof tunnelPlugin().init).toBe('function');
  });

  // ── New tunnel ──────────────────────────────────────────────────────

  it('starts a tunnel and logs the webhook URL', async () => {
    const { tunnelPlugin } = await import('./tunnel');
    mockCloudflaredAvailable();
    mockSpawn();
    mockLogContainsUrl('https://cool-fox.trycloudflare.com');

    tunnelPlugin({ port: 3001 }).init!({} as any);

    await waitForTunnel();

    const calls = (console.log as ReturnType<typeof vi.fn>).mock.calls.flat().join(' ');
    expect(calls).toContain('cool-fox.trycloudflare.com');
    expect(calls).toContain('/pesa/webhook');
  });

  // ── Existing tunnel (Bun reload) ────────────────────────────────────

  it('reuses existing tunnel when PID is still alive', async () => {
    const { tunnelPlugin } = await import('./tunnel');

    readFileSyncMock
      .mockReturnValueOnce('https://existing-fox.trycloudflare.com')
      .mockReturnValueOnce(String(process.pid));
    execFileSyncMock.mockReturnValue('cloudflared\n');

    tunnelPlugin().init!({} as any);

    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('existing-fox.trycloudflare.com'),
    );
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('reused from previous launch'),
    );
  });

  // ── Missing cloudflared ─────────────────────────────────────────────

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
    mockSpawn();
    mockLogContainsUrl('https://silent-fox.trycloudflare.com');

    tunnelPlugin({ log: false }).init!({} as any);

    await waitForTunnel();

    expect(console.log).not.toHaveBeenCalled();
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
