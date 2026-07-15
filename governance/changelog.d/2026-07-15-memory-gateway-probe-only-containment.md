# Memory Gateway probe-only containment

- Accepted ADR-20260715-01 for temporary 1A.1 containment.
- Replaced the monolithic Edge Function with a thin Deno adapter and an importable
  production handler.
- Removed PostgreSQL capability from the production probe-only composition.
- Added exact `auth/whoami` routing and fail-closed `503` responses for all former
  privileged routes.
- Added real HS256 JWT behavioral tests, strict issuer/audience checks when configured,
  frozen pnpm verification, and Deno check/bundle gates.
- Deployment and the real Projects credential probe remain separate, approval-gated
  operations.
