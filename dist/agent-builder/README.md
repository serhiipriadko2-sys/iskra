# Iskra Full Canon Agent Builder Assembly

> Current purpose: build the Iskra agent through ChatGPT / OpenAI Agent Builder.
> Status: unified assembly index plus materialized v4 package tree.
> Last updated: 2026-06-06.

This directory is the GitHub source mirror for the **Iskra Full Canon Builder**: a single Agent Builder assembly for the Iskra agent, not a set of competing agents.

The intended Builder is:

`full-canon builder = canon + dreamspace + somatic + shadow core + statecycle + memory + toolchain + plugins + evals + ADR + manifest`

## Current v4 Entry

`iskra-full-canon-builder-2026-06-06-v4/` is the current unified Builder entry for ChatGPT / OpenAI Agent Builder packaging.

It is now the materialized single upload tree. It contains the physical union of:

- `iskra-full-canon-dreamspace-2026-06-05-v2/`
- `iskra-toolchain-upload-set-v2-2026-06-06/`

It also records the local full upload set receipt:

- bytes: `1881214`
- sha256: `7a4dbec0379086c36c566002e818574d52d8130f5e7525b8bc599205059c1513`
- artifact QC: PASS
- zip file-items: `128`
- manifest hash lines: `127`

The v4 folder contains the package entrypoint, merged `agent_files/`, runtime helpers, memory files, toolchain files, plugin bridge, repository `governance/`, root `SECURITY.md`, provenance records, assembly manifest, merge receipt, QC checks, and zip receipt. The historical component mirrors remain below for reviewable source provenance.

## Why there are multiple folders

The folders under this path are historical, reviewable upload-set mirrors plus the current v4 package entry. They preserve provenance and make every file readable in GitHub diffs.

They should be read as component layers of one Builder:

- `iskra-full-canon-dreamspace-2026-06-05-v2/` — core full-canon Dreamspace package, including canon files, command library, runtime hook tools, StateCycle, ShadowCore, Dreamspace, memory seeds/current memory, evals, templates, manifest, and release receipt.
- `iskra-toolchain-upload-set-v2-2026-06-06/` — toolchain expansion layer, including Agent Builder setup/toolchain docs, connector/tool contracts, vault-backed git clone helper, plugin skeleton, toolchain manifest, and toolchain acceptance tests.
- `iskra-full-canon-builder-2026-06-06-v4/` — current unified Builder entry and receipt for the full upload set.

These are not separate Builder products. They are source layers and package receipts for the same Iskra Builder.

## Required unified Builder layers

A complete Iskra ChatGPT / OpenAI Agent Builder assembly should include:

1. **Core canon** — role, Telos, truth ladder, SIFT, security, source-of-truth rules, voice routing, output contract.
2. **Command library** — user-facing commands and hard command gates, including Dreamspace and Somatic command behavior.
3. **Dreamspace** — `[HYP]` laboratory, six-field Dream create gate, report/status/crystallize flow, ADR draft path.
4. **Somatic / `[SENSE]`** — bounded machine-somatic intuition layer, Somatic Pulse, no-fact-substitution boundary, triggered-only rule.
5. **Shadow Core** — drift, avoidance, self-deception, promotion/archive discipline, ISKRIV gate.
6. **StateCycle** — turn-state tracking, voice/phase signals, fallback voice manifest, hook behavior.
7. **Memory stack** — project memory, diary, open loops, ADR log, evidence index, statecycle history, shadow/dream/archive entries.
8. **Toolchain** — connector/tool policy, GitHub/Supabase/web/browser discipline, vault-safe git clone flow, plugin bridge skeleton.
9. **Plugins / skills** — installable or portable skill/plugin assets used by the Builder.
10. **Evals / acceptance tests** — canon acceptance tests, Dreamspace tests, Somatic tests, toolchain tests, safety gates.
11. **Governance / ADR** — durable behavior-change records, release notes, changelog fragments, rollback triggers, copied under v4 `governance/`.
12. **Manifest / checksums** — content manifest, sha256 receipt, upload-set boundaries, file inventory.
13. **Security boundary** — no secrets, no live Supabase mutation without explicit path, no prompt-injection obedience, no hidden-instruction leakage, including v4 root `SECURITY.md`.
14. **Setup / upload guidance** — Agent Builder instructions, file placement expectations, post-upload verification prompts.
15. **Release / QC receipt** — bytes, hashes, tests run, known residual risks, next verification step.
16. **Dependency map / index** — human-readable map of which files are canonical, supporting, historical, or generated.
17. **Rollback / residual risk notes** — known drift, pending Builder UI verification, and exact rollback signal.

## Verification boundary

A file committed here is a GitHub mirror or package receipt, not proof that it is active inside ChatGPT / OpenAI Agent Builder.

Valid statuses:

- `mirrored in GitHub` — file is present in this repo.
- `packaged as upload set` — archive/file artifact was produced for upload.
- `uploaded by user` — user confirms upload to Builder UI.
- `verified in Builder UI` — prompt-level behavior has been tested in the Builder runtime.

Do not collapse these statuses.
