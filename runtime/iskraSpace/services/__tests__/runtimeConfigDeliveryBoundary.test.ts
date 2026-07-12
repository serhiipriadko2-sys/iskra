import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, '../../../..');
const entrypoint = join(repoRoot, 'deploy/iskraspace-runtime-config.sh');
const serviceWorker = readFileSync(
  join(repoRoot, 'runtime/iskraSpace/public/service-worker.js'),
  'utf8'
);
const shell =
  process.platform === 'win32'
    ? ['C:/Program Files/Git/bin/sh.exe', 'C:/Program Files/Git/usr/bin/sh.exe'].find(existsSync)
    : 'sh';

function legacyJwt(role: string): string {
  const encode = (value: object) => Buffer.from(JSON.stringify(value)).toString('base64url');
  return `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ role })}.test-signature`;
}

function runEntrypoint(overrides: Record<string, string> = {}) {
  if (!shell) throw new Error('A POSIX shell is required for the runtime-config contract test');

  const work = mkdtempSync(join(tmpdir(), 'iskraspace-runtime-config-'));
  const output = join(work, 'runtime-config.js').replaceAll('\\', '/');
  const {
    SUPABASE_SERVICE_ROLE_KEY: _serviceRole,
    VITE_SUPABASE_SERVICE_ROLE_KEY: _viteServiceRole,
    ...safeProcessEnv
  } = process.env;
  const result = spawnSync(shell, [entrypoint.replaceAll('\\', '/')], {
    encoding: 'utf8',
    env: {
      ...safeProcessEnv,
      ISKRA_RUNTIME_CONFIG_OUTPUT: output,
      VITE_SUPABASE_URL: 'https://abcdefghijklmnopqrst.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'sb_publishable_smoke_public_only',
      VITE_SENTRY_DSN: '',
      VITE_POSTHOG_KEY: '',
      VITE_POSTHOG_HOST: 'https://app.posthog.com',
      ...overrides,
    },
  });
  const generated = existsSync(output) ? readFileSync(output, 'utf8') : '';
  rmSync(work, { recursive: true, force: true });
  return { ...result, generated };
}

describe('canonical runtime-config delivery boundary', () => {
  it('accepts only public Supabase client credentials', () => {
    const publishable = runEntrypoint();
    expect(publishable.status, publishable.stderr).toBe(0);
    expect(publishable.generated).toContain('sb_publishable_smoke_public_only');

    const legacyAnon = runEntrypoint({ VITE_SUPABASE_ANON_KEY: legacyJwt('anon') });
    expect(legacyAnon.status, legacyAnon.stderr).toBe(0);

    const secretValue = ['sb', 'secret', 'never_browser_visible'].join('_');
    const secret = runEntrypoint({ VITE_SUPABASE_ANON_KEY: secretValue });
    expect(secret.status).not.toBe(0);
    expect(secret.stderr).toContain(['sb', 'secret'].join('_'));

    const serviceRole = runEntrypoint({ VITE_SUPABASE_ANON_KEY: legacyJwt('service_role') });
    expect(serviceRole.status).not.toBe(0);
    expect(serviceRole.stderr).toContain('service_role');
  });

  it('rejects deceptive provider URLs instead of matching path suffixes', () => {
    const supabase = runEntrypoint({
      VITE_SUPABASE_URL: 'https://evil.invalid/path.supabase.co',
    });
    expect(supabase.status).not.toBe(0);

    const posthog = runEntrypoint({
      VITE_POSTHOG_HOST: 'https://evil.invalid/path.posthog.com',
    });
    expect(posthog.status).not.toBe(0);
  });

  it('never lets the service worker cache runtime-config.js', () => {
    expect(serviceWorker).toContain("const CACHE_NAME = 'iskra-pwa-v3'");
    expect(serviceWorker).toContain('RUNTIME_CONFIG_PATH_PATTERN.test(url.pathname)');
    expect(serviceWorker).toContain("fetch(request, { cache: 'no-store' })");
  });
});
