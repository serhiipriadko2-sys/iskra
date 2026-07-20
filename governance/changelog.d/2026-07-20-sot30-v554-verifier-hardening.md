# SoT30 v5.5.4 — verifier/build hardening + ADR accept (PR-C)

Post-merge corrective pass after an independent read-back (ISKRIV) found the shipped `tools/verify_sot30_release.ts` enforced several checks more weakly than their labels, and the ADR/receipt lifecycle was out of sync with the merged package. **No v5.5.4 package bytes change** — `dist/SoT30_v5.5.4.zip` and every `knowledge/`+`support/` file remain byte-identical; fixes are confined to tooling, governance, and release-root receipts (all outside the ZIP).

## ADR
- `ADR-20260720-02` → **accepted** (owner decision 2026-07-20). Lifecycle stages kept distinct: `Status: accepted`, `Package mirror: done`, `Implementation: merged`, `Conformance hardening: pending PR-C`, `Live verification: pending`. Acceptance = the architectural decision, explicitly **not** a claim that the verifier already met its fail-closed contract or that any live-Project run happened.

## Verifier (`tools/verify_sot30_release.ts`) — exact properties, not proxies
- C1/C4/C5: exact **unique set** equality — knowledge = {00..29}, `MANIFEST.files` = the 30 paths, file-29 table = {00..28} (previously only counted rows/length, so a dup+missing pair could slip through).
- C3: `SHA256SUMS` must list exactly {30 knowledge + MANIFEST.json + PROJECT_INSTRUCTIONS} — no missing/extra.
- C7 (T80): mirror is now **byte-equal** to the standalone, extracted at the `## Project Instructions` anchor — a modified mirror fails even if a pristine copy appears elsewhere as a substring (previously a substring `includes()`).
- C10: `changed ∪ unchanged` must equal the **actual** knowledge filename set (previously only size 30).
- C14: ZIP must have a single top-level root and an **exact allowlist** of entries (30 knowledge + 3 support); extra/undeclared entries and second roots now fail (previously only `sha256sum -c`).
- C16: real advertised coverage — scans the actual `knowledge/`+`support/` tree for `.env`/`node_modules`/cache/absolute-path artifacts, plus tight secret patterns over knowledge + support + audit + scripts (illustrative bare-PEM / placeholder env-var strings in the file-24 historical mirror are allowed, matching reality).
- C19 (T88): real composition comparison — README/QC/PACKAGE_RECEIPT carry a `<!-- composition: changed=N unchanged=M -->` token that must agree with each other and with the manifest's actual counts; file 29 must defer to the manifest (previously only a retired-string grep).

## Negative-fixture matrix (`tools/verify_sot30_release.selftest.ts`, wired into `sot_integrity` CI)
Proves fail-closed: the real v5.5.4 PASSes (19/19); 10 tampered temp-copy/temp-zip fixtures each FAIL on the targeted check — file-29 dup+missing / missing row, manifest dup+missing / missing file, foreign name in `unchanged_files`, `.env` in package, README composition mismatch, byte-modified mirror that is still a substring, extra ZIP entry, second ZIP root. Package bytes are never mutated.

## Build script (`tools/build_sot30_release.py`) — future releases only (NOT re-run on v5.5.4)
- Explicit **allowlist** copy (30 named knowledge + 3 named support), not `copytree`.
- `BuildError` raises instead of `assert` (survives `python -O`).
- argparse params: `--version/--baseline/--zip-out/--date/--adr/--baseline-version/--package-name/--acceptance-range/--from-git`.
- Honest provenance: default `generated_from: release_tree_working_bytes`; `--from-git <SHA>` truly extracts blobs via `git show` and labels `canonical_git_blobs`.
- Root name fixed to `SoT30_v<version>/`; reproducibility labelled same-toolchain (pinned mtime), cross-toolchain not guaranteed. Validated on a temp copy → hardened verifier 19/19; v5.5.4 untouched.

## Erratum + receipts (outside the ZIP)
- New `governance/errata/2026-07-20-sot30-v5-5-4-erratum.md`: E1 `generated_from` mislabel (in-package → **byte-fix deferred to v5.5.5**), E2 ZIP root-name inconsistency (deferred), E3 verifier weakness (fixed PR-C), E4 receipt overstatement (fixed PR-C).
- `QC_REPORT.md`/`README.md`/`PACKAGE_RECEIPT.md`: dated `[build-time proxy → hardened PR-C]` qualifications on T88/T80/secret-scan, four readiness levels separated, composition token added — corrected, not silently rewritten.

Ledger + canon-index regenerated. No runtime/Supabase/live-Project change.
