# ISKRA SPACE — Technical Architecture

**Version:** 0.3.3 • **Updated:** 2026-07-28

---

## Overview

Iskra Space — фронтенд-приложение React/Vite с многоуровневой системой сервисов для AI-взаимодействия. Архитектура построена вокруг **Canon** — набора принципов честности и полезности.

## Stack

- **Runtime:** React 19.2 + TypeScript 6.0.3
- **Build:** Vite 6.4.3
- **AI:** Supabase Edge AI gateway with a server-owned Gemini model allowlist
- **Tests:** Vitest + Deno policy/boundary suites; use current CI receipts, not a hard-coded count
- **Storage:** Supabase Auth/RLS + principal-scoped localStorage offline cache

---

## Services (27)

### Core AI Pipeline

| Service | Purpose | Key Methods |
|---------|---------|-------------|
| `geminiService` | Supabase Edge AI gateway client, streaming, embeddings | `getChatResponseStream`, `getChatResponseStreamWithPolicy`, `generateText` |
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
| `principalStorage` | Per-user namespace, legacy migration, transactional rollback | `bind`, `migrateLegacy`, `applyTransaction`, `clearBoundPrincipal` |
| `storageService` | Typed principal data and backup lifecycle | `bindPrincipal`, `exportAllData`, `importAllData`, `releasePrincipal` |
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
| `LiveConversation` | Release-disabled voice surface until server-side streaming gateway exists |
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

Authoritative source: `services/voiceEngine.ts` activation functions (pinned by
`services/__tests__/voiceThresholdCanon.test.ts`). Matches CLAUDE.md §9.

- `trust < 0.75` → Анхантра (≈) silence
- `clarity < 0.6` → Сэм (☉) structure
- `pain ≥ 0.3` → Кайн (⚑) directness
- `drift ≥ 0.2` → Искрив (🪞) audit
- `chaos ≥ 0.4` → Хуньдун (🜃) reset

---

## Testing

```bash
pnpm --dir runtime/iskraSpace typecheck
pnpm --dir runtime/iskraSpace test:run
pnpm --dir runtime/iskraSpace build
pnpm --dir runtime/iskraSpace lint
pnpm --dir runtime/iskraSpace audit
```

### Test Snapshot

- `pnpm --dir runtime/iskraSpace test:run`: 37 files passed, 1 skipped; 636 tests passed, 3 skipped.
- `pnpm --dir runtime/iskraSpace typecheck`: 0 TypeScript errors.
- `pnpm --dir runtime/iskraSpace build`: production build passed; no `vendor-genai` client bundle chunk.
- `pnpm --filter iskra-space lint`: 0 errors, 77 warnings.
- Chromium E2E: 27 passed with `pnpm --filter iskra-space exec playwright test --project=chromium`.
- Full Playwright browser matrix remains a release gate; browser binaries must be installed with `pnpm exec playwright install`.

---

## File Structure

```
iskraSpace/
├── components/           # React components (39)
│   ├── ChatView.tsx
│   ├── EvalDashboard.tsx
│   ├── GlossaryView.tsx
│   └── ...
├── services/             # Business logic and runtime boundaries
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

**∆:** Architecture doc corrected for pre-release hardening: pnpm canonical path, Edge AI gateway, voice release-disabled, current tests.
**D:** Source — local gates on 2026-07-01 plus Supabase read-only inventory.
**Ω:** 0.88 — local runtime gates pass; Supabase advisor warnings and full E2E matrix remain open.
**Λ:** Keep this doc tied to release receipts, not historic test counts.
