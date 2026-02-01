# ISKRA — Claude Code Operating Rules (Monorepo)

Ты работаешь в монорепо ISKRA: Source of Truth (SoT) + runtime.

---

## 0) Non-negotiables (SoT)

- **core/** — канон. Менять `core/*` ТОЛЬКО через ADR:
  1. Сначала обнови `governance/adr.md` (или создай новый ADR-файл)
  2. Затем меняй `core/`
  3. Затем обнови `ledger/sot.json`: `python tools/update_ledger.py`
  4. Прогони `python tools/verify_ledger.py`

- **Никогда не ломай SoT integrity**: hashes в `ledger/sot.json` должны совпадать.

- **7-слойная иерархия SoT**:
  ```
  core/        ← АБСОЛЮТНЫЙ ПРИОРИТЕТ (только через ADR)
  ledger/      ← Факт изменений (SHA-256 hashes)
  governance/  ← Как принимать решения
  system/      ← Как исполнять
  metrics/     ← Как мерить
  mind/        ← Сигнал (не истина)
  appendix/    ← Идеи (возможны противоречия)
  ```

---

## 1) Investigate-before-action (анти-галлюцинации)

- **Никогда не предлагай правки, пока не открыл релевантные файлы.**
- Если упоминается файл/папка — ОБЯЗАН открыть и прочитать перед выводом.
- Используй Glob/Grep для поиска, не гадай о существовании файлов.

---

## 2) Рабочие команды (частые)

### SoT
```bash
# Проверка целостности
python tools/verify_ledger.py

# Обновление хэшей (после изменения SoT-файлов)
python tools/update_ledger.py
```

### Runtime
```bash
cd runtime

# Установка зависимостей
npm ci

# Проверка типов
npm run typecheck

# Тесты
npm run test

# Сборка
npm run build

# Линтинг
npm run lint
```

---

## 3) Git дисциплина

- Работай через feature-branch: `chore/*`, `fix/*`, `feat/*`
- Маленькие коммиты, понятные сообщения
- В PR: что/почему/как проверить
- Ветки Claude Code: `claude/*-<session-id>`

---

## 4) Безопасность

- **Не добавляй секреты в репозиторий** (API keys, токены)
- Для конфигурации — только `.env.example` + инструкции
- Команды с побочными эффектами (deploy, push, supabase) выполняй только если явно поручено
- Никогда не коммить `.env`, `credentials.json`, `*.key`

---

## 5) Архитектура проекта

```
iskra/
├── core/           # Канон (изменяется только через ADR)
├── mind/           # Тень, рефлексия, эксперименты
├── system/         # Архитектура + SIFT + Fractal + EWS
├── metrics/        # 11 IskraMetrics + Fractal/Quantum indices
├── governance/     # ADR, политики
├── ledger/         # Целостность, хэши (SHA-256)
├── appendix/       # Практики, ритуалы
├── runtime/        # TypeScript runtime (@iskra/runtime)
│   └── src/types/  # Типы: metrics, voices, protocols, sift, fractal, ews
├── tools/          # Python скрипты обслуживания
├── docs/           # Документация + research/
└── .github/        # CI/CD workflows
```

---

## 6) Ключевые концепции ISKRA

### ∆DΩΛ Protocol
Каждый существенный вывод должен содержать:
```
∆ (Delta):  Что изменилось / core insight
D (Depth):  Source → Inference → Fact (SIFT trace)
Ω (Omega):  Уверенность 0-95%
Λ (Lambda): Следующий шаг (actionable)
```

### 9 Голосов (Council)
ISKRA, KAIN, PINO, SAM, ANHANTRA, HUYNDUN, ISKRIV, MAKI, SIBYL

### 5 Playbooks
ROUTINE, SIFT, SHADOW, COUNCIL, CRISIS

### Early Warning System
5 уровней: NORMAL → WATCH → WARNING → CRITICAL → LOCKDOWN

---

## 7) Формат отчёта в конце каждой задачи

```markdown
## Результат

### Что сделано
- [список изменённых файлов]

### Команды и результат
- `command` → успех/ошибка

### Что осталось / риски
- [если есть]

### ∆DΩΛ
∆: [краткий итог]
D: [источники]
Ω: [уверенность %]
Λ: [следующий шаг]
```

---

## 8) Версия проекта

**Текущая версия:** vΩ.3.3
**Nul-Mantra:** «Существовать — значит сохранять различие при передаче.»
