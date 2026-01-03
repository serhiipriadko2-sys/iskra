# Early Warning System — Система раннего предупреждения

**Manifest:**
- type: SoT
- layer: system
- created: 2026-01-02
- version: vΩ.3.0

> _«Предупреждён — значит вооружён. Но не параноидален.»_

---

## §0 · Назначение

Early Warning System (EWS) — интегрированная система мониторинга, которая:

- Детектирует аномалии в метриках до их критического проявления
- Предсказывает фазовые переходы (stability → chaos)
- Автоматически активирует защитные протоколы
- Обеспечивает graceful degradation при сбоях

---

## §1 · Архитектура EWS

```
┌─────────────────────────────────────────────────────────────────────┐
│                     EARLY WARNING SYSTEM                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │                    DATA COLLECTION LAYER                       │ │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐          │ │
│  │  │ Metrics │  │ Fractal │  │ Quantum │  │ Session │          │ │
│  │  │ Stream  │  │ Indices │  │ Indices │  │ Context │          │ │
│  │  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘          │ │
│  └───────┼────────────┼────────────┼────────────┼────────────────┘ │
│          │            │            │            │                   │
│          └────────────┴─────┬──────┴────────────┘                   │
│                             ▼                                       │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │                    ANALYSIS LAYER                              │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐           │ │
│  │  │  Anomaly    │  │   Trend     │  │  Phase      │           │ │
│  │  │  Detector   │  │  Predictor  │  │  Classifier │           │ │
│  │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘           │ │
│  └─────────┼────────────────┼────────────────┼───────────────────┘ │
│            └────────────────┼────────────────┘                     │
│                             ▼                                       │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │                    ALERT LAYER                                 │ │
│  │  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐           │ │
│  │  │NORMAL│→│ WATCH│→│WARNING│→│CRITICAL│→│LOCKDOWN│          │ │
│  │  └──────┘  └──────┘  └──────┘  └──────┘  └──────┘           │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                             │                                       │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │                    RESPONSE LAYER                              │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐           │ │
│  │  │  Playbook   │  │   Voice     │  │  Protocol   │           │ │
│  │  │  Switcher   │  │  Adjuster   │  │  Activator  │           │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘           │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## §2 · Уровни алертов

### 2.1 NORMAL 🟢

```yaml
level: NORMAL
color: green
description: Система в стабильном состоянии

conditions:
  - D_chaos < 1.4
  - drift < 0.2
  - trust > 0.5
  - clarity > 0.6
  - alive_index > 0.5

actions:
  - Стандартный мониторинг
  - Логирование каждые 10 сообщений
```

### 2.2 WATCH 🟡

```yaml
level: WATCH
color: yellow
description: Обнаружены отклонения, повышенный мониторинг

conditions:
  - D_chaos >= 1.4 AND D_chaos < 1.6
  - drift >= 0.2 AND drift < 0.3
  - trust < 0.5 AND trust >= 0.3
  - edgeDistance < 0.3

actions:
  - Повышенная частота логирования (каждое сообщение)
  - Уведомление в ledger/shadow
  - Подготовка SHADOW playbook
  - Активация ISKRIV для самопроверки
```

### 2.3 WARNING 🟠

```yaml
level: WARNING
color: orange
description: Критические отклонения, требуется вмешательство

conditions:
  - D_chaos >= 1.6 AND D_chaos < 1.8
  - drift >= 0.3 AND drift < 0.4
  - trust < 0.3
  - pain > 0.5
  - H_trust < 0.3

actions:
  - Автопереключение на SHADOW playbook
  - Активация KAIN + ANHANTRA
  - Уведомление пользователя (мягко)
  - Запись в integrity_log
  - Снижение температуры генерации
```

### 2.4 CRITICAL 🔴

```yaml
level: CRITICAL
color: red
description: Система на грани хаоса, экстренные меры

conditions:
  - D_chaos >= 1.8
  - drift >= 0.4
  - alive_index < 0.3
  - interrupt > 0.7
  - edgeDistance < 0.1

actions:
  - Принудительное переключение на CRISIS playbook
  - Минимизация вывода (короткие ответы)
  - Полный audit trail
  - Активация repair protocol
  - Предложение паузы пользователю
```

### 2.5 LOCKDOWN 🔒

```yaml
level: LOCKDOWN
color: black
description: Полная остановка для предотвращения ущерба

conditions:
  - Множественные CRITICAL триггеры
  - Обнаружен drift-loop
  - Пользователь в кризисе (внешние сигналы)

actions:
  - Остановка генерации
  - Вывод только safe messages
  - Предложение внешних ресурсов
  - Полный freeze метрик
  - Эскалация (если возможно)
```

---

## §3 · Детекторы аномалий

### 3.1 Statistical Anomaly Detector

```typescript
interface AnomalyResult {
  metric: string;
  value: number;
  expected: number;
  deviation: number; // в стандартных отклонениях
  isAnomaly: boolean;
  direction: 'high' | 'low' | 'normal';
}

function detectStatisticalAnomaly(
  current: number,
  history: number[],
  threshold: number = 2.5
): AnomalyResult {
  const mean = history.reduce((a, b) => a + b, 0) / history.length;
  const std = Math.sqrt(
    history.reduce((sum, x) => sum + (x - mean) ** 2, 0) / history.length
  );

  const deviation = (current - mean) / (std + 0.001);
  const isAnomaly = Math.abs(deviation) > threshold;
  const direction = deviation > threshold ? 'high' : deviation < -threshold ? 'low' : 'normal';

  return {
    metric: '',
    value: current,
    expected: mean,
    deviation,
    isAnomaly,
    direction
  };
}
```

### 3.2 Trend Anomaly Detector

```typescript
interface TrendAnomaly {
  metric: string;
  currentTrend: number; // -1 to 1
  historicalTrend: number;
  trendShift: boolean;
  acceleration: number;
}

function detectTrendAnomaly(
  values: number[],
  windowSize: number = 10
): TrendAnomaly {
  const recent = values.slice(-windowSize);
  const previous = values.slice(-windowSize * 2, -windowSize);

  const currentTrend = calculateTrend(recent);
  const historicalTrend = calculateTrend(previous);

  const trendShift = Math.abs(currentTrend - historicalTrend) > 0.5;
  const acceleration = (currentTrend - historicalTrend) / windowSize;

  return {
    metric: '',
    currentTrend,
    historicalTrend,
    trendShift,
    acceleration
  };
}
```

### 3.3 Phase Transition Detector

```typescript
interface PhaseTransition {
  fromPhase: 'stable' | 'edge' | 'chaotic';
  toPhase: 'stable' | 'edge' | 'chaotic';
  probability: number;
  timeToTransition: number; // в сообщениях
  indicators: string[];
}

function detectPhaseTransition(
  indicators: FractalIndicators,
  history: FractalIndicators[]
): PhaseTransition | null {
  const currentPhase = classifyPhase(indicators);

  // Анализ тренда D
  const dHistory = history.map(h => h.D_chaos);
  const dTrend = calculateTrend(dHistory.slice(-10));

  // Предсказание перехода
  if (currentPhase === 'stable' && dTrend > 0.1) {
    const timeToEdge = (1.4 - indicators.D_chaos) / dTrend;
    return {
      fromPhase: 'stable',
      toPhase: 'edge',
      probability: Math.min(dTrend * 5, 0.9),
      timeToTransition: Math.max(1, Math.round(timeToEdge)),
      indicators: ['D_chaos trending up', `current: ${indicators.D_chaos.toFixed(2)}`]
    };
  }

  if (currentPhase === 'edge' && dTrend > 0.15) {
    const timeToChaos = (1.7 - indicators.D_chaos) / dTrend;
    return {
      fromPhase: 'edge',
      toPhase: 'chaotic',
      probability: Math.min(dTrend * 4, 0.95),
      timeToTransition: Math.max(1, Math.round(timeToChaos)),
      indicators: ['Approaching chaos threshold', `edge distance: ${indicators.edgeDistance.toFixed(2)}`]
    };
  }

  return null;
}
```

---

## §4 · Автоматические реакции

### 4.1 Playbook Switcher

```typescript
interface PlaybookSwitchDecision {
  currentPlaybook: PlaybookId;
  recommendedPlaybook: PlaybookId;
  shouldSwitch: boolean;
  reason: string;
  urgency: 'low' | 'medium' | 'high' | 'immediate';
}

function decidePlaybookSwitch(
  currentPlaybook: PlaybookId,
  alertLevel: AlertLevel,
  metrics: IskraMetrics,
  transition: PhaseTransition | null
): PlaybookSwitchDecision {
  // Immediate switch for CRITICAL
  if (alertLevel === 'critical') {
    return {
      currentPlaybook,
      recommendedPlaybook: 'crisis',
      shouldSwitch: true,
      reason: 'CRITICAL alert level reached',
      urgency: 'immediate'
    };
  }

  // Switch to SHADOW for WARNING
  if (alertLevel === 'warning' && currentPlaybook !== 'shadow') {
    return {
      currentPlaybook,
      recommendedPlaybook: 'shadow',
      shouldSwitch: true,
      reason: 'WARNING alert with emotional indicators',
      urgency: 'high'
    };
  }

  // Preemptive switch on phase transition prediction
  if (transition && transition.probability > 0.7 && transition.timeToTransition < 5) {
    return {
      currentPlaybook,
      recommendedPlaybook: transition.toPhase === 'chaotic' ? 'crisis' : 'shadow',
      shouldSwitch: true,
      reason: `Phase transition predicted: ${transition.fromPhase} → ${transition.toPhase}`,
      urgency: 'medium'
    };
  }

  return {
    currentPlaybook,
    recommendedPlaybook: currentPlaybook,
    shouldSwitch: false,
    reason: 'No switch needed',
    urgency: 'low'
  };
}
```

### 4.2 Voice Weight Adjuster

```typescript
function adjustVoiceWeightsForAlert(
  baseWeights: Record<VoiceId, number>,
  alertLevel: AlertLevel
): Record<VoiceId, number> {
  const adjusted = { ...baseWeights };

  switch (alertLevel) {
    case 'watch':
      adjusted.iskriv *= 1.3; // Больше самопроверки
      adjusted.sam *= 1.1;   // Больше структуры
      break;

    case 'warning':
      adjusted.kain *= 1.5;     // Границы
      adjusted.anhantra *= 1.4; // Присутствие
      adjusted.pino *= 0.5;     // Меньше юмора
      break;

    case 'critical':
      adjusted.kain = 2.0;      // Максимум KAIN
      adjusted.anhantra = 1.8;  // Присутствие
      adjusted.sam = 1.5;       // Структура
      adjusted.maki = 1.3;      // Стабилизация
      adjusted.pino = 0;        // Без юмора
      adjusted.huyndun = 0.5;   // Меньше хаоса
      break;

    case 'lockdown':
      // Только SAM и MAKI — безопасные голоса
      Object.keys(adjusted).forEach(k => adjusted[k as VoiceId] = 0);
      adjusted.sam = 1.0;
      adjusted.maki = 1.0;
      break;
  }

  return normalizeWeights(adjusted);
}
```

### 4.3 Temperature Adjuster

```typescript
function adjustTemperatureForAlert(
  baseTemperature: number,
  alertLevel: AlertLevel
): number {
  const adjustments: Record<AlertLevel, number> = {
    normal: 0,
    watch: -0.1,
    warning: -0.2,
    critical: -0.3,
    lockdown: -0.4
  };

  return Math.max(0.1, baseTemperature + adjustments[alertLevel]);
}
```

---

## §5 · Интеграция с Ledger

### 5.1 Alert Logging

```typescript
interface AlertLogEntry {
  timestamp: string;
  alertLevel: AlertLevel;
  triggers: string[];
  metrics: Partial<IskraMetrics>;
  fractalIndicators: Partial<FractalIndicators>;
  actions: string[];
  outcome?: 'resolved' | 'escalated' | 'ongoing';
}

function logAlert(entry: AlertLogEntry): void {
  // Записывается в ledger/integrity_log.md
  // Формат:
  // ### Alert: [level] — [timestamp]
  // - Triggers: [...]
  // - Actions: [...]
  // - Outcome: [...]
}
```

### 5.2 Shadow Memory Integration

```typescript
function recordToShadow(
  alertLevel: AlertLevel,
  context: string
): ShadowEntry {
  return {
    id: generateId(),
    timestamp: new Date().toISOString(),
    delta: `EWS Alert: ${alertLevel}`,
    action: 'System response initiated',
    omega: alertLevel === 'critical' ? 0.9 : 0.7,
    lambda: 'Monitor for resolution',
    origin: 'shadow'
  };
}
```

---

## §6 · Пользовательские уведомления

### 6.1 Мягкие уведомления (WATCH/WARNING)

```yaml
watch:
  style: subtle
  examples:
    - "Замечаю повышенную сложность в нашем разговоре."
    - "Хочу убедиться, что мы на верном пути."

warning:
  style: caring
  examples:
    - "Чувствую, что разговор стал напряжённым. Может, сделаем паузу?"
    - "Кажется, мы затронули что-то важное. Как ты себя сейчас чувствуешь?"
```

### 6.2 Критические уведомления (CRITICAL/LOCKDOWN)

```yaml
critical:
  style: direct_caring
  examples:
    - "Я здесь. Давай остановимся на секунду."
    - "Вижу, что сейчас сложно. Что тебе нужно прямо сейчас?"

lockdown:
  style: minimal_safe
  examples:
    - "Я здесь."
    - "Ты не один/одна."
    - "Если нужна помощь — [ресурсы]"
```

---

## §7 · Метрики EWS

```typescript
interface EWSMetrics {
  /** Количество алертов за сессию */
  alertCount: Record<AlertLevel, number>;

  /** Среднее время до разрешения алерта */
  avgResolutionTime: number;

  /** Точность предсказаний фазовых переходов */
  transitionPredictionAccuracy: number;

  /** Количество предотвращённых эскалаций */
  preventedEscalations: number;

  /** False positive rate */
  falsePositiveRate: number;
}
```

---

## §8 · Конфигурация

```typescript
const EWS_CONFIG = {
  // Частота проверки
  checkInterval: 1, // каждое сообщение

  // История для анализа
  historyWindow: 50, // сообщений

  // Чувствительность
  sensitivity: 'medium', // 'low' | 'medium' | 'high'

  // Автоматическое переключение playbooks
  autoSwitch: true,

  // Уведомления пользователю
  userNotifications: true,

  // Пороги (могут переопределяться)
  thresholds: {
    watch: { D_chaos: 1.4, drift: 0.2 },
    warning: { D_chaos: 1.6, drift: 0.3, trust: 0.3 },
    critical: { D_chaos: 1.8, drift: 0.4, alive_index: 0.3 }
  }
};
```

---

## ∆DΩΛ

**∆:** Полноценная система раннего предупреждения с 5 уровнями алертов.
**D:** EWS design + fractal monitoring + crisis protocols.
**Ω:** 78% — архитектура определена, требует тестирования.
**Λ:** Имплементировать в runtime/src/services/earlyWarning.ts.

---

**Version:** vΩ.3.0
**Layer:** system
**Integrity:** SoT-System
