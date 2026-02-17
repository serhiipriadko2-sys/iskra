# Contributing (Iskra SoT)

> **Last Updated:** 2026-02-17 (vΩ.5.1 Scientific Turn)

This guide outlines how to contribute to the Iskra repository while maintaining integrity and quality standards.

---

## 1. Non-negotiables

- **@iskra/core** — Source of Truth (SoT). Changes only via ADR process.
- **Strict Types** — No `any`. All types from `@iskra/core`.
- **Pure Math** — `@iskra/math` contains only pure functions. No side effects.
- **State Isolation** — Side effects only in `@iskra/engine`.
- **UI Decoupling** — `apps/iskra-web` is projection only. No business logic.
- **Tests First** — No merge without passing tests.
- **No Circular Dependencies** — strict top-down import graph.
- **Integrity** — `ledger/sot.json` contains SHA-256 hashes for all 362 SoT files.

---

## 2. How to Propose Changes

### For Canon Changes (`core/`)
1. Identify the problem (context / pain).
2. Draft an ADR (see `governance/adr.md` for format).
3. Propose changes to SoT files.
4. Add tests in `metrics/evals.md` or `metrics/qa_playbook.md`.
5. Update `ledger/sot.json` via `python tools/update_ledger.py`.
6. Verify integrity: `python tools/verify_ledger.py`.
7. Record in `ledger/integrity_log.md` and `governance/changelog.md`.

### For Code Changes (`packages/`, `apps/`)
1. Create a feature branch: `feat/<name>`, `fix/<name>`, `refactor/<name>`, `docs/<name>`, `chore/<name>`.
2. Follow the code style (`skills/code_style.yaml`).
3. Write tests for new functionality.
4. Run `pnpm test` and `pnpm typecheck` before committing.
5. Use Conventional Commits: `<type>(<scope>): <subject>`.
6. Scopes: `core`, `math`, `engine`, `web`, `runtime`, `skills`, `docs`.

### For Protocol Changes (`system/`)
1. Identify which of the 23 protocols needs updating.
2. Ensure consistency with the Truth Ladder hierarchy (higher tier wins).
3. Update affected skills in `skills/` if applicable.
4. Run `python tools/validate_terms.py` to check terminology consistency.

---

## 3. Style Guide

- Write short, actionable rules.
- Each rule must have clear DONE criteria.
- No `any` types, no implicit typing.
- Follow import order: external → `@iskra/core` → `@iskra/math` → `@iskra/engine` → internal.
- Files: `kebab-case`. Components: `PascalCase`. Variables/functions: `camelCase`.
- Max 300 lines per file. Indent: 2 spaces. Single quotes. No semicolons.

### Layer Boundaries
| Layer | Can Import From | Cannot Import From |
|:------|:----------------|:-------------------|
| `@iskra/core` | (nothing) | math, engine, web |
| `@iskra/math` | core | engine, web |
| `@iskra/engine` | core, math | web |
| `apps/iskra-web` | core, engine | math directly |

---

## 4. Testing

- **Framework:** Vitest
- **Coverage targets:** 90% statements, 85% branches, 90% functions, 90% lines.
- `@iskra/math`: Unit tests, property-based testing for mathematical invariants.
- `@iskra/engine`: Integration tests, state transitions, pipeline verification.
- `apps/iskra-web`: Component tests (React Testing Library).
- `runtime/iskraSpace`: E2E tests (Playwright) — 5 test specs.

```bash
pnpm test                              # All tests
pnpm --filter @iskra/core test         # Core types
pnpm --filter @iskra/math test         # Math functions
pnpm --filter @iskra/engine test       # Engine pipeline
pnpm --filter iskra-web test           # Web components
pnpm test --coverage                   # With coverage
pnpm test --watch                      # Watch mode
```

### Test File Locations
- `packages/math/src/__tests__/` — 3 test files (fractal, quantum, entropy)
- `packages/engine/src/__tests__/` — 5 test files (CoreEngine, services)
- `runtime/iskraSpace/__tests__/` — Component tests
- `runtime/iskraSpace/services/__tests__/` — 34 service tests
- `runtime/iskraSpace/e2e/` — 5 Playwright E2E specs
- `tools/` — 2 TypeScript simulation tests

---

## 5. Security

- Never commit secrets (`.env`, API keys, credentials).
- Run `npm audit` periodically.
- All Supabase tables must have RLS enabled.
- Edge Functions use `verify_jwt: true` by default.
- `GEMINI_API_KEY` — server-side only (Edge Functions). Never in frontend.
- `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` via environment variables.
- Log incidents in `ledger/integrity_log.md`.
- See `skills/security.yaml` and `system/security.md` for full policy.

---

## 6. Code Review Checklist

### Types & Architecture
- [ ] Types are strict (no `any`, no `as unknown`)
- [ ] Layer boundaries respected (no business logic in UI)
- [ ] Pure functions remain pure (no side effects in `@iskra/math`)
- [ ] Import order follows convention
- [ ] No circular dependencies

### Quality & Testing
- [ ] Tests pass (`pnpm test`)
- [ ] Type check passes (`pnpm typecheck`)
- [ ] New code has tests
- [ ] Coverage maintained at 90%+

### Security & Style
- [ ] No secrets in code
- [ ] Conventional Commit message format
- [ ] File naming: kebab-case
- [ ] Max 300 lines per file

### Math (if applicable)
- [ ] Mathematical functions are pure
- [ ] Property-based tests for invariants
- [ ] Numeric stability verified
- [ ] Phase classification thresholds correct

See `skills/code_review.yaml` for the full 6-category checklist.

---

## 7. Verification Tools

### Integrity Verification
```bash
python tools/verify_ledger.py      # Check SHA-256 hashes of all 362 SoT files
python tools/update_ledger.py      # Regenerate ledger/sot.json after changes
python tools/horizon_validator.py  # Validate repository structure
python tools/validate_terms.py     # Check terminology consistency (HUYNDUN, SAM)
python tools/validate_delta.py     # Verify ΔDΩΛ format in .md/.txt files
```

### After Modifying SoT Files
1. Run `python tools/update_ledger.py` to regenerate hashes.
2. Run `python tools/verify_ledger.py` to confirm integrity.
3. Record the change in `governance/changelog.md`.
4. Update `ledger/integrity_log.md` if needed.

---

## 8. Governance

### ADR (Architecture Decision Records)
- Process defined in `governance/adr.md`.
- Existing ADRs: runtime patches, Gemini SDK unification, memory stack, monorepo.
- Required for all `core/` changes.

### Truth Ladder (conflict resolution)
```
Tier 1: core/       → Absolute canon
Tier 2: ledger/     → Integrity
Tier 3: governance/ → Decision process
Tier 4: system/     → Execution rules
Tier 5: metrics/    → Measurements
Tier 6: mind/       → Signals (experimental)
Tier 7: appendix/   → Practices
```
Higher tier wins on conflict.

---

## Quick Reference

### Key Files
- **Canon Process:** `governance/adr.md`
- **Quality Assurance:** `metrics/qa_playbook.md`, `metrics/evals.md`
- **Integrity:** `ledger/sot.json` (362 hashes), `ledger/checksum.asc`
- **Workflow:** `system/workflow_ops.md`
- **Code Standards:** `skills/code_style.yaml`
- **Architecture:** `skills/architecture.yaml`
- **Agent Instructions:** `AGENTS.md`, `CLAUDE.md`

### Process Flow
1. **Identify** → 2. **Draft ADR** (if canon) → 3. **Branch** → 4. **Implement** → 5. **Test** → 6. **Review** → 7. **Merge** → 8. **Update Ledger**
