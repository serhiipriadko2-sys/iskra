import { createHash } from 'node:crypto';
import { PRODUCTION_PROJECT_REF } from './stagingAcceptanceConfig';

type JsonValue = boolean | number | string | JsonObject | JsonValue[];
interface JsonObject { [key: string]: JsonValue; }

export interface StagingAcceptanceReceiptInput {
  source_pr: number;
  source_merge_sha: string;
  production_ref: string;
  production_migration_count: number;
  staging_ref_and_branch_id: { ref: string; id: string };
  staging_migrations_before_and_after: { before: number; after: number };
  function_source_hashes: Record<string, string>;
  auth_config_before_and_after: { before: string; after: string };
  test_matrix: Record<string, string>;
  advisor_counts_by_class_before_and_after: {
    before: { security: Record<string, number>; performance: Record<string, number> };
    after: { security: Record<string, number>; performance: Record<string, number> };
  };
  provider_invocations: 0;
  memory_gateway_changed: false;
  cleanup: JsonObject;
  started_at: string;
  completed_at: string;
}

export interface StagingAcceptanceReceipt extends StagingAcceptanceReceiptInput {
  schema_version: 1;
  scope: 'staging_only';
  sha256: string;
}

const sensitiveKey = /email|jwt|bearer|service[ _-]?role|secret[ _-]?key|raw[ _-]?ip|prompt|response|journal|chat(?:[ _-]?text)?/i;
const sensitiveValue = /(?:\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b|\bBearer\s+\S+|\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b|\bsb_(?:secret|publishable)_[A-Za-z0-9_-]+\b|\b(?:\d{1,3}\.){3}\d{1,3}\b|\b(?:prompt|response|journal|chat)\s*:|\b(?:service[ _-]?role|secret[ _-]?key)\s*[:=])/i;

function assertRedacted(value: JsonValue, path = 'receipt'): void {
  if (typeof value === 'string') {
    if (sensitiveValue.test(value)) throw new Error(`Redacted receipt rejected sensitive value at ${path}`);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((entry, index) => assertRedacted(entry, `${path}[${index}]`));
    return;
  }
  if (typeof value === 'object' && value !== null) {
    for (const [key, child] of Object.entries(value)) {
      if (sensitiveKey.test(key)) throw new Error(`Redacted receipt rejected sensitive key at ${path}.${key}`);
      assertRedacted(child, `${path}.${key}`);
    }
  }
}

function sortJson(value: JsonValue): JsonValue {
  if (Array.isArray(value)) return value.map(sortJson);
  if (typeof value === 'object' && value !== null) {
    return Object.fromEntries(Object.keys(value).sort().map(key => [key, sortJson(value[key]!)]));
  }
  return value;
}

export function canonicalizeStagingAcceptanceReceipt(receipt: StagingAcceptanceReceipt): string {
  const { sha256: _sha256, ...withoutHash } = receipt;
  return JSON.stringify(sortJson(withoutHash));
}

export function createStagingAcceptanceReceipt(input: StagingAcceptanceReceiptInput): StagingAcceptanceReceipt {
  assertRedacted(input as unknown as JsonObject);
  if (!Number.isInteger(input.source_pr) || input.source_pr <= 0) {
    throw new Error('Staging receipt requires a positive source_pr');
  }
  if (!/^[a-f0-9]{40}$/.test(input.source_merge_sha)) {
    throw new Error('Staging receipt requires an exact lowercase source_merge_sha');
  }
  if (input.production_ref !== PRODUCTION_PROJECT_REF) {
    throw new Error('Staging receipt production_ref does not match the canonical production project');
  }
  if (input.staging_ref_and_branch_id.ref === input.production_ref) {
    throw new Error('Staging receipt cannot use the production project as staging');
  }
  if (!Number.isInteger(input.production_migration_count) || input.production_migration_count < 0) {
    throw new Error('Staging receipt requires a non-negative production_migration_count');
  }
  for (const [name, hash] of Object.entries(input.function_source_hashes)) {
    if (!name || !/^[a-f0-9]{64}$/.test(hash)) {
      throw new Error('Staging receipt function_source_hashes must contain lowercase SHA-256 values');
    }
  }
  if (input.provider_invocations !== 0) throw new Error('Staging receipt requires provider_invocations=0');
  if (input.memory_gateway_changed !== false) throw new Error('Staging receipt requires memory_gateway_changed=false');
  if (input.cleanup.completed !== true) throw new Error('Staging receipt requires confirmed cleanup');
  const startedAt = Date.parse(input.started_at);
  const completedAt = Date.parse(input.completed_at);
  if (!Number.isFinite(startedAt) || !Number.isFinite(completedAt) || completedAt < startedAt) {
    throw new Error('Staging receipt timestamps must be valid and ordered');
  }
  const receipt: Omit<StagingAcceptanceReceipt, 'sha256'> = {
    schema_version: 1,
    scope: 'staging_only',
    ...input,
  };
  const canonical = JSON.stringify(sortJson(receipt));
  return {
    ...receipt,
    sha256: createHash('sha256').update(canonical).digest('hex'),
  };
}
