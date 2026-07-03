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
    expect(edgeFunctionSource).toContain("if (trimmed === '*')");
  });

  it('keeps auth and rate limiting before AI provider calls', () => {
    const tokenCheck = edgeFunctionSource.indexOf('const token = extractBearerToken(req);');
    const jwtCheck = edgeFunctionSource.indexOf('const jwt = await validateJwt(token);');
    const rateLimitCheck = edgeFunctionSource.indexOf('const rl = rateLimit(req, jwt.sub);');
    const providerCall = edgeFunctionSource.indexOf('await runWithFallback(action, payload)');

    expect(tokenCheck).toBeGreaterThan(-1);
    expect(jwtCheck).toBeGreaterThan(tokenCheck);
    expect(rateLimitCheck).toBeGreaterThan(jwtCheck);
    expect(providerCall).toBeGreaterThan(rateLimitCheck);
  });
});
