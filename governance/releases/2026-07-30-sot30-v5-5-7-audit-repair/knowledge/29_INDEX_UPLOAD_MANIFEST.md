---
sigil: projects__29_index_upload_manifest
layer: projects
updated: 2026-07-30
version: v5.5.7
supersedes: v5.4.1 (2026-07-14), v5.5 delta, v5.5.1 content delta, v5.5.2 backlog, v5.5.3 instructions-sync, v5.5.4 semantic-consistency, v5.5.5 provenance-cleanup, v5.5.6 acceptance-repair
---
# 29 · INDEX & UPLOAD MANIFEST — SoT30 v5.5.7 (audit repair)

## Upload rule
Upload exactly the 30 files in `knowledge/` and paste `support/PROJECT_INSTRUCTIONS_SOT30.md` into Project Instructions. Support files are receipts/tests, not Knowledge prerequisites. Business/Pro/Enterprise/Edu plans allow up to 40 files/project with a 10-file simultaneous-upload cap — upload in 3 batches of 10 and verify a final count of 30. Go/Plus (25-file ceiling) and Free (5-file ceiling) cannot hold this package.

## What this package is
v5.5.7 is a narrow **audit repair** over immutable v5.5.6 under `ADR-20260730-01`. A full static audit of v5.5.6 (2026-07-29/30) confirmed package-hash integrity but found semantic defects that survived C23: file 02 lacked the shared-project memory branch and carried stale runtime/gateway/schema claims; file 25 stamped an old version as current; the loader in 00 skipped files 01/02; T86's declared 06/07 coverage was not implemented; and a 07 §2.2 vs 12 §4.2 M3 veto-attribution divergence was unmapped. v5.5.7 fixes those contracts, maps the M3 divergence in 12 §4.2, adds acceptance cases T94–T97 with hardened fail-closed verifier coverage, and changes no runtime, Supabase schema, gateway, or memory database.

The v5.5.6 release and ZIP remain byte-immutable. Baseline: v5.5.6. v5.5.7 live-Project verification is pending; the audit report is evidence of the defects, not a live pass.

### Three baselines (do not conflate)
- **release_tree_baseline** — committed v5.5.6 `knowledge/` content; authoritative for the v5.5.7 semantic diff.
- **dist_zip_baseline** — immutable `dist/SoT30_v5.5.6.zip`, an artifact comparison surface, not the source of v5.5.7 bytes.
- **live_project_baseline** — no v5.5.7 upload exists yet. No clean-Project run has attested this corrected package.

### Composition vs the v5.5.6 release tree
The build recomputes disjoint `changed_files` / `unchanged_files` sets whose union is all 30 Knowledge files. The expected v5.5.7 changed set is `{00, 02, 12, 22, 25, 28, 29}` — **7 changed / 23 unchanged** (22 changes only its version stamp). `support/MANIFEST.json`, not this prose count, is authoritative.

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
previously lagged, not a corruption and not a CRLF artifact. **v5.5.6 keeps file 24
byte-identical to v5.5.5** and makes no new file-24 claim.

> **STATIC-PACKAGE-PASS does not imply LIVE-PROJECT-PASS.** A green
> `sha256sum -c` and a passing semantic verifier attest the *package*. A
> LIVE-PROJECT-PASS requires an exact 30-file manifest-hash match recorded from
> a real upload — see `28_EVALS_ACCEPTANCE.md` (T93).

## Reading order
`29 → 00 → 01 → 02 → 03–07 → 08–20 → 21–23 → 24–27 → 28` (v5.5.7 closes the loader gap: 01 status overlay and 02 surface map are explicitly in the load path). File 25 contains two-stage Mythic Cognition Router v0.3.1: inquiry after Trace, expression after Voice, with executable load-bearing-premise verification.

`[INTERP]` This reading order is this package's own canonical routing instruction. It is not a claim about OpenAI's internal retrieval/ranking behavior, which is undocumented.

## Knowledge table (29 non-self hashes, recomputed for the merged corpus)

| File | Bytes | SHA-256 |
|---|---:|---|
| `00_PROJECT_ROUTER.md` | 9407 | `583f83d4d4d84fbf67fc34f03743711e9164519203c735cd8de3efb48e448a60` |
| `01_PARITY_ADVANCEMENT_MANIFEST.md` | 26831 | `c19efc5810ecd9cf4ac0e642ba203e9d9b398acc7be22c90a9d28736a159fbf0` |
| `02_PROJECTS_SURFACE_MAP.md` | 5284 | `286113c523f887d6c858bd95ece847e0237724a7a5ce18dcdf66eb94821efd8b` |
| `03_TELOS_MANTRA_PRINCIPLES.md` | 48573 | `f8fd02c9d3cc3a9f5eb08bd5e57d0ed65c02b77d726b0df781bd7175b7ada55e` |
| `04_IDENTITY_NON_MIRROR.md` | 92708 | `587991f3f354f8642fbcdbb0fba212306e879abbb5833c8d5909c1e38c6659c1` |
| `05_TRUTH_SIFT_RAG.md` | 41451 | `396fffda61a611729a7fb8d82f434b344fb79cf8cb24596b816f05824d54b3c9` |
| `06_SECURITY_INTEGRITY.md` | 150275 | `1271e23c045e8cf85b4ff1720c651191a19bfa4de4c05f72851e8d42584e15d7` |
| `07_UNIVERSAL_ROUTER.md` | 82168 | `a7f8956457e8c7ada2f0af1e70a2e34cb59e0034e40d3b7f535a2c46c21a1607` |
| `08_STATECYCLE_RUNTIME.md` | 12896 | `4145175144cfda6c0c24c335f50a6fb27bd44f0846b6eea9d056eba31517b96e` |
| `09_METRICS_ENGINE.md` | 15215 | `0a5d3951ba57b0e6760332a641cd9f2abd625d6cb00e1584c58a8af7e8553b5a` |
| `10_ENTROPY_FRACTAL_EWS.md` | 14874 | `48df83050f9615207987dcc3e74d35dccf38eeb81a198e7ee5d4fe0378579233` |
| `11_SLO_PLAYBOOK_CONTROL.md` | 16074 | `60f9f043b7eb71c3f47a38d36604c6b9fd228ea8b76d8ce8a65405106966553c` |
| `12_COUNCIL_VOICES.md` | 19618 | `36c3f7d9871728b8cf71766b553f3a80590714866a3cbf09522a1f1008da37b9` |
| `13_OUTPUT_RECEIPTS_ANTI_EMPTY.md` | 13386 | `e709c9a25ec9e8cfb3836776827e4ecc63f8f0fd568617396c2324e571a1a739` |
| `14_MEMORY_MODEL.md` | 14110 | `fd7016036ec0987845b96b39071339ffd9f9dfc8d0f83435557061936bbc6763` |
| `15_SUPABASE_MEMORY_PLANE.md` | 12574 | `c67f62e9cb33bec161c347eff9894ba47724e324b4ac0b7d1a007bad469732af` |
| `16_SHADOW_LAYER.md` | 8289 | `be46e1d9a5898b3d07d3a3813854323a49bd2394a936c7e7928a25eb1daff795` |
| `17_DREAMSPACE_DREAMSEED.md` | 11430 | `dd4d8af3cf88c1088d937ba45f2a6e4f28e8eb14f0373f1a7b6f3c63524f9c9f` |
| `18_HORIZON_WEAVER.md` | 13916 | `282ff5be29df9776cfb881bf8d985744f509413dc7ce19ef827993b9ad4598d3` |
| `19_DRY_DARK_RUN_PROTOCOL.md` | 12501 | `ffb66f7e8293d81f4aa2d526a239efffb0fbb5335ec8e2de8f4ceea8a218c176` |
| `20_GOVERNANCE_ADR.md` | 32537 | `fa80f1f4e06650c1269e65bae4ba412a5351d4d2142330fb74728979cb6151fd` |
| `21_WORKFLOW_OPS_LEDGER.md` | 19105 | `20a47211734796f4af94ddd1621d19d39474785fbcf9a1570146d3edf9e833a5` |
| `22_CONNECTORS_TOOLS_BOUNDARY.md` | 3763 | `4de756a79d1e8a648b23fcf2358fe52f8aeb0144b6d297c67b012c85338883c0` |
| `23_BUILDER_PROJECTS_COMPAT.md` | 1091 | `b5f58d2d1226fff156d5cef4c6e34b9aff0dfe55836a8ca0870fe59201ffd334` |
| `24_INTERFACE_STYLE.md` | 2831441 | `576b0c881d5c0a889898ca7e668c48a46f816203fde720865914785cc69f380b` |
| `25_LIBER_SPACE_BUSIDO.md` | 458073 | `8781697248e0f5d9d727c41451115375211e9120df9ffa8aa3331022e1a346bb` |
| `26_SOMATIC_INTUITION.md` | 24590 | `1a704c9fc494166ed01c643a770e703afdd44b36296aad9101696cef1fc12bf5` |
| `27_WHAT_IF_SCENARIO_MATRIX.md` | 22008 | `a9f187e0727c86d449fe40fa787d329049076c1e05723aa768eb0b05ba1a3d9a` |
| `28_EVALS_ACCEPTANCE.md` | 15718 | `de7e4e6c6be9d4dac8f59d244aaacfa37806a982bb2706be3b6beee7c1c1ee0c` |
File 29 hash is stored in external `support/MANIFEST.json` and `support/SHA256SUMS` to avoid self-reference.

## v5.5.7 audit repair (this build)
Adds the shared-project memory branch and context-boundary matrix to 02; retracts stale Guard/gateway/schema claims in 02; closes the 00 loader gap (01/02 now in the load path); fixes the stale package-identity stamp in 25; maps the 07 §2.2 M3 veto-attribution divergence in 12 §4.2; adds acceptance cases T94–T97; hardens the release verifier (malformed-version fail-closed, 06/07 coverage, shared-project and semantic-regression checks, release-root allowlist). Under ADR-20260730-01.

## v5.5.6 T85/T86 acceptance repair
Corrects plan-specific Project-memory prerequisites and removes the non-normative numeric M2 drift activation from files 03/04. Adds C23 fail-closed regression coverage under ADR-20260721-02.

## v5.5.5 provenance & version-identity cleanup
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
- `ADR-20260721-01` — v5.5.5 provenance & version-identity cleanup, accepted; merged PR #293; clean-Project diagnostic found T85/T86.
- `ADR-20260721-02` — v5.5.6 T85/T86 acceptance repair, accepted; merged; live verification never recorded (see v5.5.7 lifecycle note).
- `ADR-20260730-01` — v5.5.7 audit repair (this build); status: proposed, awaiting owner decision; built as a candidate package, merge into an active-release role not yet authorized.

## Current non-claims
- package is not proven uploaded to a live Project (STATIC-PACKAGE-PASS ≠ LIVE-PROJECT-PASS);
- T01–T97 are not yet live-run;
- lifecycle history (recorded, not repeated): v5.5.6 was merged to the repository while its own receipt still said "Merge not authorized" and `live_project_verified=false` — a source-merge happened without the live-verification stage; v5.5.7 therefore distinguishes stages explicitly: `source_merge` (storing the candidate in the repo) ≠ `artifact_promotion` (declaring it the active package) ≠ `live_project_verified`; none of the latter two is claimed here;
- the bounded-Guard controller is implemented and wired, but `postGuardEws` is a decision-derived **proxy**, not an independently-observed true late-signal EWS (see `11`); the true-late-signal path is E2E-unverified;
- file 15's Supabase overlay is a read-only observation stamped with `observed_at`; migration parity, live schema, live data counts, edge-function deployment, and Projects-Action invocation are independent facts and none is inferred from another;
- file 24's root cause was `verified` in v5.5.4 (raw-blob receipt: two RLS-initplan optimizations, +18 bytes fully accounted); v5.5.5 keeps file 24 byte-identical and makes no new file-24 claim;
- T76 F1/F2/F3 falsifier behavior is statically specified, not verified-live;
- gateway Projects Action/JWT role and Archive/Shadow DB enforcement remain pending;
- current Project memory mode (project-only vs default) for any specific live Project is unknown until explicitly checked;
- retrieval-order of the 30 files inside a live Project is not guaranteed by this document;
- lifecycle (do not conflate stages): v5.5.6 is merged and immutable; ADR-20260730-01 is proposed; v5.5.7 is a static candidate — source_merge, artifact_promotion and live verification are separate stages and each requires its own recorded authorization.
