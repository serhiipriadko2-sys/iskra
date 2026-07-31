import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  MAX_AI_AUTH_QUOTA_TIMEOUT_MS,
  MAX_AI_PROVIDER_TIMEOUT_MS,
  MAX_AI_REQUEST_DURATION_MS,
  MAX_AI_STREAM_DURATION_MS,
  createDeadline,
} from '../../supabase/functions/_shared/aiContentPolicy.ts';

const here = dirname(fileURLToPath(import.meta.url));
const geminiSource = readFileSync(
  join(here, '../../supabase/functions/gemini/index.ts'),
  'utf8',
);
const agentSource = readFileSync(
  join(here, '../../supabase/functions/iskra-agent/index.ts'),
  'utf8',
);
const boundarySource = readFileSync(
  join(here, '../../supabase/functions/_shared/aiBoundary.ts'),
  'utf8',
);

afterEach(() => vi.useRealTimers());
describe('AI request deadline boundary', () => {
  it('keeps auth quota and provider budgets inside one request deadline', () => {
    expect(MAX_AI_AUTH_QUOTA_TIMEOUT_MS).toBe(8_000);
    expect(MAX_AI_PROVIDER_TIMEOUT_MS).toBe(20_000);
    expect(MAX_AI_STREAM_DURATION_MS).toBe(25_000);
    expect(MAX_AI_REQUEST_DURATION_MS).toBe(35_000);
    expect(MAX_AI_AUTH_QUOTA_TIMEOUT_MS).toBeLessThan(MAX_AI_PROVIDER_TIMEOUT_MS);
    expect(MAX_AI_STREAM_DURATION_MS).toBeLessThan(MAX_AI_REQUEST_DURATION_MS);
  });

  it('propagates the outer request deadline to nested network budgets', async () => {
    vi.useFakeTimers();
    const request = createDeadline(undefined, 35);
    const authQuota = createDeadline(request.signal, 100);
    const provider = createDeadline(request.signal, 100);
    await vi.advanceTimersByTimeAsync(35);
    expect(request.signal.aborted).toBe(true);
    expect(authQuota.signal.aborted).toBe(true);
    expect(provider.signal.aborted).toBe(true);
    authQuota.dispose();
    provider.dispose();
    request.dispose();
  });
  it('wires auth quota provider and stream calls to deadline signals', () => {
    for (const source of [geminiSource, agentSource]) {
      expect(source).toContain(
        'createDeadline(req.signal, MAX_AI_REQUEST_DURATION_MS)',
      );
      expect(source).toContain('MAX_AI_AUTH_QUOTA_TIMEOUT_MS');
      expect(source).toContain(
        'fetchVerifiedAiUser(token, config, authQuotaDeadline.signal)',
      );
      expect(source).toContain('authQuotaDeadline.signal');
      expect(source).not.toContain('async function validateJwt');
    }
    expect(geminiSource).toContain('deadlineTransferredToStream');
    expect(geminiSource).toContain(
      'streamWithFallback(payload, controller, requestDeadline.signal)',
    );
    expect(agentSource).toContain('signal: providerDeadline.signal');
    expect(boundarySource).toContain(
      'export async function fetchVerifiedAiUser',
    );
    expect(boundarySource).toContain('body: JSON.stringify({ p_ip_digest: ipDigest })');
    expect(boundarySource).toMatch(/p_ip_digest:[\s\S]+signal,/u);
  });
});
