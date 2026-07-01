# Iskra Space Production Readiness Receipt — 2026-07-01

## Context

Target: `runtime/iskraSpace` web/PWA release hardening.

Branch: `codex/iskraspace-production-ready`.

Baseline commit at audit start: `2067452527647a7ecfb6c26b2ebed98e3cb5fc12`.

Package manager decision: `pnpm` is canonical for the workspace; stale `runtime/iskraSpace/package-lock.json` is removed.

## Finding / Decision

- Iskra Space is not yet marked production-ready.
- Reproducibility blocker from stale npm lockfile is closed by the pnpm-only path.
- Chat and Council now route through the Supabase Edge AI gateway wrapper.
- Browser Gemini Live is release-disabled until a server-side streaming gateway exists.
- Offline sync reads `iskra_device_id` only as legacy queue provenance; current writes use Supabase Auth session identity.

## Evidence

Local toolchain:

- `node -v`: `v22.19.0`
- `pnpm -v`: `10.32.1`
- `npm -v`: `10.9.3`

Local gates:

- `pnpm install --frozen-lockfile --ignore-scripts`: passed.
- `pnpm --dir runtime/iskraSpace typecheck`: passed.
- `pnpm --dir runtime/iskraSpace test:run`: 37 files passed, 1 skipped; 636 tests passed, 3 skipped.
- `pnpm --dir runtime/iskraSpace build`: passed.
- `pnpm --dir runtime/iskraSpace lint`: 0 errors, 85 warnings.
- `pnpm --dir runtime/iskraSpace audit --json`: 0 vulnerabilities.

Build snapshot:

- `dist/index.html`: 9.61 KB, gzip 3.47 KB.
- `vendor-react`: 193.83 KB, gzip 60.55 KB.
- `vendor-supabase`: 174.16 KB, gzip 45.90 KB.
- `index`: 131.29 KB, gzip 44.77 KB.
- No `vendor-genai` client bundle chunk was emitted.

Supabase read-only inventory for `typcvaszcfdpkzbjzuur`:

- `gemini`: version 6, `ACTIVE`, `verify_jwt=true`, `ezbr_sha256=dd4e59854c0105190c26d8c06bbdb5bdb6143f011d58d34e9626b50dcaa8309f`.
- `db-proxy`: version 4, `ACTIVE`, `verify_jwt=true`, `ezbr_sha256=2ed149d888aeec434883f5888b0e9b6fd1b714beccafde5581091a9783402a92`.
- `iskra-canon-import-1536`: version 5, `ACTIVE`, `verify_jwt=true`, `ezbr_sha256=5451e65fc018de30395c8479af7014151973d6807da2dbc56ec9b53e55f4c36e`.
- `iskra-canon-backfill-1536`: version 5, `ACTIVE`, `verify_jwt=true`, `ezbr_sha256=ac1e79e91e13ffcabab71c7981ba333053d6f64da77bb3f2bda5dc606dce9c8d`.

Supabase advisor summary:

- Security warnings remain for extension placement, GraphQL authenticated table exposure, and authenticated callable `SECURITY DEFINER` graph RPCs.
- Performance warnings remain for RLS initplan patterns, multiple permissive graph policies, and unused indexes.

## Risk

- Full Playwright browser matrix still needs a current post-change run after browser installation.
- `gemini` Edge function uses CORS `*`; public release needs explicit acceptance or origin restriction.
- `db-proxy` and canon import/backfill functions need keep/retire/owner decision.
- Supabase advisor warnings are not fixed in this branch because live DDL requires explicit approval.

## Next

1. Run full Playwright matrix after browser binaries are installed.
2. Make an explicit owner decision for `db-proxy`, `iskra-canon-import-1536`, and `iskra-canon-backfill-1536`.
3. Prepare a migration-only Supabase advisor remediation PR for GraphQL exposure/RPC grants/RLS performance.
4. Implement server-side streaming voice gateway before re-enabling `LiveConversation`.

## Status

Pre-release hardening in progress. Local runtime gates are green; live Supabase mutations were not performed.

## ∆DΩΛ

∆: Reproducibility and AI boundary blockers were reduced; production status remains blocked by E2E matrix and live Supabase governance.

D: Local command outputs, code changes, and read-only Supabase inventory/advisors.

Ω: 0.88.

Λ: Complete E2E matrix and prepare explicit Supabase owner/remediation decisions.
