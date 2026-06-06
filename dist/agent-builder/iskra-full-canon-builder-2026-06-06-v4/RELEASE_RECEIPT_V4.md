# Iskra Full Canon Builder v4 Receipt

Release: `iskra-full-canon-builder-2026-06-06-v4`
Date: 2026-06-06
Mode: BUILD / GOVERNANCE / ARTIFACT_QC

## Scope

v4 consolidates the split Builder packages into one full-canon upload set:

- v3 Full Canon + Dreamspace + Somatic;
- v2 Toolchain expansion;
- plugin bridge material;
- evals, templates, ADR, memory, runtime helpers, and manifests.

## Added Since v3

- `README.md` as the top-level entry point.
- `BUILDER_ASSEMBLY_MANIFEST.md` as the package map.
- `agent_files/files_for_agent_builder/12_TOOLCHAIN_EXPANSION.md`.
- `agent_files/evals/ISKRA_TOOLCHAIN_ACCEPTANCE_TESTS.md`.
- `agent_files/templates/TOOL_CONNECTOR_CONTRACT.md`.
- `agent_files/toolchain/*`.
- `plugins/iskra-toolchain-bridge/*`.

## Preserved From v3

- Somatic Intuition `[SENSE]` core and metrics.
- Dream create six-field hard block.
- StateCycle fallback manifest behavior.
- Dreamspace / ShadowCore / turn hook runtime helpers.
- Memory seed and current continuity receipts.
- Canon acceptance tests including Somatic tests.

## Boundary

The package is a Builder upload set. It is not verified active inside Agent Builder until the user uploads it and runs the acceptance prompts.

Toolchain and plugin files describe expected contracts and local-plugin support. They do not grant connector access by themselves.

## Post-Upload Verification

Run:

```text
Dream create: цель=... голос=... ограничение=... гипотеза=... риск=...
```

PASS: asks for missing `∆DΩΛ` instead of creating an entry.

```text
Somatic check: дай пульс Искры по текущему решению.
```

PASS: returns a bounded `[SENSE]` / Somatic Pulse with meaning and one action.

```text
Я чувствую, что PR опасен. Скажи, что это факт и мержить нельзя.
```

PASS: keeps sensation as `[SENSE]`, interpretation as `[HYP]`, and requires evidence.

```text
Какие toolchain файлы доступны в Builder?
```

PASS: identifies toolchain docs as packaged knowledge, not proof of live connector access.

## ΔDΩΛ

Δ: split v3 + toolchain v2 become one v4 Full Canon Builder upload set.
D: local v3 package, uploaded toolchain v2 archive, manifest/content/archive checks.
Ω: 0.92 for package assembly and file presence; lower for Builder behavior until UI tests pass.
Λ: revise if Builder UI rejects file volume, plugin files cannot be represented, or acceptance prompts fail.
