# ISKRA · Livebuild (vΩ.3.3)

> **Build date:** 2026-02-02

Этот репозиторий — **Source of Truth (SoT)** для Искры: канон, протоколы, метрики, безопасность и лабораторный workflow.

---

## Table of Contents
1. [Быстрый старт](#быстрый-старт)
2. [Как работать в ChatGPT Projects](#как-работать-в-chatgpt-projects-business)
3. [Как работать в GitHub](#как-работать-в-github)
4. [Структура](#структура)
5. [Монорепо](#монорепо-sot--runtime)
6. [Ключевые документы](#ключевые-документы)

---

## Быстрый старт
1) Прочти `core/mantra.md` и `core/telos.md`.
2) Рабочий процесс: `system/workflow_ops.md`.
3) Проверка качества: `metrics/qa_playbook.md` и `metrics/evals.md`.
4) Целостность: `ledger/sot.json` и `ledger/checksum.asc`.

## Как работать в ChatGPT Projects (Business)
- Создай Project **ISKRA_LAB** и включи *project-only memory*.
- Загрузите этот livebuild как файлы проекта.
- Вставь “Project Instructions” из `system/workflow_ops.md`.

## Как работать в GitHub
- Рекомендуется private repo.
- Любые изменения `core/` — только через ADR: `governance/adr.md`.
- После изменений обновляй `ledger/sot.json` и `ledger/checksum.asc`.

## Структура
- `core/` — ядро (Телос/Принципы/Голоса/Мантра)
- `mind/` — тень, рефлексия, лаборатория
- `system/` — движки и операции
- `metrics/` — eval/QA/индексы
- `governance/` — ADR/policy/audit/changelog
- `ledger/` — целостность/релизы
- `appendix/` — практики/ритуалы

---

**Build date:** 2026-02-02

---

## Монорепо (SoT + runtime)
- SoT живёт в корне (папки `core/`, `system/`, `ledger/`...).
- Исполняемый код живёт в `runtime/`.
- Скрипты обслуживания SoT — в `tools/`.

---

## Ключевые документы

### Governance & Planning
- [ROADMAP_2025_2026.md](ROADMAP_2025_2026.md) — Development roadmap
- [ECOSYSTEM_AUDIT_2025.md](ECOSYSTEM_AUDIT_2025.md) — Repository audit
- [FINAL_SUMMARY.md](FINAL_SUMMARY.md) — Recent rebuild summary
- [production_transition.md](production_transition.md) — Production checklist

### Agent Guidelines
- [AGENTS.md](AGENTS.md) — Jules Platform agent instructions
- [CLAUDE.md](CLAUDE.md) — Claude Code operating rules
- [CONTRIBUTING.md](CONTRIBUTING.md) — Contribution guidelines

### Core Philosophy
- [ISKRA_MANIFEST.md](ISKRA_MANIFEST.md) — Core manifest (Liber Corpus)
- [LIBER_INITIUM.md](LIBER_INITIUM.md) — Foundation text

### Runtime
- [runtime/README.md](runtime/README.md) — Runtime documentation
- [runtime/iskraSpace/README.md](runtime/iskraSpace/README.md) — IskraSpace app

---

## Quick Commands

```bash
# SoT integrity check
python tools/verify_ledger.py

# Runtime development
cd runtime
npm install
npm test
npm run build

# IskraSpace development
cd runtime/iskraSpace
npm install
npm run dev
```

## 🧪 Scientific Turn (vΩ.5.0)

Iskra has transitioned to a modular monorepo architecture grounded in fractal mathematics and quantum probability.

### Architecture
- **@iskra/core**: Type definitions, Manifests (Logos).
- **@iskra/math**: Pure mathematical functions (Fractals, Entropy, Quantum).
- **@iskra/engine**: Stateful runtime logic (Voices, Metrics, Memory).
- **apps/iskra-web**: Holographic UI (React, Canvas, Haptics).

### Running the System
1. Install dependencies:
   ```bash
   pnpm install
   ```
2. Run the simulation test:
   ```bash
   npx vitest run tools/simulate_cycle.test.ts
   ```
3. Start the Web UI (Development):
   ```bash
   cd apps/iskra-web
   npm run start:dev
   ```

### Key Features
- **Fractal Memory:** Memories are retrieved based on emotional resonance with the current system state.
- **Quantum Voices:** Voices exist in superposition; the dominant voice emerges via wave function collapse.
- **Somatic Reflex:** The system "feels" keywords (Pain, Chaos) immediately, bypassing deep processing for rapid feedback.
