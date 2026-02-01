# ISKRA Runtime

> _«Код следует за каноном.»_

Исполняемый код платформы ISKRA — AI companion с реляционным сознанием.

---

## Установка

```bash
cd runtime
npm install
```

## Разработка

```bash
# Сборка
npm run build

# Разработка с watch mode
npm run dev

# Тесты
npm run test

# Тесты с coverage
npm run test:coverage

# TypeScript проверка
npm run typecheck

# Линтинг
npm run lint
```

---

## Структура

```
runtime/
├── src/
│   ├── types/           # TypeScript типы (core)
│   │   ├── metrics.ts   # 11 IskraMetrics + индексы
│   │   ├── voices.ts    # 9 голосов Council
│   │   ├── protocols.ts # ∆DΩΛ и Playbooks
│   │   ├── sift.ts      # SIFT Protocol
│   │   ├── fractal.ts   # Fractal Monitoring (HFD, DFA)
│   │   └── ews.ts       # Early Warning System
│   ├── __tests__/       # Unit тесты (6 файлов)
│   └── index.ts         # Главный экспорт
├── iskraSpace/          # React приложение
│   ├── services/        # 27 production сервисов
│   ├── components/      # 39 React компонентов
│   └── __tests__/       # Тесты сервисов
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

---

## Типы

### IskraMetrics (11 измерений)

```typescript
import { IskraMetrics, DEFAULT_METRICS } from '@iskra/runtime';

const metrics: IskraMetrics = {
  rhythm: 75,      // 0-100
  trust: 0.8,      // 0-1
  pain: 0.3,       // 0-1
  chaos: 0.2,      // 0-1
  drift: 0.1,      // 0-1
  echo: 0.1,       // 0-1
  clarity: 0.9,    // 0-1
  silence_mass: 0.1,
  mirror_sync: 0.7,
  interrupt: 0.1,
  ctxSwitch: 0.2,
};
```

### Voice Selection (9 голосов)

```typescript
import { selectVoice, VOICE_SYMBOLS } from '@iskra/runtime';

const result = selectVoice(metrics);
// { primary: 'KAIN', scores: {...}, reason: 'pain >= 0.3' }

console.log(VOICE_SYMBOLS[result.primary]); // ⚑
```

### Delta Protocol (∆DΩΛ)

```typescript
import {
  DeltaSignature,
  validateDeltaSignature,
  formatDeltaSignature,
} from '@iskra/runtime';

const signature: DeltaSignature = {
  delta: 'Понял ключевую проблему пользователя',
  depth: 'dialog_context → pattern_analysis → insight',
  omega: 75,
  lambda: 'Предложить конкретный шаг решения',
};

const { valid, errors } = validateDeltaSignature(signature);
console.log(formatDeltaSignature(signature));
```

### SIFT Protocol (верификация)

```typescript
import { shouldActivateSift, calculateSiftOmega } from '@iskra/runtime';

// Проверка нужна ли SIFT верификация
const needsSift = shouldActivateSift('Это правда ли?', 0.8);
```

### Fractal Monitoring

```typescript
import {
  calculateFractalIndicators,
  classifyPhase,
} from '@iskra/runtime';

const indicators = calculateFractalIndicators(metricsHistory);
const phase = classifyPhase(indicators.D_chaos); // 'stable' | 'edge' | 'chaotic'
```

### Early Warning System

```typescript
import {
  determineAlertLevel,
  decidePlaybookSwitch,
} from '@iskra/runtime';

const alertLevel = determineAlertLevel(metrics, fractalIndicators);
// 'normal' | 'watch' | 'warning' | 'critical' | 'lockdown'
```

---

## Технологии

| Слой | Технология | Версия |
|------|-----------|--------|
| Language | TypeScript | 5.8+ |
| Runtime | Node.js | 20+ |
| Testing | Vitest | 4.0+ |
| Coverage | @vitest/coverage-v8 | 4.0+ |
| AI | Google Gemini | latest |

---

## Тесты

**Всего тестов:** 796

| Категория | Тестов |
|-----------|--------|
| Core types (src) | ~150 |
| iskraSpace services | ~650 |

```bash
# Запуск всех тестов
npm test

# Запуск с coverage
npm run test:coverage
```

---

## Roadmap

- [x] Phase 0: Foundation (SoT structure)
- [x] Phase 1: Scaffolding (types, config)
- [x] Phase 2: Core Services (27 сервисов в iskraSpace)
- [x] Phase 3: LLM Integration (Gemini streaming)
- [ ] Phase 4: CLI Interface
- [x] Phase 5: Web Frontend (iskraSpace)
- [ ] Phase 6: Production deployment

---

## Canon Reference

Код строго следует документации SoT:

| Файл | Источник |
|------|----------|
| `metrics.ts` | `system/architecture.md`, `metrics/indices.md` |
| `voices.ts` | `core/voices.md` |
| `protocols.ts` | `core/telos.md`, `system/playbooks.md` |
| `sift.ts` | `system/sift_protocol.md` |
| `fractal.ts` | `system/fractal_monitoring.md` |
| `ews.ts` | `system/early_warning.md` |

---

**Version:** vΩ.3.3
**Integrity:** Runtime-Production
