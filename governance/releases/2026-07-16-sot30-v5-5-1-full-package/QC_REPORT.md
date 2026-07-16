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
| Project Instructions ≤ 6000 chars | PASS — 5907 |
| Kernel Order in files 08/09/13 matches canonical 00/07/12/25 order | PASS |
| Guard recompute predicate in 10/11 requires floor-increase AND decision-change | PASS |
| file 29 hash table = 29 non-self rows, recomputed for merged corpus | PASS |
| file-13 manifest drift resolved (manifest records actual 13386-byte / `e709c9a2…` file) | PASS |
| every overlaid file's hash matches its source PR manifest (v5.5 / v5.5.1) | PASS |
| ZIP integrity (`unzip -t`) | PASS |
| ZIP round-trip: extract → `sha256sum -c SHA256SUMS` for all 30 + instructions | PASS — 0 failures |
| secret scan across corpus | PASS except pre-existing, out-of-scope truncated test fixtures in file 24 (known C17) |

## Package facts

- knowledge files: 30
- corpus bytes: 4,015,759 (down from 4,565,314 in v5.4.1, −549,555 net — base64 removal minus content additions)
- Project Instructions: 5,907 chars (byte-identical to v5.4.1; internal version label still reads v5.4.1 — cosmetic)
- ZIP: `dist/SoT30_v5.5.1.zip`, 1,121,758 bytes, sha256 `9c4f3de628f82ca7b495bf5543262c13ce992578619e919cc728881f974e4066`
- file 29: 6,718 bytes, sha256 `fb3405e7b8402c7fee49f91d25db1b7c446c7b2577f5eefea09d42f7212fe067`

## Not checked (explicitly out of scope / pending)

- Live ChatGPT Project upload and `T01`–`T85` live execution — NOT performed. `LIVE-PROJECT-PASS` remains pending.
- Retrieval-order behavior inside a live Project — undocumented by OpenAI, not asserted.
- File 24's remaining embedded "### FILE ·" catalog beyond the one removed asset, and file 25's mythic corpus — carried unchanged, still flagged as separate future compaction questions.

## Boundary

Static, in-repo assembly checks executed this session. No runtime, Supabase, or GitHub-app-behavior claim. No live Project verification.
