// @vitest-environment node

import { SignJWT } from 'jose';
import { describe, expect, it, vi } from 'vitest';

import {
  createGatewayHandler,
  createJwtCredentialVerifier,
  resolveGatewayRoute,
  type CredentialClass,
  type PrivilegedRoute,
} from '../../../../supabase/functions/iskra-memory-gateway/handler.ts';

const SECRET = new TextEncoder().encode(
  'iskra-gateway-probe-only-test-secret-2026',
);
const WRONG_SECRET = new TextEncoder().encode(
  'iskra-gateway-probe-only-wrong-secret',
);
const EXPECTED_ISSUER = 'supabase';
const EXPECTED_AUDIENCE = 'chatgpt-projects';
const EXTERNAL_PREFIX =
  '/functions/v1/iskra-memory-gateway';
const INTERNAL_PREFIX = '/iskra-memory-gateway';

interface TokenOptions {
  role?: string;
  issuer?: string;
  audience?: string;
  secret?: Uint8Array;
  expiresIn?: string;
}

async function signToken(options: TokenOptions = {}): Promise<string> {
  return new SignJWT({ role: options.role ?? 'anon' })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuer(options.issuer ?? EXPECTED_ISSUER)
    .setAudience(options.audience ?? EXPECTED_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(options.expiresIn ?? '5m')
    .sign(options.secret ?? SECRET);
}

function createVerifier() {
  return createJwtCredentialVerifier({
    secret: SECRET,
    expectedIssuer: EXPECTED_ISSUER,
    expectedAudience: EXPECTED_AUDIENCE,
  });
}

function createProbeHandler() {
  return createGatewayHandler({
    mode: 'probe_only',
    verifyCredential: createVerifier(),
    allowedOrigins: ['https://chatgpt.com'],
  });
}

function requestFor(
  path: string,
  token?: string,
  method = 'POST',
): Request {
  const headers = new Headers({
    origin: 'https://chatgpt.com',
  });
  if (token) headers.set('authorization', `Bearer ${token}`);

  return new Request(`https://example.supabase.co${path}`, {
    method,
    headers,
    body: method === 'POST' ? JSON.stringify({ actor: 'client-forged' }) : undefined,
  });
}

async function readJson(response: Response): Promise<Record<string, unknown>> {
  return response.json() as Promise<Record<string, unknown>>;
}

const PRIVILEGED_ROUTES: readonly PrivilegedRoute[] = [
  'observe',
  'dry-run',
  'dark-run',
  'commit',
  'horizon/propose',
  'memory/write',
  'memory/search',
  'shadow/promote',
  'dream/crystallize',
];

describe('iskra-memory-gateway production-bound probe-only handler', () => {
  it.each([
    ['service_role', 'service_role'],
    ['anon', 'anon'],
    ['authenticated', 'authenticated'],
    ['custom_role', 'other'],
  ] as const)(
    'returns only the normalized class for %s',
    async (role, expectedClass) => {
      const token = await signToken({ role });
      const response = await createProbeHandler()(
        requestFor(`${EXTERNAL_PREFIX}/auth/whoami`, token),
      );
      const body = await readJson(response);

      expect(response.status).toBe(200);
      expect(body.credential_class).toBe(expectedClass as CredentialClass);
      expect(Object.keys(body).sort()).toEqual([
        'credential_class',
        'mode',
        'ok',
        'service',
      ]);
      expect(JSON.stringify(body)).not.toMatch(
        /token|secret|sub|ref|iss|aud|jti/i,
      );
    },
  );

  it('accepts the exact runtime-prefixed canonical route', async () => {
    const token = await signToken();
    const response = await createProbeHandler()(
      requestFor(`${INTERNAL_PREFIX}/auth/whoami`, token),
    );

    expect(response.status).toBe(200);
  });

  it.each([
    '/auth/whoami',
    '/whoami',
    '/x/whoami',
    `${EXTERNAL_PREFIX}/x/whoami`,
    `${EXTERNAL_PREFIX}/auth/whoami/`,
    `${EXTERNAL_PREFIX}/auth/whoami/extra`,
  ])('rejects non-canonical probe path %s', async (path) => {
    const token = await signToken();
    const response = await createProbeHandler()(requestFor(path, token));

    expect(response.status).toBe(404);
    expect((await readJson(response)).error).toBe('route_not_found');
  });

  it('requires authentication even for unknown POST routes', async () => {
    const response = await createProbeHandler()(
      requestFor(`${EXTERNAL_PREFIX}/unknown`),
    );

    expect(response.status).toBe(401);
  });

  it('rejects a token signed with another secret', async () => {
    const token = await signToken({ secret: WRONG_SECRET });
    const response = await createProbeHandler()(
      requestFor(`${EXTERNAL_PREFIX}/auth/whoami`, token),
    );

    expect(response.status).toBe(401);
  });

  it('rejects the wrong issuer when an issuer contract is configured', async () => {
    const token = await signToken({ issuer: 'not-supabase' });
    const response = await createProbeHandler()(
      requestFor(`${EXTERNAL_PREFIX}/auth/whoami`, token),
    );

    expect(response.status).toBe(401);
  });

  it('rejects the wrong audience when an audience contract is configured', async () => {
    const token = await signToken({ audience: 'wrong-audience' });
    const response = await createProbeHandler()(
      requestFor(`${EXTERNAL_PREFIX}/auth/whoami`, token),
    );

    expect(response.status).toBe(401);
  });

  it('rejects expired credentials', async () => {
    const token = await signToken({ expiresIn: '-1s' });
    const response = await createProbeHandler()(
      requestFor(`${EXTERNAL_PREFIX}/auth/whoami`, token),
    );

    expect(response.status).toBe(401);
  });

  it('returns 405 for non-POST methods without parsing credentials', async () => {
    const response = await createProbeHandler()(
      requestFor(`${EXTERNAL_PREFIX}/auth/whoami`, undefined, 'GET'),
    );

    expect(response.status).toBe(405);
  });

  it('returns a CORS preflight response without invoking auth', async () => {
    const verifier = vi.fn(createVerifier());
    const handler = createGatewayHandler({
      mode: 'probe_only',
      verifyCredential: verifier,
    });

    const response = await handler(
      requestFor(`${EXTERNAL_PREFIX}/auth/whoami`, undefined, 'OPTIONS'),
    );

    expect(response.status).toBe(204);
    expect(verifier).not.toHaveBeenCalled();
  });

  it('never invokes an injected privileged capability in probe-only mode', async () => {
    const token = await signToken({ role: 'service_role' });
    const privilegedCapability = vi.fn(async () =>
      new Response(JSON.stringify({ ok: true }), { status: 200 }),
    );
    const handler = createGatewayHandler({
      mode: 'probe_only',
      verifyCredential: createVerifier(),
      privilegedCapability,
    });

    for (const route of PRIVILEGED_ROUTES) {
      const response = await handler(
        requestFor(`${EXTERNAL_PREFIX}/${route}`, token),
      );
      expect(response.status).toBe(503);
      expect((await readJson(response)).error).toBe(
        'gateway_security_hold',
      );
    }

    expect(privilegedCapability).not.toHaveBeenCalled();
  });

  it('invokes the injected capability only in explicitly enabled mode', async () => {
    const token = await signToken({ role: 'service_role' });
    const privilegedCapability = vi.fn(async ({ route }) =>
      new Response(JSON.stringify({ ok: true, route }), { status: 200 }),
    );
    const handler = createGatewayHandler({
      mode: 'enabled',
      verifyCredential: createVerifier(),
      privilegedCapability,
    });

    const response = await handler(
      requestFor(`${EXTERNAL_PREFIX}/memory/search`, token),
    );

    expect(response.status).toBe(200);
    expect(privilegedCapability).toHaveBeenCalledTimes(1);
    expect(privilegedCapability.mock.calls[0]?.[0].route).toBe(
      'memory/search',
    );
  });

  it('keeps exact route matching deterministic', () => {
    expect(resolveGatewayRoute(`${EXTERNAL_PREFIX}/auth/whoami`)).toBe(
      'auth/whoami',
    );
    expect(resolveGatewayRoute(`${EXTERNAL_PREFIX}/memory/write`)).toBe(
      'memory/write',
    );
    expect(resolveGatewayRoute('/x/whoami')).toBeNull();
  });
});
