import { describe, expect, it } from 'vitest';
import {
  canonicalizeStagingAcceptanceReceipt,
  createStagingAcceptanceReceipt,
  type StagingAcceptanceReceiptInput,
} from '../stagingAcceptanceReceipt';

const validReceipt: StagingAcceptanceReceiptInput = {
  source_pr: 273,
  source_merge_sha: 'bb495b40cf0c9c31a7ecd9cc5122404252806e50',
  production_ref: 'typcvaszcfdpkzbjzuur',
  production_migration_count: 35,
  staging_ref_and_branch_id: { id: 'branch-id', ref: 'staging-project-ref' },
  staging_migrations_before_and_after: { before: 35, after: 36 },
  function_source_hashes: { iskra_agent: 'a'.repeat(64) },
  auth_config_before_and_after: { before: 'config-hash-before', after: 'config-hash-after' },
  test_matrix: { S0: 'passed', S1: 'passed' },
  advisor_counts_by_class_before_and_after: {
    before: {
      security: { authenticated_security_definer_function_executable: 14 },
      performance: { auth_rls_initplan: 4, multiple_permissive_policies: 2 },
    },
    after: {
      security: { authenticated_security_definer_function_executable: 13 },
      performance: { auth_rls_initplan: 0, multiple_permissive_policies: 0 },
    },
  },
  provider_invocations: 0,
  memory_gateway_changed: false,
  cleanup: { completed: true },
  started_at: '2026-07-18T00:00:00.000Z',
  completed_at: '2026-07-18T00:01:00.000Z',
};

describe('staging acceptance receipt', () => {
  it('creates deterministic canonical JSON and a SHA-256 that excludes itself', () => {
    const first = createStagingAcceptanceReceipt(validReceipt);
    const second = createStagingAcceptanceReceipt({ ...validReceipt, test_matrix: { S1: 'passed', S0: 'passed' } });

    expect(first.scope).toBe('staging_only');
    expect(first.schema_version).toBe(1);
    expect(first.sha256).toMatch(/^[a-f0-9]{64}$/);
    expect(canonicalizeStagingAcceptanceReceipt(first)).toBe(canonicalizeStagingAcceptanceReceipt(second));
  });

  it.each([
    ['email', 'owner@example.com'],
    ['JWT', 'eyJhbGciOiJIUzI1NiJ9.payload.signature'],
    ['bearer token', 'Bearer secret-value'],
    ['raw IP', '203.0.113.7'],
    ['prompt', 'prompt: private instruction'],
    ['chat text', 'journal: private thought'],
    ['Supabase secret key', 'sb_secret_forbidden_value'],
  ])('rejects sensitive %s in receipt values', (_label, sensitiveValue) => {
    expect(() => createStagingAcceptanceReceipt({ ...validReceipt, cleanup: { note: sensitiveValue } })).toThrow(/redacted receipt/i);
  });

  it('rejects a non-zero provider invocation or a changed Memory Gateway at runtime', () => {
    expect(() =>
      createStagingAcceptanceReceipt({ ...validReceipt, provider_invocations: 1 as 0 }),
    ).toThrow(/provider_invocations=0/);
    expect(() =>
      createStagingAcceptanceReceipt({ ...validReceipt, memory_gateway_changed: true as false }),
    ).toThrow(/memory_gateway_changed=false/);
  });

  it('rejects invalid or reversed timestamps', () => {
    expect(() =>
      createStagingAcceptanceReceipt({
        ...validReceipt,
        started_at: '2026-07-18T00:02:00.000Z',
        completed_at: '2026-07-18T00:01:00.000Z',
      }),
    ).toThrow(/timestamps/);
  });

  it('rejects a production staging ref, invalid source hash, or incomplete cleanup', () => {
    expect(() =>
      createStagingAcceptanceReceipt({
        ...validReceipt,
        staging_ref_and_branch_id: { id: 'branch-id', ref: validReceipt.production_ref },
      }),
    ).toThrow(/production project as staging/);
    expect(() => createStagingAcceptanceReceipt({ ...validReceipt, source_merge_sha: 'not-a-sha' })).toThrow(
      /source_merge_sha/,
    );
    expect(() => createStagingAcceptanceReceipt({ ...validReceipt, cleanup: { completed: false } })).toThrow(
      /cleanup/,
    );
  });
});
