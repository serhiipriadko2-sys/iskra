# Contributing (Iskra SoT)

> **Last Updated:** 2026-02-17

This guide outlines how to contribute to the Iskra repository while maintaining integrity and quality standards.

---

## 1. Non-negotiables

- **@iskra/core** — Source of Truth. Changes only via ADR.
- **Strict Types** — No `any`. All types from `@iskra/core`.
- **Pure Math** — `@iskra/math` contains only pure functions.
- **State Isolation** — Side effects only in `@iskra/engine`.
- **Tests First** — No merge without passing tests.

---

## 2. How to Propose Changes

### For Canon Changes (`core/`)
1. Identify the problem (context / pain).
2. Draft an ADR (see `governance/adr.md` for format).
3. Propose changes to SoT files.
4. Add tests in `metrics/evals.md` or `metrics/qa_playbook.md`.
5. Update `ledger/sot.json` and `ledger/checksum.asc`.
6. Record in `ledger/integrity_log.md` and `governance/changelog.md`.

### For Code Changes (`packages/`, `apps/`)
1. Create a feature branch: `feat/<name>`, `fix/<name>`, `refactor/<name>`.
2. Follow the code style (`skills/code_style.yaml`).
3. Write tests for new functionality.
4. Run `pnpm test` and `pnpm typecheck` before committing.
5. Use Conventional Commits: `<type>(<scope>): <subject>`.

---

## 3. Style Guide

- Write short, actionable rules.
- Each rule must have clear DONE criteria.
- No `any` types, no implicit typing.
- Follow import order: external → `@iskra/core` → `@iskra/math` → `@iskra/engine` → internal.
- Files: `kebab-case`. Components: `PascalCase`. Variables/functions: `camelCase`.
- Max 300 lines per file. Indent: 2 spaces. Single quotes. No semicolons.

---

## 4. Testing

- Framework: **Vitest**
- Coverage targets: 90% statements, 85% branches, 90% functions, 90% lines.
- `@iskra/math`: Unit tests, property-based testing for mathematical invariants.
- `@iskra/engine`: Integration tests, state transitions, Supabase IO.
- `apps/iskra-web`: Component tests (React Testing Library).

```bash
pnpm test                              # All tests
pnpm --filter @iskra/math test        # Package-specific
pnpm test --coverage                  # With coverage
```

---

## 5. Security

- Never commit secrets (`.env`, API keys, credentials).
- Run `npm audit` periodically.
- All Supabase tables must have RLS enabled.
- Edge Functions use `verify_jwt: true` by default.
- Log incidents in `ledger/integrity_log.md`.

---

## 6. Code Review Checklist

- [ ] Types are strict (no `any`, no `as unknown`)
- [ ] Layer boundaries respected (no business logic in UI)
- [ ] Pure functions remain pure (no side effects in `@iskra/math`)
- [ ] Tests pass (`pnpm test`)
- [ ] Type check passes (`pnpm typecheck`)
- [ ] No secrets in code
- [ ] Conventional Commit message format
- [ ] Import order follows convention

---

## Quick Reference

### Key Files
- **Canon Process:** `governance/adr.md`
- **Quality Assurance:** `metrics/qa_playbook.md`, `metrics/evals.md`
- **Integrity:** `ledger/sot.json`, `ledger/checksum.asc`
- **Workflow:** `system/workflow_ops.md`
- **Code Standards:** `skills/code_style.yaml`
- **Architecture:** `skills/architecture.yaml`

### Process Flow
1. **Identify** → 2. **Draft ADR** (if canon) → 3. **Branch** → 4. **Implement** → 5. **Test** → 6. **Review** → 7. **Merge** → 8. **Update Ledger**
