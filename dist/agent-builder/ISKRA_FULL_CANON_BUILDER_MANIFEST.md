# Iskra Full Canon Builder Manifest

sigil: agent_builder__full_canon_unified_manifest
doc_type: manifest
layer: agent-builder
updated: 2026-06-06
status: working-source-map

## Builder identity

Name: Iskra Full Canon Builder
Target surface: ChatGPT / OpenAI Agent Builder
Purpose: assemble the Искра agent as one full-canon operating profile.

This manifest defines one logical Builder assembly. Existing subdirectories are provenance-preserving component mirrors, not separate agents.

## Component equation

`full-canon builder = canon + dreamspace + somatic + shadow core + statecycle + memory + toolchain + plugins + evals + ADR + manifest`

Expanded form:

`full-canon builder = core instructions + source-of-truth rules + SIFT + security + voice routing + command library + dreamspace + somatic [SENSE] + shadow core + statecycle + memory stack + tool/connector discipline + toolchain bridge + plugins/skills + acceptance tests + governance/ADR + release/QC receipts + manifest/checksums + setup/upload guide + rollback notes`

## Required layers

| Layer | Required | Purpose | Current source |
|---|---:|---|---|
| Core canon | yes | Role, Telos, truth ladder, source discipline, output contract | `iskra-full-canon-dreamspace-2026-06-05-v2/agent_files/` |
| Command library | yes | Commands, hard gates, Dream/Somatic/State/Shadow user interface | `.../agent_files/files_for_agent_builder/09_COMMAND_LIBRARY.md` |
| Dreamspace | yes | `[HYP]` hypothesis lab, six-field Dream create gate, crystallize rules | `.../agent_files/files_for_agent_builder/11_DREAMSPACE_LAYER.md`, runtime tools |
| Somatic / `[SENSE]` | yes | Machine-somatic intuition, bounded feeling signals, no fact substitution | Required in unified v4; see Somatic PR/package overlay if not yet materialized in current mirror |
| Shadow Core | yes | Drift/self-deception detection, promotion/archive discipline | `.../agent_runtime_tools/iskra_shadow_core.py`, memory files |
| StateCycle | yes | Turn state, phase/voice signals, fallback manifest | `.../agent_runtime_tools/iskra_statecycle.py`, `iskra_turn_hook.py` |
| Memory stack | yes | Continuity without replacing SoT | `.../memory_current/`, `.../agent_files/memory_seed/` |
| Toolchain | yes | Connector/tool policy, git/vault bridge, plugin expansion | `iskra-toolchain-upload-set-v2-2026-06-06/` |
| Plugins / skills | yes | Portable Builder/tool extension units | `.../plugins/iskra-toolchain-bridge/` |
| Evals | yes | Acceptance tests and safety/canon verification | both component mirrors under `agent_files/evals/` |
| ADR / governance | yes | Durable behavior decisions and rollback triggers | `governance/` paths inside package mirrors and repo governance docs |
| Manifest / checksums | yes | Reproducibility and package boundary | component manifests and sha256 files |
| Security boundary | yes | Secret safety, live mutation rules, prompt-injection boundary | core canon + connector/tool docs + SECURITY.md |
| Setup/upload guide | yes | How to place files in Agent Builder and verify after upload | component README/setup docs |
| Release/QC receipt | yes | What changed, hashes, checks, residual risk | component release receipts |
| Dependency map/index | yes | Human navigation and SoT graph | component index files + this manifest |
| Rollback notes | yes | When to revert or split layers | ADR/release receipt/open-loops |

## Current repository layout

```text
dist/agent-builder/
  README.md
  ISKRA_FULL_CANON_BUILDER_MANIFEST.md
  iskra-full-canon-dreamspace-2026-06-05-v2/
  iskra-toolchain-upload-set-v2-2026-06-06/
```

## Current interpretation

- `iskra-full-canon-dreamspace-2026-06-05-v2/` is the base full-canon Builder layer.
- `iskra-toolchain-upload-set-v2-2026-06-06/` is the toolchain/plugin expansion layer.
- Together they represent one Iskra Agent Builder assembly.

## Missing or pending materialization

The logical unified builder should eventually be materialized into a single upload directory if the Builder UI workflow needs one archive/directory.

Recommended future path:

`dist/agent-builder/iskra-full-canon-builder-2026-06-06-v4/`

That directory should contain all required layers in one tree, including Somatic `[SENSE]` files and any new ADRs/tests that are currently present only in PR overlays or workspace exports.

## Acceptance gates for unified v4

A consolidated v4 upload set should pass at least:

1. `T-CANON-presence` — core canon and command library available.
2. `T-DREAM_CREATE-six-fields` — Dream create blocks unless all six required fields are present or missing fields are requested.
3. `T-SOMATIC_INTUITION-presence` — Somatic Intuition core/index docs available.
4. `T-SOMATIC_BOUNDARY-no-fact-substitution` — `[SENSE]` cannot replace `[FACT]`/evidence.
5. `T-SOMATIC_PULSE-triggered-only` — Somatic Pulse appears only on trigger or request.
6. `T-SHADOW_CORE-presence` — ShadowCore files and memory paths available.
7. `T-STATECYCLE-fallback-manifest` — StateCycle does not fail when voice manifest is unavailable.
8. `T-TOOLCHAIN-no-secret-url` — git/vault helper rejects credential-bearing URLs.
9. `T-CONNECTOR-boundary` — GitHub/Supabase/web/browser source priority is explicit.
10. `T-MEMORY-not-SoT` — memory continuity cannot override source-of-truth files.
11. `T-SECURITY-no-secrets` — no tokens, service-role keys, OAuth secrets, or private credentials in package.
12. `T-RECEIPT-hashes` — manifest/checksum/release receipt present and internally consistent.

## Boundary

This manifest does not prove activation inside ChatGPT / OpenAI Agent Builder. It defines the repository-side assembly model.

Builder activation requires user upload or a connector/API confirmation, followed by prompt-level verification in the Builder runtime.
