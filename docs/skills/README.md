# Skill Registry v1

`registry-v1.json` is the governance catalog for the 68 skills audited on 2026-07-22 under ADR-20260722-03.

## Statuses

- `ACTIVE`: current primary or explicitly transitional owner.
- `ABSORB`: transition alias that must route new work to `replacement`.
- `DEPRECATED`: retained for trace only and not eligible for implicit routing.
- `CODEX_ONLY`: installed plugin workflow that must not be claimed as executable on ordinary ChatGPT surfaces.
- `PLANNED`: target declared outside the current inventory and blocked until its acceptance gate passes.

## Boundaries

The registry is governance metadata. It does not prove installation, packaging, deployment, implicit invocation, or live Builder behavior. `iskra-canon-runtime` remains blocked for readiness claims until its Kernel Order and missing bundled references are repaired.

## Verification

```bash
npm run check:skill-registry
npm run test:skill-registry
```

The validator is static and never executes scripts bundled inside skills.
