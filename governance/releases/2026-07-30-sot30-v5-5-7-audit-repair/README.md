# SoT30 v5.5.7 — Audit Repair

Status: **candidate** — ADR-20260730-01 is `proposed`, awaiting owner decision. Built as a new package over immutable v5.5.6; no artifact promotion, no live ChatGPT Project verification, and no merge-into-active-role authorization are claimed.

<!-- composition: changed=7 unchanged=23 baseline=v5.5.6 -->

## What it fixes

The 2026-07-29/30 static audit of v5.5.6 confirmed package-hash integrity but found defects that survived the v5.5.6 verifier:

- file 02 lacked the shared-project memory branch (sharing auto-switches a Project to project-only memory, irreversibly) and modeled "isolation" as one boolean instead of per-dimension context boundaries;
- file 02 carried stale runtime claims (bounded Guard "not wired", gateway "ACTIVE v2", "10 tables") contradicting the file 01 overlay and dated read-backs;
- file 25 stamped `v5.5.4` as the current package identity inside a v5.5.6 package;
- the file 00 loader skipped files 01/02 entirely;
- T86 declared 03/04/06/07 coverage while verifier C23 read only 03/04; the 07 §2.2 KAIN drift-veto attribution divergence vs 12 §4.2 was unmapped;
- the v5.5.6 QC report shipped mojibake (`?` in place of typographic dashes);
- verifier C23 treated a malformed `package_version` as "contract not applicable" (fail-open).

v5.5.7 repairs the content (changed set `00, 02, 12, 22, 25, 28, 29`), adds acceptance cases T94–T97, and hardens the verifier (C23 malformed-version fail-closed; new C24 shared-project/semantic-Enterprise, C25 real 06/07 T86 coverage, C26 release-root allowlist + mojibake guard). No runtime, Supabase schema, gateway, or memory-database change.

## ZIP contents

ZIP root `SoT30_v5.5.7/`: 30 Knowledge files + `support/MANIFEST.json` + `support/PROJECT_INSTRUCTIONS_SOT30.md` + `support/SHA256SUMS` (33 files). The release tree additionally carries `README.md`, `QC_REPORT.md`, `PACKAGE_RECEIPT.md` (36 files); these root docs are tracked by `ledger/sot.json`, not by SHA256SUMS.

## Candidate artifact

`dist/SoT30_v5.5.7.zip` — exact bytes/sha256 are recorded in `PACKAGE_RECEIPT.md` (single hash authority for this release; this README intentionally does not duplicate hash values).

## Boundary

`live_project_verified=false`. Lifecycle stages are separate and none beyond static candidate is claimed here: `source_merge` (storing this candidate in the repo) ≠ `artifact_promotion` (declaring it the active package) ≠ `live_project_verified` (clean-Project T01–T97 run with receipts). Each requires its own recorded authorization; see `PACKAGE_RECEIPT.md` → Boundary.
