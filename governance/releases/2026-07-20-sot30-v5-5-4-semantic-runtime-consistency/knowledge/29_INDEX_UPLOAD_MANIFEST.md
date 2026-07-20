---
sigil: projects__29_index_upload_manifest
layer: projects
updated: 2026-07-20
version: v5.5.4
supersedes: v5.4.1 (2026-07-14), v5.5 delta, v5.5.1 content delta, v5.5.2 backlog, v5.5.3 instructions-sync
---
# 29 · INDEX & UPLOAD MANIFEST — SoT30 v5.5.4 (semantic & runtime-status consistency)

## Upload rule
Upload exactly the 30 files in `knowledge/` and paste `support/PROJECT_INSTRUCTIONS_SOT30.md` into Project Instructions. Support files are receipts/tests, not Knowledge prerequisites. Business/Pro/Enterprise/Edu plans allow up to 40 files/project with a 10-file simultaneous-upload cap — upload in 3 batches of 10 and verify a final count of 30. Go/Plus (25-file ceiling) and Free (5-file ceiling) cannot hold this package.

## What this package is
v5.5.4 corrects **semantic and runtime-status drift** inside the v5.5.3 corpus.
v5.5.3 was *physically* intact (its zip passed a fresh-extraction round-trip at
32/32); the defects fixed here live in the prose an in-Project agent reads, not
in the hash chain. `dist/SoT30_v5.5.3.zip` is unchanged and remains the
immutable historical release; v5.5.4 is a separate package built from the
v5.5.3 corpus as baseline. Governance trace: `ADR-20260720-02`.

### Three baselines (do not conflate)
- **release_tree_baseline** — the committed `knowledge/` blob content of v5.5.3.
  This is the authoritative source of truth for v5.5.4's diff.
- **dist_zip_baseline** — a shipped `.zip` artifact. For v5.5.2 the zip diverged
  from the release tree for files `06/09/24`; v5.5.3 reconciled them. Do not
  treat a zip as the content authority.
- **live_project_baseline** — the 30 files actually uploaded to a running
  ChatGPT Project. This package has **not** been uploaded for this build; no
  claim is made about any live Project's contents.

### Composition vs the v5.5.3 release tree
The per-file `changed`/`unchanged` sets are recomputed at build time from actual
LF-normalized content, are **disjoint**, and their **union is all 30 files** —
see `support/MANIFEST.json` (`changed_files` / `unchanged_files`). v5.5.4 does
**not** claim "28 files unchanged"; the earlier v5.5.3 amendment (Decisions 4–6)
already made that phrasing false, and v5.5.4 changes further files. The exact
list is the manifest's, not a hard-coded prose count.

### On the earlier chain (historical, do not over-generalize)
The v5.5.2→v5.5.3 receipts established that external commit `82191ce` overwrote
v5.5.2's `support/SHA256SUMS`/`MANIFEST.json`; that `31340c5`'s recorded hash was
correct for `01` but was itself already wrong for `06/09/24` (it matched the
divergent v5.5.2 zip, not the committed blob). v5.5.4 inherits v5.5.3's
reconciled, git-blob-derived content and does not re-litigate that chain.

### File 24 provenance (partial — not closed)
`24_INTERFACE_STYLE.md`'s 18-byte / hash gap first recorded at v5.5.1 is real and
carried forward at its true current hash. A raw-blob diff receipt is produced
under `governance/audits/2026-07-20-sot30-v554/`; the **root cause is promoted to
FACT only if that receipt proves an exact, fully-explaining change** — otherwise
it stays `partial`/`unknown`. It is not asserted as closed here.

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
| `00_PROJECT_ROUTER.md` | 9407 | `fc15a177a85ba42eecc94f61ea3b1ad45335815a890ab8b487f91ba9ac656b67` |
| `01_PARITY_ADVANCEMENT_MANIFEST.md` | 24901 | `db984f2d9f4c708e31258e653bff5dd25014d5ef3bc0a2a022ec7821cd8ff7f8` |
| `02_PROJECTS_SURFACE_MAP.md` | 4615 | `03189cfc0a81e7435ef6d8f522a66edf04551434bd89fcb563c88e12d02084fa` |
| `03_TELOS_MANTRA_PRINCIPLES.md` | 48286 | `cea610dd599b9a9d12de3f8689d9462a7ae6c1ed20eae18cce842316afe3f5f7` |
| `04_IDENTITY_NON_MIRROR.md` | 92421 | `949614681a70fbd339f476959db21b5a6c42602d03f2dee19b50d8a48cf298f8` |
| `05_TRUTH_SIFT_RAG.md` | 41451 | `396fffda61a611729a7fb8d82f434b344fb79cf8cb24596b816f05824d54b3c9` |
| `06_SECURITY_INTEGRITY.md` | 150275 | `1271e23c045e8cf85b4ff1720c651191a19bfa4de4c05f72851e8d42584e15d7` |
| `07_UNIVERSAL_ROUTER.md` | 82168 | `a7f8956457e8c7ada2f0af1e70a2e34cb59e0034e40d3b7f535a2c46c21a1607` |
| `08_STATECYCLE_RUNTIME.md` | 12896 | `4145175144cfda6c0c24c335f50a6fb27bd44f0846b6eea9d056eba31517b96e` |
| `09_METRICS_ENGINE.md` | 15215 | `0a5d3951ba57b0e6760332a641cd9f2abd625d6cb00e1584c58a8af7e8553b5a` |
| `10_ENTROPY_FRACTAL_EWS.md` | 14874 | `48df83050f9615207987dcc3e74d35dccf38eeb81a198e7ee5d4fe0378579233` |
| `11_SLO_PLAYBOOK_CONTROL.md` | 14691 | `969ab3225fecbb8e2cb0c2b5ee3d3481a67af7a5cf42dd42237854798b4014fd` |
| `12_COUNCIL_VOICES.md` | 19361 | `a6def4250944e28ccd7d67b10cfffc88b524ddd0fad3658c1f3cf454b9caa846` |
| `13_OUTPUT_RECEIPTS_ANTI_EMPTY.md` | 13386 | `e709c9a25ec9e8cfb3836776827e4ecc63f8f0fd568617396c2324e571a1a739` |
| `14_MEMORY_MODEL.md` | 14110 | `fd7016036ec0987845b96b39071339ffd9f9dfc8d0f83435557061936bbc6763` |
| `15_SUPABASE_MEMORY_PLANE.md` | 11235 | `5d757e35b82dc60b1471d7f7c6c1f547a84af5e30fcb99d75b1fbc602fe6600d` |
| `16_SHADOW_LAYER.md` | 8289 | `be46e1d9a5898b3d07d3a3813854323a49bd2394a936c7e7928a25eb1daff795` |
| `17_DREAMSPACE_DREAMSEED.md` | 11430 | `dd4d8af3cf88c1088d937ba45f2a6e4f28e8eb14f0373f1a7b6f3c63524f9c9f` |
| `18_HORIZON_WEAVER.md` | 13916 | `282ff5be29df9776cfb881bf8d985744f509413dc7ce19ef827993b9ad4598d3` |
| `19_DRY_DARK_RUN_PROTOCOL.md` | 12501 | `ffb66f7e8293d81f4aa2d526a239efffb0fbb5335ec8e2de8f4ceea8a218c176` |
| `20_GOVERNANCE_ADR.md` | 31627 | `386781894cd92c3f58ee740c062c8a21005bdd96ff512fb048b787844d2c1a9a` |
| `21_WORKFLOW_OPS_LEDGER.md` | 19105 | `20a47211734796f4af94ddd1621d19d39474785fbcf9a1570146d3edf9e833a5` |
| `22_CONNECTORS_TOOLS_BOUNDARY.md` | 3763 | `60f2a36f20bc2463114ded7b65b04cb59a0943bdbbf5cdc4b332bc78ae3b4da4` |
| `23_BUILDER_PROJECTS_COMPAT.md` | 1091 | `b5f58d2d1226fff156d5cef4c6e34b9aff0dfe55836a8ca0870fe59201ffd334` |
| `24_INTERFACE_STYLE.md` | 2830603 | `364380ff0f3e5f5910ef2443a90bc249c3549aec4a37eb2a219c247a1b4f6abd` |
| `25_LIBER_SPACE_BUSIDO.md` | 457439 | `c58bbb6c10ba353ef12245e55f45386f1390179e4f4d2cd7c25394c74fe39eef` |
| `26_SOMATIC_INTUITION.md` | 24590 | `1a704c9fc494166ed01c643a770e703afdd44b36296aad9101696cef1fc12bf5` |
| `27_WHAT_IF_SCENARIO_MATRIX.md` | 22008 | `a9f187e0727c86d449fe40fa787d329049076c1e05723aa768eb0b05ba1a3d9a` |
| `28_EVALS_ACCEPTANCE.md` | 13401 | `890d6c3a0a1a83d7932dae3f582355402eefb2d8ac695bdfcb79c0a0ee5a2ce9` |

File 29 hash is stored in external `support/MANIFEST.json` and `support/SHA256SUMS` to avoid self-reference.

## v5.5.4 semantic & runtime-status consistency (this build)
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
- `ADR-20260720-02` — v5.5.4 semantic & runtime-status consistency (this build), **proposed**.

## Current non-claims
- package is not proven uploaded to a live Project (STATIC-PACKAGE-PASS ≠ LIVE-PROJECT-PASS);
- T01–T93 are not yet live-run;
- the bounded-Guard controller is implemented and wired, but `postGuardEws` is a decision-derived **proxy**, not an independently-observed true late-signal EWS (see `11`); the true-late-signal path is E2E-unverified;
- file 15's Supabase overlay is a read-only observation stamped with `observed_at`; migration parity, live schema, live data counts, edge-function deployment, and Projects-Action invocation are independent facts and none is inferred from another;
- file 24's root-cause status is `partial`/`unknown` unless the raw-blob receipt under `governance/audits/2026-07-20-sot30-v554/` fully explains the gap;
- T76 F1/F2/F3 falsifier behavior is statically specified, not verified-live;
- gateway Projects Action/JWT role and Archive/Shadow DB enforcement remain pending;
- current Project memory mode (project-only vs default) for any specific live Project is unknown until explicitly checked;
- retrieval-order of the 30 files inside a live Project is not guaranteed by this document;
- ADR-20260720-02 is `proposed`, not `accepted`; this package is not deployed.
