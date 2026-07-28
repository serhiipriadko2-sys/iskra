import {
  buildCorsHeaders,
  enforceAiRequestBoundary,
  isAllowedOrigin,
  parseVerifiedAiUser,
  type AiBoundaryConfig,
} from './aiBoundary.ts';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const config: AiBoundaryConfig = {
  supabaseUrl: 'https://abcdefghijklmnopqrst.supabase.co',
  supabaseApiKey: 'sb_publishable_test_public_only',
  allowedOrigins: 'https://beta.example.com',
  environment: 'production',
  allowDevelopmentWildcard: false,
  ipHmacSecret: 'test-only-hmac-secret',
  canonicalIngressHeader: 'cf-connecting-ip',
};

const member = { sub: 'member-1', isAnonymous: false };

function requestWithIp(): Request {
  return new Request('https://edge.example/functions/v1/gemini', {
    method: 'POST',
    headers: { 'cf-connecting-ip': '203.0.113.10' },
  });
}

Deno.test('auth payload parser returns a permanent user with a boolean boundary', () => {
  const user = parseVerifiedAiUser({
    id: 'member-1',
    is_anonymous: false,
    app_metadata: { provider: 'email' },
  });

  assert(user?.sub === 'member-1', 'expected member id');
  assert(user.isAnonymous === false, 'expected permanent member');
});

Deno.test('auth payload parser rejects both anonymous markers', () => {
  const flagUser = parseVerifiedAiUser({ id: 'anon-1', is_anonymous: true });
  const providerUser = parseVerifiedAiUser({
    id: 'anon-2',
    app_metadata: { provider: 'anonymous' },
  });

  assert(flagUser?.isAnonymous === true, 'expected is_anonymous marker');
  assert(providerUser?.isAnonymous === true, 'expected provider marker');
});

Deno.test('auth payload parser rejects malformed payloads', () => {
  assert(parseVerifiedAiUser(null) === null, 'expected null denial');
  assert(parseVerifiedAiUser({ id: 42 }) === null, 'expected non-string id denial');
  assert(parseVerifiedAiUser({}) === null, 'expected missing id denial');
});

Deno.test('CORS is exact-origin and production wildcard fails closed', () => {
  assert(isAllowedOrigin('https://beta.example.com', config), 'expected configured origin');
  assert(!isAllowedOrigin('https://evil.example.com', config), 'expected foreign origin denial');
  assert(!isAllowedOrigin(null, config), 'expected missing origin denial');
  assert(
    !isAllowedOrigin('https://anything.example', {
      ...config,
      allowedOrigins: '*',
      allowDevelopmentWildcard: true,
    }),
    'expected production wildcard denial'
  );
  assert(
    isAllowedOrigin('https://anything.example', {
      ...config,
      allowedOrigins: '*',
      environment: 'test',
      allowDevelopmentWildcard: true,
    }),
    'expected explicit test-only wildcard'
  );

  const deniedHeaders = buildCorsHeaders('https://evil.example.com', config);
  assert(!('access-control-allow-origin' in deniedHeaders), 'denied origin must not receive ACAO');
});

Deno.test('anonymous and unidentified clients are denied before quota RPC', async () => {
  const anonymous = await enforceAiRequestBoundary(
    requestWithIp(),
    'token',
    { sub: 'anon-1', isAnonymous: true },
    config
  );
  assert(!anonymous.allowed && anonymous.status === 401, 'expected anonymous 401');

  const missingIp = await enforceAiRequestBoundary(
    new Request('https://edge.example/functions/v1/gemini', { method: 'POST' }),
    'token',
    member,
    config
  );
  assert(!missingIp.allowed && missingIp.status === 503, 'expected missing IP fail-closed');
});

Deno.test('only the configured ingress identity header is trusted', async () => {
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = () => Promise.resolve(Response.json({ allowed: true }));

    const configured = await enforceAiRequestBoundary(requestWithIp(), 'token', member, config);
    assert(configured.allowed, 'expected configured canonical header');

    const unconfigured = await enforceAiRequestBoundary(
      new Request('https://edge.example/functions/v1/gemini', {
        method: 'POST',
        headers: { 'forwarded-client-ip': '203.0.113.10' },
      }),
      'token',
      member,
      config,
    );
    assert(!unconfigured.allowed && unconfigured.status === 503, 'expected unconfigured header denial');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

Deno.test('quota and membership responses map to stable public status codes', async () => {
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = () =>
      Promise.resolve(Response.json({ allowed: false, reason: 'member_minute' }));
    const limited = await enforceAiRequestBoundary(requestWithIp(), 'token', member, config);
    assert(!limited.allowed && limited.status === 429, 'expected quota 429');
    assert(limited.error === 'rate_limit_exceeded', 'expected stable quota code');

    globalThis.fetch = () => Promise.resolve(new Response(null, { status: 401 }));
    const expired = await enforceAiRequestBoundary(requestWithIp(), 'token', member, config);
    assert(!expired.allowed && expired.status === 401, 'expected expired token 401');

    globalThis.fetch = () => Promise.resolve(new Response(null, { status: 403 }));
    const inactive = await enforceAiRequestBoundary(requestWithIp(), 'token', member, config);
    assert(!inactive.allowed && inactive.status === 403, 'expected inactive member 403');

    globalThis.fetch = () => Promise.reject(new Error('network unavailable'));
    const unavailable = await enforceAiRequestBoundary(requestWithIp(), 'token', member, config);
    assert(!unavailable.allowed && unavailable.status === 503, 'expected RPC failure 503');
  } finally {
    globalThis.fetch = originalFetch;
  }
});
