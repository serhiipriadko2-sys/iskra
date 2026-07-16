# ADR-20260716-01: SoT30 Business Projects Runtime Hardening (v5.5)

Status: proposed
Date: 2026-07-16
Owner / Builder: Владелец / Claude Code

## Context

The SoT30 Knowledge package (`SoT30_v5.4.1_Mythic_Corpus_Pass2_T76_Knowledge`, uploaded this session as `SoT30_v5.4.zip`, mirrored to this repo in still-open PR #257) is designed to be uploaded as the 30-file Knowledge set of a ChatGPT Business Project. Prior audit in this session found the package's own description of the ChatGPT Projects runtime environment (`02_PROJECTS_SURFACE_MAP.md`, `22_CONNECTORS_TOOLS_BOUNDARY.md`) predates several confirmed OpenAI product facts and understates two load-bearing risks:

1. **Memory isolation.** `02_PROJECTS_SURFACE_MAP.md` labelled project-only memory "optional convenience." For Business/Enterprise, OpenAI requires two personal settings (`Reference saved memories`, `Reference chat history`) plus workspace-level Memory to be ON, chosen at project creation, before project-only memory is even available — otherwise default memory may let project chats reference non-project chats and vice versa. Verified this session via `WebSearch` against `help.openai.com` (direct `WebFetch` to the Help Center returned HTTP 403 in this environment; search-result snippets from the same domain were used instead and are marked `[FACT]` in the changed files with that caveat).
2. **Capability-chain conflation.** `22_CONNECTORS_TOOLS_BOUNDARY.md` did not distinguish "an App/connector is connected" from "an action is enabled, authorized, invoked, succeeded, or verified" — the single most common false-confidence pattern surfaced in this session's audit of prior claims.

Additionally: `02`'s GitHub `main` SHA reference was stale (pre-dated 15 merged PRs), and its shared-projects wording conflated the Enterprise/Edu early-access rollout with the feature's general availability on Free/Plus/Pro/Go.

## Decision

Patch 4 of the 30 Knowledge files (`02_PROJECTS_SURFACE_MAP.md`, `22_CONNECTORS_TOOLS_BOUNDARY.md`, `28_EVALS_ACCEPTANCE.md`, `29_INDEX_UPLOAD_MANIFEST.md`) to:

- require an explicit, checked project-only-memory precondition before any isolation claim;
- state the Business/Pro/Enterprise/Edu 40-file plan ceiling as an explicit compatibility gate for this package (30 files + up to 10 reserved slots), with the 10-file simultaneous-upload cap;
- correct the sharing-default wording to distinguish the Enterprise/Edu early-access window from general availability;
- add an explicit Project-runtime-boundary statement (Project = context container, never executor) and an App/Plugin capability chain (`connected ≠ enabled ≠ authorized ≠ invoked ≠ succeeded ≠ verified`);
- add 9 new acceptance prompts, `T77`–`T85`, testing the above.

The remaining 26 Knowledge files, `support/PROJECT_INSTRUCTIONS_SOT30.md`, and the package's own internal ADR registry (`20_GOVERNANCE_ADR.md`) are explicitly out of scope for this ADR — see `governance/releases/2026-07-16-sot30-v5-5-business-projects-hardening/KNOWLEDGE_DIFF.md`.

This ADR does not activate, deploy, or live-verify anything. It is Knowledge-only:

- no `runtime/` code changed;
- no Supabase schema or `iskra_memory.*` write;
- no ChatGPT Project has been created or tested against `T77`–`T85`.

## Evidence

- Delta files, byte counts, and SHA-256 hashes: `governance/releases/2026-07-16-sot30-v5-5-business-projects-hardening/MANIFEST.json` and `SHA256SUMS`.
- Static QC (secret scan, test-ID contiguity, scope check): `governance/releases/2026-07-16-sot30-v5-5-business-projects-hardening/QC_REPORT.md`.
- OpenAI product facts: `WebSearch` results this session against `help.openai.com` (Projects in ChatGPT; File Uploads FAQ) — direct `WebFetch` to those URLs returned HTTP 403 in this environment, so facts are sourced from search-result snippets of the same official pages, not full-page fetches. Labelled accordingly in the changed files.
- GitHub `main` HEAD referenced: `559cf2752e481df70e97f6049ce92635168abc65`, observed via `git fetch`/`git log` in this session.

## Risk

- The App-permission-mode and shared-projects-default wording rests on search snippets, not a full page fetch; if `help.openai.com` content has since changed, this ADR's `[FACT]` labels should be re-verified before the next release.
- Community reports of file-limit drift (20-file/10-file observations vs documented 25/40) are `[HYP]`, included as a caution, not resolved.
- `T77`–`T85` are authored, not live-run; `LIVE-PROJECT-PASS` is unchanged as a pending gate.

## Next

1. Merge this ADR + PR #264 delta as `proposed → accepted` once reviewed.
2. Upload the full 30-file package (26 unchanged + these 4) to a fresh Business Project with project-only memory confirmed via the two personal toggles + workspace Memory.
3. Run `T01`–`T85`, record outcomes, and close `LIVE-PROJECT-PASS`.
4. Re-verify the `help.openai.com` facts above via a full-page fetch once this environment's `WebFetch` access to that domain is unblocked, or via manual UI check.

## Status

`proposed` — awaiting Owner acceptance. Not canonically active. Not deployed. Not live-verified.
