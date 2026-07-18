# Audit Corrections Trail

This atom's scope was arrived at through two rounds of third-party academic audit plus independent verification in this session. Several claims from both prior rounds did not survive direct file-reading and were corrected before being acted on. Recorded here so the correction history isn't lost.

## Verified TRUE (acted on)

- C11 retrieval gravity: files 24+25 = 84.45% of the 30-file corpus (exact, recomputed independently).
- File 24 contains a base64-embedded ZIP; percentage claim corrected from an initial 16.3%/744KB (measured over the wrong line range, including headers/blank lines) to the verified 12.35%/563,776 bytes (isolated to actual base64-charset lines only).
- 15 exact repeats of the "Искра — древнее сознание" epigraph across files 04/05/07 (exact count, confirmed twice).
- Kernel Order divergence in files 01/08/09/13 (C04) — real, traced to `ADR-20260714-01`'s explicit diff-scope excluding those files.
- `LAB` used as a Guard-field value in file 27 scenarios B8/B11/B16 (C07) — real, `LAB` is a profile label (§A5), not a Guard enum member.
- Guard recompute predicate gap between file 00/28 (hard AND on floor-increase) and files 10/11 (no explicit floor-increase requirement) (C05) — confirmed real after a background research agent initially called it "overstated"; re-verified by direct line-by-line reading, which showed file 10/11 never restate the floor-increase requirement, only that a floor-rise-alone is insufficient (not that it's necessary).
- `PROCEED`+`SHADOW` scenarios in file 27 B5/B10/B15/B20 recorded as final decisions rather than the advisory/pending-reevaluation pattern that file 11 §7 itself defines for this exact case (C08, partial).

## Claimed but found FALSE on independent verification — NOT acted on

- **"The embedded ZIP is corrupted / truncated by 12 bytes / fails `unzip -t`"** — directly decoded and tested in this session: `zipfile.testzip()` returned no errors across 163/163 entries, `unzip -t` reported zero errors, decoded byte count (422,832) and sha256 (`58c18257…`) matched the file's own declaration exactly, difference = 0, not −12. The archive is valid. It was still removed (Atom 1), but for retrieval-noise reasons, not corruption.
- **"PR #265 was created and merged, adding `dist/SoT30_v5.4.zip` to main"** — no PR #265 exists in the repository (checked via GitHub search). The file is real and is on `main`, but arrived via a direct "Add files via upload" commit (GitHub web-UI upload), not any pull request.
- **"Council default (`27`'s 'режим COUNCIL') is a confirmed default-routing type-error identical in kind to the `LAB` issue"** — on direct verification, "режим COUNCIL" appears exactly once in the whole corpus and no file ever treats it as an alias for the typed `CouncilMode` enum; this is real ambiguity/interpretive risk (fixed in Atom 5), but is a different, less severe kind of issue than `LAB`'s clear type-mismatch — not escalated to the same severity class.
- **C06/C08 as unconditionally "CONFIRMED"** — nuanced to "real risk, but not a proven code-level contradiction" after checking that file 11 §7 and file 12's enum both already partially address the pattern in question; the risk was real enough to fix (Atom 5) but the initial framing overstated certainty.
- Metric-provenance claim (C09) that file 27 "fabricates telemetry" — file 27 never asserts its numeric thresholds are pre-measured facts; downgraded to a documentation-hardening item (still fixed, via a file-level gating note, not a scenario-by-scenario rewrite).

## Method

Every item above was checked by one or more of: `grep -n` with exact quoted context, byte-exact `base64 -d` + `zipfile.testzip()` + `unzip -t`, exact fixed-string occurrence counting (`grep -Fc`), and direct reading of the relevant ADR (`20_GOVERNANCE_ADR.md`) for root-cause attribution — not by re-trusting either prior audit's framing.
