# Release Note

**Manifest:**
- type: SoT
- layer: ledger
- created: 2026-01-01
- version: vΩ.1.0

## vΩ.1.0 (rev12a) — 2026-01-01
### Что сделано
- Заполнены все SoT-заглушки.
- Добавлены протоколы: STOP/REPAIR/WARM, режимы 0–3, Council.
- Описана лаборатория: ChatGPT Projects + GitHub + Apps/Company knowledge.
- Добавлены evals/qa/security baseline.
- Обновлены sha256 и checksum.

### Риски
- Увеличился объём канона → возможна “перегруженность”.  
  Λ: пересмотреть после 10 LAB-сессий.

### Следующий шаг
- Подключить GitHub app и завести репозиторий (private).
- Запустить 4 базовых теста (Mirror/Drift/Repair/RAG).

---

**Integrity:** Release-Primary


## vΩ.1.1 (rev12b-monorepo-seed) — 2026-01-02
### Что сделано
- Принято решение монорепо: SoT + runtime в одном репозитории.
- Добавлены `runtime/` (каркас) и `tools/` (скрипты обновления/проверки ledger).
- CI SoT ограничен path-фильтрами (не гоняется на изменения runtime).

### Риски
- Возможен рассинхрон “канон ↔ код”, если менять runtime без ADR.
  Λ: правило — любое изменение, влияющее на поведение Искры, фиксировать ADR.

### Следующий шаг
- Создать private GitHub repo и залить этот монорепо-seed.
- Подключить GitHub app в ChatGPT Business.
