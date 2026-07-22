import { describe, expect, it } from 'vitest';
import {
  assertMemoryGatewayUnchanged,
  findForbiddenMemoryGatewayPaths,
  resolveRepositoryRoot,
} from '../../services/stagingAcceptanceSourceContract';
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
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
});
