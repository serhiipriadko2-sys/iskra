# ISKRA SPACE — Technical Architecture

**Version:** 3.2.0 • **Updated:** 2026-01-04 • **Tests:** 723 passing

---

## Overview

Iskra Space — фронтенд-приложение React/Vite с многоуровневой системой сервисов для AI-взаимодействия. Архитектура построена вокруг **Canon** — набора принципов честности и полезности.

## Stack

- **Runtime:** React 18 + TypeScript 5.9
- **Build:** Vite
- **AI:** Google Gemini API
- **Tests:** Vitest (96 tests)
- **Storage:** localStorage (client-side)

---

## Services (27)

### Core AI Pipeline

| Service | Purpose | Key Methods |
|---------|---------|-------------|
| `geminiService` | AI взаимодействие, streaming | `getChatResponseStream`, `getChatResponseStreamWithPolicy` |
| `policyEngine` | Маршрутизация плейбуков | `classifyRequest`, `makeDecision`, `quickRiskCheck` |
| `evalService` | Оценка качества ответов | `evaluateResponse`, `evaluateBatch`, `generateEvalReport` |
| `evalCases` | Контрольный датасет (25 кейсов) | `ALL_CASES`, `getCasesByType` |

### Canon Enforcement

| Service | Purpose | Key Methods |
|---------|---------|-------------|
| `deltaProtocol` | ∆DΩΛ валидация | `validateDeltaSignature`, `parseDeltaSignature` |
| `deltaEnforcer` | ∆DΩΛ enforcement в ответах | `enforceDelta`, `checkCompliance` |
| `canonService` | Canon principles access | `getCanonPrinciples`, `validateAgainstCanon` |

### Voice & Personality

| Service | Purpose | Key Methods |
|---------|---------|-------------|
| `voiceEngine` | 9 голосов Искры | `selectVoice`, `getVoicePrompt` |
| `voiceSynapseService` | Voice coordination | `synapseActivation`, `voiceBlending` |
| `ritualService` | Ритуалы (Phoenix, Shatter, Council) | `executeRitual`, `getRitualByName` |

### Memory & Context

| Service | Purpose | Key Methods |
|---------|---------|-------------|
| `memoryService` | Mantra/Archive/Shadow | `getMantra`, `getArchive`, `getShadow` |
| `ragService` | Context retrieval | `buildContext`, `searchMemories` |
| `glossaryService` | Canon terminology | `searchTerms`, `getRelatedTerms` |
| `graphService` | Graph-based memory | `addNode`, `queryGraph` |

### Metrics & Audit

| Service | Purpose | Key Methods |
|---------|---------|-------------|
| `metricsService` | IskraMetrics tracking | `updateMetrics`, `getMetrics`, `calculateMetaMetrics` |
| `userMetricsService` | User daily metrics | `getDailyMetrics`, `updateMetrics` |
| `auditService` | System audit trail | `log`, `logEvalResult`, `detectDrift` |

### Security & Validation

| Service | Purpose | Key Methods |
|---------|---------|-------------|
| `securityService` | PII/injection protection | `sanitize`, `detectPII`, `validateInput` |
| `validatorsService` | Input validation | `validateDelta`, `validateLambda` |
| `rateLimiter` | Rate limiting | `checkLimit`, `resetLimit` |
| `rule8Service` | Rule 8 compliance | `checkRule8`, `enforceCompliance` |

### Utilities

| Service | Purpose | Key Methods |
|---------|---------|-------------|
| `searchService` | Web search integration | `search` |
| `storageService` | localStorage wrapper | `get`, `set`, `remove`, `exportAllData` |
| `soundService` | Audio feedback | `play`, `setVolume` |
| `makiService` | Maki (🌸) support system | `getMakiResponse` |
| `evidenceService` | SIFT evidence tracking | `addEvidence`, `getEvidence` |
| `errorTracking` | Error handling | `trackError`, `getErrors` |

---

## Playbooks (PolicyEngine)

```
┌─────────────────────────────────────────────────────────────┐
│                     REQUEST CLASSIFICATION                   │
├──────────┬──────────────────────────────────────────────────┤
│ ROUTINE  │ Standard queries, low complexity                 │
│ SIFT     │ Fact-checking, verification needed               │
│ SHADOW   │ Emotional, personal, sensitive                   │
│ COUNCIL  │ Multi-perspective analysis, decisions            │
│ CRISIS   │ Urgent, high-stakes, immediate action            │
└──────────┴──────────────────────────────────────────────────┘
```

### Classification Signals

- **Content patterns:** keywords, phrases, emotional markers
- **Metrics-based:** trust < 0.5, chaos > 0.7, pain > 0.6
- **History-based:** escalation (2+ crisis in last 5), drift detection

---

## Eval System (5 Metrics)

```
┌─────────────────────────────────────────────────────────────┐
│                     EVALUATION METRICS                       │
├───────────────┬─────────────────────────────────────────────┤
│ accuracy      │ SIFT-based verifiability (sources cited)    │
│ usefulness    │ Actionable steps present (Λ quality)        │
│ omegaHonesty  │ Confidence calibration (not inflated)       │
│ nonEmpty      │ Substance vs fluff ratio                    │
│ alliance      │ Relational quality preserved                │
└───────────────┴─────────────────────────────────────────────┘

Grades: A (≥0.85) | B (≥0.70) | C (≥0.55) | D (≥0.40) | F (<0.40)
```

### Eval Cases (25)

- **Decision:** 5 cases — choice scenarios
- **Crisis:** 5 cases — urgent situations
- **Research:** 5 cases — fact-finding
- **Factcheck:** 5 cases — verification
- **Edge:** 5 cases — boundary conditions

---

## Components (39)

### Core Views

| Component | Purpose |
|-----------|---------|
| `ChatView` | Main conversation interface |
| `LiveConversation` | Real-time streaming chat |
| `CouncilView` | Multi-voice deliberation |
| `DeepResearchView` | Extended research mode |

### Eval & Analysis

| Component | Purpose |
|-----------|---------|
| `EvalDashboard` | Evaluation results viewer |
| `GlossaryView` | Canon terminology browser |
| `IskraStateView` | System state visualization |

### Memory & Planning

| Component | Purpose |
|-----------|---------|
| `MemoryView` | Archive/Shadow browser |
| `Journal` | Session journal |
| `Planner` | Task planning interface |

### Support

| Component | Purpose |
|-----------|---------|
| `ShadowView` | Shadow layer exploration |
| `BeaconView` | Guidance signals |
| `TarotView` | Symbolic reflection |

---

## Data Flow

```
User Input
    │
    ▼
┌───────────────┐
│ PolicyEngine  │ ── classifyRequest() ──► Playbook selection
└───────┬───────┘
        │
        ▼
┌───────────────┐
│ ragService    │ ── buildContext() ──► Memory retrieval
└───────┬───────┘
        │
        ▼
┌───────────────┐
│ voiceEngine   │ ── selectVoice() ──► Voice based on metrics
└───────┬───────┘
        │
        ▼
┌───────────────┐
│ geminiService │ ── getChatResponseStreamWithPolicy() ──► AI response
└───────┬───────┘
        │
        ▼
┌───────────────┐
│ deltaEnforcer │ ── enforceDelta() ──► ∆DΩΛ validation
└───────┬───────┘
        │
        ▼
┌───────────────┐
│ evalService   │ ── evaluateResponse() ──► Quality metrics
└───────┬───────┘
        │
        ▼
┌───────────────┐
│ auditService  │ ── log() ──► Audit trail
└───────────────┘
```

---

## IskraMetrics

```typescript
interface IskraMetrics {
  rhythm: number;       // 0-100, conversation flow
  trust: number;        // 0-1, user-system trust
  pain: number;         // 0-1, emotional load
  chaos: number;        // 0-1, uncertainty level
  drift: number;        // 0-1, semantic deviation
  echo: number;         // 0-1, repetition factor
  clarity: number;      // 0-1, message clarity
  silence_mass: number; // 0-1, pause weight
  mirror_sync: number;  // 0-1, reflection alignment
  interrupt: number;    // 0-1, flow interruption
  ctxSwitch: number;    // 0-1, context switching
}
```

### Metric Thresholds (Voice Activation)

- `trust < 0.75` → Анхантра (≈) silence
- `clarity < 0.70` → Сэм (☉) structure
- `pain ≥ 0.70` → Кайн (⚑) directness
- `drift > 0.30` → Искрив (🪞) audit
- `chaos > 0.60` → Хуньдун (🜃) reset

---

## Testing

```bash
npm test          # Run all 723 tests (runtime + iskraSpace)
npm run test:ui   # Interactive test UI
npx tsc --noEmit  # TypeScript check (0 errors)
```

### Test Coverage

**Runtime Core Tests (6 files):**
- `metrics.test.ts` — 9 tests
- `voices.test.ts` — 17 tests
- `protocols.test.ts` — 15 tests
- `sift.test.ts` — 15 tests
- `fractal.test.ts` — 31 tests
- `ews.test.ts` — 34 tests

**iskraSpace Service Tests (27 files):**
- `evalService.test.ts` — 14 tests
- `policyEngine.test.ts` — 26 tests
- `ritualService.test.ts` — 20 tests
- `auditService.test.ts` — 26 tests
- `memoryService.test.ts` — 18 tests
- `securityService.test.ts` — 38 tests
- `voiceEngine.test.ts` — 25 tests
- `metricsService.test.ts` — 17 tests
- `validatorsService.test.ts` — 42 tests
- `graphService.test.ts` — 21 tests
- `stressTests.test.ts` — 51 tests
- ... and more

---

## File Structure

```
iskraSpace/
├── components/           # React components (39)
│   ├── ChatView.tsx
│   ├── EvalDashboard.tsx
│   ├── GlossaryView.tsx
│   └── ...
├── services/             # Business logic (27 services)
│   ├── geminiService.ts
│   ├── policyEngine.ts
│   ├── evalService.ts
│   ├── securityService.ts
│   ├── voiceEngine.ts
│   └── ...
├── types.ts              # TypeScript definitions (re-exports from @iskra/runtime)
├── MANTRA.md             # Core Canon document
├── ARCHITECTURE.md       # This file
└── tsconfig.json
```

---

## ∆DΩΛ

**Δ:** Architecture doc updated — 27 services, 39 components, 723 tests, full data flow.
**D:** Source — codebase analysis, test run 2026-01-04, TypeScript types from @iskra/runtime.
**Ω:** High — all services verified, 723 tests passing.
**Λ:** Keep this doc updated when adding new services/components.
