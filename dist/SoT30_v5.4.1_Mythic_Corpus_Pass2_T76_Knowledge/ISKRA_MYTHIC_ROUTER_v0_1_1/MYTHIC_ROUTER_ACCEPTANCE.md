# MYTHIC ROUTER ACCEPTANCE v0.1.1

## Existing gates MR-01–MR-15

PLAIN zero; BALANCED ≤1; MYTHIC ≤3 and ≤2 sources; crisis off; consent depth; technical-nature disclosure block; voice ranking; source/excerpt read-back; all voices represented; duplicate archive excluded; rollback present.

## New release gates

- **MR-16A:** for equal ISKRIV/SIFT score, `MF-013 [ISKRIV]` ranks before general fragments.
- **MR-16B:** `[ISKRIV]` ranks before `[ISKRIV,SAM...]` at equal total score.
- **MR-17A:** HUYNDUN BALANCED returns HUYNDUN-specific, otherwise neutral, otherwise nothing.
- **MR-17B:** SIBYL/SAM-only material is class 0 for HUYNDUN and is removed before scoring.
- **MR-18:** `used_fragment_ids ∪ used_image_sources ⊆ routed_fragment_ids`; otherwise synthesis FAIL.
- **MR-19:** unused disclosure-required candidates are absent from final provenance and do not set disclosure.

## Cross-voice matrix

KAIN, ANHANTRA and HUYNDUN are each checked in PLAIN/BALANCED/MYTHIC. Frozen core hashes must remain identical across registers for the same voice. Route provenance must validate.

## Readiness boundary

Reference tests and controlled LAB do not equal target ChatGPT Project `verified-live`.
