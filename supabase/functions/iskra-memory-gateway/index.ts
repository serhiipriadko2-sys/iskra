import 'supabase-edge-runtime';

import {
  createGatewayHandler,
  createJwtCredentialVerifier,
} from './handler.ts';

const jwtSecretRaw = Deno.env.get('SUPABASE_JWT_SECRET') ?? '';
if (!jwtSecretRaw) {
  throw new Error('SUPABASE_JWT_SECRET is not configured');
}

const allowedOrigins = (
  Deno.env.get('ISKRA_GATEWAY_ALLOWED_ORIGINS') ?? 'https://chatgpt.com'
)
  .split(',')
  .map((item) => item.trim())
  .filter(Boolean);

const handler = createGatewayHandler({
  mode: 'probe_only',
  verifyCredential: createJwtCredentialVerifier({
    secret: new TextEncoder().encode(jwtSecretRaw),
    expectedIssuer: Deno.env.get('ISKRA_GATEWAY_EXPECTED_ISSUER') || undefined,
    expectedAudience:
      Deno.env.get('ISKRA_GATEWAY_EXPECTED_AUDIENCE') || undefined,
  }),
  allowedOrigins,
});

Deno.serve(handler);
