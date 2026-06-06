# Iskra Space Release Priority v1

Status: accepted working canon  
Date: 2026-06-06  
Owner: Semyon + Iskra operational contour  
Scope: repository planning, release triage, repair PRs, Supabase drift decisions

## Plain-language summary

`runtime/iskraSpace` is the application we prepare for public release.

Everything else in the repository is internal support for Semyon and Iskra unless a later ADR explicitly promotes it to public-release scope.

In simple words: the repo has many tools, notes, experiments, repair paths, governance files, and support systems. They matter, but they do not all need to become a public product at the same time. The release focus is now one clear app: Iskra Space.

## Decision

[FACT] The public release target is `runtime/iskraSpace`.

[FACT] All other repository areas are internal/support contour by default.

[INTERP] Future repair, audit, and cleanup work should classify every finding by its effect on `runtime/iskraSpace`:

- `release-blocking`: prevents Iskra Space from being built, deployed, secured, or used correctly.
- `release-supporting`: improves the release path but does not block the product by itself.
- `internal`: useful for Semyon + Iskra operations, memory, governance, audits, or repo maintenance.
- `defer`: not needed for the public release and safe to leave for later.

## Evidence

[FACT] User instruction on 2026-06-06: `runtime/iskraSpace` is the priority application for release into the world; everything else is for the internal contour of Semyon and Iskra.

[FACT] GitHub source path: `runtime/iskraSpace` at commit `20bacc5bb262eb1aa0798451c2920984dfb9e26b`.

[FACT] Observed repository files at that commit:

- `runtime/iskraSpace/README.md` declares `# Iskra Space` and `Status: Production-Ready`.
- `runtime/iskraSpace/package.json` declares package name `iskra-space`.
- `runtime/iskraSpace/metadata.json` declares app name `Iskra Space`.

## What this changes

Before this decision, audits could treat the whole repository as one equally public surface.

After this decision, we separate two things:

- Public product surface: Iskra Space.
- Internal operating system: docs, governance, ledger, Supabase repair notes, memory, experiments, older apps, and supporting scripts.

This does not make the internal contour unimportant. It only changes release priority.

## Practical example

If an old experimental file in another folder is messy but does not affect `runtime/iskraSpace`, it is not a public-release blocker.

If a Supabase Edge Function, environment variable, CORS rule, or database contract is used by `runtime/iskraSpace`, then drift there can be a release blocker.

## Working rules

1. Keep `runtime/iskraSpace` as the first release-readiness path.
2. Do not delete internal files only because they are not public; first prove they are unused or harmful.
3. When a problem is found, label it by impact: release-blocking, release-supporting, internal, or defer.
4. Supabase drift decisions must say whether the drift affects Iskra Space directly.
5. Ledger and SoT integrity remain important, but they are release blockers only when they block PR flow, verified source trace, or app deployment.
6. A different app or folder can become public only through a later explicit ADR.

## Known blind spots

[HYP] Some internal files may still be imported by `runtime/iskraSpace` indirectly. This must be checked by an import graph before cleanup.

[HYP] Some Supabase functions or tables may look internal but still support the app runtime. This must be checked against live Supabase metadata and app environment usage.

[HYP] The README status says Production-Ready, but release readiness still needs a current verification pass: install, build, tests, environment, Supabase contract, and deploy smoke.

## Verification gates

A release-readiness pass should prove at least:

- `runtime/iskraSpace` dependencies install cleanly.
- The app builds from a clean checkout.
- Required environment variables are documented and available through safe deployment configuration.
- Supabase schema/functions used by the app match the code contract.
- CORS, auth, and external API calls do not expose secrets or block normal use.
- Public-facing docs describe the app, not the whole internal operating contour.

## Rollback or revision trigger

Revise this rule if:

- Semyon explicitly promotes another app/folder to public release scope.
- Import graph proves another folder is a required runtime part of Iskra Space.
- Supabase/live deployment proves a different release surface is actually serving users.
- Product strategy changes and is recorded in a later ADR.
