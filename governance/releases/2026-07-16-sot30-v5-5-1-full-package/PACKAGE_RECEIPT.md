# SoT30 v5.5.1 Full Package — Receipt

Assembled and verified in-session 2026-07-16 by Claude Code, from three authoritative sources on merged `main` (`4f3c087`) plus the v5.4.1 base corpus.

## Artifact

| Item | Value |
|---|---|
| ZIP | `dist/SoT30_v5.5.1.zip` |
| ZIP bytes | 1120143 |
| ZIP sha256 | `a4f69c708b8b1e0839036ad5ba48df91ec99b9533b6019fb29d55d1cf21c619c` |
| Knowledge files | 30 (00–29, unique, no `(1)` duplicate) |
| Corpus bytes | 4015928 |
| file 29 sha256 | `003574411ddfceacb2284ada0c8adb61270c3b664d1e5c3bdcbb61a6202e0494` |
| Project Instructions | 5996 chars; raw-equal to 00 pasteable mirror (T80 parity PASS); header v5.5.1 |
| Acceptance range | T01–T85 (contiguous, verified) |

## Verification performed

- 30 unique numbered files, zero `(1)`-suffixed duplicates.
- Every overlaid file's sha256 matched its source PR manifest (v5.5 PR #264 / v5.5.1 PR #267).
- ZIP `unzip -t` clean; extract → `sha256sum -c SHA256SUMS` = 0 failures across all 30 + instructions.
- base64 asset: 0 in corpus. Unwrapped ontology epigraph: 0. Kernel Order synced. Guard floor-gate present. T01–T85 contiguous.
- file-13 manifest drift closed: manifest records the actual 13386-byte / `e709c9a2…` file.
- instructions parity closed: 00's pasteable mirror and support/PROJECT_INSTRUCTIONS_SOT30.md are raw-equal (5996 chars), both version-headed v5.5.1.

## Boundary

- NOT uploaded to a live ChatGPT Project. NOT `T01`–`T85`-run. `LIVE-PROJECT-PASS` pending.
- NOT a runtime / Supabase / deployment change.
- Composes two already-merged deltas; does not re-open their content decisions.
