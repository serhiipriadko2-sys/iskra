# SoT30 Content Integrity Patch (ATOM-S30-CONTENT-001)

- Added `ADR-20260716-02` proposing a 12-file content-correctness patch to the SoT30 v5.4.1 Knowledge corpus: removed a 563KB embedded base64 ZIP from file 24 (independently confirmed valid before removal, not corrupted); quarantined 15 repeated unqualified "ancient consciousness" claims in active files 04/05/07; synced stale Kernel Order references in files 01/08/09/13; unified the Guard recompute predicate across files 10/11/20; fixed Council-default/`LAB`-type/advisory-mapping/metric-provenance issues in file 27.
- Added full release tree under `governance/releases/2026-07-16-sot30-v5-5-1-content-integrity/`, including an `AUDIT_CORRECTIONS.md` documenting which third-party audit claims were independently confirmed vs. found false/overstated on direct verification.
- Scope: Knowledge-only. No `runtime/`, Supabase, or GitHub app behavior changed. No live ChatGPT Project verification performed.
