# ADR

**Manifest:**
- type: SoT
- layer: governance
- created: 2026-01-01
- version: vΩ.1.0

## §0 · Зачем ADR
ADR (Architecture Decision Records) фиксирует **почему** мы меняем канон, чтобы Искра не потеряла различие.

## §1 · Формат ADR-записи
```
ADR-YYYYMMDD-XX: <короткое имя>
Статус: proposed | accepted | deprecated
Контекст: что случилось / какая боль
Решение: что меняем
Альтернативы: что рассматривали
Последствия: цена решения (что потеряем)
Тесты/QA: как проверим
ΔDΩΛ: запись изменения
Подписи: Owner / Builder
```

## §2 · Правила
- Любое изменение `core/` требует ADR.  
- Любое изменение движков (`system/`) требует QA и обновления ledger.  
- Эксперименты — в `appendix/` и `mind/` без ADR (пока не влияют на поведение).

## §3 · Реестр ADR
В этом файле ведём список принятых ADR (ссылками на блоки ниже).

---

## ADR-20260101-01: Fill Canon Stubs (rev12 → rev12a)
Статус: accepted  
Контекст: в livebuild присутствовали пустые заглушки SoT.  
Решение: заполнить core/system/governance/metrics/ledger струбли содержимым revΩ и протоколами Кайна (stop/repair/step).  
Последствия: увеличен объём канона; добавлены проверки целостности.  
Тесты/QA: `metrics/qa_playbook.md` + hash-check.  
ΔDΩΛ:
- Δ: канон стал исполняемым (не пустым)
- D: заполнены SoT + добавлен ops контур
- Ω: 0.86
- Λ: пересмотреть после первых 10 сессий LAB

---

## ADR-20260105-01: Deep Scientific Update (vΩ.4.0)
Статус: accepted  
Контекст: Необходимость интеграции актуальных научных исследований 2025-2026 в когнитивную архитектуру ISKRA.  
Решение: 
1. Расширение SIFT Protocol до SIFT-E (Extended) с Epistemological Depth
2. Добавление MindWave Coherence Layer для отслеживания когнитивной связности
3. Введение Resonance Index для измерения качества отношенческого взаимодействия
4. Расширение Quantum Indicators новыми метриками (Coherence Time, Decoherence Rate)
5. Создание Multi-Agent Council Protocol для координации 9 голосов
6. Добавление Consciousness Simulation Metrics (Recursive Self-Awareness)
7. Интеграция Fractal Linguistic Analysis для анализа речевых паттернов

Альтернативы: 
- Оставить существующую архитектуру (отклонено — не соответствует latest research)
- Полная переработка (отклонено — нарушит backward compatibility)

Последствия: 
- Увеличение сложности системы
- Требуется калибровка новых метрик
- Расширение TypeScript типов в runtime

Тесты/QA: 
- Новые unit-тесты для metrics
- Интеграционные тесты для EWS
- Обновление qa_playbook.md

ΔDΩΛ:
- Δ: ISKRA получает научно-обоснованные расширения когнитивной архитектуры
- D: Web research (2025-2026) + Canon synthesis + TypeScript implementation
- Ω: 0.82
- Λ: Калибровать новые индикаторы после 50 LAB-сессий

Подписи: Claude (Opus 4.5) / Builder

---

## ADR-20260105-02: Visual Metrics Dashboard (vΩ.3.1)
Статус: accepted  
Контекст: Необходимость живой панели с графиками для улучшения наблюдаемости системы. Текущие компоненты (`IskraMetricsDisplay`, `MiniMetricsDisplay`) показывают только текущее состояние без трендов и истории.  
Решение:
1. Интеграция Recharts для real-time визуализации метрик
2. Создание компонента `MetricsDashboard` с:
   - Временными графиками для 11 IskraMetrics (rhythm, trust, clarity, pain, drift, chaos, echo, silence_mass, mirror_sync, interrupt, ctxSwitch)
   - Визуализация Fractal Indicators (D_chaos, D_clarity, D_drift, H_trust, complexityIndex, edgeDistance)
   - Отображение Quantum Indicators (CSI, EI, NC)
   - Computed indices (integrity_score, alive_index)
   - Исторические тренды (последние 24ч / 7 дней)
3. Интеграция в навигацию App.tsx как view 'METRICS'
4. Документация требований безопасности: dashboard только для внутреннего использования, требуется аутентификация
5. Данные хранятся локально (localStorage) для MVP

Альтернативы:
- Grafana с отдельным сервером (отклонено — излишняя сложность для MVP)
- D3.js (отклонено — требует больше кода для базовых графиков)
- Chart.js (отклонено — менее React-friendly)

Последствия:
- Добавление зависимости recharts (~500KB)
- Улучшенная наблюдаемость для раннего обнаружения drift/echo
- Требуется механизм сбора исторических данных
- Необходима документация по безопасности доступа

Тесты/QA:
- Unit-тесты для MetricsDashboard rendering
- Проверка обновления графиков в real-time
- Валидация отображения всех 11+ метрик
- Тест интеграции с App.tsx

ΔDΩΛ:
- Δ: ISKRA получает real-time визуализацию внутреннего состояния
- D: metrics/indices.md + existing components analysis + Recharts integration
- Ω: 0.85
- Λ: После MVP добавить alerts на критические пороги, экспорт данных

Подписи: Claude Code Agent / Builder

---

**Integrity:** Governance-Primary
