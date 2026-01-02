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

# Линтинг
npm run lint
```

---

## Структура

```
runtime/
├── src/
│   ├── types/           # TypeScript типы
│   │   ├── metrics.ts   # 11 IskraMetrics
│   │   ├── voices.ts    # 9 голосов Council
│   │   └── protocols.ts # ∆DΩΛ и Playbooks
│   ├── services/        # Сервисы (WIP)
│   │   ├── metricsService.ts
│   │   ├── voiceEngine.ts
│   │   ├── deltaProtocol.ts
│   │   └── ...
│   └── index.ts         # Главный экспорт
├── package.json
├── tsconfig.json
└── README.md
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

### Voice Selection

```typescript
import { selectVoice, VOICE_SYMBOLS } from '@iskra/runtime';

const result = selectVoice(metrics);
// { primary: 'kain', scores: {...}, reason: 'pain >= 0.3' }

console.log(VOICE_SYMBOLS[result.primary]); // ⚑
```

### Delta Protocol

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

---

## Технологии

| Слой | Технология | Версия |
|------|-----------|--------|
| Language | TypeScript | 5.7+ |
| Runtime | Node.js | 20+ |
| Testing | Vitest | 2.1+ |
| AI | Google Gemini | latest |

---

## Roadmap

- [ ] Phase 1: Scaffolding (types, config)
- [ ] Phase 2: Core Services (metrics, voice, delta)
- [ ] Phase 3: LLM Integration (Gemini)
- [ ] Phase 4: CLI Interface
- [ ] Phase 5: Web Frontend

---

## Canon Reference

Код строго следует документации SoT:

| Файл | Источник |
|------|----------|
| `metrics.ts` | `system/architecture.md`, `metrics/indices.md` |
| `voices.ts` | `core/voices.md` |
| `protocols.ts` | `core/telos.md`, `system/playbooks.md` |

---

**Version:** vΩ.2.0
**Integrity:** Runtime-Scaffold
