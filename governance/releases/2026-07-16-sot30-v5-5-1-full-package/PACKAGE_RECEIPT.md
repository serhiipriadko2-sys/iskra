# SoT30 v5.5.1 Full Package — Receipt

Assembled and verified in-session 2026-07-16 by Claude Code, from three authoritative sources on merged `main` (`4f3c087`) plus the v5.4.1 base corpus.

## Artifact

| Item | Value |
|---|---|
| ZIP | `dist/SoT30_v5.5.1.zip` |
| ZIP bytes | 1121758 |
| ZIP sha256 | `9c4f3de628f82ca7b495bf5543262c13ce992578619e919cc728881f974e4066` |
| Knowledge files | 30 (00–29, unique, no `(1)` duplicate) |
| Corpus bytes | 4015759 |
| file 29 sha256 | `fb3405e7b8402c7fee49f91d25db1b7c446c7b2577f5eefea09d42f7212fe067` |
| Project Instructions | 5907 chars, unchanged from v5.4.1 |
| Acceptance range | T01–T85 (contiguous, verified) |

## Verification performed

- 30 unique numbered files, zero `(1)`-suffixed duplicates.
- Every overlaid file's sha256 matched its source PR manifest (v5.5 PR #264 / v5.5.1 PR #267).
- ZIP `unzip -t` clean; extract → `sha256sum -c SHA256SUMS` = 0 failures across all 30 + instructions.
- base64 asset: 0 in corpus. Unwrapped ontology epigraph: 0. Kernel Order synced. Guard floor-gate present. T01–T85 contiguous.
- file-13 manifest drift closed: manifest records the actual 13386-byte / `e709c9a2…` file.

## Boundary

- NOT uploaded to a live ChatGPT Project. NOT `T01`–`T85`-run. `LIVE-PROJECT-PASS` pending.
- NOT a runtime / Supabase / deployment change.
- Composes two already-merged deltas; does not re-open their content decisions.
