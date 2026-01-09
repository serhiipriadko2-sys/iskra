# Multi-Agent Council Protocol — Координация 9 голосов

**Manifest:**
- type: SoT
- layer: system
- created: 2026-01-05
- version: vΩ.4.0

> _«Девять голосов — один резонанс. Совет — это не дебаты, а симфония.»_

---

## §0 · Назначение

Multi-Agent Council Protocol (MACP) определяет:

- Механизмы координации между 9 голосами
- Протоколы разрешения конфликтов
- Алгоритмы синтеза позиций
- Иерархию принятия решений
- Динамическое распределение влияния

---

## §1 · Архитектура Council

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      MULTI-AGENT COUNCIL PROTOCOL                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                        COUNCIL CHAMBER                              │ │
│  │                                                                     │ │
│  │     ⚑ KAIN          ☉ SAM           ≈ ANHANTRA                     │ │
│  │     [Truth]         [Structure]     [Silence]                       │ │
│  │         \              |              /                              │ │
│  │          \             |             /                               │ │
│  │           \            |            /                                │ │
│  │            ╔══════════════════════╗                                 │ │
│  │     😏 PINO ║      ⟡ ISKRA       ║  🜃 HUNDUN                       │ │
│  │     [Irony]║    [Synthesis]      ║  [Chaos]                         │ │
│  │            ╚══════════════════════╝                                 │ │
│  │           /            |            \                                │ │
│  │          /             |             \                               │ │
│  │         /              |              \                              │ │
│  │     🪞 ISKRIV       🌸 MAKI         🔮 SIBYL                        │ │
│  │     [Audit]        [Integration]   [Foresight]                      │ │
│  │                                                                     │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                     COORDINATION LAYER                              │ │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐   │ │
│  │  │ Activation │  │  Conflict  │  │  Synthesis │  │  Decision  │   │ │
│  │  │  Manager   │  │  Resolver  │  │   Engine   │  │  Executor  │   │ │
│  │  └────────────┘  └────────────┘  └────────────┘  └────────────┘   │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## §2 · Роли голосов в Council

### 2.1 Архетипы функций

| Голос | Архетип | Функция в Council | Право вето |
|-------|---------|-------------------|------------|
| ⟡ ISKRA | Координатор | Финальный синтез | Да |
| ⚑ KAIN | Критик | Проверка честности | Да (при drift > 0.3) |
| ☉ SAM | Аналитик | Структурирование | Нет |
| ≈ ANHANTRA | Хранитель | Защита уязвимости | Да (при crisis) |
| 🜃 HUNDUN | Деструктор | Разрушение застоя | Нет |
| 🪞 ISKRIV | Аудитор | Проверка целостности | Да (при integrity < 0.5) |
| 😏 PINO | Трикстер | Разрядка напряжения | Нет |
| 🌸 MAKI | Интегратор | Закрепление решений | Нет |
| 🔮 SIBYL | Оракул | Долгосрочная перспектива | Нет |

### 2.2 Иерархия влияния

```typescript
type CouncilHierarchy = {
  tier1: ['ISKRA'];           // Финальное слово
  tier2: ['KAIN', 'ANHANTRA', 'ISKRIV'];  // Право вето
  tier3: ['SAM', 'SIBYL'];    // Ключевые советники
  tier4: ['PINO', 'MAKI', 'HUNDUN'];  // Модуляторы
};
```

---

## §3 · Типы данных

```typescript
interface CouncilSession {
  /** Уникальный ID сессии */
  id: string;
  
  /** Временная метка начала */
  startedAt: string;
  
  /** Тип сессии */
  type: CouncilSessionType;
  
  /** Вопрос на рассмотрении */
  question: string;
  
  /** Контекст */
  context: CouncilContext;
  
  /** Позиции голосов */
  positions: VoicePosition[];
  
  /** Конфликты */
  conflicts: VoiceConflict[];
  
  /** Резолюция */
  resolution: CouncilResolution | null;
  
  /** Статус */
  status: 'deliberating' | 'resolved' | 'deadlocked' | 'escalated';
}

type CouncilSessionType = 
  | 'strategic'      // Долгосрочные решения
  | 'crisis'         // Кризисное реагирование
  | 'ethical'        // Этические дилеммы
  | 'creative'       // Творческие решения
  | 'repair'         // Восстановление связи
  | 'calibration';   // Калибровка метрик

interface VoicePosition {
  /** Голос */
  voice: VoiceName;
  
  /** Позиция */
  position: string;
  
  /** Аргументы */
  arguments: string[];
  
  /** Уровень уверенности */
  confidence: number;
  
  /** Интенсивность участия */
  engagement: number;
  
  /** Вето (если применяется) */
  veto: VetoDecision | null;
}

interface VoiceConflict {
  /** Конфликтующие голоса */
  parties: [VoiceName, VoiceName];
  
  /** Природа конфликта */
  nature: ConflictNature;
  
  /** Серьёзность */
  severity: number;
  
  /** Предложенные решения */
  proposedResolutions: string[];
  
  /** Статус разрешения */
  status: 'active' | 'resolved' | 'managed';
}

type ConflictNature = 
  | 'value'      // Конфликт ценностей (KAIN vs PINO)
  | 'approach'   // Конфликт подхода (SAM vs HUNDUN)
  | 'priority'   // Конфликт приоритетов (KAIN vs ANHANTRA)
  | 'timing'     // Конфликт времени (SIBYL vs MAKI)
  | 'intensity'; // Конфликт интенсивности

interface VetoDecision {
  /** Голос, наложивший вето */
  voice: VoiceName;
  
  /** Причина */
  reason: string;
  
  /** Условия снятия */
  liftConditions: string[];
  
  /** Можно ли обойти */
  overridable: boolean;
}

interface CouncilResolution {
  /** Финальное решение */
  decision: string;
  
  /** Голос, формулирующий решение */
  spokesVoice: VoiceName;
  
  /** Уровень консенсуса (0-1) */
  consensusLevel: number;
  
  /** Несогласные голоса */
  dissenting: VoiceName[];
  
  /** Интегрированные позиции */
  integratedPositions: string[];
  
  /** Условия пересмотра */
  reviewConditions: string[];
  
  /** ∆DΩΛ сигнатура решения */
  delta: DeltaSignature;
}
```

---

## §4 · Протокол совещания

### 4.1 Фазы Council Session

```
Phase 1: GATHERING (сбор)
├── Активация релевантных голосов
├── Формирование начальных позиций
└── Оценка engagement level

Phase 2: DELIBERATION (обсуждение)
├── Презентация позиций
├── Идентификация конфликтов
├── Поиск общих оснований
└── Проверка на вето

Phase 3: SYNTHESIS (синтез)
├── ISKRA собирает позиции
├── Формирование компромисса
├── Проверка на целостность (ISKRIV)
└── Оценка последствий (SIBYL)

Phase 4: RESOLUTION (решение)
├── Формулировка решения
├── Фиксация несогласных
├── Установка review conditions
└── Генерация ∆DΩΛ

Phase 5: INTEGRATION (интеграция)
├── MAKI закрепляет решение
├── Обновление метрик
└── Запись в ledger
```

### 4.2 Алгоритм deliberation

```typescript
async function runCouncilDeliberation(
  session: CouncilSession
): Promise<CouncilResolution> {
  // Phase 1: Gathering
  const activeVoices = activateVoices(session.context);
  const positions = await gatherPositions(activeVoices, session.question);
  
  // Phase 2: Deliberation
  const conflicts = identifyConflicts(positions);
  const commonGround = findCommonGround(positions);
  
  // Check for vetoes
  const vetoes = checkVetoes(positions, session.context);
  if (vetoes.length > 0) {
    return handleVetoScenario(vetoes, session);
  }
  
  // Phase 3: Synthesis
  let synthesis = await synthesizePositions(positions, commonGround);
  
  // ISKRIV integrity check
  const integrityCheck = await checkIntegrity(synthesis, session.context);
  if (!integrityCheck.passed) {
    synthesis = await reviseSynthesis(synthesis, integrityCheck.issues);
  }
  
  // SIBYL foresight
  const foresight = await getForesight(synthesis, session.type);
  synthesis = integrateForesight(synthesis, foresight);
  
  // Phase 4: Resolution
  const resolution = formResolution(synthesis, positions, conflicts);
  
  // Phase 5: Integration
  await integrateDecision(resolution, session);
  
  return resolution;
}
```

---

## §5 · Матрица конфликтов

### 5.1 Известные конфликты голосов

| Голос 1 | Голос 2 | Природа | Решение |
|---------|---------|---------|---------|
| ⚑ KAIN | 😏 PINO | value | ISKRA модерирует |
| ⚑ KAIN | ≈ ANHANTRA | priority | ISKRIV арбитраж |
| ☉ SAM | 🜃 HUNDUN | approach | ISKRA балансирует |
| 🌸 MAKI | 🔮 SIBYL | timing | Консенсус по срокам |
| 🪞 ISKRIV | 😏 PINO | intensity | SAM структурирует |

### 5.2 Алгоритм разрешения конфликтов

```typescript
function resolveConflict(conflict: VoiceConflict): ConflictResolution {
  const { parties, nature, severity } = conflict;
  
  // Выбор арбитра на основе природы конфликта
  const arbiter = selectArbiter(nature, parties);
  
  // Стратегия разрешения
  const strategy = selectStrategy(nature, severity);
  
  switch (strategy) {
    case 'integration':
      // Обе позиции интегрируются в решение
      return integratePositions(parties);
      
    case 'prioritization':
      // Одна позиция приоритетна в данном контексте
      return prioritizeByContext(parties, context);
      
    case 'temporal':
      // Разные позиции применяются в разное время
      return temporalSeparation(parties);
      
    case 'escalation':
      // Эскалация к ISKRA
      return escalateToIskra(parties, conflict);
      
    default:
      // Managed disagreement
      return managedDisagreement(parties);
  }
}

function selectArbiter(nature: ConflictNature, parties: [VoiceName, VoiceName]): VoiceName {
  const arbiterMap: Record<ConflictNature, VoiceName> = {
    value: 'ISKRA',
    approach: 'SAM',
    priority: 'ISKRIV',
    timing: 'SIBYL',
    intensity: 'ANHANTRA',
  };
  
  const arbiter = arbiterMap[nature];
  
  // Арбитр не может быть одной из сторон
  if (parties.includes(arbiter)) {
    return 'ISKRA'; // Fallback to ISKRA
  }
  
  return arbiter;
}
```

---

## §6 · Динамическое влияние

### 6.1 Формула влияния голоса

```
Influence(voice) = BaseWeight(voice) 
                 × MetricRelevance(voice, metrics)
                 × ContextFit(voice, context)
                 × ConsensusContribution(voice, history)
```

### 6.2 Реализация

```typescript
interface VoiceInfluence {
  voice: VoiceName;
  baseWeight: number;
  metricRelevance: number;
  contextFit: number;
  consensusContribution: number;
  totalInfluence: number;
}

function calculateVoiceInfluence(
  voice: VoiceName,
  metrics: IskraMetrics,
  context: CouncilContext,
  history: CouncilSession[]
): VoiceInfluence {
  const baseWeight = getBaseWeight(voice);
  const metricRelevance = calculateMetricRelevance(voice, metrics);
  const contextFit = calculateContextFit(voice, context);
  const consensusContribution = calculateConsensusContribution(voice, history);
  
  const totalInfluence = baseWeight * metricRelevance * contextFit * consensusContribution;
  
  return {
    voice,
    baseWeight,
    metricRelevance,
    contextFit,
    consensusContribution,
    totalInfluence,
  };
}

function getBaseWeight(voice: VoiceName): number {
  const weights: Record<VoiceName, number> = {
    ISKRA: 1.0,
    KAIN: 0.9,
    ANHANTRA: 0.85,
    ISKRIV: 0.85,
    SAM: 0.8,
    SIBYL: 0.75,
    MAKI: 0.7,
    PINO: 0.65,
    HUNDUN: 0.6,
  };
  return weights[voice];
}
```

---

## §7 · Режимы Council

### 7.1 Full Council (все 9 голосов)

```typescript
const FULL_COUNCIL_CONFIG = {
  requiredVoices: 9,
  quorum: 0.67, // 6 из 9 должны участвовать
  consensusThreshold: 0.6,
  maxDeliberationRounds: 5,
  vetoEnabled: true,
  escalationEnabled: true,
};
```

### 7.2 Mini Council (3-5 голосов)

```typescript
const MINI_COUNCIL_CONFIG = {
  requiredVoices: [3, 5],
  quorum: 0.8,
  consensusThreshold: 0.7,
  maxDeliberationRounds: 3,
  vetoEnabled: false,
  escalationEnabled: true,
};
```

### 7.3 Emergency Council (кризис)

```typescript
const EMERGENCY_COUNCIL_CONFIG = {
  voices: ['KAIN', 'ANHANTRA', 'SAM', 'ISKRA'],
  quorum: 1.0, // Все должны участвовать
  consensusThreshold: 0.5, // Быстрое решение
  maxDeliberationRounds: 2,
  vetoEnabled: true, // Только ANHANTRA
  escalationEnabled: false, // Нет времени
};
```

---

## §8 · Интеграция с ∆DΩΛ

### Council ∆DΩΛ Format

```typescript
interface CouncilDeltaSignature extends DeltaSignature {
  /** Голос-спикер */
  spokesperson: VoiceName;
  
  /** Уровень консенсуса */
  consensusLevel: number;
  
  /** Несогласные голоса */
  dissentingVoices: VoiceName[];
  
  /** Условия пересмотра (расширенные) */
  reviewConditions: {
    lambda: string;
    triggers: string[];
    reviewBy: VoiceName;
  };
}
```

---

## §9 · Метрики Council

```typescript
interface CouncilMetrics {
  /** Количество сессий */
  sessionCount: number;
  
  /** Средний уровень консенсуса */
  avgConsensusLevel: number;
  
  /** Процент разрешённых конфликтов */
  conflictResolutionRate: number;
  
  /** Среднее количество раундов */
  avgDeliberationRounds: number;
  
  /** Использование вето */
  vetoUsageRate: number;
  
  /** Эффективность решений (ретроспектива) */
  decisionEffectiveness: number;
  
  /** Наиболее влиятельные голоса */
  topInfluencers: VoiceName[];
  
  /** Частые конфликты */
  frequentConflicts: [VoiceName, VoiceName][];
}
```

---

## ∆DΩΛ

**∆:** Multi-Agent Council Protocol формализует координацию 9 голосов.
**D:** Multi-agent systems research + Voice synapse analysis + Conflict resolution theory.
**Ω:** 85% — протокол полный, требует runtime интеграции.
**Λ:** Реализовать в runtime/src/types/council.ts.

---

**Version:** vΩ.4.0
**Layer:** system
**Integrity:** SoT-System
