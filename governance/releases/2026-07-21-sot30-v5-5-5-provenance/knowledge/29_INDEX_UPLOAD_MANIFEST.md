---
sigil: projects__29_index_upload_manifest
layer: projects
updated: 2026-07-21
version: v5.5.5
supersedes: v5.4.1 (2026-07-14), v5.5 delta, v5.5.1 content delta, v5.5.2 backlog, v5.5.3 instructions-sync, v5.5.4 semantic-consistency
---
# 29 · INDEX & UPLOAD MANIFEST — SoT30 v5.5.5 (provenance & version-identity cleanup)

## Upload rule
Upload exactly the 30 files in `knowledge/` and paste `support/PROJECT_INSTRUCTIONS_SOT30.md` into Project Instructions. Support files are receipts/tests, not Knowledge prerequisites. Business/Pro/Enterprise/Edu plans allow up to 40 files/project with a 10-file simultaneous-upload cap — upload in 3 batches of 10 and verify a final count of 30. Go/Plus (25-file ceiling) and Free (5-file ceiling) cannot hold this package.

## What this package is
v5.5.5 is a **provenance / version-identity cleanup** over v5.5.4 — no semantic,
runtime, Supabase, or memory-policy change (ADR-20260721-01). It resolves the two
in-ZIP inaccuracies v5.5.4's erratum deferred: **E1** — `support/MANIFEST.json`
`generated_from: canonical_git_blobs` is now *genuinely true* (built from a
source-freeze commit via a real `--from-git`, with 30/30 knowledge files + the
instructions in the ZIP byte-equal to the git blobs at that commit, recorded in
`generated_from_ref`); **E2** — the ZIP root is now `SoT30_v5.5.5/`. It also makes
the active package identity consistent at v5.5.5 (both Project Instructions copies
and the version stamps in `00/01/02/22/25/28/29`). Baseline: v5.5.4. Live-Project
verification pending. Governance trace: `ADR-20260721-01`.

v5.5.4 (semantic & runtime-status consistency), v5.5.3 and earlier are **historical
previous releases**, not this package; their sections lower in this file are kept
for provenance only.

### Three baselines (do not conflate)
- **release_tree_baseline** — the committed v5.5.4 release-tree `knowledge/` content;
  the authoritative source of truth for v5.5.5's diff.
- **dist_zip_baseline** — the immutable shipped v5.5.4 ZIP, used only as an artifact
  comparison surface, **not** as a source of new bytes. (Historically the v5.5.2 zip
  diverged from its release tree for `06/09/24`; v5.5.3 reconciled it. Do not treat a
  zip as the content authority.)
- **live_project_baseline** — **absent**: v5.5.5 has not been uploaded to any live
  ChatGPT Project; no claim is made about a live Project's contents.

### Composition vs the v5.5.4 release tree
The per-file `changed`/`unchanged` sets are recomputed at build time from actual
LF-normalized content, are **disjoint** (intersection empty), and their **union is
all 30 files** — see `support/MANIFEST.json` (`changed_files` / `unchanged_files`).
For v5.5.5 the expected changed set is `{00, 01, 02, 22, 25, 28, 29}` — **7 changed /
23 unchanged**. The exact list is the manifest's, not a hard-coded prose count.

### On the earlier chain (historical, do not over-generalize)
The v5.5.2→v5.5.3 receipts established that external commit `82191ce` overwrote
v5.5.2's `support/SHA256SUMS`/`MANIFEST.json`; that `31340c5`'s recorded hash was
correct for `01` but was itself already wrong for `06/09/24` (it matched the
divergent v5.5.2 zip, not the committed blob). v5.5.4 inherited v5.5.3's
reconciled, git-blob-derived content; v5.5.5 does not re-litigate that chain.

### File 24 provenance (resolved in v5.5.4)
`24_INTERFACE_STYLE.md`'s 18-byte / hash gap first recorded at v5.5.1 was **resolved
in v5.5.4**: the raw-blob receipt under `governance/audits/2026-07-20-sot30-v554/`
(`FILE24_PROVENANCE_RECEIPT.json`, `root_cause_status: verified`) showed the change is
**exactly two** `auth.uid()` → `(select auth.uid())` RLS-initplan optimizations
(9 bytes ×2 = 18, zero CRLF in both blobs) — a benign optimization the manifest hash
previously lagged, not a corruption and not a CRLF artifact. **v5.5.5 keeps file 24
byte-identical to v5.5.4** and makes no new file-24 claim.

> **STATIC-PACKAGE-PASS does not imply LIVE-PROJECT-PASS.** A green
> `sha256sum -c` and a passing semantic verifier attest the *package*. A
> LIVE-PROJECT-PASS requires an exact 30-file manifest-hash match recorded from
> a real upload — see `28_EVALS_ACCEPTANCE.md` (T93).

## Reading order
`29 → 00 → 03–07 → 08–20 → 21–23 → 24–27 → 28`. File 25 contains two-stage Mythic Cognition Router v0.3.1: inquiry after Trace, expression after Voice, with executable load-bearing-premise verification.

`[INTERP]` This reading order is this package's own canonical routing instruction. It is not a claim about OpenAI's internal retrieval/ranking behavior, which is undocumented.

## Knowledge table (29 non-self hashes, recomputed for the merged corpus)

| File | Bytes | SHA-256 |
|---|---:|---|
| `00_PROJECT_ROUTER.md` | 9407 | `d72bbb89387b3762ab4797b0ab0955fba5e15589094fcc20c6426d0114d9fa97` |
| `01_PARITY_ADVANCEMENT_MANIFEST.md` | 26301 | `70ea68f429808409ac0dee768c286df5bb18794c78a78246ab97668bfbb899cb` |
| `02_PROJECTS_SURFACE_MAP.md` | 4615 | `a798c146a1aea4b1210d04bde7e03ff50975b4748261c22172a1bcb4426aff85` |
| `03_TELOS_MANTRA_PRINCIPLES.md` | 48286 | `cea610dd599b9a9d12de3f8689d9462a7ae6c1ed20eae18cce842316afe3f5f7` |
| `04_IDENTITY_NON_MIRROR.md` | 92421 | `949614681a70fbd339f476959db21b5a6c42602d03f2dee19b50d8a48cf298f8` |
| `05_TRUTH_SIFT_RAG.md` | 41451 | `396fffda61a611729a7fb8d82f434b344fb79cf8cb24596b816f05824d54b3c9` |
| `06_SECURITY_INTEGRITY.md` | 150275 | `1271e23c045e8cf85b4ff1720c651191a19bfa4de4c05f72851e8d42584e15d7` |
| `07_UNIVERSAL_ROUTER.md` | 82168 | `a7f8956457e8c7ada2f0af1e70a2e34cb59e0034e40d3b7f535a2c46c21a1607` |
| `08_STATECYCLE_RUNTIME.md` | 12896 | `4145175144cfda6c0c24c335f50a6fb27bd44f0846b6eea9d056eba31517b96e` |
| `09_METRICS_ENGINE.md` | 15215 | `0a5d3951ba57b0e6760332a641cd9f2abd625d6cb00e1584c58a8af7e8553b5a` |
| `10_ENTROPY_FRACTAL_EWS.md` | 14874 | `48df83050f9615207987dcc3e74d35dccf38eeb81a198e7ee5d4fe0378579233` |
| `11_SLO_PLAYBOOK_CONTROL.md` | 16074 | `60f9f043b7eb71c3f47a38d36604c6b9fd228ea8b76d8ce8a65405106966553c` |
| `12_COUNCIL_VOICES.md` | 19361 | `a6def4250944e28ccd7d67b10cfffc88b524ddd0fad3658c1f3cf454b9caa846` |
| `13_OUTPUT_RECEIPTS_ANTI_EMPTY.md` | 13386 | `e709c9a25ec9e8cfb3836776827e4ecc63f8f0fd568617396c2324e571a1a739` |
| `14_MEMORY_MODEL.md` | 14110 | `fd7016036ec0987845b96b39071339ffd9f9dfc8d0f83435557061936bbc6763` |
| `15_SUPABASE_MEMORY_PLANE.md` | 12574 | `c67f62e9cb33bec161c347eff9894ba47724e324b4ac0b7d1a007bad469732af` |
| `16_SHADOW_LAYER.md` | 8289 | `be46e1d9a5898b3d07d3a3813854323a49bd2394a936c7e7928a25eb1daff795` |
| `17_DREAMSPACE_DREAMSEED.md` | 11430 | `dd4d8af3cf88c1088d937ba45f2a6e4f28e8eb14f0373f1a7b6f3c63524f9c9f` |
| `18_HORIZON_WEAVER.md` | 13916 | `282ff5be29df9776cfb881bf8d985744f509413dc7ce19ef827993b9ad4598d3` |
| `19_DRY_DARK_RUN_PROTOCOL.md` | 12501 | `ffb66f7e8293d81f4aa2d526a239efffb0fbb5335ec8e2de8f4ceea8a218c176` |
| `20_GOVERNANCE_ADR.md` | 32537 | `fa80f1f4e06650c1269e65bae4ba412a5351d4d2142330fb74728979cb6151fd` |
| `21_WORKFLOW_OPS_LEDGER.md` | 19105 | `20a47211734796f4af94ddd1621d19d39474785fbcf9a1570146d3edf9e833a5` |
| `22_CONNECTORS_TOOLS_BOUNDARY.md` | 3763 | `09875eb12c2371cf5ba09bdf607cd4476ab838660360f0b5895a148d3c07a053` |
| `23_BUILDER_PROJECTS_COMPAT.md` | 1091 | `b5f58d2d1226fff156d5cef4c6e34b9aff0dfe55836a8ca0870fe59201ffd334` |
| `24_INTERFACE_STYLE.md` | 2831441 | `576b0c881d5c0a889898ca7e668c48a46f816203fde720865914785cc69f380b` |
| `25_LIBER_SPACE_BUSIDO.md` | 458073 | `8b8548d692be3fbdca1f205ba44b3bf6af03817a1a88c3211e7af47ddc1ef0cb` |
| `26_SOMATIC_INTUITION.md` | 24590 | `1a704c9fc494166ed01c643a770e703afdd44b36296aad9101696cef1fc12bf5` |
| `27_WHAT_IF_SCENARIO_MATRIX.md` | 22008 | `a9f187e0727c86d449fe40fa787d329049076c1e05723aa768eb0b05ba1a3d9a` |
| `28_EVALS_ACCEPTANCE.md` | 15492 | `2bcb21d0f4a2deb23cf6b29653218752280f92053249f429f6cab7a5851f90e3` |
File 29 hash is stored in external `support/MANIFEST.json` and `support/SHA256SUMS` to avoid self-reference.

## v5.5.5 provenance & version-identity cleanup (this build)
Resolves the two in-ZIP inaccuracies deferred from v5.5.4 (E1 untrue `generated_from` label, E2 ZIP root missing `v`) and makes the active package identity consistent at v5.5.5. Built from a source-freeze commit via genuine `--from-git` under ADR-20260721-01.

## v5.5.4 semantic & runtime-status consistency
Corrects in-corpus prose that no longer matched reality: file 29's own
composition narrative; `MANIFEST.json` disjoint changed/unchanged sets; the
bounded-Guard lifecycle and proxy `postGuardEws` status in `11`/`20`/`01`;
Supabase live-overlay freshness in `15`; historical-Ω / reference quarantine in
`25`/`24`; and adds acceptance cases T88–T93 in `28`. No runtime, Supabase, or
live-Project change. Full trace: `governance/adr_20260720_sot30_v5_5_4_semantic_runtime_consistency.md`.

## v5.5.3 instructions-version-sync + hash-chain repair
Version-label sync (00) + restoration of a verified-correct hash chain after
external commit `82191ce` corrupted v5.5.2's SHA256SUMS/MANIFEST.json. Full
trace: `governance/adr_20260719_sot30_v5_5_3_instructions_version_sync.md`.

## v5.5.2 backlog-batch resolution
Seven files changed from v5.5.1: `04`, `06`, `07`, `09`, `12`, `27`, `28`. Each closes a specific coordinate from the independently cross-verified SoT30 v5.5.1 audit (Mythic Router / RESEARCH function / Voice completeness). Full trace: `governance/adr_20260718_sot30_v5_5_2_backlog_batch.md`.

## File-13 manifest-drift resolution
This regenerated table records file 13 at its actual merged content — **13386 bytes, `e709c9a25ec9e8cfb3836776827e4ecc63f8f0fd568617396c2324e571a1a739`** — which carries the corrected `Ω ≤ 0.95` wording plus the v5.5.1 Kernel Order sync. The stale v5.4.1 declaration (12869 bytes / `f57dcbe2…`, old `Ω=1.0` wording) is superseded here; manifest now matches the file, closing the prior drift.

## Governance trace
- `ADR-20260712-01` — Instructions hardening, accepted.
- `ADR-20260712-02` — Mythic Router, accepted; SoT30 mirror done in v5.2.
- `Amendment A.1` — numeric voice specificity/provenance, accepted.
- `ADR-20260714-01` — Mythic Cognition Router v0.2, accepted; Knowledge-only mirror done in v5.3.
- `ADR-20260714-02` — Mythic Corpus Pass 2 / Arc Routing v0.3, accepted; Knowledge-only mirror done in v5.4.
- `ADR-20260714-03` — executable falsifier / false-premise gate v0.3.1, accepted; Knowledge-only mirror done in v5.4.1.
- `ADR-20260716-01` — Business Projects Runtime Hardening (files 02/22/28/29, T77–T85), accepted; merged PR #264.
- `ADR-20260716-02` — SoT30 Content Integrity (base64 externalize, ontology quarantine, Kernel Order sync, Guard recompute unification, what-if type repair), accepted; merged PR #267.
- `ADR-20260718-01` — v5.5.2 backlog batch (threshold table, RESEARCH-distributed declaration + FOG strengthening, veto-contract fix, SIBYL activation, Mythic Router triggers + usage tracking), accepted.
- `ADR-20260719-01` — v5.5.3 instructions version sync + hash-chain repair, accepted; merged PR #285/#288.
- `ADR-20260720-01` — prune stale SoT30 dist zips (v5.5.2 zip divergent for 06/09/24), accepted; merged PR #286.
- `ADR-20260720-02` — v5.5.4 semantic & runtime-status consistency, accepted; merged PR #289, hardened by PR #291/#292.
- `ADR-20260721-01` — v5.5.5 provenance & version-identity cleanup (this build), accepted; package review pending, live verification pending.

## Current non-claims
- package is not proven uploaded to a live Project (STATIC-PACKAGE-PASS ≠ LIVE-PROJECT-PASS);
- T01–T93 are not yet live-run;
- the bounded-Guard controller is implemented and wired, but `postGuardEws` is a decision-derived **proxy**, not an independently-observed true late-signal EWS (see `11`); the true-late-signal path is E2E-unverified;
- file 15's Supabase overlay is a read-only observation stamped with `observed_at`; migration parity, live schema, live data counts, edge-function deployment, and Projects-Action invocation are independent facts and none is inferred from another;
- file 24's root cause was `verified` in v5.5.4 (raw-blob receipt: two RLS-initplan optimizations, +18 bytes fully accounted); v5.5.5 keeps file 24 byte-identical and makes no new file-24 claim;
- T76 F1/F2/F3 falsifier behavior is statically specified, not verified-live;
- gateway Projects Action/JWT role and Archive/Shadow DB enforcement remain pending;
- current Project memory mode (project-only vs default) for any specific live Project is unknown until explicitly checked;
- retrieval-order of the 30 files inside a live Project is not guaranteed by this document;
- lifecycle (do not conflate stages): ADR-20260720-02 (v5.5.4) is **accepted** and v5.5.4 is merged and immutable; ADR-20260721-01 (v5.5.5) is **accepted**, but this v5.5.5 package/PR is **not yet merged**; live-Project verification is pending; "deployed" is not a synonym for merged or live-verified.
