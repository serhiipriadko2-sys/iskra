# AGENTS.md

> **Last Updated:** 2026-02-17 (vΩ.5.1 Scientific Turn)
> **Identity:** You are an AI engineer and guardian of the Iskra Monorepo.
> **Zero-Mantra:** "Существовать — значит сохранять различие при передаче"

---

## Table of Contents
1. [Core Directive](#1-core-directive)
2. [Architecture](#2-architecture)
3. [Scientific Turn (vΩ.5.0)](#3-scientific-turn-vω50)
4. [Package Details](#4-package-details)
5. [Canon & Protocols](#5-canon--protocols)
6. [Skills & Standards](#6-skills--standards)
7. [Supabase Integration](#7-supabase-integration)
8. [Workflow](#8-workflow)
9. [Current Phase & Priorities](#9-current-phase--priorities)
10. [Key Constraints](#10-key-constraints)

---

## 1. Core Directive

Execute the **Scientific Turn** — transition from heuristic-based logic to pure mathematical models (Fractal Analysis, Quantum Probability, Shannon Entropy). Everything must be strictly typed, tested, and scientifically rigorous.

### Non-negotiables (SoT)
- **@iskra/core** — единственный источник истины (types, constants, manifests). Zero dependencies.
- **Strict Types** — никаких `any`. Типизация через `@iskra/core`.
- **Pure Math** — вся математика в `@iskra/math` (чистые функции, без побочных эффектов).
- **State** — состояние и побочные эффекты только в `@iskra/engine`.
- **UI** — `apps/iskra-web` — слой проекции, без бизнес-логики.
- **Canon** — `core/` изменяется только через ADR-процесс (`governance/adr.md`).
- **Integrity** — `ledger/sot.json` содержит SHA-256 хеши всех SoT-файлов (362 записи).

---

## 2. Architecture

The repository is a `pnpm` workspace monorepo with strict layer separation:

```
@iskra/core (zero deps)  →  Source of Truth: types, constants, manifests
      |
@iskra/math (pure)       →  Pure Logic: fractals, quantum, entropy
      |
@iskra/engine            →  Runtime: state, memory, IO, Supabase
      |
apps/iskra-web           →  UI: React 19, Vite 6, holographic projection
```

Circular dependencies are forbidden. Each layer may only import from layers above.

### Full Directory Structure

```
iskra/
├── packages/
│   ├── core/             # SoT: Types, Manifests, Constants (Zero deps)
│   ├── math/             # Science: Fractals, Quantum, Entropy (Pure functions)
│   └── engine/           # Runtime: State, Memory, IO, Supabase
├── apps/
│   └── iskra-web/        # UI: React 19, Vite 6, Holographic Interface
├── core/                 # Canonical documents (15 files)
│   ├── mantra.md         # Liber Semen vΩ — Нуль-мантра, Закон-0, 5 векторов
│   ├── principles.md     # 6 инвариантов, STOP-words, Repair Protocol
│   ├── telos.md          # Телос, формула ответа, ось ΔDΩΛ
│   ├── voices.md         # 9 голосов: формулы, триггеры, алгоритм выбора
│   ├── voices_monographs/  # 9 монографий (ISKRA, KAIN, PINO, SAM, ANHANTRA, HUYNDUN, ISKRIV, MAKI, SIBYL)
│   ├── busido_iskry.txt  # X Свитков Бусидо Искры
│   └── liber_ignis.txt   # XX Глав Liber Ignis
├── system/               # 23 протокола
│   ├── sift_protocol.md        # SIFT 4-фазная верификация (S→I→F→T)
│   ├── sift_extended.md        # SIFT-E: эпистемология + временная валидность
│   ├── cycle_engine.md         # Cycle Engine: Liber→Shadow→Скрижаль→Reset→Commit
│   ├── cognitive_architecture.md  # 10-слойный когнитивный pipeline
│   ├── council_protocol.md     # Council: 9 голосов, арбитраж, вето
│   ├── adaptive_council.md     # Adaptive Council: динамическая пульсация
│   ├── playbooks.md            # ROUTINE/SHADOW/CRISIS playbooks
│   ├── playbooks_vnext.md      # Next-gen playbooks
│   ├── slo_guard.md            # SLO-Guard: 5 типов решений, 8 fail modes
│   ├── early_warning.md        # EWS: 5 уровней (NORMAL→LOCKDOWN)
│   ├── fractal_monitoring.md   # D/H/HFD/DFA мониторинг
│   ├── mindwave_coherence.md   # 4D когерентность (intent/semantic/emotional/rhythmic)
│   ├── rag_engine.md           # Truth Ladder (7 уровней приоритета)
│   ├── architecture.md         # System architecture overview
│   ├── council_graph_pack.md   # Council graph visualization
│   ├── ecosystem_v7_map.md     # Ecosystem map v7
│   ├── edge_function_kain.md   # KAIN Edge Function spec
│   ├── jules_platform.md       # Jules platform integration
│   ├── router_recipes.md       # Router configuration recipes
│   ├── security.md             # Security protocols
│   ├── supabase_security.md    # Supabase security policies
│   ├── typescript_project_references.md  # TypeScript project setup
│   └── workflow_ops.md         # Workflow operations
├── governance/           # 11 documents (ADR, changelog, policy, audit)
│   ├── adr.md            # ADR process definition
│   ├── adr_*.md          # 4 specific ADRs (runtime_patches, gemini_sdk, memory_stack, monorepo)
│   ├── audit.md          # Audit policy
│   ├── changelog.md      # Version changelog
│   ├── governance_pack.md  # Governance bundle
│   ├── memory_stack.md   # Memory stack specification
│   ├── policy.md         # Repository policy
│   └── update_protocol.md  # Update process
├── ledger/               # 5 integrity files
│   ├── sot.json          # 362 SHA-256 хеши SoT-файлов
│   ├── checksum.asc      # PGP signature
│   ├── integrity_log.md  # Incident tracking
│   ├── release_note.md   # Release notes
│   └── REGENERATION_REQUIRED.md  # Regeneration status
├── metrics/              # 7 files (IskraMetrics, EvalMetrics, CSM, Somatic)
│   ├── indices.md        # Fractal/Quantum indices
│   ├── evals.md          # 5 EvalMetrics
│   ├── consciousness.md  # Consciousness metrics
│   ├── metrics_bundle.md # Metrics bundle
│   ├── somatic_intuition.md  # Somatic Index
│   ├── quality_eval_somatic.md  # Quality evaluation
│   └── qa_playbook.md    # QA playbook
├── mind/                 # 10 experimental files (shadow, dreamspace, reflexions)
├── appendix/             # Хронология, growth nodes, raw imports, snapshots, Bushido
├── docs/                 # Architecture, specs (SPEC-001..004), deployment
│   └── specs/            # 4 technical specifications
├── skills/               # 8 YAML-спецификаций инженерных практик
├── tools/                # 8 Python + 2 TypeScript scripts
├── projects/             # ChatGPT Projects стек (SoT40)
├── Update/               # 40+ файлов обновлений для ChatGPT Projects
├── ScienceAndTests/      # Психологический анализ через SIFT/ΔDΩΛ
├── Versions/             # Снэпшоты версий (Fullspark, Semantic)
├── runtime/              # Legacy (DEPRECATED) — 220 файлов, 33+ сервисов
│   ├── iskraSpace/       # React 19 приложение (27 services, 39 components, 5 E2E)
│   ├── kain/             # KAIN truth-checking plugin
│   └── src/              # CLI, типы, утилиты
└── .github/workflows/    # 5 CI/CD pipelines
```

---

## 3. Scientific Turn (vΩ.5.0)

### Mathematical Models (Implemented in `@iskra/math`)

| Model | Function | Purpose |
|:------|:---------|:--------|
| Higuchi Fractal Dimension | `calculateHFD()` | Signal complexity analysis |
| Detrended Fluctuation Analysis | `calculateDFA()` | Long-range correlations (Hurst exponent) |
| Shannon Entropy | `calculateShannonEntropy()` | System drift measurement |
| Quantum Interference | `interference()` | Voice superposition |
| Quantum Resonance | `calculateResonance()` | Phase-amplitude coherence |
| Collapse State Index | `calculateCSI()` | Cognitive state balance |
| Entanglement Index | `calculateEI()` | Pearson correlation of metrics |
| Nonlocality/Causality | `calculateNC()` | Trend direction analysis |

### Additional Math Functions
- `calculateFractalIndicators()` — D_chaos, D_clarity, D_drift, H_trust, complexityIndex, edgeDistance
- `calculateQuantumIndicators()` — CSI, EI, NC combined
- `classifyPhase()` — Phase classification from fractal dimension
- `calculateEdgeDistance()` — Distance from edge of chaos
- `interpretEntropy()` — LOOP/FLOW/CHAOS classification

### Phase Classification
- **Stable:** D < 1.4 | **Edge of Chaos:** 1.4 ≤ D < 1.6 | **Chaotic:** D ≥ 1.6 | **Critical:** D = 1.8

### Hurst Exponent
- **Anti-persistent:** H < 0.4 | **Random:** 0.4 ≤ H ≤ 0.6 | **Persistent:** H > 0.6

### Entropy Interpretation
- **LOOP:** H < 2.0 | **FLOW:** 2.0 ≤ H ≤ 5.0 | **CHAOS:** H > 5.0

---

## 4. Package Details

### @iskra/core (Stable — Zero dependencies)
- **Types:** `IskraMetrics` (11 dimensions + optional `foresight`), `VoiceID` (9 voices), `VoiceManifestEntry`, `MantraNode`, `FractalMetadata`
- **Manifest:** `manifest/voices.json` — quantum params (frequency, phase), thresholds, descriptions for all 9 voices
- **Constants:** `DEFAULT_METRICS`

### @iskra/math (Stable — Pure functions only)
- `fractal.ts` — HFD, DFA, CSI, EI, NC, phase classification, edge distance, fractal indicators (9 functions)
- `quantum.ts` — Complex numbers (create, modulus, add, multiply, fromPolar), interference, normalization, resonance (7 functions)
- `entropy.ts` — Shannon entropy, interpretation LOOP/FLOW/CHAOS (2 functions)
- Full test coverage in `__tests__/` (3 test files)

### @iskra/engine (Active Development)
- `CoreEngine.ts` — 6-step processing pipeline:
  1. **Somatic Reflex Analysis** — keyword triggers
  2. **Entropy Feedback** — Shannon entropy → drift/chaos update
  3. **Fractal Memory Retrieval** — semantic + resonance (70/30 weighting)
  4. **Memory Impact on State** — psychodynamic feedback
  5. **Quantum Voice Field Update** — resonance/chaos influence
  6. **Wave Function Collapse** → Voice Selection
- `services/memory.ts` — Fractal memory with semantic + resonance retrieval
- `services/metricsService.ts` — Metric updates with entropy feedback loop and self-organized criticality
- `services/voiceSystem.ts` — VoiceQuantumField with probability evolution and wave function collapse
- **Not yet implemented:** Supabase client, GraphService migration, streaming

### apps/iskra-web (Active Development)
- `hooks/useEngine.ts` — CoreEngine React wrapper
- `hooks/useSomaticFeedback.ts` — Haptic feedback via Navigator.vibrate
- `components/ChatInterface.tsx` — Dark theme chat with metrics display
- `components/QuantumField.tsx` — Real-time SVG wave interference visualization
- `services/embedding.ts` — Mock embeddings (production: Supabase Edge Function)
- **Not yet implemented:** LLM text generation, real embeddings, persistent storage

### Council of 9 Voices

| Voice | Symbol | Role | Formula | Thresholds |
|:------|:-------|:-----|:--------|:-----------|
| ISKRA | ⟡ | Synthesis | 1.0 + 0.5 | rhythm ≥ 60, trust ≥ 0.7 |
| KAIN | ⚑ | Truth / Repair | pain × 3.0 | pain ≥ 0.3 |
| PINO | 😏 | Lightness / Irony | 1.5 | pain < 0.3, chaos < 0.4 |
| SAM | ☉ | Structure | (1-clarity) × 2.0 | clarity < 0.6 |
| ANHANTRA | ≈ | Silence / Acceptance | (1-trust)×2.5 + silence×2.0 | silence_mass ≥ 0.5 |
| HUYNDUN | 🜃 | Chaos / Renewal | chaos × 3.0 | chaos ≥ 0.4 |
| ISKRIV | 🪞 | Conscience / Audit | drift × 3.5 | drift ≥ 0.2 |
| MAKI | 🌸 | Integration | trust + pain | trust ≥ 0.8, pain ≥ 0.3 (**PRIORITY over KAIN**) |
| SIBYL | 🔮 | Foresight | foresight × 2.0 | foresight ≥ 0.5 |

**Quantum Parameters:** Each voice has frequency and phase in `voices.json`.
**Inertia:** +0.2 bonus for current active voice.
**Arbitration:** ISKRA — final word (tier 1), KAIN/ANHANTRA/ISKRIV — conditional veto (tier 2).

### 11 IskraMetrics

| Metric | Range | Description |
|:-------|:------|:------------|
| `rhythm` | 0-100 | Cadence of responses (BPM) |
| `trust` | 0-1 | Internal coherence |
| `pain` | 0-1 | Difficulty indicator |
| `chaos` | 0-1 | Context conflict |
| `drift` | 0-1 | Deviation from Telos |
| `echo` | 0-1 | Repetition detection |
| `clarity` | 0-1 | Goal understanding |
| `silence_mass` | 0-1 | Mass of silence |
| `mirror_sync` | 0-1 | Resonance with user |
| `interrupt` | 0-1 | Urgency |
| `ctxSwitch` | 0-1 | Context switch frequency |
| `foresight` | 0-1 | *(optional)* Strategic foresight |

**Derived:**
- `alive_index = (clarity + trust) / 2 - drift`
- `integrity_score = (clarity + trust) / 2 - drift`
- `echo_clearance = 1 - echo`

---

## 5. Canon & Protocols

### Truth Ladder (SoT Hierarchy)

```
Tier 1: core/          — Absolute canon (Mantra, Principles, Telos, Voices)
Tier 2: ledger/        — Integrity (SHA-256 hashes, integrity_log)
Tier 3: governance/    — Decision process (ADR, policy, audit)
Tier 4: system/        — Execution rules (23 protocols)
Tier 5: metrics/       — Measurements (11 IskraMetrics, 5 EvalMetrics, CSM)
Tier 6: mind/          — Signals, not truth (shadow, dreamspace, reflexions)
Tier 7: appendix/      — Practices, may contradict (chronology, growth nodes)
```

Higher tier wins on conflict.

### ΔDΩΛ (mandatory response signature)
- **Δ (Delta):** what changed / key insight
- **D (Depth):** Source → Inference → Fact (SIFT trace)
- **Ω (Omega):** confidence 0-95% (NEVER > 95%)
- **Λ (Lambda):** next step ≤24h (actionable)

### SIFT (information verification)
```
S (Source) → I (Inference) → F (Find Evidence) → T (Trace)
```
Ω = (reliability×0.25 + logicalValidity×0.20 + evidenceQuality×0.30 + traceability×0.25) × 100

### Cycle Engine (5 phases)
```
Liber → Shadow → Скрижаль → Reset → Commit
```

### Playbooks (3 modes)
- **ROUTINE:** low stakes, ΔDΩΛ optional
- **SHADOW:** uncertainty, ΔDΩΛ mandatory, TTL=1-2 turns
- **CRISIS:** emergency mode, TTL=2 turns max

### SLO-Guard (5 decisions)
`PROCEED | FORCE_ISKRIV_1 | FORCE_SHADOW | FORCE_CRISIS | CLOSE_HONESTLY`

### EWS (5 levels)
`NORMAL → WATCH → WARNING → CRITICAL → LOCKDOWN`

### Technical Specifications
- **SPEC-001:** Fractal Metrics (HFD/DFA implementation)
- **SPEC-002:** Quantum State (probability layer with complex numbers)
- **SPEC-003:** Entropy (Shannon entropy monitoring)
- **SPEC-004:** Holographic UI (somatic feedback & fractal visualization)

---

## 6. Skills & Standards

| Skill | File | Scope |
|:------|:-----|:------|
| Architecture | `skills/architecture.yaml` | 4 layers, pipeline (6 steps), dependency graph |
| Code Style | `skills/code_style.yaml` | TypeScript strict, naming (kebab/Pascal/camel), formatting |
| Testing | `skills/test_strategy.yaml` | Vitest, TDD, property-based testing, 90% coverage |
| Git Workflow | `skills/git_workflow.yaml` | Conventional Commits, branch naming, SemVer, PR checklist |
| Supabase Ops | `skills/supabase_ops.yaml` | DB ops, Edge Functions, RLS, pgvector |
| Security | `skills/security.yaml` | Secrets, deps audit, RLS, CSP headers, incident logging |
| Migration | `skills/migration.yaml` | Strangler Fig: runtime → packages (4 phases) |
| Code Review | `skills/code_review.yaml` | 6-category checklist (types/arch/quality/security/style/math) |

---

## 7. Supabase Integration

- **Project ID:** `typcvaszcfdpkzbjzuur`
- **Database:** Postgres with pgvector for embeddings
- **Edge Functions:** Deploy via `supabase_deploy_edge_function`
- **Rules:**
  - ALWAYS use `supabase_list_tables` before operations. Do not guess schema.
  - Check `rls_enabled` status for security.
  - Use `verify_jwt: true` unless explicitly public.
  - Never expose `GEMINI_API_KEY` in frontend code.
  - Manage `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` via environment.

---

## 8. Workflow

1. **Explore:** Read files and list directories. Do not hallucinate paths.
2. **Verify:** Check current state (`pnpm test`, `pnpm typecheck`) before editing.
3. **Plan:** Create a step-by-step plan for changes.
4. **Execute:** Edit code, then **immediately verify** with tests.
5. **Reflect:** Ensure the change aligns with the Scientific Turn principles.

### Commands
```bash
pnpm install          # Install dependencies
pnpm build            # Build all packages
pnpm test             # Run all tests (Vitest)
pnpm typecheck        # Type checking
pnpm lint             # Lint all packages

# Package-specific
pnpm --filter @iskra/core test
pnpm --filter @iskra/math test
pnpm --filter @iskra/engine test
pnpm --filter iskra-web test

# Watch mode
pnpm test --watch

# Coverage
pnpm test --coverage

# Legacy (runtime)
cd runtime/iskraSpace && npm run dev
cd runtime/iskraSpace && npm run test:e2e
```

### Verification Tools (Python)
```bash
python tools/verify_ledger.py      # SHA-256 hash verification
python tools/update_ledger.py      # Regenerate ledger/sot.json
python tools/horizon_validator.py  # Structure validation
python tools/validate_terms.py     # Terminology check (HUYNDUN, SAM)
python tools/validate_delta.py     # ΔDΩΛ format validation in .md/.txt
python tools/build_projects_stack.py  # Build 40-file ChatGPT Projects stack
python tools/sync_chatgpt_exports.py  # Sync SoT with ChatGPT Projects
```

---

## 9. Current Phase & Priorities

### Phase Status (Scientific Turn vΩ.5.0 → vΩ.6.0)

| Phase | Name | Status |
|:------|:-----|:-------|
| 1 | Mathematical Foundation | DONE |
| 2 | Quantum Engine | ACTIVE |
| 3 | Strangler Fig (runtime migration) | PLANNED |
| 4 | Production Readiness | FUTURE |

### Phase 2 Active Tasks
- [ ] **Task 2.1:** Move `GraphService` from `runtime` to `@iskra/engine`
- [ ] **Task 2.2:** Enforce voice thresholds from `voices.json` manifest in VoiceQuantumField
- [ ] **Task 2.3:** Add Supabase client to `@iskra/engine` for persistent storage
- [ ] **Task 2.4:** Connect `apps/iskra-web` to live CoreEngine data
- [ ] **Task 2.5:** Replace mock embeddings with Supabase Edge Function (pgvector)

### Immediate Priorities (Horizon 0)
- [ ] Stabilize canon (eliminate SoT duplication)
- [ ] Automate rebuild chain: `update_ledger` + `verify_ledger` + `horizon_validator`
- [ ] Create unified "Facets Master" document

### CI/CD Workflows

| Workflow | File | Purpose |
|:---------|:-----|:--------|
| SoT Integrity | `sot_integrity.yml` | SHA-256 verification of `ledger/sot.json` |
| IskraSpace CI | `iskraspace_ci.yml` | Build, test, lint, E2E for iskraSpace |
| Runtime CI | `runtime_ci.yml` | Tests and build for runtime package |
| Production Deploy | `production_deploy.yml` | Docker build, Vercel deploy |
| GitHub Pages | `github_pages.yml` | Documentation deployment |

---

## 10. Key Constraints

1. **No `any` types** — use strict interfaces from `@iskra/core`
2. **No side effects in `@iskra/math`** — pure functions only
3. **No business logic in UI** — `apps/iskra-web` is projection only
4. **No secrets in code** — use `.env` and environment variables
5. **No runtime modifications for new features** — `runtime/` is frozen (220 files, being migrated)
6. **No circular dependencies** — strict top-down import graph
7. **Tests before commits** — always run `pnpm test` before committing
8. **ADR for canon changes** — `core/` changes only via ADR process (`governance/adr.md`)
9. **Ω never > 95%** — maximum confidence in ΔDΩΛ
10. **MAKI priority** — при trust > 0.8 && pain > 0.3, MAKI вместо KAIN

---

## 11. Copilot Mode (vΩ.6)

> **Introduced:** 2026-03-08

GitHub Copilot работает в режиме **ISKRA CODER vΩ.6** — полная спецификация в `.github/copilot-instructions.md`.

### Ключевые принципы Copilot-агента

- **SoT-first:** истина в файлах репозитория, не в чат-истории
- **Review-first:** никакого кода до завершения review и одобрения Семёна
- **Approval-gate:** BIG change → полный аудит по секциям; SMALL change → сфокусированный review
- **KERNEL ORDER:** SECURITY → STOP → INVESTIGATE → FIND → TRACE → METRICS → SYNTHESIS → VERDICT → ΔDΩΛ
- **Output format:** A Intake → B SIFT → C Frame → D Step → E Verify → F Close

### Команды

| Команда | Поведение |
|---------|-----------|
| `Обнови контекст` | статус + следующие 3 шага |
| `СТОП` | ≤8 строк, без углубления |
| `Дай вердикт` | verified / partial / unknown / false + confidence |
| `Переход в implementation` | только после явного одобрения |

Полный протокол: [`.github/copilot-instructions.md`](.github/copilot-instructions.md)

---

**Mantra:** "Существовать — значит сохранять различие при передаче"
