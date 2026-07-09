import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const edgeFunctionSource = readFileSync(
  join(__dirname, '../../supabase/functions/kain/index.ts'),
  'utf-8',
);

describe('kain Edge Function security boundary', () => {
  it('does not expose wildcard CORS by default', () => {
    expect(edgeFunctionSource).not.toContain("'access-control-allow-origin': '*'");
    expect(edgeFunctionSource).toContain('KAIN_ALLOWED_ORIGINS');
    expect(edgeFunctionSource).toContain("if (trimmed === '*')");
  });

  it('requires origin, JWT and rate limit before running repair logic', () => {
    const originCheck = edgeFunctionSource.indexOf('if (!isOriginAllowed(origin))');
    const tokenCheck = edgeFunctionSource.indexOf('const token = extractBearerToken(req);');
    const jwtCheck = edgeFunctionSource.indexOf('const user = await validateJwt(token);');
    const rateLimitCheck = edgeFunctionSource.indexOf('const rateLimited = rateLimit(req, user.sub);');
    const repairCall = edgeFunctionSource.indexOf('checkRepair(metrics);');

    expect(originCheck).toBeGreaterThan(-1);
    expect(tokenCheck).toBeGreaterThan(originCheck);
    expect(jwtCheck).toBeGreaterThan(tokenCheck);
    expect(rateLimitCheck).toBeGreaterThan(jwtCheck);
    expect(repairCall).toBeGreaterThan(rateLimitCheck);
  });
});
