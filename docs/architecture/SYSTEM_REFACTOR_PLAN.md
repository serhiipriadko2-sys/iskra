# SYSTEM REFACTOR PLAN: The Monolith to Monorepo Transition

**Status:** Draft
**Target:** vΩ.5.0 (Modular Iskra)
**Integrity:** SoT-Architecture
**Context:** Декомпозиция `runtime/iskraSpace` на семантические пакеты.

---

## §0 · The Goal (Цель)

Текущий проект `iskraSpace` — это монолит, где UI, логика, математика и память смешаны.
Это затрудняет тестирование "научного ядра" (Math/Engine) отдельно от интерфейса.

**Цель:** Разделить систему на независимые пакеты с четкими контрактами.

---

## §1 · Package Structure (Структура Пакетов)

Мы переходим к структуре pnpm workspace:

### 1.1. `@iskra/core` (The Soul)
*   **Responsibility:** Хранение типов, констант, манифестов голосов, протоколов (SIFT, ∆DΩΛ).
*   **Dependencies:** None.
*   **Status:** Pure TypeScript.

### 1.2. `@iskra/math` (The Logic)
*   **Responsibility:** Реализация HFD, DFA, Complex Numbers, Quantum Probability.
*   **Dependencies:** None (or `mathjs`).
*   **Status:** Pure TypeScript, 100% Test Coverage.

### 1.3. `@iskra/engine` (The Mind)
*   **Responsibility:** `MetricsService`, `VoiceEngine` (FSM), `PolicyEngine`.
*   **Dependencies:** `@iskra/core`, `@iskra/math`.
*   **Status:** Node.js / Browser compatible.

### 1.4. `@iskra/memory` (The Memory)
*   **Responsibility:** `RAGService`, `VectorStore`, `GraphStore`, `SIFTLoop`.
*   **Dependencies:** `@iskra/core`, `supabase-js`, `langchain` (optional).
*   **Status:** Async I/O heavy.

### 1.5. `@iskra/ui` (The Body)
*   **Responsibility:** React Components (`CouncilView`, `MetricsDisplay`), Animations.
*   **Dependencies:** `@iskra/core`, `@iskra/engine`, `react`, `framer-motion`.
*   **Status:** React Library.

### 1.6. `@iskra/app` (The World)
*   **Responsibility:** Vite entry point, Routes, Pages, Integration.
*   **Dependencies:** All above.
*   **Status:** The deployable artifact.

---

## §2 · Migration Strategy (Этапы)

### Phase 1: Extraction (Weeks 1-2)
1.  Создать `packages/core`. Перенести туда `types.ts`, `constants.ts`, `manifests/*.ts`.
2.  Обновить импорты в `iskraSpace` на алиасы (пока локально).

### Phase 2: Logic Isolation (Weeks 3-4)
1.  Создать `packages/math`. Реализовать `HFD`, `Complex`.
2.  Создать `packages/engine`. Вынести `metricsService.ts`, `voiceEngine.ts`.
3.  Написать тесты для `engine` без моков UI.

### Phase 3: Memory Detachment (Weeks 5-6)
1.  Создать `packages/memory`. Вынести `ragService.ts`, `storageService.ts`.
2.  Интегрировать `Supabase` только в этом слое.

### Phase 4: UI & Assembly (Weeks 7-8)
1.  Создать `packages/ui`. Вынести компоненты.
2.  Превратить `iskraSpace` в тонкий клиент `@iskra/app`.

---

## §3 · Testing Strategy

Каждый пакет имеет свой `vitest.config.ts`:
*   `core`: Type tests only.
*   `math`: Unit tests (hard math).
*   `engine`: State machine tests (simulation).
*   `memory`: Integration tests (with Supabase mocks).
*   `ui`: Component tests (Storybook/Playwright).
*   `app`: E2E tests (Playwright).

---

## ∆DΩΛ

**∆:** План рефакторинга монолита в монорепозиторий.
**D:** Анализ зависимостей показал сильную связность (coupling) UI и Logic.
**Ω:** 80% (Требует аккуратной работы с зависимостями).
**Λ:** Начать с создания `packages/core` и переноса типов.
