# ADR 2026-06-20: ChatGPT Agent Builder Audit and v2 Repair Plan

Status: proposed  
Date: 2026-06-20  

## Context

[FACT] The repository contains a Builder upload set at `dist/agent-builder/iskra-full-canon-unified-2026-06-10`.  
[FACT] An academic audit of this set against the full Iskra canon in `C:\github\iskra-1` and against current ChatGPT Agents / Workspace Agents capabilities found significant drift and gaps.

Key findings:

- The Git-indexed (LF) version of the package is byte-consistent with `MANIFEST.sha256`, but the local Windows working copy is CRLF-converted and fails byte-level verification.
- The package covers only ~35–40 % of the current repository canon (missing `core/voices_monographs/`, most of `metrics/`, `mind/`, `docs/`, `appendix/`, all of `ledger/`, `runtime/`, `packages/`, `apps/`).
- `memory_current/development-diary.md` and `memory_current/project-memory.md` contain PII/raw private narrative that violates `SECURITY.md`.
- Version labels drift between `unified-2026-06-10` and internal references to `builder-2026-06-06-v4`.
- Relative links inside `08_INTERFACE_STYLE.parts/` are broken for the flattened package structure.
- Required tooling referenced by instructions (`tools/verify_ledger.py`, `validate_terms.py`, `validate_delta.py`) is missing from the package.
- The package lacks `agent.yaml`, an icon, a packaged skill, and action schemas expected by ChatGPT Agents Studio.
- OpenAI has deprecated the visual Agent Builder / AgentKit (shutdown 2026-11-30) and is moving toward Workspace Agents and the Agents SDK.

## Decision

[DECISION] Repair the existing `iskra-full-canon-unified-2026-06-10` upload set in place rather than creating a new dated folder, because the folder name already represents the target release and the changes are corrective.

[DECISION] Apply a four-layer repair:

1. **Hygiene and safety**: normalize line endings, remove PII, remove build byproducts, add `.gitattributes`.
2. **Metadata integrity**: synchronize version labels, fix broken internal links, update `MANIFEST.sha256` from LF sources.
3. **Canon completeness**: backfill the most critical missing canonical layers (`voices_monographs/`, `metrics/`, `mind/`, `docs/specs/`, `appendix/`, `ledger/`, root `AGENTS.md`).
4. **Builder artifacts**: add `agent.yaml`, an icon, a packaged skill, and eval prompts aligned with ChatGPT Agents Studio.

[DECISION] Treat Workspace Agents as the primary target UI and Agents SDK as the strategic fallback, while keeping all canonical source-of-truth in Git.

[DECISION] Do not store secrets, service-role keys, or raw private user narrative in any Builder upload set or memory file.

## Alternatives

### Alternative 1: Create a new folder `iskra-full-canon-v2-2026-06-20/`

- Keeps the old package untouched for traceability.
- Increases repo size and fragmentation.
- Rejected because the existing folder name is the intended release identifier and the changes are repairs, not a new product version.

### Alternative 2: Delete the Builder upload set entirely and rely only on Agents SDK

- Avoids OpenAI UI deprecation risk.
- Loses the low-code ChatGPT Agents Studio surface that the user is actively exploring.
- Rejected; the project needs both surfaces during the transition.

### Alternative 3: Patch only CRLF and PII, ignore canon gaps

- Fast and low-risk.
- Leaves the agent behavior incomplete and prone to hallucination.
- Rejected; the audit showed that missing canon is the largest risk to answer quality.

## Consequences

- The upload set will become byte-verifiable on Windows after `core.autocrlf` or `.gitattributes` normalization.
- PII will be removed from published memory, reducing privacy and compliance risk.
- The agent will have broader canonical coverage and fewer hallucination-prone blind spots.
- The package will be closer to the file/format expectations of ChatGPT Agents Studio.
- Repo size will grow because of backfilled canonical files.

## Scope

In scope:

- Files under `dist/agent-builder/iskra-full-canon-unified-2026-06-10/`.
- Governance ADR and receipts.
- `.gitattributes` for the `dist/agent-builder/` subtree.

Out of scope:

- Changes to live Supabase state.
- Changes to `runtime/` source code beyond packaging helpers.
- Committing or pushing to Git (to be done by the operator).

## Verification

Required checks before marking this ADR accepted:

- [ ] `sha256sum -c MANIFEST.sha256` passes locally after LF normalization.
- [ ] `python -m unittest discover -s tests/horizon` passes.
- [ ] `python tools/reassemble_interface_style.py --check` passes.
- [ ] No PII or secret patterns in `memory/`, `agent_files/`, or root package files.
- [ ] `agent.yaml` validates as a Workspace Agent manifest.
- [ ] All version labels inside the package match `unified-2026-06-10`.
- [ ] `evals/` contain ≥ 30 acceptance prompts with expected answers.

## Rollback Trigger

Revisit or revert if:

- ChatGPT Agents Studio rejects the repaired package.
- Acceptance evals fall below 85 % pass rate.
- Repo size or duplication becomes unmaintainable.
- OpenAI announces deprecation of Workspace Agents before this ADR is accepted.

## ΔDΩΛ

Δ: The Builder upload set is repaired from a fragile partial-canon package into a verifiable, PII-free, format-ready upload set with broader canonical coverage.

D: Audit report (this ADR), `MANIFEST.sha256`, `SECURITY.md`, `AGENTS.md`, ChatGPT Agents Studio screenshots, OpenAI deprecation page.

Ω: 0.85 expected after repair; 0.55 current; 0.35–0.40 current canon coverage.

Λ: Run verification checklist, then open a PR for final review and merge.
