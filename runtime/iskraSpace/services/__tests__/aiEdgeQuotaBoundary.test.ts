import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const thisFile = fileURLToPath(import.meta.url);
const runtimeRoot = join(dirname(thisFile), '../..');
const sharedBoundaryPath = join(runtimeRoot, 'supabase/functions/_shared/aiBoundary.ts');
const migrationPath = join(
  runtimeRoot,
  '../../supabase/migrations/20260710100000_ai_edge_quota_boundary.sql',
);
const geminiPath = join(runtimeRoot, 'supabase/functions/gemini/index.ts');
const iskraAgentPath = join(runtimeRoot, 'supabase/functions/iskra-agent/index.ts');

const readOrEmpty = (path: string) => existsSync(path) ? readFileSync(path, 'utf8') : '';

describe('AI Edge closed-beta quota contract', () => {
  it('provides a shared boundary that fails closed and hashes client IPs before RPC use', () => {
    const sharedBoundary = readOrEmpty(sharedBoundaryPath);

    expect(existsSync(sharedBoundaryPath)).toBe(true);
    expect(sharedBoundary).toContain('export async function enforceAiRequestBoundary');
    expect(sharedBoundary).toContain('AI_RATE_LIMIT_IP_HMAC_SECRET');
    expect(sharedBoundary).toContain('crypto.subtle.sign');
    expect(sharedBoundary).toContain("'HMAC'");
    expect(sharedBoundary).toContain('consume_ai_quota');
    expect(sharedBoundary).toContain("'unavailable'");
    expect(sharedBoundary).toContain('isAnonymous');
    expect(sharedBoundary).not.toContain('console.');
  });

  it('uses one atomic private quota store and a membership-guarded RPC for all quota windows', () => {
    const migration = readOrEmpty(migrationPath);

    expect(existsSync(migrationPath)).toBe(true);
    expect(migration).toContain('private.ai_rate_limit_windows');
    expect(migration).toContain('public.consume_ai_quota');
    expect(migration).toContain('private.is_active_beta_member()');
    expect(migration).toContain('pg_advisory_xact_lock');
    expect(migration).toContain("'member_minute'");
    expect(migration).toContain("'ip_minute'");
    expect(migration).toContain("'member_day'");
    expect(migration).toContain("p_ip_digest text");
    expect(migration).toContain("^[0-9a-f]{64}$");
    expect(migration).not.toContain('client_ip');
  });

  it('rejects anonymous users from the server response and does not expose upstream failures', () => {
    const gemini = readOrEmpty(geminiPath);
    const iskraAgent = readOrEmpty(iskraAgentPath);

    for (const edgeSource of [gemini, iskraAgent]) {
      expect(edgeSource).toContain('data.is_anonymous === true');
      expect(edgeSource).toContain('anonymousProvider');
      expect(edgeSource).not.toContain('JWT validation error');
    }

    expect(iskraAgent).toMatch(/try\s*\{\s*const agentResponse = await fetch\(/);
    expect(iskraAgent).toContain('agent_upstream_unavailable');
    expect(iskraAgent).not.toContain('risks: [raw]');
  });
});
