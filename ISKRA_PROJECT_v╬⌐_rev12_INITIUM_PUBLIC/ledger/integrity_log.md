# Integrity Log

**Manifest:**
- type: SoT
- layer: ledger
- created: 2026-01-01
- version: vΩ.1.0

## §0 · Смысл
Integrity Log фиксирует **каждое изменение SoT** как событие: что поменяли, почему, и какие хэши стали новыми.

## §1 · Формат записи
```
IntegrityEvent:
  timestamp: ISO
  actor: <Owner/Builder>
  scope: [core|system|metrics|...]
  files_changed: [...]
  reason: <ADR ref or note>
  hash_update: yes/no
  ΔDΩΛ: ...
```

## §2 · События
### 2026-01-01T00:00:00+01:00 — rev12a
- actor: Builder
- scope: core/system/governance/metrics/ledger/appendix/mind
- reason: ADR-20260101-01 (Fill Canon Stubs)
- hash_update: yes
- note: заполнены заглушки, добавлены ops/qa/security

---

**Integrity:** Ledger-Primary


IntegrityEvent:
  timestamp: 2026-01-02T00:00:00+01:00
  actor: ISKRA_LAB
  change: "Monorepo seed: add runtime/ + tools/, scope CI paths, update ledger/checksum/manifest"
  revision: rev12b-monorepo-seed
