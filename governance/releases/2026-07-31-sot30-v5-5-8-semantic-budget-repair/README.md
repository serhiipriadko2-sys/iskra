# SoT30 v5.5.8 — Semantic Self-Contradiction + Budget Repair

Status: static candidate. Package ADR-20260731-01 is proposed; behavior ADR-20260730-02 (`PINO_FIRST_STRIKE_V1`) remains accepted and carried forward unchanged.

<!-- composition: changed=6 unchanged=24 baseline=v5.5.7 -->

Fixes a self-contradiction that survived v5.5.7's own repair: file 28's `T96-LOADER-COVERAGE` row still called file 01 "status overlay" after v5.5.7 reclassified it historical. Extends `C28` to validate file 28's independent loader-route copy token-exact. Compresses Project Instructions 5996 → 5599 chars (wording only, every normative clause preserved) under a new internal `release_ceiling=5600` (`hard_ceiling=6000`, reserve ≥400), floor-gated to v5.5.8+. Files 02/22 carry a version-stamp-only bump (`C12`); no body change. Not independently adversarial-reviewed (unlike v5.5.4–v5.5.7).

Artifact: `dist/SoT30_v5.5.8.zip`. STATIC-PACKAGE-PASS does not imply LIVE-PROJECT-PASS.
