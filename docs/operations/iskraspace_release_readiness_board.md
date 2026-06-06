# Iskra Space Release Readiness Board

Status: working board  
Date: 2026-06-06  
Release target: `runtime/iskraSpace`

## Purpose

This board keeps the next work honest.

The question is not: "Is the whole repository perfect?"

The question is: "What must be true for `runtime/iskraSpace` to be safely released to the public?"

## Priority lanes

### P0: release blockers

These block release until verified or fixed.

- `runtime/iskraSpace` cannot install from a clean checkout.
- `runtime/iskraSpace` cannot build.
- Required environment variables are missing, undocumented, or unsafe.
- Supabase tables, functions, auth, storage, or RLS used by the app do not match the code.
- Gemini or other external API calls expose secrets, fail without clear handling, or rely on unsafe client-side keys.
- CORS/auth/rate-limit behavior blocks normal app use or opens public abuse risk.
- Ledger/SoT integrity blocks PR merge, release traceability, or trusted source verification.
- Public docs point users to internal-only flows instead of the app.

### P1: release-supporting work

Important, but not always a hard block.

- Import graph for `runtime/iskraSpace` and its real dependencies.
- Stale-file scan scoped by app impact.
- Supabase drift audit with explicit label: app-impacting or internal-only.
- Smoke test instructions for deployment.
- Small user-facing README improvements for the app.
- Clear release checklist.

### P2: internal contour

These support Semyon + Iskra but are not public product surface by default.

- Governance logs and ADR indexes.
- Memory and evidence indexes.
- Repair PR notes.
- Agent Builder instructions.
- Internal audit documents.
- Legacy experiments that are not imported by `runtime/iskraSpace`.

### Defer until after release

Safe to postpone unless evidence shows direct app impact.

- Full cleanup of old archives.
- Cosmetic repository reshaping.
- Large docs reorganization.
- Non-Iskra-Space application polish.
- Removing old files without import-graph proof.

## Decision rule

For every issue, ask three questions:

1. Does it affect `runtime/iskraSpace` at runtime, build time, deployment time, or security time?
2. Does it block PR/CI integrity needed to ship safely?
3. Does it confuse public users or expose internal-only material as if it were the product?

If yes, treat it as release-facing.

If no, classify it as internal or defer.

## Supabase drift decision rule

Supabase drift is release-blocking only when it touches something used by `runtime/iskraSpace` or breaks trusted deployment/verification.

Examples:

- A missing CORS helper used by an app-facing Edge Function is release-facing.
- A table with old internal run logs is internal unless the app reads it.
- A policy mismatch on public app data is release-blocking.
- A migration/history mismatch is high-risk if it prevents reliable rebuild or rollback.

## Next 15-minute checks

1. Run a clean dependency install for the app.
2. Run the app build command.
3. List imports from `runtime/iskraSpace` to find external repo dependencies.
4. List Supabase functions/tables referenced by the app.
5. Mark each finding as `release-blocking`, `release-supporting`, `internal`, or `defer`.

## Definition of done for this board

This board is useful when every open task can answer:

- what it affects;
- why it matters;
- whether it blocks public release;
- how to verify it;
- what the next safe action is.
