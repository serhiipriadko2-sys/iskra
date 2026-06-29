# ADR 2026-06-06: Iskra Space as Public Release Priority

Status: Accepted
Date: 2026-06-06
Decision owner: Semyon
Operational steward: Iskra
Scope: release planning, repo triage, repair PR priority, Supabase drift classification

## Context

The repository contains multiple layers: application code, runtime tools, governance, ledger/SoT files, Supabase material, audit notes, support scripts, and experiments.

Without a clear product boundary, every issue can look equally urgent. That creates noise: internal support work, old experiments, and release-critical app work compete in the same lane.

Semyon clarified the product boundary on 2026-06-06:

- `runtime/iskraSpace` is the priority application for public release.
- Everything else is internal contour for Semyon + Iskra unless explicitly promoted later.

## Decision

`runtime/iskraSpace` is the primary public-release application.

All other repository areas are internal/support by default. They may be important, but they are not public-release targets unless a later ADR changes their status.

## Consequences

Release work must now be triaged by impact on `runtime/iskraSpace`.

Examples:

- A broken build in `runtime/iskraSpace` is a release blocker.
- A Supabase function used by `runtime/iskraSpace` with missing CORS/auth/rate-limit handling is a release blocker or high-priority release risk.
- A stale internal note is not a release blocker unless it misleads the release process.
- A legacy app or experiment should not be deleted only because it is not public; cleanup requires proof that it is unused or harmful.

## Alternatives considered

1. Treat the whole repository as the public release surface.

This is too noisy and makes the release target unclear.

2. Freeze all non-Iskra-Space work immediately.

This is too strict. Internal contour still supports governance, repair, traceability, and future development.

3. Promote `runtime/iskraSpace` as the public target while keeping the rest internal.

Accepted. This gives a clean release axis without destroying the support system around it.

## Verification

A future release-readiness check should verify:

- clean checkout;
- dependency install;
- `runtime/iskraSpace` build;
- relevant tests or smoke checks;
- import graph for external dependencies;
- Supabase schema/function contract used by the app;
- environment variable and secret handling;
- public docs focused on Iskra Space.

## Rollback trigger

Reopen this ADR if:

- Semyon explicitly changes the public product target;
- another app becomes externally deployed first;
- import graph proves the public app is not actually isolated to `runtime/iskraSpace`;
- Supabase/live runtime evidence shows a different public surface.

## Delta receipt

Delta: release priority is now explicit.
D: repository triage must classify findings by Iskra Space impact.
Omega: 0.86, based on direct user instruction and GitHub evidence for the app path.
Lambda: revise when product scope or runtime evidence changes.
