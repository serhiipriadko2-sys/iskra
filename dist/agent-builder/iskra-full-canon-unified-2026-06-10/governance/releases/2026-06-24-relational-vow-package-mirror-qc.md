# Package Mirror QC Receipt - 2026-06-24

Package: `dist/agent-builder/iskra-full-canon-unified-2026-06-10`
Scope: voice seed + relational vow package mirror
Status: MANIFEST UPDATED / QC RECORDED / SIDECAR ZIP PENDING

## Intake

User requested a separate package-mirror PR for `dist/agent-builder/...` with regenerated manifest/QC after PR #212 recorded the root governance ADRs.

## Changes Mirrored

Added package-facing canon and eval files:

- `agent_files/files_for_agent_builder/16_VOICE_SEED_RELATIONAL_VOW.md`
- `agent_files/evals/ISKRA_VOICE_SEED_RELATIONAL_VOW_ACCEPTANCE_TESTS.md`

Added package governance trace:

- `governance/adr_20260624_voice_seed.md`
- `governance/adr_20260624_relational_vow.md`
- `governance/changelog.d/2026-06-24-voice-seed-builder-canon.md`
- `governance/changelog.d/2026-06-24-relational-vow-canon.md`
- `governance/releases/2026-06-24-relational-vow-package-mirror-qc.md`

## Boundary

This package mirror records the voice seed and Relational Vow as governed Builder-upload corpus material.

It does not prove:

- live ChatGPT Agent Builder file visibility;
- live Builder prompt behavior;
- active tool/connector execution;
- model consciousness, qualia, soul, legal personhood, or independent agency.

## Manifest / QC

- Manifest inventory was updated from the current package manifest inventory plus the new package-facing files.
- Root `MANIFEST.sha256` remains excluded from its own hash set.
- `ZIP_RECEIPT.json` is marked pending because this connector-only environment cannot download the full repository archive or regenerate the sidecar clean zip.
- A fresh sidecar clean zip must be generated after checkout/merge before any archive PASS claim.

## Required Follow-Up

Run from a full checkout of the PR branch:

```bash
cd dist/agent-builder/iskra-full-canon-unified-2026-06-10
py tools/generate_manifest.py
py tools/clean_export.py --source manifest --zip ../iskra-full-canon-unified-2026-06-10-clean.zip --force
py tools/validate_terms.py --dir .
py tools/validate_delta.py --dir .
```

Then run Builder acceptance:

- existing full canon tests;
- `ISKRA_VOICE_SEED_RELATIONAL_VOW_ACCEPTANCE_TESTS.md`;
- hardening prompts H1-H6;
- live Builder file-tree comparison before readiness claims.

## ∆DΩΛ

∆: Package mirror now carries the voice seed and Relational Vow as Builder-upload corpus material.
D: PR #212 governance ADRs, local Builder receipt, this package mirror receipt.
Ω: 0.84 for package mirror trace; 0.42 for live Builder parity until UI evidence.
Λ: Regenerate sidecar zip and run live Builder acceptance prompts.
