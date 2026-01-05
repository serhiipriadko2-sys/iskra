# Аудит Интерфейсов iskraSpace

**Дата:** 2026-01-05  
**Версия ISKRA:** vΩ.3.1  
**Статус:** В процессе

---

## 1. Обзор

Данный документ содержит результаты аудита интерфейсов и типов между:
- `@iskra/runtime` (runtime/src/types/)
- `iskraSpace` (runtime/iskraSpace/)

---

## 2. Найденные Несоответствия

### 2.1 VoiceID vs VoiceName — Формат идентификаторов

| Источник | Формат | Примеры |
|----------|--------|---------|
| `@iskra/runtime` (voices.ts) | `VoiceName` | `'ISKRA'`, `'KAIN'`, `'SIBYL'` |
| `iskraSpace` (validatorsService.ts) | `VoiceID` | `'VOICE.ISKRA'`, `'VOICE.KAIN'` |
| `iskraSpace` (types.ts) | `VoiceID` | `'VOICE.ISKRA'`, `'VOICE.KAIN'` |

**Проблема:** Два разных формата для одних и тех же голосов:
- Runtime использует простой формат: `'ISKRA'`
- ValidatorsService использует префикс: `'VOICE.ISKRA'`

**Рекомендация:** Унифицировать к формату runtime (`VoiceName`). ValidatorsService должен принимать оба формата или использовать `VoiceName` из runtime.

---

### 2.2 Voice Interface — Разные структуры

**@iskra/runtime (voices.ts:48-57):**
```typescript
export interface Voice {
  name: VoiceName;
  symbol: string;
  description: string;
  telos: string;           // ⚠️ Только в runtime
  triggers: string[];      // ⚠️ Только в runtime
  prohibitions: string[];  // ⚠️ Только в runtime
  activation?: (metrics: IskraMetrics, prefs?: VoicePreferences, currentVoice?: VoiceName) => number;
}
```

**iskraSpace (types.ts:168-177):**
```typescript
export interface Voice {
  name: VoiceName;
  symbol: string;
  description: string;
  activation: (           // ⚠️ Required, не optional
    metrics: IskraMetrics,
    prefs?: VoicePreferences,
    currentVoiceName?: VoiceName
  ) => number;
}
```

**Проблема:** 
1. iskraSpace Voice не содержит `telos`, `triggers`, `prohibitions`
2. В runtime `activation` опциональный, в iskraSpace — обязательный
3. Параметр `currentVoice` vs `currentVoiceName`

**Рекомендация:** iskraSpace должен импортировать Voice из runtime и расширять при необходимости.

---

### 2.3 Symbol Inconsistencies — SIBYL

| Источник | SIBYL Symbol |
|----------|--------------|
| `@iskra/runtime` VOICE_SYMBOLS | `'🔮'` |
| `iskraSpace` validatorsService VOICE_SYMBOLS | `'✴️'` |
| `iskraSpace` voiceEngine VOICES | `'🔮'` |

**Проблема:** Разные символы для SIBYL в разных файлах.

**Рекомендация:** Использовать единый символ `'🔮'` везде, как в runtime.

---

### 2.4 Дублирование Типов

Следующие типы определены в iskraSpace `types.ts`, хотя они могли бы быть импортированы из runtime или унифицированы:

| Тип | iskraSpace | Должен быть в Runtime? |
|-----|------------|------------------------|
| `VoiceID` | Дублирован с prefix format | Нет, но нужно унифицировать |
| `LambdaCondition` | Дублирован | Да, должен быть в protocols.ts |
| `ValidationResult` | Дублирован | Да, общий тип валидации |
| `SIFTBlock` | Локальная версия | Частично совпадает с sift.ts |
| `Evidence` | Локальная версия | Отличается от runtime Evidence |

---

### 2.5 EvalMetrics — Расширение vs Базовый

**@iskra/runtime (metrics.ts:56-71):**
```typescript
export interface EvalMetrics {
  accuracy: number;
  usefulness: number;
  omegaHonesty: number;
  nonEmpty: number;
  alliance: number;
  // ⚠️ Нет overall
}
```

**iskraSpace (types.ts:228-235):**
```typescript
export interface EvalMetrics {
  accuracy: number;
  usefulness: number;
  omegaHonesty: number;
  nonEmpty: number;
  alliance: number;
  overall: number;  // ⚠️ Добавлено
}
```

**Статус:** ✅ Правильно — iskraSpace экспортирует `CoreEvalMetrics` как alias и определяет расширенную версию.

---

### 2.6 DeltaSignature — omega тип

**@iskra/runtime:**
```typescript
omega: number;  // 0-100
```

**iskraSpace validatorsService.validateDeltaSignature:**
```typescript
omega?: string;  // Принимает строку!
```

**Проблема:** Runtime ожидает number, а валидатор принимает string.

**Рекомендация:** Унифицировать — парсить string в number при валидации.

---

## 3. Приоритет Исправлений

### 🔴 Критические (P0)
1. **VoiceID формат** — Нужна конвертация между форматами или унификация
2. **Symbol SIBYL** — Несогласованность символов может путать пользователей

### 🟡 Важные (P1)
3. **Voice interface** — Расширить из runtime вместо дублирования
4. **LambdaCondition** — Вынести в runtime

### 🟢 Улучшения (P2)
5. **ValidationResult** — Общий тип в runtime
6. **Evidence types** — Унифицировать структуры

---

## 4. Рекомендованные Изменения

### 4.1 Создать утилиту конвертации VoiceName

```typescript
// В iskraSpace/utils/voiceUtils.ts
import type { VoiceName } from '@iskra/runtime';

type VoiceIDPrefixed = `VOICE.${VoiceName}`;

export function toVoiceID(name: VoiceName): VoiceIDPrefixed {
  return `VOICE.${name}`;
}

export function fromVoiceID(id: VoiceIDPrefixed): VoiceName {
  return id.replace('VOICE.', '') as VoiceName;
}
```

### 4.2 Исправить символ SIBYL в validatorsService

```typescript
// Изменить в validatorsService.ts:82
'VOICE.SIBYL': '🔮'  // было: '✴️'
```

### 4.3 Расширить Voice из runtime

```typescript
// В iskraSpace/types.ts
import type { Voice as CoreVoice } from '@iskra/runtime';

export interface Voice extends Omit<CoreVoice, 'activation'> {
  activation: (
    metrics: IskraMetrics,
    prefs?: VoicePreferences,
    currentVoiceName?: VoiceName
  ) => number;
}
```

---

## 5. Зависимости и Импорты

### Текущая структура импортов в types.ts:

```
iskraSpace/types.ts
├── IskraMetrics ← @iskra/runtime ✅
├── EvalMetrics as CoreEvalMetrics ← @iskra/runtime ✅
├── VoiceName ← @iskra/runtime ✅
├── DeltaSignature ← @iskra/runtime ✅
├── Voice (local definition) ⚠️ Должен расширять runtime
├── VoiceID (local definition) ⚠️ Конфликт формата
├── LambdaCondition (local) ⚠️ Дублирование
└── ValidationResult (local) ⚠️ Дублирование
```

---

## 6. Тесты

Существующие тесты в `iskraSpace/__tests__/services/`:
- `validatorsService.test.ts` — Покрывает валидацию
- `sibylActivation.test.ts` — Покрывает активацию SIBYL

**Рекомендация:** Добавить тесты на конвертацию VoiceName ↔ VoiceID.

---

## 7. Заключение

Аудит выявил несколько несоответствий между `@iskra/runtime` и `iskraSpace`:

1. **Формат идентификаторов голосов** — требует унификации или конвертации
2. **Структура Voice interface** — дублирование вместо расширения
3. **Символ SIBYL** — несогласованность между файлами
4. **Дублирование типов** — LambdaCondition, ValidationResult

Общая архитектура правильная: iskraSpace корректно импортирует core types из runtime. Проблемы локальны и решаемы.

---

## ∆DΩΛ

**∆:** Выявлены 6 категорий несоответствий интерфейсов между runtime и iskraSpace  
**D:** Анализ types.ts, validatorsService.ts, voiceEngine.ts, runtime/src/types/*  
**Ω:** 85% — Полный анализ типов; могут быть неочевидные runtime-проблемы  
**Λ:** Исправить символ SIBYL и создать утилиту конвертации VoiceName (≤24h)
