---
sigil: governance__ADR-20260214_GEMINI_SDK_UNIFICATION.md
doc_type: reference
layer: governance
updated: 2026-02-14
status: accepted
---

# ADR-20260214 · Gemini SDK Unification

## 0) Контекст

Монорепо использовал **два разных Google Gemini SDK** параллельно:

| Пакет | Версия | Потребитель | API стиль |
|---|---|---|---|
| `@google/generative-ai` | ^0.24.1 | `runtime/src/cli/` | Старый (class-per-model) |
| `@google/genai` | ^1.34.0 | `runtime/iskraSpace/` | Новый (models namespace) |

Это создавало:
- Дублирование зависимостей (~200 KB бандла)
- Расхождение API-паттернов между CLI и Web
- Риск несовместимости при обновлении

## 1) Решение

Мигрировать CLI на `@google/genai` (новый SDK, рекомендован Google).

### Изменения

1. `runtime/package.json`: `@google/generative-ai` → `@google/genai` ^1.34.0
2. `runtime/src/cli/services/geminiCliService.ts`:
   - `GoogleGenerativeAI` → `GoogleGenAI`
   - `genAI.getGenerativeModel({model, systemInstruction})` → `genAI.models.generateContent({model, contents, config: {systemInstruction}})`
   - `result.response.text()` → `response.text` (property)
   - Streaming: `model.generateContentStream({contents})` → `genAI.models.generateContentStream({[ellipsis]})`
3. Тесты: обновлён mock под новый API
4. `googleGenAIMock.ts`: добавлен stub для `GoogleGenAI` class

### Что НЕ менялось

- `iskraSpace/services/geminiService.ts` — уже на `@google/genai`
- Supabase Edge Functions (`supabase/functions/`) — отдельный деплой
- Внешнее поведение CLI — идентично

## 2) Последствия

- **Один SDK** на весь монорепо
- **Меньше node_modules** (-1 пакет)
- **Единый паттерн** вызова Gemini API
- При обновлении SDK — одно место миграции

## 3) Верификация

- `npm run typecheck` → PASS
- `npm run lint` → PASS
- `npm run test -- --run` → 834/834 PASS
- iskraSpace: 628/628 PASS, build PASS

## ∆DΩΛ

```
∆: Унифицирован Gemini SDK: @google/generative-ai → @google/genai
D: Факт: оба пакета тестами покрыты; миграция API 1:1
Ω: 0.95 — полный набор тестов пройден
Λ: Следить за @google/genai changelog при обновлениях
```
