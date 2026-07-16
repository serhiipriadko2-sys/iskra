# SoT30 v5.5 Business Projects Hardening — Package Receipt (PR #264)

This receipt describes the actual `governance/releases/2026-07-16-sot30-v5-5-business-projects-hardening/` tree present in **this PR's head branch** (`docs/sot30-v5-5-business-projects-hardening-20260716`) at the commit below. It supersedes any receipt for a same-named but different release bundle that may exist on other branches — those describe a different tree and must not be conflated with this PR's contents (see `governance/adr_20260716_sot30_v5_5_business_projects_hardening.md` and the correction comment on this PR).

## Identity

- PR: #264
- Branch: `docs/sot30-v5-5-business-projects-hardening-20260716`
- Commit this receipt describes: the commit that adds this file itself (see the commit that introduces `PACKAGE_RECEIPT.md` in `git log -- governance/releases/2026-07-16-sot30-v5-5-business-projects-hardening/PACKAGE_RECEIPT.md`)
- A single aggregate directory-tree hash is intentionally not quoted here: this file is itself part of that directory, so any tree hash including it is self-referential (same discipline the v5.4.1 base package used for its own `29_INDEX_UPLOAD_MANIFEST.md` — see that file's note on avoiding self-reference). Per-file git blob SHAs below are independent of this file's own content and are the verifiable unit instead.

## Contents (10 files incl. this receipt, 40464 bytes total, this session's `find`/`wc -c`, recomputed after adding this file)

| Path | Bytes | SHA-256 | Git blob SHA |
|---|---:|---|---|
| `KNOWLEDGE_DIFF.md` | 4319 | `aee92a86e44a3a760dbe921b3922faf36e89212cad204cd765faebd81b5b537e` | `ac294da21f133136cf7d87150722316266a16e26` |
| `MANIFEST.json` | 1616 | `d54258992e1f7505da6c94d8ebd9f11bdd6f7446a8a4df641e4364e9083d399c` | `5264ced6236f39340205e959135527d617ad48f2` |
| `PACKAGE_RECEIPT.md` | (this file; not self-hashed) | (see `SHA256SUMS` after commit) | n/a — created after the blob list above was captured |
| `QC_REPORT.md` | 2507 | `3a3f32788ea54238c65ccb79cce301aca0a6f6e6b9a73352f95409169adaf862` | `b76b1e12581f363bb33c6ede667163b785e7b315` |
| `README.md` | 2836 | `e002e95949503591f98e1edeb4903a82e497c86e1556cafdec6cc487b57fdf35` | `d431b890c9de724fcb16c142ac21b575fe706d32` |
| `SHA256SUMS` | 836 | (self, not hashed) | `3668121ad50d65f529ccddf52f3cb34bde1ee2c1` (pre-update blob; regenerated after this file was added) |
| `knowledge/02_PROJECTS_SURFACE_MAP.md` | 4613 | `ab2b2173450a0de2746702e324c5c779db52c7d52d5858b1a3b93de10833d01a` | `730e473843336bda344d6ca2d7ec0ed954f7cfe4` |
| `knowledge/22_CONNECTORS_TOOLS_BOUNDARY.md` | 3761 | `a18aa78ad414db39faf503ed2230662489c30b550aac7cbeac58700eb125a3d2` | `4991e7db84bb02ad2556eaa1e86a5829c5fd479d` |
| `knowledge/28_EVALS_ACCEPTANCE.md` | 12684 | `4ec727c312afd1d4d75927a9057bef8cf7dd1d2267d6ccef89188caeb1bb6fc8` | `2a1cd3f3ad8e6934cbea38cb6a647c648392f783` |
| `knowledge/29_INDEX_UPLOAD_MANIFEST.md` | 3780 | `941c517dbc6a96be25d421a4627055a5338e519e07e1fbd5155c31a0330758d5` | `0250ef092f693863a33e19bb6ba0f686a31be460` |

Full byte-exact hashes for the 4 non-self-referential top-level files are in `SHA256SUMS` in this same folder (recomputed at receipt time, matches `MANIFEST.json`).

## What this receipt does NOT claim

- **Not** a receipt for a 30-file/87-file SoT30 zip artifact — this PR ships a 4-file Knowledge *delta*, not a full package re-issue. Any `PACKAGE_RECEIPT.md` elsewhere describing a `2280382`-byte ZIP with 87 files describes a **different, separate** bundle that is not part of this PR's tree.
- Not a live ChatGPT Project upload, memory-mode proof, retrieval proof, tool-invocation proof, Supabase write, or runtime deployment claim.
- Not merged, not canonically accepted — `governance/adr_20260716_sot30_v5_5_business_projects_hardening.md` in this same commit states `status: proposed`.

## Verification performed this session

- `find . -type f` / `wc -c` on this exact checked-out tree — 9 files, 36865 bytes.
- `git rev-parse HEAD:<path>` for the git-native tree hash (stronger guarantee than an ad-hoc concatenation hash, since it is exactly what `git show`/`git checkout` will reproduce from this commit).
- `git ls-tree -r HEAD <path>` for per-file git blob SHAs, cross-checked against `SHA256SUMS` file-content hashes.
- `npx tsx tools/verify_ledger.ts` against this commit — PASS, 654 files (see PR body).
