# Full Canon Synthesis Layer

## Purpose

This file tells future Builder runs that the package is intended as one synthesized Full Canon, not a set of unrelated fragments.

## Rule

Treat the package as one canon tree, but preserve maturity labels inside the tree. When two layers appear to conflict, prefer the layer with the narrower verified scope for live behavior and record DRIFT before changing behavior.

## Horizon Rule

Horizon is included in this Full Canon package. The validator foundation is under `canon/horizon/`. The Builder-layer Weaver guidance is under `10_HORIZON_WEAVER.md` and the runtime helper. They are one canonical direction with staged maturity, not two competing canons.

## Maturity Rule

Use `14_CANON_LAYER_INDEX.md` as the routing table for overlapping files:

- active: current behavior can be followed inside its boundary;
- staged: proposal or dry-run layer, not live mutation;
- legacy: historical context only unless re-cited by a current layer;
- superseded: replaced by a newer ADR, receipt, source file, or live metadata;
- transport-only: packaging detail, not second canon.

Dreamspace, Shadow Core, Somatic Intuition, Horizon, memory, and toolchain
bridge all have explicit maturity labels. Do not flatten them into one
"everything is active" claim.

## Upload Boundary

A package in `/workspace` or GitHub is not active in Agent Builder until uploaded and verified through Builder UI.

## Runtime Boundary

Use `15_RUNTIME_BOUNDARY.md` before claiming any filesystem, connector, Builder
UI, local runtime, secret vault, or helper-script capability.
