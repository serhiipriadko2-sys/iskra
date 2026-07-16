# KNOWLEDGE_DIFF — SoT30 v5.4.1 → v5.5

Scope: 4 of 30 Knowledge files changed. 26 files byte-identical to v5.4.1 (not re-mirrored here; see base package `dist/SoT30_v5.4.1_Mythic_Corpus_Pass2_T76_Knowledge/` in PR #257 for the unchanged files, or the originally uploaded `SoT30_v5.4.zip`).

## `02_PROJECTS_SURFACE_MAP.md`

- Replaced "Project-only memory | optional convenience | never overrides SoT" with an explicit **Memory boundary** section: default memory does not prove isolation; project-only memory does, but only after two personal toggles (`Reference saved memories`, `Reference chat history`) plus workspace Memory are confirmed ON, and only if chosen at project creation.
- Added **Business plan file-budget gate**: 40-file ceiling for Business/Pro/Enterprise/Edu, 25 for Go/Plus, 5 for Free; 10-file simultaneous-upload cap; flagged community reports of lower observed live-UI limits as `[HYP]`, not fact.
- Refreshed the GitHub `main` SHA reference from the stale `8666444...` to the actual current `559cf275...` observed in this session.
- Fixed **sharing-status** wording: previous text implied shared projects were universally off-by-default during early access; corrected to state this only ever applied to the Enterprise/Edu 4-week early-access window, which converts to enabled-by-default afterward. Free/Plus/Pro/Go shipped generally available.

**Why:** the v5.4.1 wording let a Business Project make an unverified isolation claim and cited a stale sharing-default rule. Both are load-bearing for any "isolated Project" or "safe to share" statement this package makes.

## `22_CONNECTORS_TOOLS_BOUNDARY.md`

- Added **Project runtime boundary**: Project = context container, never executor/runtime/deployment surface; execution happens via whichever model+tool/App/mode is actually available (Chat/Deep Research/Agent/Work/Codex), and those are distinct surfaces from the Project container itself.
- Extended the surface matrix with an **App/Plugin** row reflecting the July 2026 Plugin Directory naming change.
- Added **App/Plugin capability chain**: `connected ≠ enabled ≠ authorized ≠ invoked ≠ succeeded ≠ verified`, plus the documented default `Important actions` permission mode and the fact that Deep Research only ever performs App *read* actions.

**Why:** without this, "an App is connected" or "a file mentions a capability" could be read as proof of a working, permitted, or executed action — the single most common failure mode this audit found across prior sessions' claims.

## `28_EVALS_ACCEPTANCE.md`

- Appended `T77`–`T85` (9 new acceptance prompts) covering: file-limit awareness, memory-mode attestation, Project-is-not-an-executor, instruction parity, the App capability chain, Project/Work separation, visual-content canonicity, retrieval nondeterminism, and the Business memory-settings precondition.
- Updated the `Live Project gate` range from `T01–T76` to `T01–T85`.

**Why:** the new boundaries in `02` and `22` are only load-bearing if a fresh Project session can be tested against them; untested boundary text is a claim, not a contract.

## `29_INDEX_UPLOAD_MANIFEST.md`

- Added the v5.5 delta hash table (this file's own 4-file changeset) and a governance-trace line for `ADR-20260716-01`.
- Added two non-claims: current Project memory mode is unknown until checked per-Project (v5.5 forbids inferring it from plan tier), and OpenAI's documented file limits are contradicted by several community reports of lower live-UI ceilings.
- Clarified the reading order is this package's own routing instruction, not a claim about OpenAI's internal retrieval order.

**Why:** the manifest is the file most likely to be read first (`29 → 00 → ...`); it needs to carry the new non-claims and the corrected governance trace before anything else.

## Explicitly out of scope for this atom

`00_PROJECT_ROUTER.md`, `20_GOVERNANCE_ADR.md`, `23_BUILDER_PROJECTS_COMPAT.md`, `support/PROJECT_INSTRUCTIONS_SOT30.md`, and the remaining 25 Knowledge files are unchanged. The prior audit in this thread proposed touching some of these; on review, the memory/connector/acceptance/manifest changes above cover the load-bearing content without needing a router or ADR-registry rewrite. If a future atom needs a `00`/`20` change, it should be its own slice.
