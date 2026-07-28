import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const thisFile = fileURLToPath(import.meta.url);
const runtimeRoot = join(dirname(thisFile), '../..');
const contentPolicyPath = join(runtimeRoot, 'supabase/functions/_shared/aiContentPolicy.ts');
const boundaryPath = join(runtimeRoot, 'supabase/functions/_shared/aiBoundary.ts');
const geminiPath = join(runtimeRoot, 'supabase/functions/gemini/index.ts');
const agentPath = join(runtimeRoot, 'supabase/functions/iskra-agent/index.ts');
const denoPolicyTestPath = join(runtimeRoot, 'supabase/functions/_shared/aiContentPolicy_test.ts');

const readOrEmpty = (path: string) => existsSync(path) ? readFileSync(path, 'utf8') : '';

describe('AI Edge hardening contract', () => {
  it('has one server-only content policy that rejects direct PII, injection and danger before quota', () => {
    const contentPolicy = readOrEmpty(contentPolicyPath);
    const gemini = readOrEmpty(geminiPath);
    const agent = readOrEmpty(agentPath);

    expect(existsSync(contentPolicyPath)).toBe(true);
    expect(contentPolicy).toContain('export function validateGeminiRequest');
    expect(contentPolicy).toContain('export function validateAgentRequest');
    expect(contentPolicy).toContain("'server_redact'");
    expect(contentPolicy).toContain('content_policy_pii_detected');
    expect(contentPolicy).toContain('content_policy_injection_detected');
    expect(contentPolicy).toContain('content_policy_danger_detected');
    expect(contentPolicy).toContain('recheck');
    expect(contentPolicy).not.toContain('console.');

    for (const edgeSource of [gemini, agent]) {
      const policyCheck = edgeSource.indexOf('validate');
      const quotaCheck = edgeSource.indexOf('const boundary = await enforceAiRequestBoundary(');
      expect(edgeSource).toContain("from '../_shared/aiContentPolicy.ts'");
      expect(policyCheck).toBeGreaterThan(-1);
      expect(quotaCheck).toBeGreaterThan(policyCheck);
    }
  });

  it('bounds body, text, parts, models, output and provider lifetime from server-owned constants', () => {
    const contentPolicy = readOrEmpty(contentPolicyPath);
    const gemini = readOrEmpty(geminiPath);

    expect(contentPolicy).toContain('MAX_AI_REQUEST_BYTES');
    expect(contentPolicy).toContain('MAX_AI_TEXT_CHARACTERS');
    expect(contentPolicy).toContain('MAX_AI_PARTS');
    expect(contentPolicy).toContain('MAX_AI_OUTPUT_TOKENS');
    expect(contentPolicy).toContain('readBoundedJsonBody');
    expect(contentPolicy).toContain('unsupported_model');
    expect(gemini).toContain('CANONICAL_GEMINI_TEXT_MODEL');
    expect(gemini).toContain('MAX_AI_PROVIDER_TIMEOUT_MS');
    expect(gemini).toContain('MAX_AI_STREAM_DURATION_MS');
    expect(contentPolicy).toContain('AbortController');
    expect(gemini).toContain('abortSignal');
    expect(gemini).not.toContain('AI_FALLBACK_PROVIDER');
    expect(gemini).not.toContain('https://api.openai.com');
  });

  it('requires a configured canonical ingress header instead of accepting generic forwarding headers', () => {
    const boundary = readOrEmpty(boundaryPath);

    expect(boundary).toContain('AI_EDGE_INGRESS_IP_HEADER');
    expect(boundary).toContain('canonicalIngressHeader');
    expect(boundary).not.toContain('x-forwarded-for');
    expect(boundary).not.toContain('x-real-ip');
  });

  it('disables dev/test real providers and constrains the Workspace Agent bearer destination', () => {
    const gemini = readOrEmpty(geminiPath);
    const agent = readOrEmpty(agentPath);

    expect(gemini).toContain('AI_EDGE_TEST_MODE');
    expect(gemini).toContain('provider_upstream_disabled');
    expect(agent).toContain('AI_EDGE_TEST_MODE');
    expect(agent).toContain('CANONICAL_WORKSPACE_AGENT_ORIGIN');
    expect(agent).toContain('new URL');
    expect(agent).toContain('agent_target_not_allowed');
  });

  it('keeps a Deno-executable policy suite beside the Deno source', () => {
    const denoPolicyTest = readOrEmpty(denoPolicyTestPath);

    expect(existsSync(denoPolicyTestPath)).toBe(true);
    expect(denoPolicyTest).toContain('Deno.test');
    expect(denoPolicyTest).toContain('server_redact');
  });
});
