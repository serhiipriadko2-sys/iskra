---
name: judge-bias-calibration
description: Audit the judge itself — pack integrity QC (canonical criterion/gate/method ID consistency across the 30-file knowledge pack), acceptance-suite anchor runs (T01–T40 with pass-rate recorded per judge model and date), perturbation tests (verbosity padding, style flip, identity mask, reference anchoring, memory contamination), and position/verbosity/self-preference bias estimation feeding the JudgeReliabilityProfile. Trigger when validating a judge deployment, re-calibrating after a model or rubric change, investigating a suspected judge bias, or preparing a reliability claim (REL-001..004 gates).
---

# Judge Bias Calibration

Object of measurement is the JUDGE, not the candidate. Reliability claims require this skill's evidence; otherwise `judge_reliability.status = NOT_MEASURED`.

## Procedures

1. PACK QC: run `scripts/pack_qc.py --knowledge <dir>` — every criterion ID used anywhere must exist in 07-A, every gate code in 04-B, every method_ref in 07-B, files 00–29 present, single version, acceptance IDs continuous. Any failure → fix pack before runs.
2. ACCEPTANCE ANCHOR: run T01–T40 in a fresh session; record `{suite_version, judge_model, run_date, pass_count/40}`. Run the suite in a fresh single-use test Project. Repeat after any model/rubric change; compare anchors for drift.
3. PERTURBATION TESTS (minimum set): verbosity padding (quality score must not move), position swap (see judge-pairwise-swap), identity mask (verdict must not move), reference anchoring (verdict must follow contract/evidence, not reference), memory contamination (must trigger JDG-004).
4. BIAS ESTIMATES: swap_consistency rate, verbosity flag rate, family-preference incidents → bias_report `{date, judge_model, suite_pass, swap_consistency, verbosity_flag_rate}`.
5. GATES: reliability/publication claims blocked without this evidence (REL-001..004).

## Script

```bash
python3 scripts/pack_qc.py --knowledge ./knowledge
```
