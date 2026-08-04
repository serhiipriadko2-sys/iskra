import { describe, expect, it } from 'vitest';
import {
  assertMemoryGatewayUnchanged,
  findForbiddenMemoryGatewayPaths,
  resolveRepositoryRoot,
} from '../../services/stagingAcceptanceSourceContract';
import { parseAndVerifyStagingAcceptanceReceiptBlock } from '../../services/stagingAcceptanceReceipt';
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

function git(cwd: string, ...args: string[]): string {
  return execFileSync('git', args, { cwd, encoding: 'utf8' }).trim();
}

describe('staging acceptance source contract', () => {
  it('does not change iskra-memory-gateway relative to the acceptance base', () => {
    expect(() => assertMemoryGatewayUnchanged()).not.toThrow();
  });

  it('fails closed when the requested comparison base does not exist', () => {
    expect(() => assertMemoryGatewayUnchanged('refs/heads/definitely-missing-acceptance-base')).toThrow(
      /could not compare/i,
    );
  });

  it('resolves the Git root before checking a root-level protected path', () => {
    const root = resolveRepositoryRoot();
    expect(existsSync(join(root, 'supabase', 'functions', 'iskra-memory-gateway'))).toBe(true);
  });

  it('detects a root Gateway change when invoked from a nested runtime directory', () => {
    const fixtureRoot = mkdtempSync(join(tmpdir(), 'iskra-staging-contract-'));
    try {
      const gatewayDir = join(fixtureRoot, 'supabase', 'functions', 'iskra-memory-gateway');
      const nestedRuntimeDir = join(fixtureRoot, 'runtime', 'iskraSpace');
      mkdirSync(gatewayDir, { recursive: true });
      mkdirSync(nestedRuntimeDir, { recursive: true });
      writeFileSync(join(gatewayDir, 'index.ts'), 'export const boundary = "base";\n');
      git(fixtureRoot, 'init', '--quiet');
      git(fixtureRoot, 'config', 'user.email', 'staging-contract@example.invalid');
      git(fixtureRoot, 'config', 'user.name', 'Staging Contract Test');
      git(fixtureRoot, 'add', '.');
      git(fixtureRoot, 'commit', '--quiet', '-m', 'fixture base');
      const base = git(fixtureRoot, 'rev-parse', 'HEAD');

      writeFileSync(join(gatewayDir, 'index.ts'), 'export const boundary = "changed";\n');
      expect(() => assertMemoryGatewayUnchanged(base, nestedRuntimeDir)).toThrow(
        /forbids Memory Gateway changes/i,
      );
    } finally {
      rmSync(fixtureRoot, { recursive: true, force: true });
    }
  });

  it('detects staged, committed, and untracked gateway paths with either separator', () => {
    expect(
      findForbiddenMemoryGatewayPaths(
        'runtime/iskraSpace/App.tsx\nsupabase/functions/iskra-memory-gateway/index.ts',
        'supabase\\functions\\iskra-memory-gateway\\untracked.ts',
      ),
    ).toEqual([
      'supabase/functions/iskra-memory-gateway/index.ts',
      'supabase/functions/iskra-memory-gateway/untracked.ts',
    ]);
  });

  it('keeps one canonical failed-staging receipt in the living release status', () => {
    const releaseStatus = readFileSync(
      join(resolveRepositoryRoot(), 'runtime', 'iskraSpace', 'RELEASE_STATUS.md'),
      'utf8',
    );
    const receipt = parseAndVerifyStagingAcceptanceReceiptBlock(releaseStatus);

    expect(receipt.source_pr).toBe(299);
    expect(receipt.source_merge_sha).toBe('4dd29c64e24a3f0333ca4d350154380dc1dd8ae0');
    expect(receipt.staging_migrations_before_and_after).toEqual({ before: 33, after: 33 });
    expect(receipt.test_matrix.branch_replay).toBe('failed_before_S0');
    expect(receipt.cleanup).toMatchObject({ branch_deleted: true, completed: true });
  });

  it('records the reproduced migration-34 cause and the exact-preview remediation', () => {
    const releaseStatus = readFileSync(
      join(resolveRepositoryRoot(), 'runtime', 'iskraSpace', 'RELEASE_STATUS.md'),
      'utf8',
    );

    expect(releaseStatus).toContain('82191ce0899bedb04bcd4345e0c7ee28adb65258');
    expect(releaseStatus).toContain('c8251c707d7bee66ece9c874c27c1ebe5833024a0573169df00f53a330a2be93');
    expect(releaseStatus).toContain('Users can manage own graph nodes (secure)');
    expect(releaseStatus).toContain('exact Git-associated');
    expect(releaseStatus).toContain('all 36 migrations replayed');
    expect(releaseStatus).toContain('functions were deployed/read back manually');
  });

  it('keeps historical GitHub integration drift and records the current exact-preview reconciliation', () => {
    const releaseStatus = readFileSync(
      join(resolveRepositoryRoot(), 'runtime', 'iskraSpace', 'RELEASE_STATUS.md'),
      'utf8',
    );

    expect(releaseStatus).toContain('serhiipriadko2-sys/Iskraspace');
    expect(releaseStatus).toContain('serhiipriadko2-sys/iskra');
    expect(releaseStatus).toContain('e66da7044627b7058e961a5a0619ef32d3980dd3');
    expect(releaseStatus).toContain('staging/iskraspace-acceptance-d2ce040');
    expect(releaseStatus).toContain('superseded for the current candidate');
    expect(releaseStatus).toContain('rejqxblontqjycldniyz');
    expect(releaseStatus).toContain('all 36 migrations replayed');
  });

  it('restores caller environment and scopes quota cleanup to disposable member subjects', () => {
    const harness = readFileSync(
      join(resolveRepositoryRoot(), 'tools', 'run_iskraspace_staging_acceptance.ps1'),
      'utf8',
    );

    expect(harness).toContain('$acceptanceEnvSnapshot');
    expect(harness).toContain('Wait-ForPostgrestJwtReadiness');
    expect(harness).toContain("$body -notmatch 'PGRST303'");
    expect(harness).toContain('GRAPH_FORBIDDEN_CLIENT_GRANT_COUNT');
    expect(harness).toContain('from information_schema.table_privileges');
    expect(harness).toContain("privilege_type in ('TRUNCATE', 'TRIGGER', 'REFERENCES')");
    expect(harness).toContain("'--db-url', $branch.POSTGRES_URL, '--output-format', 'json'");
    expect(harness).toContain("'--agent', 'yes'");
    expect(harness).toContain('$grantResult.forbidden_grant_count');
    expect(harness).toContain('Set-Item -LiteralPath "Env:$name"');
    expect(harness).toContain('Remove-Item -LiteralPath "Env:$name"');
    expect(harness).toContain("scope in ('member_minute','member_day')");
    expect(harness).toContain('subject in ($memberSubjectList)');
    expect(harness).toContain('CLEANUP_DB_ATTEMPTS');
    expect(harness).toContain('$cleanupAttempt -le 3');
    expect(harness).toContain("$cleanupTag = '$acceptance_cleanup$'");
    expect(harness).toContain('do $cleanupTag');
    expect(harness).toContain('delete from public.users where id in ($idList);');
    expect(harness).not.toContain('delete from private.ai_rate_limit_windows returning 1');
  });

  it('keeps strict production schema verification behind an explicit post-deploy dispatch', () => {
    const workflow = readFileSync(
      join(resolveRepositoryRoot(), '.github', 'workflows', 'supabase_schema_contract.yml'),
      'utf8',
    );

    expect(workflow).toContain('verify_live:');
    expect(workflow).toContain("github.event_name == 'workflow_dispatch'");
    expect(workflow).toContain('inputs.verify_live == true');
    expect(workflow).toContain('AGIISKRA_SUPABASE_DB_URL is required for verify_live=true');
    expect(workflow).toContain('pnpm check:supabase-graph-contract');
    expect(workflow).not.toContain('--allow-unreconciled-history');
  });
});
