import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, '../../../..');
const productionWorkflow = readFileSync(
  join(repoRoot, '.github/workflows/production_deploy.yml'),
  'utf8'
);
const rootPackage = JSON.parse(readFileSync(join(repoRoot, 'package.json'), 'utf8')) as {
  packageManager?: string;
  pnpm?: unknown;
};
const runtimePackage = JSON.parse(
  readFileSync(join(repoRoot, 'runtime/package.json'), 'utf8')
) as {
  devDependencies?: Record<string, string>;
  overrides?: Record<string, unknown>;
};
const braceExpansionCompatPackage = JSON.parse(
  readFileSync(
    join(repoRoot, 'vendor/brace-expansion-compat/package.json'),
    'utf8',
  )
) as {
  dependencies?: Record<string, string>;
  exports?: Record<string, { import?: string; require?: string }>;
};
const pnpmWorkspace = readFileSync(join(repoRoot, 'pnpm-workspace.yaml'), 'utf8');
const supabaseConfig = readFileSync(join(repoRoot, 'supabase/config.toml'), 'utf8');
const pullRequestWorkflow = readFileSync(
  join(repoRoot, '.github/workflows/iskraspace_ci.yml'),
  'utf8'
);
const pagesWorkflow = readFileSync(join(repoRoot, '.github/workflows/github_pages.yml'), 'utf8');
const viteConfig = readFileSync(join(repoRoot, 'runtime/iskraSpace/vite.config.ts'), 'utf8');
const nginxConfig = readFileSync(join(repoRoot, 'nginx.conf'), 'utf8');
const vercelConfig = readFileSync(join(repoRoot, 'vercel.json'), 'utf8');
const sourceIndex = readFileSync(join(repoRoot, 'runtime/iskraSpace/index.html'), 'utf8');
const dockerfile = readFileSync(join(repoRoot, 'Dockerfile'), 'utf8');
const runtimeConfigEntrypoint = readFileSync(
  join(repoRoot, 'deploy/iskraspace-runtime-config.sh'),
  'utf8'
);

describe('IskraSpace release workflow contract', () => {
  it('pins the resource-safe Vitest worker model and runs units twice', () => {
    expect(viteConfig).toContain("pool: 'threads'");
    expect(viteConfig).toContain('maxWorkers: 2');
    expect(
      productionWorkflow.match(
        /pnpm --filter iskra-space --fail-if-no-match test:run/g
      )?.length
    ).toBeGreaterThanOrEqual(2);
    expect(pullRequestWorkflow.match(/pnpm test:run/g)?.length).toBeGreaterThanOrEqual(2);
  });

  it('makes security, integrity, browser and Docker smoke checks release gates', () => {
    for (const marker of [
      'lint:strict',
      'npx --yes pnpm@11.13.0',
      '--pm-on-fail=ignore',
      'audit --audit-level moderate',
      'npm audit --audit-level moderate',
      'check:supabase-graph-contract:repo',
      'check:supabase-voice-metrics-contract:repo',
      'tools/verify_ledger.ts',
      'deno test',
      'playwright test --project=chromium',
      'playwright.production.config.ts',
      'chromium-production',
      'check:bundle-budget',
      'docker run',
      '/health',
      'Content-Security-Policy',
      '/tmp/health-headers.txt',
      'asset_path=',
      'runtime-config.js',
      'sb_publishable_smoke_public_only',
      'RELEASE_RECEIPT.md',
      'steps.candidate.outputs.digest',
      'Promote the smoke-tested digest',
      'confirm_live_supabase_acceptance',
      'environment: production',
    ]) {
      expect(productionWorkflow).toContain(marker);
    }

  });

  it('uses one pinned install authority, a separate audit-only client and API-compatible overrides', () => {
    expect(rootPackage.packageManager).toBe('pnpm@10.32.1');
    expect(rootPackage.pnpm).toBeUndefined();
    expect(productionWorkflow).toContain('npx --yes pnpm@11.13.0');
    expect(productionWorkflow).toContain('packageManager remains authoritative for install/build');
    expect(pnpmWorkspace).toContain('overrides:');
    expect(pnpmWorkspace).toContain("postcss: '8.5.18'");
    expect(pnpmWorkspace).toContain(
      "brace-expansion: 'file:vendor/brace-expansion-compat'",
    );
    expect(pnpmWorkspace).not.toContain('patchedDependencies:');
    expect(runtimePackage.devDependencies?.['eslint']).toBe('10.0.2');
    expect(runtimePackage.overrides?.['brace-expansion']).toBeUndefined();
    expect(runtimePackage.overrides?.['minimatch@3.1.5']).toBeUndefined();
    expect(braceExpansionCompatPackage.dependencies?.['brace-expansion-modern']).toBe(
      'npm:brace-expansion@5.0.8',
    );
    expect(braceExpansionCompatPackage.exports?.['.']).toEqual({
      import: './index.mjs',
      require: './index.cjs',
    });
  });

  it('maps runtime Edge Functions to entrypoints relative to supabase/config.toml', () => {
    for (const functionName of ['gemini', 'iskra-agent', 'kain']) {
      expect(supabaseConfig).toContain(`[functions.${functionName}]`);
      expect(supabaseConfig).toContain(
        `entrypoint = "../runtime/iskraSpace/supabase/functions/${functionName}/index.ts"`,
      );
      expect(supabaseConfig).toContain(
        `import_map = "../runtime/iskraSpace/supabase/functions/${functionName}/deno.json"`,
      );
    }
  });

  it('keeps Vercel out of the canonical production path', () => {
    expect(productionWorkflow).toContain('Deploy Vercel preview');
    expect(productionWorkflow).not.toMatch(/vercel deploy[^\n]*--prod/);
  });

  it('does not publish a production image on an automatic main push', () => {
    expect(productionWorkflow).toContain("github.event_name == 'workflow_dispatch'");
    expect(productionWorkflow).toContain('inputs.confirm_live_supabase_acceptance');
  });

  it('keeps GitHub Pages as a manually invoked preview', () => {
    expect(pagesWorkflow).toContain('workflow_dispatch:');
    expect(pagesWorkflow).not.toMatch(/^\s+push:/m);
  });

  it('requires public closed-beta configuration before building the Pages preview', () => {
    for (const marker of [
      'ISKRASPACE_SUPABASE_URL',
      'ISKRASPACE_SUPABASE_PUBLISHABLE_KEY',
      'Verify GitHub Pages closed-beta configuration',
      'VITE_APP_VERSION: ${{ github.sha }}',
    ]) {
      expect(pagesWorkflow).toContain(marker);
    }
  });

  it('runs when build inputs and release surfaces change', () => {
    for (const marker of [
      'packages/**',
      'deploy/**',
      'pnpm-workspace.yaml',
      'Dockerfile',
      'nginx.conf',
      '.github/workflows/production_deploy.yml',
    ]) {
      expect(productionWorkflow).toContain(marker);
    }

    for (const marker of [
      'packages/core/**',
      'packages/math/**',
      'deploy/**',
      'pnpm-workspace.yaml',
      'Dockerfile',
      'nginx.conf',
      '.github/workflows/production_deploy.yml',
    ]) {
      expect(pullRequestWorkflow).toContain(marker);
    }
  });

  it('keeps model providers behind Edge Functions and synchronizes the CSP surfaces', () => {
    for (const source of [viteConfig, nginxConfig, vercelConfig]) {
      expect(source).toContain('https://*.supabase.co');
      expect(source).toContain('https://*.posthog.com');
      expect(source).toContain('https://*.sentry.io');
      expect(source).not.toContain('https://api.openai.com');
      expect(source).not.toContain('https://api.chatgpt.com');
      expect(source).not.toContain('https://generativelanguage.googleapis.com');
    }

    expect(sourceIndex).not.toContain('http-equiv="Content-Security-Policy"');
  });

  it('injects validated public config when the canonical container starts', () => {
    expect(sourceIndex).toContain('runtime-config.js');
    expect(sourceIndex).toContain('src="/index.tsx"');
    expect(sourceIndex).toContain('href="/index.css"');
    expect(sourceIndex).not.toContain('%BASE_URL%index.tsx');
    expect(sourceIndex).not.toContain('%BASE_URL%index.css');
    expect(dockerfile).toContain('/docker-entrypoint.d/40-iskraspace-runtime-config.sh');
    expect(runtimeConfigEntrypoint).toContain('VITE_SUPABASE_URL is required');
    expect(runtimeConfigEntrypoint).toContain('service-role credentials are forbidden');
    expect(runtimeConfigEntrypoint).not.toMatch(/^\s+VITE_SUPABASE_SERVICE_ROLE_KEY:/m);
  });
});
