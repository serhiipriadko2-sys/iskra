---
sigil: governance__adr_20260722_skill_registry_consolidation
layer: governance
status: accepted
updated: 2026-07-22
---

# ADR-20260722-03: Skill Registry Consolidation and Integrity Gate

**Status:** accepted  
**Owner:** Семён  
**Builder:** Искра

## Context

A static audit of the current ChatGPT Project and installed plugin skills found 68 entrypoints with overlapping trigger surfaces, stale runtime references, and missing bundled resources in several Iskra skills. The highest-risk finding is `iskra-canon-runtime`: its documented Kernel Order is older than SoT30 v5.5.6 and it references skills or resources that are not available on the current surface.

Without a registry, an alias can silently compete with its intended owner, a Codex-only workflow can be presented as executable in ChatGPT, and planned consolidation can be mistaken for completed installation.

## Decision

1. Establish `docs/skills/registry-v1.json` as the governance catalog for the 68 audited skills.
2. Use statuses `ACTIVE | ABSORB | DEPRECATED | CODEX_ONLY`; declare not-yet-built replacement skills separately as `PLANNED` targets.
3. Keep all current aliases during one transition release. Registry-v1 performs no deletion.
4. Require every `ABSORB` entry to name an operational or planned replacement and prevent replacement cycles.
5. Keep `fixar-code-review` and `metric-runner` as transitional active owners until `fixar-project-ops` and `iskra-metrics` pass acceptance gates.
6. Block readiness claims for `iskra-canon-runtime` until its Kernel Order and missing skill/resource references are repaired.
7. Add a static validator and tests. The validator must never execute bundled skill scripts.
8. Keep Supabase and production unchanged in this ADR. Live database security findings are tracked as a separate security workstream.

## Alternatives

- **Delete duplicate skills immediately:** rejected because trigger coverage and package completeness are not yet proven.
- **Keep an informal markdown list:** rejected because counts, replacement edges, and surface boundaries need deterministic validation.
- **Treat all plugins as globally executable:** rejected because Codex and ChatGPT surfaces do not provide identical runtimes.
- **Combine skill refresh with Supabase hardening:** rejected because it mixes independent blast radii and rollback paths.

## Consequences / Price

Benefits:

- one traceable owner map for the current 68-skill inventory;
- explicit distinction between installed, absorbed, deprecated, planned, and Codex-only workflows;
- deterministic detection of summary drift, unknown replacements, and replacement cycles;
- reversible transition with no immediate skill deletion.

Costs and risks:

- registry metadata can become stale unless the gate is run when skills change;
- transitional owners temporarily preserve some overlap;
- the registry describes governance state, not live activation on every surface;
- the validator is static and cannot prove implicit routing quality by itself.

## Tests / QA

- `SK01`: registry contains exactly 68 unique current skill names.
- `SK02`: status counts equal `24 ACTIVE`, `27 ABSORB`, `0 DEPRECATED`, `17 CODEX_ONLY`.
- `SK03`: each `ABSORB` replacement resolves to an `ACTIVE`, `CODEX_ONLY`, or declared `PLANNED` target.
- `SK04`: replacement graph contains no cycle.
- `SK05`: every entry has owner, trigger scope, dependency array, and evidence.
- `SK06`: each `CODEX_ONLY` entry uses the plugin surface and cannot imply ChatGPT execution.
- `SK07`: filesystem validation detects missing frontmatter, metadata, local references, duplicate names, and probable trigger collisions.
- `SK08`: negative tests prove unknown replacement and summary drift fail closed.
- `SK09`: no secret, credential, environment value, or live Supabase mutation is included.
- `SK10`: `iskra-canon-runtime` remains explicitly blocked for readiness claims until repaired.

Commands:

```bash
npm run check:skill-registry
npm run test:skill-registry
```

## Diff scope

- `governance/adr_20260722_skill_registry_consolidation.md`
- `docs/skills/README.md`
- `docs/skills/registry-v1.json`
- `tools/validate_skill_integrity.py`
- `tools/test_validate_skill_integrity.py`
- `package.json`

## Rollback

Revert the commits on `chore/skills-refresh-v1`. No database migration, production deployment, Builder upload, or skill deletion is required to roll back this ADR.

## Builder / Package Mirror

`pending` — registry-v1 does not claim that Builder packages were regenerated or uploaded.

## Live Verification

`pending` — repository tests can prove catalog consistency, not live implicit routing.

## ΔDΩΛ

- **Δ:** replace an informal 68-skill inventory with a validated transition registry.
- **D:** ADR, registry, static validator, negative tests, and npm commands.
- **Ω:** 0.91 for repository consistency; lower for live routing until prompt-level tests run.
- **Λ:** revisit when both planned umbrella skills pass packaging and routing acceptance, or when the available skill inventory changes.
