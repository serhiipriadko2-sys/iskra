# SoT30 v5.5.6 — T85/T86 Acceptance Repair

Status: **accepted** (ADR-20260721-02, owner decision 2026-07-21). Built as a new package over immutable v5.5.5; live ChatGPT Project revalidation pending.

<!-- composition: changed=10 unchanged=20 baseline=v5.5.5 -->

## What this is

A narrow semantic repair after a clean-Project v5.5.5 diagnostic run returned 44 PASS_DIRECT, 47 PASS_CONTRACT and 2 FAIL. T85 now uses plan-specific Project-memory prerequisites. T86 removes a non-normative numeric M2 drift activation from files 03/04 and keeps file 12 §4.2 authoritative.

## Composition

Expected changed Knowledge: `00,01,02,03,04,12,22,25,28,29` (10). Expected unchanged: 20. `support/MANIFEST.json` is authoritative.

## Contents

`dist/SoT30_v5.5.6.zip` with root `SoT30_v5.5.6/`; 30 Knowledge files; three support files.

## Candidate artifact

- ZIP: `dist/SoT30_v5.5.6.zip`
- bytes: `1131422`
- sha256: `d86959641c9d78fea321a837d2ebf58e9406cf75acec84b9ea98b3d9d2dd9764`
- root: `SoT30_v5.5.6/`
- generated_from: `canonical_git_blobs`
- generated_from_ref: `b31e861c4752aa26c003a2c0135e1c7ef2827dd9`
- support/MANIFEST.json sha256: `ddd70068b53382fe103c683e3af51644506900f99eeb8c49b0e32fa35f1ef804`

## Boundary

v5.5.5 remains immutable. No runtime, Supabase, gateway, deployment, or memory-database change. `live_project_verified=false`; T01–T93 must be rerun in a new clean Project before merge authorization.
