# Production Transition Plan

> **Last Updated:** 2026-02-02

This document outlines the tasks required to transition the ISKRA project to a production-ready state, based on the Jules Platform audit.

---

## Table of Contents
1. [Immediate Actions (Completed)](#1-immediate-actions-completed)
2. [Infrastructure & Environment](#2-infrastructure--environment)
3. [Documentation & Knowledge](#3-documentation--knowledge)
4. [Quality Assurance](#4-quality-assurance)
5. [Features to Finalize](#5-features-to-finalize)
6. [Final Review](#6-final-review)

---

## 1. Immediate Actions (Completed)
- [x] **Deep Audit:** Full repository analysis and file enumeration.
- [x] **Test Repairs:** Fixed `localStorage` dependency in `streamingAndSecurity.test.ts`.
- [x] **Verification:** Verified 100% test pass rate (817 tests passed).
- [x] **Platform Setup:** Implemented `skills/` directory and `AGENTS.md`.

## 2. Infrastructure & Environment
- [ ] **Dependency Unification:**
    - `runtime` uses `@google/generative-ai` (v0.24.1).
    - `iskraSpace` uses `@google/genai` (v1.34.0).
    - *Task:* Migrate `runtime` to use `@google/genai` for consistency across the monorepo.
- [ ] **Environment Variables:**
    - Ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are securely managed in production (e.g., Vercel/Netlify env vars).
    - Verify `GEMINI_API_KEY` handling in Edge Functions (do not expose in frontend).

## 3. Documentation & Knowledge
- [x] **Jules Platform Docs:** Created `system/jules_platform.md`.
- [x] **Agent Instructions:** Created `AGENTS.md`.
- [ ] **API Documentation:** Update `system/` docs to reflect any recent API changes in `iskraSpace`.

## 4. Quality Assurance
- [ ] **E2E Testing:** Run Playwright tests (`npm run test:e2e` in `iskraSpace`) to verify frontend flows.
- [ ] **Performance:** Audit bundle size and load times for `iskraSpace`.
- [ ] **Security:** Run `npm audit` and address high-severity vulnerabilities.

## 5. Features to Finalize
- [ ] **Skill Expansion:** Add more skills to `skills/` (e.g., `security_audit.yaml`, `react_optimization.yaml`).
- [ ] **CI/CD Integration:** Set up GitHub Actions to trigger Jules Skills on PRs.

## 6. Final Review
- [ ] **Canon Verification:** Ensure `core/` remains the immutable source of truth.
- [ ] **Code Freeze:** Lock dependencies before final build.

---

## Additional Resources

- **Architecture:** See `system/architecture.md`
- **Jules Platform:** See `system/jules_platform.md`
- **Agent Instructions:** See `AGENTS.md`
- **Skills:** Check `skills/` directory for engineering practices
