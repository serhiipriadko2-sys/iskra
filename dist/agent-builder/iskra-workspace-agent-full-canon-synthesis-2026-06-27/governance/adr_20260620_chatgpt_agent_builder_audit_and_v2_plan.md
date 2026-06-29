# ADR 2026-06-20: ChatGPT Agent Builder Audit and Repair Plan

Status: accepted
Date: 2026-06-20
Accepted: 2026-06-23

## Context

[FACT] The active repair target is
`dist/agent-builder/iskra-full-canon-unified-2026-06-10`.

[FACT] The historical GitHub baseline
`e33268fbdfbb0dc52b6fd1fb8399698bf9387129` is a drift comparison point, not
the active remediation target.

[FACT] The package is a committed upload mirror and clean export candidate. It
does not prove activation inside ChatGPT Agent Builder, Workspace Agents, or the
Builder UI.

[DRIFT] This older audit snapshot previously treated an OpenAI Agent Builder
deprecation date as a fact. The 2026-06-27 official-doc check did not verify a
public `2026-11-30` deprecation claim for the current ChatGPT Workspace Agents
surface. Keep this as historical local audit context, not current platform
truth. Current alignment should use the official `ChatGPT Workspace Agents` and
`Agent Builder` terminology, with the Agents SDK kept as a separate code-first
fallback.

## Superseded Snapshot

The original 2026-06-20 proposed ADR is superseded as an audit snapshot. Its
useful signal was that the package needed repair, but its release decision data
is now replaced by:

- `CANON_TRACE_MAP.md` for exact, transformed, summarized, excluded, and missing
  canon boundaries.
- `MANIFEST.sha256` for current package-file truth.
- `UNIFIED_QC_RECEIPT.json` for local gate evidence.
- `ZIP_RECEIPT.json` for sidecar clean-zip evidence.
- `agent_files/evals/AGENT_BUILDER_ACCEPTANCE_PROMPTS.md` and
  `agent_files/evals/BUILDER_RUNTIME_HARDENING_PROMPTS.md` for Builder UI
  acceptance.

## Decision

[DECISION] Repair the existing `iskra-full-canon-unified-2026-06-10` folder in
place. Do not create a new release folder for this corrective pass.

[DECISION] Treat the root manifest as the authoritative clean upload subset.
The sidecar clean zip must be generated from manifest paths, and receipts must
state the same inventory boundary.

[DECISION] Keep two explicit knowledge-upload modes:

1. `compact_7_volume`: the seven files under
   `agent_files/consolidated_knowledge/`.
2. `expanded_corpus`: the multi-file package corpus under `agent_files/`.

The selected upload mode must match `agent.yaml`, `MANIFEST.sha256`, the clean
zip, and Builder acceptance evidence.

[DECISION] Reclassify "full canon" as bounded package coverage, not a
byte-identical mirror of the whole repository. Exact mirror claims are allowed
only where `CANON_TRACE_MAP.md` records byte-identical source coverage.

[DECISION] Use Workspace Agents as the team/UI workflow target and Agents SDK as
the code-first fallback. The fallback keeps a tested SDK pin plus an upgrade
check policy instead of treating the pin as permanently canonical.

[DECISION] No live Supabase, GitHub, ChatGPT Builder, or Workspace Agent
mutation belongs to this repair without separate explicit approval.

## Consequences

- Manifest, clean zip, QC receipt, and zip receipt become a single package truth
  boundary.
- Declared knowledge paths become release blockers when missing from the clean
  subset.
- Builder status remains `uploaded by user, pending Builder verification` until
  prompt-level evidence exists.
- Workspace Agent API calls are documented as distinct from SDK runs:
  `agtch_...` IDs, Workspace Agent access tokens, and asynchronous `202
  Accepted` trigger behavior.
- Local helper files and Agents SDK source remain source/reference material
  unless an actual runtime executes them.

## Verification

Required local gates:

- `py tools/generate_manifest.py`
- `py tools/clean_export.py --source manifest`
- `py tools/reassemble_interface_style.py --repo-root . --check`
- `py -m unittest discover -s tests/horizon`
- `py tools/validate_terms.py --dir .`
- `py tools/validate_delta.py --dir .`
- Upload-subset secret/PII scan with no high-confidence secret values.
- `agents-sdk\.venv\Scripts\python.exe -m unittest discover -s agents-sdk\tests`
- `agents-sdk\.venv\Scripts\python.exe -m pip check`

Required Builder gates:

- Upload only the clean subset generated from `MANIFEST.sha256`.
- Run acceptance prompts A-V.
- Run hardening prompts H1-H6.
- Record prompt-level evidence before promoting the status to
  `verified in Builder UI`.

## Rollback Trigger

Revisit or supersede this ADR if:

- the clean zip and manifest disagree after regeneration;
- Builder rejects required files or declared knowledge paths;
- Workspace Agents API/auth semantics change materially;
- a high-confidence secret or private raw memory value appears in the upload
  subset;
- maintaining both Workspace Agents and Agents SDK paths becomes misleading.

## Delta

Delta = proposed audit snapshot converted into accepted repair governance.
Data = package manifest, clean export, QC receipt, zip receipt, OpenAI official
docs, and Builder acceptance prompts.
Omega = 0.86 before Builder UI evidence; local gates can raise package
confidence but cannot prove Builder activation.
Lambda = regenerate files, manifest, QC, clean zip, and zip receipt; then run
Builder UI acceptance before any `verified in Builder UI` claim.
