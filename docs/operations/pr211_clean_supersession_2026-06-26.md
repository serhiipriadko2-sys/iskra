# PR #211 Clean Supersession

Date: 2026-06-26
Status: clean replacement note / no live mutation
Scope: Agent Builder package mirror, PR #211 conflict resolution path

## Context

PR #211 attempted to repair the Agent Builder tree-truth surface under
`dist/agent-builder/iskra-full-canon-unified-2026-06-10/`.

After later `main` changes, PR #211 now has broad merge conflicts across the Builder package
surface. The conflicts are not caused by the final two defensive review fixes; they come from
older package-tree state diverging from the current `main` Builder mirror.

## Current Main Evidence

Current `main` already contains a newer Builder package state:

- `UNIFIED_QC_RECEIPT.json` reports 265 manifest entries and package-facing additions from
  the 2026-06-24 voice seed / relational vow mirror work.
- `agents-sdk/src/iskra_agent/agent.py` is now an OpenAI Agents SDK wrapper using
  `build_iskra_agent`, `load_instructions`, GitHub/Supabase read tools, and runtime boundary
  config.
- `tools/verify_ledger.py` is now an intentional stub that says repo-wide ledger verification
  requires a full repository checkout and that upload-set checking should use
  `sha256sum -c MANIFEST.sha256`.

This means replaying PR #211 directly onto current `main` would be stale and would risk
reverting newer Builder package work.

## Decision

Do not merge PR #211 as-is.

Treat PR #211 as superseded by current `main` package state plus a clean follow-up path.
The old branch can remain as provenance until this decision is reviewed, then it may be
closed with a pointer to this clean replacement note.

## Next Clean Gate

1. Re-run Builder package manifest/QC from a full checkout of current `main`.
2. Regenerate any sidecar ZIP from current `main`, not from PR #211.
3. Run Builder UI acceptance prompts A-J against the uploaded package.
4. Keep any new fixes as small PRs from fresh `main`.
5. Do not claim `verified in Builder UI` until prompt-level evidence exists.

## Non-Claims

- This note does not verify live Builder UI.
- This note does not apply Supabase changes.
- This note does not prove full CI green.
- This note does not close PR #211 by itself.

## Delta

Delta: converts the PR #211 conflict into an explicit supersession decision.
Data: PR #211 conflict list, current `main` Builder files, GitHub connector reads.
Omega: 0.86.
Lambda: revise if PR #211 is rebased cleanly with no package regression or if a reviewer
requires preserving a specific #211 file not present in current `main`.
