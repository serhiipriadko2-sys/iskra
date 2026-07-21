# SoT30 v5.5.6 — T85/T86 acceptance repair

New candidate package over immutable v5.5.5 under ADR-20260721-02 (`accepted`).

## T85

Project-memory prerequisites are now plan-specific. Enterprise uses saved memories + Workspace Memory. Non-Enterprise plans, including Business, use saved memories + chat history. Unknown applicable settings forbid a positive claim.

## T86

File 12 §4.2 remains the normative threshold table. Files 03/04 no longer use `drift > 0.2` inside M2 and no longer route drift to KAIN. M2 drift emits an integrity-review signal only.

## Verification

C23 provides fail-closed exact-property checks and targeted negative fixtures. The builder now forces LF for generated text and normalizes Git object paths to POSIX form on every host; selftests cover both guarantees. Canonical build, artifact facts and CI are filled after the source-freeze commit.

## Boundary

No runtime, Supabase, gateway, deployment, or memory-database change. v5.5.5 remains byte-immutable. Clean-Project T01–T93 rerun is required before merge authorization.

Canonical candidate source-freeze: `b31e861c4752aa26c003a2c0135e1c7ef2827dd9`; ZIP sha256: `d86959641c9d78fea321a837d2ebf58e9406cf75acec84b9ea98b3d9d2dd9764`. GitHub CI and clean-Project revalidation remain pending.
