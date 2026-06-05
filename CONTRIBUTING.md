# Contributing to ISKRA

> **Last verified:** 2026-06-05  
> **Repository:** `serhiipriadko2-sys/iskra`  
> **Default branch:** `main`

This guide defines how to contribute without breaking the project boundaries: code, canon, governance, security, runtime behavior, and Agent Builder upload artifacts are related but not interchangeable.

---

## 1. Non-Negotiables

- **Source discipline:** GitHub files, Supabase live metadata, committed artifacts, and canon files outrank chat memory.
- **No secrets:** never commit real `.env` files, service-role keys, API keys, OAuth tokens, private keys, credentials, cookies, or sensitive logs.
- **ADR gate:** canon, governance, memory policy, workflow discipline, persistence model, connector policy, security posture, and durable agent behavior changes require an ADR or an explicit ADR update.
- **Layer boundaries:** pure math remains pure; UI remains projection; side effects stay in runtime/engine/service layers.
- **Reviewable changes:** keep PRs focused and reversible. Avoid broad refactors in the same PR as behavior or governance changes.
- **Evidence receipts:** significant audits or changes need a short receipt in the relevant governance, ledger, release, or memory record.
- **Agent Builder boundary:** a committed upload mirror is not proof of activation in Agent Builder UI. Activation requires upload and prompt-level verification.

---

## 2. Branch and Commit Workflow

Use a short branch name that names the change:

```text
feat/<scope>-<topic>
fix/<scope>-<topic>
docs/<scope>-<topic>
chore/<scope>-<topic>
codex/<scope>-<topic>
```

Use Conventional Commits where practical:

```text
<type>(<scope>): <subject>
```

Common scopes:

```text
core, math, engine, web, runtime, docs, governance, ledger, security, agent-builder, supabase
```

Before opening a PR:

1. Identify the changed contour: code, canon, runtime, Supabase, Agent Builder, docs, security, or release artifact.
2. Run the smallest verification set that proves the change.
3. Add or update tests when behavior changes.
4. Update ADR, ledger, changelog, receipt, or release notes when the change affects durable behavior.
5. State what was verified and what remains unverified.

---

## 3. Change-Type Gates

### Code Changes

Expected checks depend on touched files, but start here:

```bash
pnpm test
pnpm build
pnpm typecheck
pnpm lint
```

For broad changes, use:

```bash
pnpm verify
```

Rules:

- Do not introduce `any` unless the local codebase already uses it for a constrained boundary and the PR explains why.
- Keep `@iskra/math` side-effect free.
- Keep UI business logic out of app components when a runtime/service layer exists.
- Avoid circular dependencies and cross-layer imports that bypass package boundaries.

### Canon and Governance Changes

Canon/governance changes include edits to `core/`, `system/`, `governance/`, `ledger/`, `metrics/`, durable agent instructions, memory rules, workflow policy, or source-of-truth rules.

Required:

1. Explain the reason and source evidence.
2. Add or update an ADR when behavior or policy changes.
3. Update ledger/checksum material if SoT files are governed by the ledger.
4. Add a short receipt: context, finding/decision, evidence, risk, next step, status.
5. Identify rollback or reversal trigger.

Useful commands:

```bash
pnpm check:adr-gate
pnpm ledger:update
python tools/validate_delta.py
python tools/validate_terms.py
```

### Agent Builder Upload Artifacts

Agent Builder package artifacts live under:

```text
dist/agent-builder/
```

For upload mirror changes:

- Include `README_AGENT_BUILDER_UPLOAD.md` and `RELEASE_RECEIPT.md`.
- Include `MANIFEST.sha256` for package file hashes.
- Include acceptance tests when behavior is added or tightened.
- Keep `memory_current/` as continuity receipts, not immutable canon.
- Document whether Builder UI activation has actually been observed.

Required boundary language:

```text
Committed to GitHub does not mean active in Agent Builder UI.
```

### Supabase or Live Backend Changes

Supabase work is high-risk when live schema and Git migration path can drift.

Required before live change:

1. Identify project/branch and blast radius.
2. Prefer a Git migration path before live mutation.
3. Verify RLS, auth, and rollback path.
4. Record migration evidence and any drift.
5. Treat live schema changes without Git migration path as HIGH-RISK DRIFT.

### Security-Sensitive Changes

Security-sensitive changes include auth, RLS, Edge Functions, CSP, dependency upgrades, token handling, environment loading, logging, webhooks, and Agent Builder connector behavior.

Required:

- Confirm no secrets are committed.
- Avoid public exploit details in issues or PRs.
- Update `SECURITY.md` when supported scope, reporting process, or residual risk changes.
- Run dependency/security checks where relevant:

```bash
pnpm audit
npm audit --omit=dev
```

Use whichever audit command matches the package manager and package scope being changed.

---

## 4. Local Setup

Requirements:

- Node.js `>=20.0.0`
- pnpm `>=9.0.0`

Setup:

```bash
pnpm install
pnpm build
```

Common checks:

```bash
pnpm test
pnpm typecheck
pnpm lint
pnpm verify
```

Targeted examples:

```bash
pnpm --filter @iskra/core test
pnpm --filter @iskra/math test
pnpm --filter @iskra/engine test
pnpm --filter iskra-web dev
python tools/check_no_src_imports.py
```

---

## 5. Review Checklist

### Architecture

- [ ] The change has one clear purpose.
- [ ] Layer boundaries are preserved.
- [ ] No unrelated refactor is mixed into the PR.
- [ ] New abstractions remove real complexity or match an existing local pattern.

### Verification

- [ ] Relevant tests/checks were run and listed in the PR.
- [ ] Behavior changes include tests or a justified smoke check.
- [ ] Docs match current files and do not claim unverified runtime/UI state.
- [ ] Artifact changes include hashes, bytes, manifests, or receipts where relevant.

### Governance

- [ ] ADR updated when behavior/policy changed.
- [ ] Ledger or receipt updated when SoT/integrity changed.
- [ ] Drift is explicitly marked as `DRIFT` or `HIGH-RISK DRIFT` when discovered.
- [ ] Rollback/reversal trigger is named for risky changes.

### Security

- [ ] No secrets or sensitive logs are present.
- [ ] Environment examples use placeholder values only.
- [ ] RLS/auth/CSP changes are verified where relevant.
- [ ] Vulnerability details are not disclosed publicly before mitigation.

### Agent Builder

- [ ] Upload mirror contains README, receipt, manifest, instructions, evals, and runtime helpers when intended as a full mirror.
- [ ] Builder UI activation is not claimed unless actually observed.
- [ ] Dreamspace entries remain `[HYP]` unless crystallized through evidence and the required gate.

---

## 6. Pull Request Template

Use this structure in the PR body when no stronger template exists:

```markdown
## Summary

## Scope

## Evidence

## Verification

## Risk / Rollback

## Boundary
```

For docs-only PRs, state the source files used for the update. For runtime PRs, include commands and test results. For security PRs, avoid exploit details and use a private reporting channel when needed.

---

## 7. Key References

- [`README.md`](README.md) — repository orientation.
- [`SECURITY.md`](SECURITY.md) — vulnerability reporting and supported scope.
- [`LICENSE`](LICENSE) — software and canon/content license scope.
- [`AGENTS.md`](AGENTS.md) — agent operating instructions for repo work.
- [`governance/adr.md`](governance/adr.md) — ADR process.
- [`ledger/sot.json`](ledger/sot.json) — SoT integrity ledger.
- [`dist/agent-builder/iskra-full-canon-dreamspace-2026-06-05-v2/`](dist/agent-builder/iskra-full-canon-dreamspace-2026-06-05-v2/) — current Agent Builder upload mirror.
