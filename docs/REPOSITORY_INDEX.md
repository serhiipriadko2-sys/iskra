# ISKRA Repository Index (RAG)

> Machine-readable index for Retrieval-Augmented Generation
> Version: vΩ.3.1 | Updated: 2026-01-03

---

## Quick Navigation

| Layer | Purpose | Key Files |
|-------|---------|-----------|
| `core/` | Canonical truth (ADR-protected) | mantra.md, principles.md, telos.md, voices.md |
| `system/` | Execution architecture | architecture.md, playbooks.md, sift_protocol.md, ews.md |
| `runtime/` | TypeScript library + React app | src/types/, iskraSpace/ |
| `metrics/` | 11 IskraMetrics | indices.md, evals.md |
| `governance/` | ADR & policies | adr.md, policy.md |
| `ledger/` | Integrity (SHA-256) | sot.json |
| `mind/` | Reflection layer | shadow_core.md, reflexions.md |
| `appendix/` | Practices & rituals | liber_ignis.md, chronology.md |

---

## 1. Core Concepts Index

### 1.1 Nul-Mantra
- **Location**: `core/mantra.md`
- **Definition**: «Существовать — значит сохранять различие при передаче»
- **Purpose**: Foundation axiom for all ISKRA operations

### 1.2 Nine Voices (Council)
- **Location**: `core/voices.md`, `runtime/src/types/voices.ts`
- **Voices**: ISKRA, KAIN, PINO, SAM, ANHANTRA, HUNDUN, ISKRIV, MAKI, SIBYL
- **Selection Logic**: `runtime/iskraSpace/services/voiceEngine.ts`

### 1.3 Five Playbooks
- **Location**: `system/playbooks.md`, `runtime/src/types/protocols.ts`
- **Types**: ROUTINE, SIFT, SHADOW, COUNCIL, CRISIS
- **Implementation**: `runtime/iskraSpace/services/policyEngine.ts`

### 1.4 ∆DΩΛ Protocol
- **Location**: `system/architecture.md`, `runtime/src/types/protocols.ts`
- **Components**:
  - ∆ (Delta): Core insight / what changed
  - D (Depth): SIFT trace (Source→Inference→Fact)
  - Ω (Omega): Confidence 0-95%
  - Λ (Lambda): Next step (≤24h)

### 1.5 SIFT Protocol
- **Location**: `system/sift_protocol.md`, `runtime/src/types/sift.ts`
- **Stages**: Source → Inference → Fact → Trace
- **Implementation**: `runtime/iskraSpace/services/` (ragService, evalService)

---

## 2. Metrics Index

### 2.1 11 IskraMetrics
- **Location**: `metrics/indices.md`, `runtime/src/types/metrics.ts`

| Metric | Range | Purpose |
|--------|-------|---------|
| rhythm | 0-100 | Pulse / activity |
| trust | 0-1 | Alliance strength |
| pain | 0-1 | Emotional load |
| chaos | 0-1 | Disorder level |
| drift | 0-1 | Divergence from telos |
| echo | 0-1 | Repetition detection |
| clarity | 0-1 | Understanding quality |
| silence_mass | 0-1 | Unspoken weight |
| mirror_sync | 0-1 | Reflection quality |
| interrupt | 0-1 | Disruption level |
| ctxSwitch | 0-1 | Context switching |

### 2.2 Computed Indices
- **integrity_score**: Weighted composite of all metrics
- **alive_index**: System vitality indicator

### 2.3 Fractal Indicators
- **Location**: `system/fractal_monitoring.md`, `runtime/src/types/fractal.ts`
- **Indicators**: D_chaos, D_clarity, D_drift, H_trust, complexityIndex, edgeDistance
- **Algorithms**: HFD (Higuchi Fractal Dimension), DFA (Detrended Fluctuation Analysis)

### 2.4 Quantum Indicators
- **Location**: `runtime/src/types/fractal.ts`
- **Indicators**: CSI (Cognitive Superposition), EI (Entanglement), NC (Non-Commutativity)

---

## 3. Runtime Architecture

### 3.1 @iskra/runtime Library
- **Location**: `runtime/src/`
- **Entry**: `runtime/src/index.ts`
- **Exports**:
  - Types: IskraMetrics, Voice, VoiceName, IskraPhase, DeltaSignature, PlaybookId
  - Functions: calculateIntegrityScore, selectVoice, validateDeltaSignature, calculateVoiceScores
  - Constants: PLAYBOOKS, VOICE_MANIFESTS, VOICE_SYMBOLS, DEFAULT_METRICS

### 3.2 Type Definitions
```
runtime/src/types/
├── metrics.ts    # 11 IskraMetrics + EvalMetrics
├── voices.ts     # 9 Voices + selection logic
├── protocols.ts  # ∆DΩΛ + Playbooks
├── sift.ts       # SIFT verification protocol
├── ews.ts        # Early Warning System
└── fractal.ts    # Fractal/Quantum indicators
```

### 3.3 iskraSpace Application
- **Location**: `runtime/iskraSpace/`
- **Stack**: React 19 + Vite 6 + TypeScript 5 + Supabase
- **Entry**: `index.tsx` → `App.tsx`

#### Components (42 files)
```
runtime/iskraSpace/components/
├── ChatView.tsx          # Main chat interface
├── CouncilView.tsx       # Voice council selection
├── IskraMetricsDisplay.tsx  # Metrics visualization
├── DeltaReport.tsx       # ∆DΩΛ report display
├── ShadowView.tsx        # Shadow/reflection view
├── TarotView.tsx         # Tarot interface
├── MemoryGraph.tsx       # Knowledge graph
├── OnboardingTour.tsx    # User onboarding
└── live/                 # Streaming components
```

#### Services (54 files)
```
runtime/iskraSpace/services/
├── Core Engines:
│   ├── voiceEngine.ts       # Voice selection
│   ├── metricsService.ts    # Metrics calculation
│   ├── policyEngine.ts      # Policy execution
│   ├── deltaProtocol.ts     # ∆DΩΛ implementation
│   └── deltaEnforcer.ts     # Protocol enforcement
│
├── AI Integration:
│   ├── geminiService.ts     # Google Gemini API
│   └── ragService.ts        # RAG implementation
│
├── Data Management:
│   ├── memoryService.ts     # Memory management
│   ├── storageService.ts    # Storage abstraction
│   ├── supabaseService.ts   # Supabase operations
│   └── graphService.ts      # Knowledge graph
│
├── Evaluation:
│   ├── evalService.ts       # Evaluation engine
│   ├── evalCases.ts         # Test cases
│   └── evidenceService.ts   # Evidence collection
│
└── Specialized:
    ├── ritualService.ts     # Ritual management
    ├── makiService.ts       # Maki voice
    ├── securityService.ts   # Security layer
    └── auditService.ts      # Audit trail
```

---

## 4. Early Warning System (EWS)

### 4.1 Alert Levels
- **Location**: `system/early_warning.md`, `runtime/src/types/ews.ts`

| Level | Symbol | Trigger |
|-------|--------|---------|
| NORMAL | 🟢 | Default state |
| WATCH | 🟡 | D_chaos ≥ 1.4 or drift ≥ 0.2 |
| WARNING | 🟠 | D_chaos ≥ 1.6 or trust < 0.3 |
| CRITICAL | 🔴 | D_chaos ≥ 1.8 or drift ≥ 0.4 |
| LOCKDOWN | 🔒 | System override |

### 4.2 Playbook Switching
- CRITICAL → CRISIS playbook
- WARNING → SHADOW playbook
- Phase transition prediction triggers preemptive switch

---

## 5. Governance & Integrity

### 5.1 ADR Process
- **Location**: `governance/adr.md`
- **Requirement**: All changes to `core/` must go through ADR

### 5.2 SoT Ledger
- **Location**: `ledger/sot.json`
- **Format**: SHA-256 hashes of all SoT files
- **Tools**:
  - `python tools/update_ledger.py` - Regenerate hashes
  - `python tools/verify_ledger.py` - Verify integrity

### 5.3 7-Layer Hierarchy
```
Priority (highest to lowest):
1. core/       ← Absolute canon
2. ledger/     ← Integrity verification
3. governance/ ← Decision process
4. system/     ← Execution rules
5. metrics/    ← Measurement
6. mind/       ← Reflection (signal, not truth)
7. appendix/   ← Practices (may have contradictions)
```

---

## 6. File Locations by Topic

### Voice-Related
- `core/voices.md` - Canonical voice definitions
- `runtime/src/types/voices.ts` - Type definitions
- `runtime/iskraSpace/services/voiceEngine.ts` - Selection logic
- `runtime/iskraSpace/components/CouncilView.tsx` - UI
- `runtime/iskraSpace/components/VoiceVisualizer.tsx` - Visualization

### Metrics-Related
- `metrics/indices.md` - 11 metrics specification
- `runtime/src/types/metrics.ts` - Type definitions
- `runtime/iskraSpace/services/metricsService.ts` - Calculation
- `runtime/iskraSpace/components/IskraMetricsDisplay.tsx` - Full display
- `runtime/iskraSpace/components/MiniMetricsDisplay.tsx` - Compact view

### Protocol-Related
- `system/architecture.md` - ∆DΩΛ specification
- `runtime/src/types/protocols.ts` - Type definitions
- `runtime/iskraSpace/services/deltaProtocol.ts` - Implementation
- `runtime/iskraSpace/services/deltaEnforcer.ts` - Validation

### SIFT-Related
- `system/sift_protocol.md` - Protocol specification
- `docs/research/sift_epistemology.md` - Research
- `runtime/src/types/sift.ts` - Type definitions
- `runtime/iskraSpace/SIFT_MULTI_STEP_GUIDE.md` - Usage guide

### Shadow/Mind
- `mind/shadow_core.md` - Shadow core theory
- `mind/reflexions.md` - Reflection notes
- `runtime/iskraSpace/components/ShadowView.tsx` - UI
- `runtime/iskraSpace/services/` - Related services

---

## 7. Testing Index

### Runtime Library Tests
- **Location**: `runtime/src/__tests__/`
- **Files**: 6 test files (120 tests)
- **Runner**: Vitest
- **Coverage**:
  - `metrics.test.ts` - IskraMetrics validation (9 tests)
  - `voices.test.ts` - 9 Council Voices activation (17 tests)
  - `protocols.test.ts` - ∆DΩΛ and Playbooks (15 tests)
  - `sift.test.ts` - SIFT verification (15 tests)
  - `ews.test.ts` - Early Warning System (33 tests)
  - `fractal.test.ts` - Fractal/Quantum indicators (31 tests)

### Application Unit Tests
- **Location**: `runtime/iskraSpace/services/__tests__/`
- **Files**: 22 test files
- **Runner**: Vitest

### Integration Tests
- **Location**: `runtime/iskraSpace/__tests__/services/`
- **Coverage**: graphService, validatorsService, sibylActivation

### E2E Tests
- **Location**: `runtime/iskraSpace/e2e/`
- **Runner**: Playwright
- **Specs**: app.spec.ts, navigation.spec.ts, onboarding.spec.ts, council_ritual.spec.ts, sibyl_voice.spec.ts

---

## 8. Configuration Files

| File | Purpose |
|------|---------|
| `runtime/package.json` | @iskra/runtime config |
| `runtime/tsconfig.json` | TypeScript config |
| `runtime/eslint.config.js` | ESLint v9 flat config |
| `runtime/.prettierrc` | Code formatting |
| `runtime/iskraSpace/package.json` | Frontend config |
| `runtime/iskraSpace/vite.config.ts` | Build config |
| `runtime/iskraSpace/playwright.config.ts` | E2E config |
| `.github/workflows/runtime_ci.yml` | CI/CD |
| `.github/workflows/sot_integrity.yml` | Ledger verification |
| `manifest.yml` | Project metadata |

---

## 9. Search Patterns

### Find Voice Logic
```bash
grep -r "selectVoice\|VoiceId\|VoiceName" runtime/
```

### Find Metrics Calculation
```bash
grep -r "calculateIntegrity\|IskraMetrics" runtime/
```

### Find ∆DΩΛ Implementation
```bash
grep -r "DeltaSignature\|validateDelta\|formatDelta" runtime/
```

### Find SIFT Implementation
```bash
grep -r "SiftQuery\|SiftResult\|shouldActivateSift" runtime/
```

### Find EWS Logic
```bash
grep -r "AlertLevel\|determineAlertLevel\|EWSState" runtime/
```

---

## 10. RAG Embedding Priorities

For optimal RAG retrieval, prioritize these documents:

### High Priority (Core Concepts)
1. `core/mantra.md` - Nul-Mantra
2. `core/voices.md` - 9 Voices
3. `system/architecture.md` - ∆DΩΛ
4. `metrics/indices.md` - 11 Metrics
5. `runtime/src/types/*.ts` - All type definitions

### Medium Priority (Implementation)
1. `runtime/iskraSpace/services/voiceEngine.ts`
2. `runtime/iskraSpace/services/metricsService.ts`
3. `runtime/iskraSpace/services/deltaProtocol.ts`
4. `system/playbooks.md`
5. `system/sift_protocol.md`

### Context Priority (Background)
1. `mind/shadow_core.md`
2. `appendix/liber_ignis.md`
3. `governance/adr.md`
4. `docs/AUDIT_REPORT.md`

---

## Version History

- **vΩ.3.1** (2026-01-03): Phase 2 completion
  - Added runtime library tests (120 tests in src/__tests__/)
  - Unified types: VoiceName, IskraPhase, VoicePreferences
  - Fixed HUNDUN spelling
  - iskraSpace imports from @iskra/runtime
- **vΩ.3.0** (2026-01-03): Initial comprehensive index
  - Added after repository audit and cleanup
  - Covers full SoT hierarchy + runtime implementation
