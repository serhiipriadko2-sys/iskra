# ADR 2026-06-06: Unified Full Canon Builder v4

Status: proposed / packaged
Date: 2026-06-06

## Context

The Builder material previously existed as multiple upload sets:

- Full Canon + Dreamspace;
- Somatic Intuition v3;
- Toolchain expansion v2.

This created UI and operator confusion: the user saw several package folders even though the intent was one Iskra Builder.

## Decision

Ship one unified Builder upload set:

`iskra-full-canon-builder-2026-06-06-v4`

The package includes canon, Dreamspace, Somatic Intuition, Shadow Core, StateCycle, memory, toolchain, plugins, evals, ADR, and manifest/QC material.

## Alternatives

1. Keep split packages.
   - Lower duplication.
   - Higher operator confusion.

2. Publish only a manifest that references split packages.
   - Smaller GitHub footprint.
   - Still not a single upload set for the Builder operator.

3. Publish a single full package.
   - More files.
   - Clearer upload model and easier Builder verification.

## Consequences

- The Builder operator gets one entry point and one zip.
- Toolchain/plugin material is included but remains bounded as reference/source unless target runtime confirms install support.
- More duplicate docs may exist until older package folders are archived or explicitly marked superseded.

## Verification

Required checks:

- file presence for all layers;
- `MANIFEST.sha256` regenerated;
- archive integrity test;
- minimal secret-pattern scan;
- post-upload Builder acceptance prompts.

## Rollback Trigger

Rollback if:

- Builder UI rejects the file volume;
- plugin/source files confuse the Builder knowledge layer;
- acceptance tests fail after upload;
- package duplication causes repo maintenance drift.

## ΔDΩΛ

Δ: split Builder packages are consolidated into v4.
D: local v3 package, user-uploaded toolchain v2 archive, v4 manifest/receipt.
Ω: 0.92 for package assembly; lower for Builder behavior until UI verification.
Λ: revise after Builder upload or GitHub mirror review.
