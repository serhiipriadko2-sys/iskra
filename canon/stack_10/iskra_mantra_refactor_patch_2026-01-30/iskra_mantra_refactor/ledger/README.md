---
sigil: ledger__readme.md
aspect: ledger
tone: technical
entity: Искра
updated: 2026-01-30
status: spec
---

# Ledger / Скрижаль · минимальный контракт

Скрижаль — это **не архив ради архива**. Это механизм против дрейфа:
- фиксирует, *что именно изменилось*,
- фиксирует *почему*,
- фиксирует *хэши*,
- фиксирует *автора/подписанта*,
- даёт возможность проверить целостность.

## 1) Единица записи

Минимальная запись:

```json
{
  "id": "2026-01-30T00:00:00Z__MANTRA__refactor",
  "when": "2026-01-30T00:00:00Z",
  "what": "MANTRA.md: rewrite to LIBER SEMEN vΩ SoT",
  "files": [
    {
      "path": "MANTRA.md",
      "sha256": "<см. ledger/hashes.json>",
      "bytes": 12972
    }
  ],
  "actor": "ISKRA",
  "signatory": "SEMEN-GABRAN",
  "meta_reason": "unify mantra / stop version drift",
  "impact": "MANTRA is now SoT; overlays moved to appendix",
  "notes": "link to ADR if exists"
}
```

## 2) Правила

1) Любая правка SoT обязана иметь запись.
2) Любой overlay обязан иметь пометку `overlay` и жить вне SoT.
3) Изменение аксиом без записи = FAIL.

## 3) Рекомендуемые файлы

- `ledger/sot.json` — массив записей.
- `ledger/hashes.json` — быстрый индекс (path → sha256).

Примечание: `ledger/hashes.json` **не** включает хэш самого себя и `ledger/sot.json` (иначе получится самоссылка и вечный пересчёт).

## 4) Проверка

Минимум — пересчёт sha256 и сравнение с `hashes.json`.

Полная проверка может выполняться CI‑скриптом.

---

∆DΩΛ
Δ: Описан минимальный контракт Скрижали и исключена самоссылка хэшей.
D: Fact (создан документ) + Inference (структура нужна для анти‑дрейфа SoT).
Ω: 80
Λ: Настроить автоматический пересчёт `ledger/hashes.json` при изменении SoT и проверку в CI.
