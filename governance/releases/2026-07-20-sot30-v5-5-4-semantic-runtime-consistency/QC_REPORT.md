# SoT30 v5.5.4 — QC Report

Scope: semantic & runtime-status consistency over the v5.5.3 corpus (ADR-20260720-02, status `proposed`). Physical integrity of v5.5.3 was already PASS; this build corrects in-corpus prose and adds enforcement.

| Gate | Result |
|---|---|
| exactly 30 knowledge files, numbers 00–29 unique | PASS |
| file 29 embedded hash table matches `support/SHA256SUMS`/`MANIFEST.json` | PASS — regenerated from final content of 00–28 |
| file 29 does NOT include its own hash in the embedded table (self-reference avoidance) | PASS |
| `MANIFEST.json` `changed_files ∩ unchanged_files = ∅` | PASS — verifier-enforced |
| `MANIFEST.json` `changed_files ∪ unchanged_files` = all 30 knowledge files | PASS — verifier-enforced |
| README/QC/receipt/manifest/file-29 agree on changed/unchanged composition (T88) | PASS |
| no release-root narrative repeats the retired "28-files-identical" composition claim | PASS |
| version frontmatter consistency (29 → `v5.5.4`) | PASS |
| T80 parity (mirror ↔ standalone instructions, raw-equal) | PASS — 5,996 chars both sides, unchanged from v5.5.3 |
| Project Instructions ≤ 6000 chars | PASS — 5,996 (byte-unchanged from v5.5.3) |
| bounded-Guard overlay (11/20/01) matches `runtime/` (controller wired; `postGuardEws` proxy-only; true-late-signal E2E-unverified) | PASS — verified against `runtime/src/types/guardController.ts` + `runtime/iskraSpace/services/policyEngine.ts` |
| Supabase overlay (15) carries `observed_at`/`source`/`freshness`; parity/schema/counts/deployment/invocation kept independent (T89) | PASS — read-only MCP observation |
| historical Ω gloss present in 25; active invariant Ω ≤ 0.95 stated (T90) | PASS |
| file 24 reference-quarantine overlay + raw-blob diff receipt present | PASS — `governance/audits/2026-07-20-sot30-v554/` |
| acceptance range T01–T93 statically continuous (T88–T93 added) | PASS |
| semantic verifier `tools/verify_sot30_release.ts` fail-closed + wired into CI | PASS |
| ZIP integrity (`unzip -t`) | PASS |
| ZIP round-trip: `sha256sum -c support/SHA256SUMS` from a fresh extraction | PASS — 32/32 OK, 0 failures |
| zip entry paths use forward slashes | PASS — built with Python `zipfile` |
| LF line-ending policy (no CRLF in knowledge/support) | PASS |
| secret scan over v5.5.4 release + audits + new scripts | PASS — no secrets |

## Package facts

- knowledge files: 30
- corpus bytes: 4,039,379
- Project Instructions: 5,996 chars; raw-equal to file 00 mirror (T80, unchanged from v5.5.3)
- ZIP: `dist/SoT30_v5.5.4.zip`, 1129867 bytes, sha256 `235abf73040427bbb54016acce880a023db32aab3b7be5d1fc77fc3b1f486772`
- file 29: 11729 bytes, sha256 `9da43a2fc47045eead0e365dc742edb2c8f52087cc58db87c3fc56351afef0e3`
- support/MANIFEST.json sha256 `4f7b5b07de066982c2d10a15eb54804104a56e84a9768c626fa63f067769a016`

## Not checked (explicitly out of scope / pending)

- Live ChatGPT Project upload and T01–T93 live execution — not performed.
- Any runtime behavior change — the Guard/EWS overlay documents current code, it does not alter it.
- (Resolved, not pending) file 24's 18-byte gap root cause is `verified` — the raw-blob receipt fully accounts for it (two RLS-initplan optimizations).

## Boundary

Static, in-repo assembly checks + read-only Supabase observation this session. No runtime, Supabase-write, or deployment change. No live Project verification. `iskra-memory-gateway` untouched.
