# SoT30 v5.5.4 — QC Report

Scope: semantic & runtime-status consistency over the v5.5.3 corpus (ADR-20260720-02, status `accepted` 2026-07-20). Physical integrity of v5.5.3 was already PASS; this build corrects in-corpus prose and adds enforcement.

<!-- composition: changed=10 unchanged=20 baseline=v5.5.3 -->

> **Dated qualification (2026-07-20, PR-C review).** The gate table below records
> the result **at v5.5.4 build time**. An independent review then found that
> several gates were enforced by the verifier more weakly than their labels
> implied (notably T88, T80 "raw-equal", and the secret/"forbidden-content"
> scan). The verifier is hardened in **PR-C** (`fix/sot30-v554-verifier-hardening`);
> rows below are annotated `[build-time proxy → hardened PR-C]` where that applies.
> The **package bytes are unchanged** — only the verifier and these receipts move.
> See `governance/errata/2026-07-20-sot30-v5-5-4-erratum.md`.

| Gate | Result |
|---|---|
| exactly 30 knowledge files, numbers 00–29 unique | PASS |
| file 29 embedded hash table matches `support/SHA256SUMS`/`MANIFEST.json` | PASS — regenerated from final content of 00–28 |
| file 29 does NOT include its own hash in the embedded table (self-reference avoidance) | PASS |
| `MANIFEST.json` `changed_files ∩ unchanged_files = ∅` | PASS — verifier-enforced |
| `MANIFEST.json` `changed_files ∪ unchanged_files` = all 30 knowledge files | PASS — verifier-enforced (PR-C: now exact **set** equality, not just size) |
| README/QC/receipt/manifest/file-29 agree on changed/unchanged composition (T88) | PASS `[build-time proxy → hardened PR-C]` — at build time only the retired-string absence was checked; PR-C adds a real composition-token comparison (C19) across the three release-root docs vs the manifest counts |
| no release-root narrative repeats the retired "28-files-identical" composition claim | PASS |
| version frontmatter consistency (29 → `v5.5.4`) | PASS |
| T80 parity (mirror ↔ standalone instructions) | PASS `[build-time proxy → hardened PR-C]` — at build time a substring `includes()`; PR-C anchors the mirror at `## Project Instructions` and does a **byte-equal** region compare (C7). 5,996 chars both sides, unchanged from v5.5.3 |
| Project Instructions ≤ 6000 chars | PASS — 5,996 (byte-unchanged from v5.5.3) |
| bounded-Guard overlay (11/20/01) matches `runtime/` (controller wired; `postGuardEws` proxy-only; true-late-signal E2E-unverified) | PASS — verified against `runtime/src/types/guardController.ts` + `runtime/iskraSpace/services/policyEngine.ts` |
| Supabase overlay (15) carries `observed_at`/`source`/`freshness`; parity/schema/counts/deployment/invocation kept independent (T89) | PASS — read-only MCP observation |
| historical Ω gloss present in 25; active invariant Ω ≤ 0.95 stated (T90) | PASS |
| file 24 reference-quarantine overlay + raw-blob diff receipt present | PASS — `governance/audits/2026-07-20-sot30-v554/` |
| acceptance range T01–T93 statically continuous (T88–T93 added) | PASS |
| semantic verifier `tools/verify_sot30_release.ts` fail-closed + wired into CI | PASS |
| ZIP integrity (`unzip -t`) | PASS |
| ZIP fresh-extraction: single root + exact allowlist (30 knowledge + 3 support) + `sha256sum -c` 32/32 | PASS — PR-C now rejects extra/undeclared entries and multiple roots (C14) |
| zip entry paths use forward slashes | PASS — built with Python `zipfile` |
| LF line-ending policy (no CRLF in knowledge/support) | PASS |
| forbidden-content / secret scan | PASS `[build-time proxy → hardened PR-C]` — at build time only knowledge files were scanned for a few secret patterns; PR-C implements the advertised coverage: no packaged `.env`/`node_modules`/build-cache/absolute-path artifact, plus tight secret patterns over knowledge + support + audit + scripts (illustrative bare PEM/placeholder env-var strings in the file-24 historical mirror are allowed) |

## Verifier coverage (dated)

- **At v5.5.4 build time (before PR-C):** the package passed a 18-check verifier, but T88, T80, and the forbidden-content scan were necessary-but-insufficient proxies (string presence / substring / knowledge-only). The **package itself is well-formed** — the weakness was in what the verifier *proved*, not in the artifact.
- **After PR-C:** the verifier enforces exact set-equality (knowledge 00–29, `MANIFEST.files`, file-29 table 00–28), `changed ∪ unchanged` = actual filename set, byte-equal T80 mirror extraction, ZIP single-root + exact allowlist, real composition-token agreement (T88/C19), and the full forbidden-content/secret coverage — with a negative-fixture test matrix proving each fails closed.
- **Live-Project:** NOT VERIFIED (unchanged) — see below.

## Package facts

- knowledge files: 30
- corpus bytes: 4,039,379
- Project Instructions: 5,996 chars; byte-equal to the file-00 mirror region (T80, PR-C byte-anchored; unchanged from v5.5.3)
- ZIP: `dist/SoT30_v5.5.4.zip`, 1129867 bytes, sha256 `235abf73040427bbb54016acce880a023db32aab3b7be5d1fc77fc3b1f486772`
- file 29: 11729 bytes, sha256 `9da43a2fc47045eead0e365dc742edb2c8f52087cc58db87c3fc56351afef0e3`
- support/MANIFEST.json sha256 `4f7b5b07de066982c2d10a15eb54804104a56e84a9768c626fa63f067769a016`
- **Known internal inaccuracy:** `support/MANIFEST.json` `generated_from: canonical_git_blobs` — the v5.5.4 build actually read release-tree working bytes, not git blobs. Recorded as erratum; **byte-level fix deferred to v5.5.5** (package is immutable).

## Not checked (explicitly out of scope / pending)

- Live ChatGPT Project upload and T01–T93 live execution — not performed.
- Any runtime behavior change — the Guard/EWS overlay documents current code, it does not alter it.
- (Resolved, not pending) file 24's 18-byte gap root cause is `verified` — the raw-blob receipt fully accounts for it (two RLS-initplan optimizations).

## Boundary

Static, in-repo assembly checks + read-only Supabase observation. No runtime, Supabase-write, or deployment change. No live Project verification. `iskra-memory-gateway` untouched.
