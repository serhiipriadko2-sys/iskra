# Full Canon Unification

Build UTC: `20260610T200726Z`

## Decision

This package is the unified Full Canon recovery package. The prior recovery bundle kept `horizon_pr1/` separate only as an audit boundary while conflicts were being checked. This unified package folds Horizon PR #1 into the same canonical tree.

## Layer Order

1. Core Full Canon and Builder instructions remain the primary identity and operating contract.
2. Horizon PR #1 validator files live under `canon/horizon/` as the canonical validator-only foundation.
3. Builder-layer Horizon Weaver files remain under `agent_files/files_for_agent_builder/10_HORIZON_WEAVER.md` and `agent_runtime_tools/iskra_horizon_weaver.py` as the dry-run map-shift layer.
4. Tests and wrappers live under `tests/horizon/` and `tools/` so GitHub can verify the Horizon boundary.

## Boundary

Unified does not mean ungraded. Horizon PR #1 is validator-only. Horizon Weaver is included as a Builder-layer dry-run map-shift module. `SEMANTIC_PASS` remains invalid for Horizon v0.1. No file in this package claims live Builder UI mutation, Supabase mutation, GitHub mutation, or autonomous canon evolution without explicit approval and verification.

## Why This Is Full Canon

The canon is full because the layers are present in one source tree with their status and verification gates. The canon would be false if it erased the difference between a validator foundation and a Weaver layer.

## Receipt

- Source extended candidate: `iskra-full-canon-builder-2026-06-06-v4-extended-sanitized.zip`
- Horizon source: recovery bundle `horizon_pr1/`
- Manifest regenerated after unification.
- Security and QC marker scan required before delivery.
