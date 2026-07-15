import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const edgeFunctionSource = readFileSync(
  join(__dirname, '../../supabase/functions/iskra-agent/index.ts'),
  'utf-8',
);

describe('iskra-agent Edge Function security boundary', () => {
  it('does not expose wildcard CORS by default', () => {
    expect(edgeFunctionSource).not.toContain("'access-control-allow-origin': '*'");
    expect(edgeFunctionSource).not.toContain('"access-control-allow-origin": "*"');
    expect(edgeFunctionSource).toContain('ISKRA_AGENT_ALLOWED_ORIGINS');
    expect(edgeFunctionSource).toContain('AI_EDGE_ALLOW_DEV_WILDCARD');
    expect(edgeFunctionSource).toContain('AI_EDGE_ENV');
  });

  it('verifies the JWT signature via the Supabase auth endpoint (no raw base64 decode)', () => {
    // The insecure prior implementation trusted an unverified base64-decoded `sub`.
    expect(edgeFunctionSource).toContain('/auth/v1/user');
    expect(edgeFunctionSource).not.toContain('function readUserId');
  });

  it('requires origin, JWT and shared closed-beta quota before calling the billed upstream agent API', () => {
    const originCheck = edgeFunctionSource.indexOf('if (!isOriginAllowed(origin))');
    const tokenCheck = edgeFunctionSource.indexOf('const token = extractBearerToken(req);');
    const jwtCheck = edgeFunctionSource.indexOf('const jwt = await validateJwt(token);');
    const quotaCheck = edgeFunctionSource.indexOf('const boundary = await enforceAiRequestBoundary(');
    const upstreamCall = edgeFunctionSource.indexOf('const agentResponse = await fetch(');

    expect(originCheck).toBeGreaterThan(-1);
    expect(tokenCheck).toBeGreaterThan(originCheck);
    expect(jwtCheck).toBeGreaterThan(tokenCheck);
    expect(quotaCheck).toBeGreaterThan(jwtCheck);
    expect(upstreamCall).toBeGreaterThan(quotaCheck);
    expect(edgeFunctionSource).toContain("from '../_shared/aiBoundary.ts'");
    expect(edgeFunctionSource).not.toContain('rlBuckets');
    expect(edgeFunctionSource).not.toContain('console.');
  });
});
