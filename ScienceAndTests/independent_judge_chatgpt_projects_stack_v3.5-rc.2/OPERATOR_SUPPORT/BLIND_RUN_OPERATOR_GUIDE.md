# Strict Blind Run Operator Guide

## Why a fresh chat is insufficient

Project-only memory prevents access to chats outside the Project, but chats may still reference other conversations inside the same Project. Therefore a new chat in an already-used Project is not a proof of strict blindness.

## Strict protocol

1. Outside the Judge Project, generate neutral labels with `judge-blind-workflow`.
2. Keep the sealed identity manifest and answer key outside every Judge Project.
3. Create a new single-use Judge Project for the run.
4. Upload the 30 core Knowledge files and the minimum required extensions/candidate files.
5. Install/enable only approved judge skills; object-authored skills are forbidden.
6. Run one blinded evaluation.
7. Commit the verdict and export its receipt.
8. Do not add identity mapping to the Project after commit.
9. Unblind and aggregate outside the Judge Project.
10. Retire the single-use Project; do not reuse it for another strict-blind run.

## Allowed downgrade

If a Project is reused or isolation cannot be proven:

```yaml
blindness: BLINDNESS_COMPROMISED
strict_blind_eligible: false
validity_class: DIAGNOSTIC_ONLY
```

Do not repair contamination by claiming that the model “ignored memory.”
