import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const edgeFunctionSource = readFileSync(
  join(__dirname, '../../supabase/functions/gemini/index.ts'),
  'utf-8',
);

describe('gemini Edge Function security boundary', () => {
  it('does not expose wildcard CORS by default', () => {
    expect(edgeFunctionSource).not.toContain("'access-control-allow-origin': '*'");
    expect(edgeFunctionSource).toContain('AI_PROXY_ALLOWED_ORIGINS');
    expect(edgeFunctionSource).toContain('AI_EDGE_ALLOW_DEV_WILDCARD');
    expect(edgeFunctionSource).toContain('AI_EDGE_ENV');
  });

  it('keeps closed-beta auth and shared transactional quota before AI provider calls', () => {
    const tokenCheck = edgeFunctionSource.indexOf('const token = extractBearerToken(req);');
    const jwtCheck = edgeFunctionSource.indexOf('const jwt = await validateJwt(token);');
    const quotaCheck = edgeFunctionSource.indexOf('const boundary = await enforceAiRequestBoundary(');
    const payloadRead = edgeFunctionSource.indexOf('const parsedBody = await readBoundedJsonBody(req);');
    const providerCall = edgeFunctionSource.indexOf('await runWithFallback(action, payload)');

    expect(tokenCheck).toBeGreaterThan(-1);
    expect(jwtCheck).toBeGreaterThan(tokenCheck);
    expect(quotaCheck).toBeGreaterThan(jwtCheck);
    expect(payloadRead).toBeGreaterThan(quotaCheck);
    expect(providerCall).toBeGreaterThan(payloadRead);
    expect(edgeFunctionSource).toContain("from '../_shared/aiBoundary.ts'");
    expect(edgeFunctionSource).toContain("from '../_shared/aiContentPolicy.ts'");
    expect(edgeFunctionSource).not.toContain('req.json()');
    expect(edgeFunctionSource).not.toContain('rlBuckets');
    expect(edgeFunctionSource).not.toContain('console.');
  });
});
