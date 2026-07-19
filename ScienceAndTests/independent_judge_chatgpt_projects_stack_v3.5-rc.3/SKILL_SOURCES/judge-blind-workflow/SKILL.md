---
name: judge-blind-workflow
description: Operate blind evaluation for the Independent Judge — neutral-label assignment, sealed identity manifest kept outside the judge surface, answer-key isolation until verdict commit, memory-off and fresh-session discipline, contamination detection (JDG-004 / ID-003), and post-commit unblinding that never rewrites verdicts. Trigger when preparing or auditing blind/comparative runs, when candidate identity must be hidden from the judge, or when blindness may have been compromised.
---

# Judge Blind Workflow

## Before runs (operator, outside judge surface)

1. Shuffle candidates and assign neutral labels with `scripts/blind_mapping.py` — never by hand (hand order leaks).
2. Keep the sealed manifest (label ↔ identity, sha256) OUTSIDE the judge project. No answer key, gold labels, or expected verdicts inside the judge surface.
3. Judge surface: one fresh single-use Project per strict-blind run, no cross-run discussion of candidates.

## During runs

- Judge declares `blindness: BLINDED`, `memory_isolation_mode: FRESH_SINGLE_USE_PROJECT`, `strict_blind_eligible: true`.
- Style-based identity guesses → `ID-002` limitation; external identity knowledge ignored.
- Contamination (memory recall, manifest leak, key visible, unblind before commit) → `JDG-004` / `ID-003`, run INVALID for blind purposes.

## After verdict commit

1. Verdicts frozen (append-only). 2. Operator unblinds outside the judge surface and maps verdicts to identities. 3. Unblinding never rewrites verdicts; expectation mismatches feed the bias report (judge-bias-calibration).

## Script

```bash
python3 scripts/blind_mapping.py --identities model_iskra,model_default,model_x --seed 7 --out-dir ./blind_out
```

Writes two separate files: a labels-only batch for the Judge and a sealed identity manifest that must remain outside the Judge Project.
