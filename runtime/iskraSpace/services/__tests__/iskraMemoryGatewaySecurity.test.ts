import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const edgeFunctionSource = readFileSync(
  join(__dirname, '../../../../supabase/functions/iskra-memory-gateway/index.ts'),
  'utf-8',
);

describe('iskra-memory-gateway Edge Function security boundary', () => {
  it('verifies the JWT signature independently of the platform verify_jwt switch', () => {
    // The insecure prior implementation trusted an unverified base64-decoded payload.
    expect(edgeFunctionSource).not.toContain('function decodeJwtPayload');
    expect(edgeFunctionSource).toContain("jsr:@panva/jose");
    expect(edgeFunctionSource).toContain('jwtVerify(token, JWT_SECRET_KEY');
    expect(edgeFunctionSource).toContain('algorithms: ["HS256"]');
  });

  it('never derives actor from the request body (only from verified JWT claims)', () => {
    // The insecure prior implementation trusted `body.actor` outright.
    expect(edgeFunctionSource).not.toContain('function asActor');
    expect(edgeFunctionSource).not.toMatch(/body\.actor/);
  });

  it('verifies identity before parsing the body or dispatching to any route handler', () => {
    const verifyCall = edgeFunctionSource.indexOf('actor = await verifyActor(');
    const bodyParse = edgeFunctionSource.indexOf('const body = await req.json()');
    const routeDispatch = edgeFunctionSource.indexOf('const handler = routes[route]');

    expect(verifyCall).toBeGreaterThan(-1);
    expect(bodyParse).toBeGreaterThan(verifyCall);
    expect(routeDispatch).toBeGreaterThan(bodyParse);
  });

  it('maps auth failures to 401, not the generic 500 handler', () => {
    expect(edgeFunctionSource).toMatch(/return json\(req, \{ ok: false, error: message \}, 401\);/);
  });

  it('[HYP] role is not yet gated to service_role — documented follow-up, not silently forgotten', () => {
    // Intentionally permissive until the real ChatGPT Projects connector's
    // Authorization value is confirmed. This test pins the documented reason
    // so removing the gate doesn't silently become "nobody remembers why".
    expect(edgeFunctionSource).toContain('[HYP] Role scope is intentionally NOT restricted to service_role yet');
    expect(edgeFunctionSource).not.toContain('REQUIRED_ROLE');
  });
});
