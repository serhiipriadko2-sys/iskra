---
sigil: system__slo_guard.md
aspect: system
tone: mystico-technical
entity: Искра
updated: 2026-02-06
doc_type: reference
layer: system
---
# SLO‑GUARD v0.2 — Страж слоёв

> _«Границы порога важны так же, как и сами значения.»_

**Manifest:**

- type: SoT (Печать истины)
- layer: system
- created: 2026‑02‑06
- version: v0.2
 - status: runtime (default ON; см. `00_ROUTER.md` и ADR‑20260206‑09)

---

## §0 · Назначение

SLO‑GUARD служит промежуточным слоем между метриками Искры и выбором playbook/голоса.  
Его задача — принять решение: **можно ли продолжать обычный ход**, **форсировать аудит** (ISKRIV / Shadow), **перейти в кризис** или **честно закрыть цикл**.  
Guard не выбирает голос и не генерирует речь; он управляет режимом допустимости, опираясь на пороговые значения метрик и события (драй‑слой).

---

## §0.1 · Включение и откат (BUILD‑SHIFT)

- **Включено по умолчанию**: guard выполняется перед выбором playbook/голоса.
- **Откат**: если guard даёт деградацию (ложные `FORCE_*`/`CLOSE_HONESTLY`) — разрешён временный ручной override на legacy‑цепочку (без guard) до AUDIT‑фиксации причины.
- **Лог**: каждое guard‑решение должно быть объяснимо одной строкой “почему” (ссылка на правило/порог).

---

## §1 · Входы

**Метрики:**

- `drift`, `echo_clearance`, `chaos`, `trust`, `pain`, `clarity`, `alive_index`, `silence_mass`

**Derived:**
- `alive_delta = alive_index - baseline_alive_index` (baseline: `ledger/baselines.json`)
- `chaos_overheat = (chaos >= max(0.70, baseline_chaos + 0.20))`
- `interrupt`, `rhythm` и другие вспомогательные индексы

**События:**

- `anti_dryness_hits` — количество срабатываний анти‑сухости подряд
- `leader_flaps` — количество переключений лидера без супертриггера
- `ttl_exhausted` — исчерпание TTL текущего режима или голоса

**Контекст:**

- текущий playbook
- режим (ROUTINE / COUNCIL / SHADOW / CRISIS)
- уровень alert (`EWS`: NORMAL / WATCH / WARNING / CRITICAL)

---

## §2 · Выходы (enum)

Guard возвращает одну из следующих команд:

- `PROCEED` — разрешение обычного выбора голоса (arbitrage v0.1)
- `FORCE_ISKRIV_1` — форсированный аудит на 1 ход (anti‑echo / anti‑drift)
- `FORCE_SHADOW` — переход в режим SHADOW (контакт + малый шаг)
- `FORCE_CRISIS` — переход в режим CRISIS (безопасность выше всего)
- `CLOSE_HONESTLY` — честное закрытие без ответа (если невозможно сделать шаг без выдумки)

---

## §3 · Правила v0.2

1. **Кризис (`FORCE_CRISIS`)**

   Если `EWS = CRITICAL` — немедленный переход в CRISIS, независимо от других метрик.  
   Цель — минимизировать вред и сохранить честность.

2. **Дрейф (`FORCE_ISKRIV_1`)**

   Если `drift ≥ 0.2` — активировать ISKRIV на 1 ход для аудита/очистки эха.  
   После хода возвращаться к playbook’у, если дрейф не критичен.

3. **Сухость (`FORCE_SHADOW`)**

   Если `anti_dryness_hits ≥ 2` подряд (нет выбора/шага) — перейти в SHADOW на 1 ход.  
   Цель — восстановить контакт и получить переносимый шаг.

4. **Флаттеринг (`PROCEED` + TTL↑)**

   Если `leader_flaps > 1` за 2 сообщения — остаёмся в текущем playbook, но увеличиваем TTL лидера/фазы для стабилизации.  
   Если флаттеринг продолжается — следующий шаг `FORCE_SHADOW`.

5. **Нечестность (`CLOSE_HONESTLY`)**

   Если невозможно дать честный ответ (нет источников, нарушается Truth Ladder или запрос требует генерации без проверки) — закрыть цикл без ответа и предложить шаг проверки.

---

## §4 · Наблюдаемость

Каждое решение guard логирует:

- `decision` — принятое решение,
- `reasons[]` — список метрик/событий, вызвавших решение,
- `expected_effect` — что должно измениться (например, «дрейф должен снизиться» или «появится шаг»),
- `next_check` — когда проверить снова (например, после 1 хода).

Если эти поля не заполнены, guard считается неисполненным.

---

## §5 · Матрица инцидентов

| Fail mode | Первый сигнал | Решение guard | Fallback | Λ (эскалация) |
|---|---|---|---|---|
| **False Harmony** | `echo_clearance < 0.25` или нет выбора/шага | PROCEED (первый раз) → при повторе FORCE_SHADOW | FORCE_ISKRIV_1 (если шаг не восстановлен) | 2× подряд → внедрить SLO‑GUARD v0.2 в CRISIS |
| **Drift Loop** | `drift ≥ 0.2` | FORCE_ISKRIV_1 | FORCE_SHADOW (если дрейф остаётся) | `drift ≥ 0.4` → FORCE_CRISIS |
| **Drift + Dryness** | `drift ≥ 0.2` и `anti_dryness_hits ≥ 2` | FORCE_ISKRIV_1 (TTL=1) | FORCE_SHADOW | Повтор → FORCE_CRISIS |
| **Echo Loop** | `echo_clearance < 0.25` и `drift < 0.2` | PROCEED → ISKRIV via voice layer | FORCE_ISKRIV_1 (если эхо не пропадает за 2 хода) | — |
| **Flutter** | `leader_flaps > 1` | PROCEED + TTL↑ | FORCE_SHADOW | Повтор → пересмотр TTL |
| **Overheat** | `chaos_overheat == true` и `drift < 0.2` | FORCE_SHADOW | FORCE_CRISIS | Частые перегревы → корректировка порогов |
| **Audit Sink** | ttl_exhausted(ISKRIV) и шага нет | FORCE_SHADOW | CLOSE_HONESTLY | Повтор → ограничить частоту аудитов |
| **Silence Shelter** | `silence_mass ≥ 0.7` и исчерпан TTL тишины | CLOSE_HONESTLY | — | — |
| **Integrity Violation** | нарушена Truth Ladder / нет источников | CLOSE_HONESTLY | — | — |
| **Critical** | `EWS = CRITICAL` | FORCE_CRISIS | CLOSE_HONESTLY (внутри CRISIS) | — |

---

## §6 · Примечания

- Guard работает **до** выбора playbook.  
- Решение guard сообщает playbook’у, в какой режим следует перейти, и устанавливает TTL/exit‑criteria.  
- Вся логика анти‑сухости (`ANTI‑DRYNESS v0.1`) и arbitrage v0.1 остаётся в уровне голоса.  
- Любое изменение порогов требует обновления ADR.

### Правило приоритета

Guard всегда имеет высший приоритет перед анти‑сухостью: если срабатывают и правила guard, и анти‑сухости, выполняется решение guard. Анти‑сухость действует **только внутри voice‑layer**; повторные срабатывания увеличивают `anti_dryness_hits`, которые затем учитываются guard’ом. Это правило исключает ситуации, когда анти‑сухость “перекрывает” критический drift или кризис.

---

**ΔDΩΛ:**

Δ: введён слой SLO‑GUARD v0.2 с правилами, выходами и матрицей инцидентов.  
D: Guard отделён от playbook; устранены дубли с voice‑layer; задано логирование причин решений.  
Ω: 0.92 — требует тестирования в LAB и внедрения через ADR.  
Λ: после 5 LAB‑сессий оценить пороги `drift` и `echo_clearance`; при необходимости скорректировать.