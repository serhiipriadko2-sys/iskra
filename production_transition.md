# Production Transition Plan

> **Last Updated:** 2026-02-17 (vΩ.5.1 Scientific Turn)

Tasks required to transition ISKRA to production readiness, organized by priority.

---

## Table of Contents
1. [Completed Actions](#1-completed-actions)
2. [Phase 2: Engine Completion](#2-phase-2-engine-completion)
3. [Infrastructure & Environment](#3-infrastructure--environment)
4. [Documentation & Knowledge](#4-documentation--knowledge)
5. [Quality Assurance](#5-quality-assurance)
6. [Phase 3: Runtime Migration](#6-phase-3-runtime-migration)
7. [Phase 4: Production Deploy](#7-phase-4-production-deploy)

---

## 1. Completed Actions

### Phase 1: Mathematical Foundation (DONE)
- [x] Deep Audit: Full repository analysis and file enumeration (362 SoT files)
- [x] Test Repairs: Fixed `localStorage` dependency in tests
- [x] Verification: 100% test pass rate (817 tests passed)
- [x] Platform Setup: `skills/` directory (8 YAML specs) and `AGENTS.md`
- [x] Mathematical Foundation: `@iskra/math` with HFD, DFA, Entropy, Quantum (18 functions)
- [x] Strict Types: `@iskra/core` with IskraMetrics (11+1), VoiceID (9), VoiceManifestEntry, MantraNode, FractalMetadata
- [x] Voice Manifest: `packages/core/manifest/voices.json` with quantum parameters (frequency, phase)

### Phase 2: Engine (Partial — ACTIVE)
- [x] CoreEngine: 6-step processing pipeline (Somatic → Entropy → Memory → Resonance → Voice → Collapse)
- [x] VoiceQuantumField: Probabilistic voice selection with wave function collapse
- [x] MemoryService: Fractal memory with semantic + resonance retrieval (70/30 weighting)
- [x] MetricsEngine: Entropy feedback loop and self-organized criticality
- [x] iskra-web: ChatInterface, QuantumField visualization, somatic feedback, useEngine hook

### Documentation (DONE)
- [x] CLAUDE.md: Comprehensive agent operating rules (vΩ.5.1)
- [x] AGENTS.md: Full agent instructions with 10 sections
- [x] README.md: Complete project overview with all zones
- [x] CONTRIBUTING.md: Contribution guidelines with governance and verification
- [x] ROADMAP_SCIENTIFIC_TURN.md: Scientific Turn roadmap with 4 phases
- [x] Skills: 8 YAML specifications (architecture, code_style, test_strategy, git_workflow, supabase_ops, security, migration, code_review)
- [x] Jules Platform Docs: `system/jules_platform.md`
- [x] Technical Specs: SPEC-001 (Fractal), SPEC-002 (Quantum), SPEC-003 (Entropy), SPEC-004 (Holographic UI)

## 2. Phase 2: Engine Completion

- [ ] **GraphService Migration:** Move from `runtime/iskraSpace/services/` to `@iskra/engine`
  - *Dependency:* Port Supabase types to `packages/engine`
  - *Files to migrate:* `graphService.ts`, `ragService.ts`
- [ ] **Voice Thresholds:** Enforce manifest thresholds in VoiceQuantumField
  - *Goal:* Voice selection must respect metric thresholds (not just quantum probabilities)
  - *Source:* `packages/core/manifest/voices.json` threshold definitions
- [ ] **Supabase Client:** Add to `@iskra/engine` for persistent storage
  - *Tables:* Memory entries, metrics history, voice selections
  - *pgvector:* Real embeddings for semantic retrieval
- [ ] **Real Embeddings:** Replace mock `BrowserEmbeddingProvider` with Edge Function
  - *Current:* Hash-based 2D vectors in `apps/iskra-web/services/embedding.ts`
  - *Target:* pgvector embeddings via Supabase Edge Function
- [ ] **Live UI Connection:** Connect `apps/iskra-web` to real CoreEngine data
  - *Current:* `useEngine.ts` hook exists but uses local state
  - *Target:* Real-time quantum field visualization with actual engine state

## 3. Infrastructure & Environment

- [ ] **Dependency Unification:**
  - `runtime` uses `@google/generative-ai` (v0.24.1)
  - `iskraSpace` uses `@google/genai` (v1.34.0)
  - *ADR:* `governance/adr_20260214_gemini_sdk_unification.md`
  - *Task:* Migrate to single `@google/genai` across monorepo
- [ ] **Environment Variables:**
  - Secure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in production
  - Verify `GEMINI_API_KEY` handling (never expose in frontend)
- [ ] **CI/CD GitHub Actions (5 workflows):**
  - `sot_integrity.yml` — SHA-256 verification ✅
  - `iskraspace_ci.yml` — Build, test, lint, E2E ✅
  - `runtime_ci.yml` — Runtime tests ✅
  - `production_deploy.yml` — Docker build, Vercel deploy ✅
  - `github_pages.yml` — Documentation deployment ✅
  - *Task:* Verify all workflows are active and passing

## 4. Documentation & Knowledge

- [x] CLAUDE.md: Agent operating rules (vΩ.5.1)
- [x] AGENTS.md: Full agent instructions
- [x] README.md: Complete project overview
- [x] CONTRIBUTING.md: Contribution guidelines
- [x] Skills: 8 YAML specifications
- [x] Technical Specs: SPEC-001..004
- [ ] API Documentation: Update `system/` docs for recent engine changes
- [ ] Facets Master: Unified document (voices + practices + tests)

## 5. Quality Assurance

- [ ] **E2E Testing:** Extend Playwright tests (currently 5 specs in `runtime/iskraSpace/e2e/`)
- [ ] **Performance:** Bundle size and load time audit for `apps/iskra-web`
- [ ] **Security:** `npm audit` and vulnerability remediation
- [ ] **Coverage:** Achieve 90% across all packages (target per `skills/test_strategy.yaml`)
- [ ] **Integration Tests:** Supabase and GraphRAG interactions
- [ ] **Integrity Automation:** Chain `update_ledger` + `verify_ledger` + `horizon_validator`

## 6. Phase 3: Runtime Migration

Strategy: **Strangler Fig Pattern** (see `skills/migration.yaml`)

- [ ] Replace `runtime/iskraSpace/services/metricsService.ts` with `@iskra/math` imports
- [ ] Deprecate `runtime/iskraSpace/services/voiceEngine.ts` → `packages/engine/src/services/voiceSystem.ts`
- [ ] Migrate GraphService and RAG from `runtime` to `@iskra/engine`
- [ ] Freeze `runtime` for new features (already policy — see constraint #5)
- [ ] Archive `runtime/` directory (currently 220 files)

## 7. Phase 4: Production Deploy

- [ ] Deploy CoreEngine (Supabase Edge Functions or client-side PWA)
- [ ] Integrate LLM text generation (Gemini / Claude)
- [ ] Validate "Soul Integrity" (verify math models preserve persona)
- [ ] Performance audit (bundle size, load times)
- [ ] Security audit (`npm audit`, RLS verification)
- [ ] E2E testing with Playwright
- [ ] Canon verification (core/ immutability via `tools/verify_ledger.py`)
- [ ] Code freeze and dependency lock

---

## References

- **Architecture:** `system/architecture.md`
- **Roadmap:** `ROADMAP_SCIENTIFIC_TURN.md`
- **Agent Instructions:** `AGENTS.md`, `CLAUDE.md`
- **Skills:** `skills/` directory (8 YAML files)
- **Integrity:** `ledger/sot.json` (362 SHA-256 hashes), `ledger/checksum.asc`
- **Governance:** `governance/adr.md`, `governance/changelog.md`
- **Specs:** `docs/specs/SPEC-001..004`
