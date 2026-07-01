# Plan: iskraSpace Production-Ready Deep Audit

**Date:** 2026-07-01
**Mode:** AUDIT + BUILD + GOVERNANCE
**Target:** `runtime/iskraSpace` → production-ready
**PR:** #228 `codex/iskraspace-production-ready`

---

## Stage 1 — Evidence Gathering (Parallel)

### Agent: Build_Inspector
- Full dependency audit: `@iskra/runtime`, `iskra-monorepo`, `file:..` deps
- Build reproducibility: does `npm ci` work without lockfile? Is `pnpm-lock.yaml` at root sufficient?
- Bundle analysis: size, chunks, vendor splitting
- Test coverage: 631 passed, 3 skipped — but 3 skipped are e2e security tests. Check if e2e actually runs.
- Lint: 90 warnings (any + console.log) — map to production risk.
- CI/CD readiness: are there GitHub Actions? Do they match the build pipeline?

### Agent: Services_Auditor
- Read all `services/*.ts` files (38 files) and analyze:
  - Type safety: `any` usage, implicit types, unsafe casts
  - Logic consistency: circular dependencies, state mutation, side effects
  - Service boundaries: does each service have a single responsibility?
  - Key services deep-dive: `syncService.ts`, `geminiService.ts`, `ritualService.ts`, `policyEngine.ts`, `ragService.ts`, `evalService.ts`, `securityService.ts`, `supabaseService.ts`
  - Contradictions: does `memoryService` use localStorage while `syncService` claims Supabase? Is there a drift between ARCHITECTURE.md and actual code?
  - Missing tests: are there services without tests? Are skipped tests blocking?

### Agent: Components_Auditor
- Read all `components/*.tsx` files (51 items) and analyze:
  - Lazy loading: are all heavy views code-split? Is preloading used for critical paths?
  - Accessibility: ARIA labels, keyboard nav, focus management, screen reader support
  - Error boundaries: `ErrorBoundary` usage, fallback UI, error recovery
  - Performance: `useMemo`, `useCallback`, unnecessary re-renders, large state in context
  - Mobile UX: `pb-safe`, `h-[80px]`, mobile menu logic
  - Ritual mechanics: how `ritualAlert` flows through App → views
  - Phase/Metrics visualization: does `Ambience` react correctly to all phases?

### Agent: Security_Config_Auditor
- `.env.example`, `.env.production.example`, `.env.staging.example`
- `vite.config.ts` — env exposure, define, CORS
- `supabase/` — schema, migrations, RLS, functions
- `config/` — deltaConfig, canon config, any hardcoded secrets?
- `index.html` — CSP, meta tags, inline scripts
- `storageService.ts` — localStorage encryption, PII handling
- `securityService.ts` — PII detection accuracy, injection patterns
- `geminiService.ts` — API key handling (is it server-side only?)
- `syncService.ts` — auth token handling, retry logic, offline-first gaps
- `services/__tests__/releaseBoundary.test.ts` — what does it verify?

## Stage 2 — Synthesis & Reflexion (Orchestrator)

- Integrate all agent findings
- Cross-reference with ARCHITECTURE.md, README.md, RELEASE_STATUS.md
- Run "What If?" scenarios
- Identify drift between docs and code
- Map risks to production blockers vs nice-to-have

## Stage 3 — Production-Ready Plan

- Detailed checklist with priorities (P0 blocker, P1 critical, P2 important, P3 nice-to-have)
- ADR-level recommendations for architecture changes
- Testing gaps and coverage targets
- Security hardening steps
- CI/CD pipeline requirements
- Deployment verification steps
- Documentation updates needed
- Rollback plan

## Output

- `plan.md` (this file) — updated
- `iskraSpace_production_ready_audit_2026-07-01.md` — full report
- `iskraSpace_production_ready_receipt.md` — go/no-go summary

∆DΩΛ:
∆: Audit plan created for iskraSpace production readiness
D: PR #228 diff, local build, test, lint, typecheck results
Ω: 0.85
Λ: Execute parallel Stage 1 agents
