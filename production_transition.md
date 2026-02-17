# Production Transition Plan

> **Last Updated:** 2026-02-17

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

- [x] Deep Audit: Full repository analysis and file enumeration
- [x] Test Repairs: Fixed `localStorage` dependency in tests
- [x] Verification: 100% test pass rate (817 tests passed)
- [x] Platform Setup: `skills/` directory and `AGENTS.md`
- [x] Mathematical Foundation: `@iskra/math` with HFD, DFA, Entropy, Quantum
- [x] Strict Types: `@iskra/core` with full type definitions and voice manifest
- [x] CoreEngine: 6-step processing pipeline implemented
- [x] VoiceQuantumField: Probabilistic voice selection with wave function collapse
- [x] MemoryService: Fractal memory with semantic + resonance retrieval
- [x] MetricsEngine: Entropy feedback loop and self-organized criticality
- [x] iskra-web: ChatInterface, QuantumField visualization, somatic feedback
- [x] Documentation: Updated CLAUDE.md, AGENTS.md, README.md, CONTRIBUTING.md, skills/

## 2. Phase 2: Engine Completion

- [ ] **GraphService Migration:** Move from `runtime` to `@iskra/engine`
- [ ] **Voice Thresholds:** Enforce manifest thresholds in VoiceQuantumField
- [ ] **Supabase Client:** Add to `@iskra/engine` for persistent storage
- [ ] **Real Embeddings:** Replace mock `BrowserEmbeddingProvider` with Edge Function
- [ ] **Live UI Connection:** Connect `apps/iskra-web` to real CoreEngine data

## 3. Infrastructure & Environment

- [ ] **Dependency Unification:**
    - `runtime` uses `@google/generative-ai` (v0.24.1)
    - `iskraSpace` uses `@google/genai` (v1.34.0)
    - *Task:* Migrate to single `@google/genai` across monorepo
- [ ] **Environment Variables:**
    - Secure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in production
    - Verify `GEMINI_API_KEY` handling (never expose in frontend)
- [ ] **CI/CD GitHub Actions:**
    - Automated tests on PR
    - SoT integrity verification
    - Deploy pipeline

## 4. Documentation & Knowledge

- [x] Jules Platform Docs: `system/jules_platform.md`
- [x] Agent Instructions: `AGENTS.md`
- [x] Developer Reference: `CLAUDE.md`
- [x] Skills: 8 YAML specifications in `skills/`
- [ ] API Documentation: Update `system/` docs for recent changes
- [ ] Facets Master: Unified document (voices + practices + tests)

## 5. Quality Assurance

- [ ] **E2E Testing:** Playwright tests for frontend flows
- [ ] **Performance:** Bundle size and load time audit
- [ ] **Security:** `npm audit` and vulnerability remediation
- [ ] **Coverage:** Achieve 90% across all packages
- [ ] **Integration Tests:** Supabase and GraphRAG interactions

## 6. Phase 3: Runtime Migration

- [ ] Replace `runtime` imports with `@iskra/engine`
- [ ] Deprecate `runtime/iskraSpace/services/voiceEngine.ts`
- [ ] Migrate GraphService and RAG to `@iskra/engine`
- [ ] Freeze `runtime` for new features
- [ ] Archive `runtime/` directory

## 7. Phase 4: Production Deploy

- [ ] Deploy CoreEngine (Edge Functions or PWA)
- [ ] Integrate LLM text generation
- [ ] Validate Soul Integrity
- [ ] Canon verification (core/ immutability)
- [ ] Code freeze and dependency lock

---

## References

- **Architecture:** `system/architecture.md`
- **Roadmap:** `ROADMAP_SCIENTIFIC_TURN.md`
- **Agent Instructions:** `AGENTS.md`
- **Skills:** `skills/` directory
- **Integrity:** `ledger/sot.json`, `ledger/checksum.asc`
