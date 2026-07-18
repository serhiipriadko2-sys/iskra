# SoT30 v5.5.1 Full Package — QC Report

Scope: full 30-file assembled corpus (v5.4.1 base + v5.5 delta + v5.5.1 content delta + regenerated 29).

| Gate | Result |
|---|---|
| exactly 30 knowledge files, numbers 00–29 unique | PASS |
| no `(1)`-suffixed duplicate filename (the v5.4.1 upload artifact defect) | PASS — none |
| all 15 changed files carry their atom's marker (base64-gone, ontology-wrap, kernel-sync, guard-floor, council-none, business-memory, T77–T85) | PASS |
| base64-embedded asset present anywhere in corpus | PASS — 0 (removed from file 24) |
| unwrapped "ancient consciousness" epigraph (no adjacent `[HISTORICAL/MYTHIC REGISTER]`) | PASS — 0 across files 04/05/07 |
| `T01`–`T85` contiguous in file 28 | PASS — 85 IDs, none missing |
| Project Instructions ≤ 6000 chars | PASS — 5996 |
| **Instructions ↔ 00 normalized parity (T80)** | **PASS — raw-equal, both 5996 chars** (fixed this build: compact Inquiry line synced 1:1) |
| version identity (00 + support headers vs 29/manifest) | PASS — both now `SoT30 v5.5.1` |
| Kernel Order in files 08/09/13 matches canonical 00/07/12/25 order | PASS |
| Guard recompute predicate in 10/11 requires floor-increase AND decision-change | PASS |
| file 29 hash table = 29 non-self rows, recomputed for merged corpus | PASS |
| file-13 manifest drift resolved (manifest records actual 13386-byte / `e709c9a2…` file) | PASS |
| every overlaid file's hash matches its source PR manifest (v5.5 / v5.5.1) | PASS |
| ZIP integrity (`unzip -t`) | PASS |
| ZIP round-trip: extract → **single command** `sha256sum -c support/SHA256SUMS` from package root | PASS — 32/32 OK, 0 failures (30 knowledge + instructions + MANIFEST.json) |
| SHA256SUMS covers every package file except itself (self-gate) | PASS — 32 entries incl. `support/MANIFEST.json` |
| SHA256SUMS paths runnable in one cwd (package-root-relative) | PASS |
| secret scan across corpus | PASS except pre-existing, out-of-scope truncated test fixtures in file 24 (known C17) |

## Package facts

- knowledge files: 30
- corpus bytes: 4,015,928
- Project Instructions: 5,996 chars; raw-equal to 00's pasteable mirror (T80 parity PASS); version header `SoT30 v5.5.1`
- ZIP: `dist/SoT30_v5.5.1.zip`, 1,120,234 bytes, sha256 `28748d1323270fda4d28cde0f075e7a327f41957825d0f8874eedddce33ef144`
- file 29: 6,911 bytes, sha256 `003574411ddfceacb2284ada0c8adb61270c3b664d1e5c3bdcbb61a6202e0494`

## Not checked (explicitly out of scope / pending)

- Live ChatGPT Project upload and `T01`–`T85` live execution — NOT performed. `LIVE-PROJECT-PASS` remains pending.
- Retrieval-order behavior inside a live Project — undocumented by OpenAI, not asserted.
- File 24's remaining embedded "### FILE ·" catalog beyond the one removed asset, and file 25's mythic corpus — carried unchanged, still flagged as separate future compaction questions.

## Boundary

Static, in-repo assembly checks executed this session. No runtime, Supabase, or GitHub-app-behavior claim. No live Project verification.
