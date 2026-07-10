# [P0-BLOCKER] CORS `*` on AI Proxy Edge Functions — Open to Abuse

## Status: ✅ RESOLVED for `gemini`, `kain`, `iskra-agent` — 2026-07-09

Resolution:
- `gemini` Edge Function was already hardened with origin allow-list, JWT validation, and rate limiting.
- `kain` Edge Function hardened: `KAIN_ALLOWED_ORIGINS`, Supabase JWT validation via `/auth/v1/user`, per-user/IP rate limiting.
- `iskra-agent` Edge Function hardened: `ISKRA_AGENT_ALLOWED_ORIGINS`, full Supabase JWT validation (replaced payload-only decode), per-user/IP rate limiting.
- Security tests added: `services/__tests__/kainEdgeFunctionSecurity.test.ts`, `services/__tests__/iskraAgentEdgeFunctionSecurity.test.ts`.
- Environment variables documented in `.env.example`.
- Local gates: typecheck, lint, test:run, build — pass.

## Original report (retained for context)

## Problem
The Supabase Edge Function `supabase/functions/gemini/index.ts` sets `Access-Control-Allow-Origin: *`, allowing any origin to call the AI proxy. This function forwards requests to Google Gemini/OpenAI using the project's API keys.

## Evidence

**`supabase/functions/gemini/index.ts:23-27`:**
```typescript
const headers = new Headers();
headers.set('Access-Control-Allow-Origin', '*'); // ← ANY ORIGIN
headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
```

**`supabase/functions/kain/index.ts:15-19`:** Same pattern.

## Impact
- **Financial:** Any malicious website can make POST requests to the Edge Function, consuming Gemini/OpenAI API quota and generating costs
- **DoS:** Rate limits can be exhausted by third-party sites, denying service to legitimate users
- **Data leakage:** The function doesn't validate that the request comes from the IskraSpace app; an attacker could use it as a free AI proxy
- **No rate limiting:** There is no IP-based or user-based rate limiting on the Edge Function

## Fix

Replace `*` with the app origin:

```typescript
const APP_ORIGIN = Deno.env.get('VITE_APP_URL') || 'https://iskra.app';
headers.set('Access-Control-Allow-Origin', APP_ORIGIN);
```

Also add a preflight validation:
```typescript
if (req.method === 'OPTIONS') {
  return new Response(null, { status: 204, headers });
}
const origin = req.headers.get('Origin') || req.headers.get('Referer') || '';
if (!origin.startsWith(APP_ORIGIN)) {
  return new Response('Unauthorized origin', { status: 403 });
}
```

And add rate limiting (e.g., Supabase KV or Redis):
```typescript
// Pseudo-code for rate limiting
const clientIP = req.headers.get('x-forwarded-for') || 'unknown';
const rateKey = `rate_limit:${clientIP}`;
const current = await kv.get(rateKey);
if (current.count > 10) { // 10 requests per minute
  return new Response('Rate limit exceeded', { status: 429 });
}
```

## ∆DΩΛ
∆: CORS wildcard allows any origin to abuse AI proxy
D: `supabase/functions/gemini/index.ts:24`, `supabase/functions/kain/index.ts:15`
Ω: 98%
Λ: Whitelist origin + add rate limiting + add preflight validation
