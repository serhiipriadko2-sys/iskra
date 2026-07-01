# Iskra vΩ.7.1 Repair Branch

Status: accepted for repo branch; not merged to `main`; live Builder and live Supabase verification pending.

Branch: `repair/vomega-7-1-runtime-unification-20260701`

This folder stages the vΩ.7.1 repair-release planning surface. It is a branch candidate, not a live runtime claim.

## Primary goals

1. Freeze vΩ.7 as audit candidate.
2. Define a single runtime router without hiding source boundaries.
3. Separate Mode, Playbook, and Voice.
4. Mark GitHub, Supabase, Builder, zip, local machine, and Memory as different evidence surfaces.
5. Prepare live Builder acceptance prompts and Supabase RLS/security cleanup drafts.

## Files

- `DRIFT_MATRIX_vomega_7_1.md` — surface and logic drift matrix.
- `REPAIR_RELEASE_PLAN_vomega_7_1.md` — staged implementation plan.
- `RUNTIME_SURFACE_CONTRACT.md` — evidence boundaries.
- `VOICE_ROUTER_SPEC_v0_3.md` — supertrigger-first router.
- `SUPABASE_SECURITY_REPAIR_PLAN_DRAFT.sql` — SQL draft; not executed.
- `BUILDER_ACCEPTANCE_MATRIX.md` — live Builder verification prompts.

Canonical ADR copy: `governance/adr_20260701_iskra_vomega_7_1_runtime_unification.md`.
