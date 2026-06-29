# ADR 2026-06-10: Unified Full Canon Recovery Package

## Context

Fourteen Iskra copy archives were recovered from separate cloud workspaces. The first recovery pass separated the extended Builder candidate from `horizon_pr1/` to avoid silent stage collapse while conflicts were audited.

## Decision

Create one unified Full Canon package that includes Horizon PR #1 directly in the package tree while preserving explicit maturity boundaries:

- `canon/horizon/` is the validator-only canonical foundation.
- `agent_files/files_for_agent_builder/10_HORIZON_WEAVER.md` and `agent_runtime_tools/iskra_horizon_weaver.py` remain Builder-layer dry-run Weaver material.
- `tests/horizon/` and `tools/` are included for GitHub verification.
- `SEMANTIC_PASS` remains invalid in Horizon v0.1.

## Alternatives

1. Keep Horizon outside the package. Rejected for final Full Canon because the user wants one synthesized canon.
2. Merge Horizon without status labels. Rejected because it would create false confidence and erase stage boundaries.
3. Include both layers with clear ordering. Accepted.

## Consequences

The package is broader and more honest. GitHub and Builder UI can receive one artifact, while reviewers still see which parts are validator foundation and which are Weaver dry-run layer.

## Verification

- Regenerate `MANIFEST.sha256`.
- Run high-confidence secret scan.
- Run QC-marker scan.
- Run Horizon validator/wrapper smoke tests.
- Compile runtime helper Python files.
- Run artifact receipt on final zip.

## Rollback Trigger

Rollback if Builder UI rejects the unified file volume, Horizon tests fail, or review determines that Weaver material must wait for a separate PR after validator-only merge.

## Delta

- Delta: Horizon PR #1 moved from separate recovery evidence into the unified Full Canon tree.
- Evidence: `canon/horizon/`, `tests/horizon/`, `tools/horizon_validator.py`, `FULL_CANON_UNIFICATION.md`.
- Confidence: 0.88 before GitHub/Builder UI activation.
- Reversal: split Horizon back into separate PR if acceptance tests or Builder verification fail.
