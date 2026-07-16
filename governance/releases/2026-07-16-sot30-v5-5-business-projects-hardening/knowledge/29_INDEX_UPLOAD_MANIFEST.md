---
sigil: projects__29_index_upload_manifest
layer: projects
updated: 2026-07-16
version: v5.5
supersedes: v5.4.1 (2026-07-14)
---
# 29 · INDEX & UPLOAD MANIFEST — SoT30 v5.5

## Upload rule
Upload exactly the 30 files in `knowledge/` and paste `support/PROJECT_INSTRUCTIONS_SOT30.md` into Project Instructions. Support files are receipts/tests, not Knowledge prerequisites. Business/Pro/Enterprise/Edu plans allow up to 40 files/project with a 10-file simultaneous-upload cap — upload in 3 batches of 10 and verify a final count of 30. Go/Plus (25-file ceiling) and Free (5-file ceiling) cannot hold this package; see `02_PROJECTS_SURFACE_MAP.md`.

## Reading order
`29 → 00 → 03–07 → 08–20 → 21–23 → 24–27 → 28`. File 25 contains two-stage Mythic Cognition Router v0.3.1: inquiry after Trace, expression after Voice, with executable load-bearing-premise verification.

`[INTERP]` This reading order is this package's own canonical routing instruction. It is not a claim about OpenAI's internal retrieval/ranking behavior, which is undocumented — see `T84-RETRIEVAL-NONDETERMINISM`.

## Knowledge table — v5.5 delta (4 changed files)

Only these 4 files change bytes/hash in v5.5. All other 26 files are byte-identical to v5.4.1 and keep the hashes recorded in the base package's `support/MANIFEST.json`.

| File | v5.4.1 bytes → v5.5 bytes | v5.5 SHA-256 |
|---|---|---|
| `02_PROJECTS_SURFACE_MAP.md` | 1811 → 4613 | `ab2b2173450a0de2746702e324c5c779db52c7d52d5858b1a3b93de10833d01a` |
| `22_CONNECTORS_TOOLS_BOUNDARY.md` | 1813 → 3761 | `a18aa78ad414db39faf503ed2230662489c30b550aac7cbeac58700eb125a3d2` |
| `28_EVALS_ACCEPTANCE.md` | 10501 → 12684 | `4ec727c312afd1d4d75927a9057bef8cf7dd1d2267d6ccef89188caeb1bb6fc8` |
| `29_INDEX_UPLOAD_MANIFEST.md` | 4975 → n/a (self) | recorded in `../SHA256SUMS` only, not here, to avoid self-reference |

File 29's own hash is stored in `../SHA256SUMS` and `../MANIFEST.json` to avoid self-reference, same discipline as v5.4.1.

## Governance trace
- `ADR-20260712-01` — Instructions hardening, accepted.
- `ADR-20260712-02` — Mythic Router, accepted; SOT30 mirror done in v5.2.
- `Amendment A.1` — numeric voice specificity/provenance, accepted.
- `ADR-20260714-01` — Mythic Cognition Router v0.2, accepted; Knowledge-only mirror done in v5.3.
- `ADR-20260714-02` — Mythic Corpus Pass 2 / Arc Routing v0.3, accepted; Knowledge-only mirror done in v5.4.
- `ADR-20260714-03` — executable falsifier / false-premise gate v0.3.1, accepted; Knowledge-only mirror done in v5.4.1.
- `ADR-20260716-01` — Business Projects Runtime Hardening (memory-mode boundary, connector capability chain, plan file-budget gate, T77–T85), accepted; Knowledge-only mirror done in v5.5. Repo-level record: `governance/adr_20260716_sot30_v5_5_business_projects_hardening.md`.

## Current non-claims
- package is not proven uploaded to a live Project;
- T01–T85 are not yet live-run;
- T76 F1/F2/F3 falsifier behavior is statically specified, not verified-live;
- runtime code and GitHub app/product behavior were intentionally not changed by this Knowledge-only release;
- bounded controller deployed application E2E remains separate;
- gateway Projects Action/JWT role and Archive/Shadow DB enforcement remain pending;
- current Project memory mode (project-only vs default) for any specific live Project is unknown until explicitly checked in that Project's settings — v5.5 forbids inferring it from plan tier alone;
- OpenAI's own published file-count limits (25 for Plus, 40 for Business/Pro/Enterprise) are contradicted by several independent community reports of lower observed ceilings in the live UI — this package treats the documented limit as the plan ceiling, not as a live-UI guarantee.
