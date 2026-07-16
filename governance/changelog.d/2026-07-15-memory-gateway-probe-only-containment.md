# Memory Gateway probe-only containment

- Accepted ADR-20260715-01 for temporary 1A.1 containment.
- Replaced the monolithic Edge Function with a thin Deno adapter and an importable
  production handler.
- Removed PostgreSQL capability from the production probe-only composition.
- Added exact `auth/whoami` routing and fail-closed `503` responses for all former
  privileged routes.
- Added real HS256 JWT behavioral tests, strict issuer/audience checks when configured,
  frozen pnpm verification, and Deno check/bundle gates.
- Supabase v4 is `ACTIVE` with `verify_jwt=true`; management-plane source read-back
  confirmed the probe-only composition.
- Normalized configured CORS origins and trimmed captured Bearer tokens during review;
  these two fixes are newer than live v4 and still need a post-merge deployment/read-back.
- The real Projects credential probe remains pending; no credential class is claimed.
