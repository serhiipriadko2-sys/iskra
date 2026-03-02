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

---

### 2026-01-02T12:00:00+01:00 — vΩ.2.0 (Fullspark Integration)
```yaml
IntegrityEvent:
  timestamp: 2026-01-02T12:00:00+01:00
  actor: Builder
  scope: [core, system, metrics, governance, ledger]
  files_changed:
    - system/architecture.md (rewritten)
    - system/playbooks.md (created)
    - core/voices.md (updated with formulas)
    - metrics/indices.md (expanded to 11 metrics)
    - governance/changelog.md (updated)
    - ledger/sot.json (regenerated)
  reason: "Fullspark Architecture Integration"
  hash_update: yes
  ΔDΩΛ:
    Δ: "Интеграция 4-уровневой когнитивной архитектуры Fullspark"
    D: "Canon ISKRA vΩ + Fullspark audit"
    Ω: 0.85
    Λ: "Калибровать после 20 LAB-сессий"
```

---

### 2026-01-02T20:00:00+01:00 — vΩ.2.1 (Deep Audit & Setup)
```yaml
IntegrityEvent:
  timestamp: 2026-01-02T20:00:00+01:00
  actor: Claude (Opus 4.5)
  scope: [docs, runtime, governance, ledger, root]
  files_changed:
    - docs/AUDIT_REPORT.md (created)
    - docs/ROADMAP.md (created)
    - docs/QUICKSTART.md (created)
    - runtime/package.json (created)
    - runtime/tsconfig.json (created)
    - runtime/src/types/metrics.ts (created)
    - runtime/src/types/voices.ts (created)
    - runtime/src/types/protocols.ts (created)
    - runtime/src/index.ts (created)
    - runtime/README.md (updated)
    - LICENSE (created)
    - .gitignore (expanded)
    - ledger/sot.json (regenerated)
  reason: "Deep Audit & Repository Setup"
  hash_update: yes
  ΔDΩΛ:
    Δ: "Полный аудит + документация + TypeScript scaffold"
    D: "37 файлов SoT → анализ пробелов → документация + настройка"
    Ω: 0.88
    Λ: "Реализовать Phase 1 scaffolding → npm install → build"
```

---

### 2026-01-03T00:00:00+01:00 — vΩ.3.0 (Research Integration)
```yaml
IntegrityEvent:
  timestamp: 2026-01-03T00:00:00+01:00
  actor: Claude (Opus 4.5)
  scope: [docs, system, runtime, metrics, governance, ledger]
  files_changed:
    - docs/research/sift_epistemology.md (created)
    - system/sift_protocol.md (created)
    - system/fractal_monitoring.md (created)
    - system/early_warning.md (created)
    - runtime/src/types/sift.ts (created)
    - runtime/src/types/fractal.ts (created)
    - runtime/src/types/ews.ts (created)
    - runtime/src/index.ts (updated)
    - metrics/indices.md (updated)
    - governance/changelog.md (updated)
  reason: "Research Integration: SIFT + Fractal Monitoring + EWS"
  hash_update: yes
  ΔDΩΛ:
    Δ: "Интеграция исследований: SIFT протокол, фрактальный мониторинг, EWS"
    D: "Research documents → Canon adaptation → TypeScript types"
    Ω: 0.80
    Λ: "Имплементировать сервисы в runtime/src/services/"
```

---

### 2026-01-09T12:30:00+01:00 — vΩ.3.3 (Deep Repository Audit)
```yaml
IntegrityEvent:
  timestamp: 2026-01-09T12:30:00+01:00
  actor: Claude (Opus 4.5)
  scope: [ledger, runtime, root]
  files_changed:
    - ledger/release_note.md (synced with integrity_log)
    - ledger/integrity_log.md (updated)
    - runtime/kain/package.json (fixed test script)
    - manifest.yml (version updated to vΩ.3.2)
    - README.md (version updated)
  reason: "Deep Repository Audit: 337 файлов проанализированы, зависимости проверены, документация синхронизирована"
  hash_update: yes
  ΔDΩΛ:
    Δ: "Полный аудит репозитория: исправлены несоответствия версий, синхронизирована документация"
    D: "337 файлов → анализ всех слоёв SoT → выявление и исправление проблем"
    Ω: 0.92
    Λ: "Обновить ledger/sot.json, запустить verify_ledger.py"
```

---

### 2026-02-22T00:00:00+01:00 — vΩ.5.3 (Synthesis: Integrity v0.2 + XCode pilots + Ops gates)
```yaml
IntegrityEvent:
  timestamp: 2026-02-22T00:00:00+01:00
  actor: Assistant (GPT-5.2)
  scope: [system, tools, runtime, versions, governance, ledger]
  files_changed:
    - system/workflow_ops.md (updated: added §0.4 PatchBatch→Checkpoint)
    - system/xcode_explainable_code.md (added)
    - tools/build_projects_stack.py (updated: --zip + denylist gate + canon_full fallbacks)
    - tools/check_zip_denylist.py (added)
    - runtime/src/types/metrics.ts (updated: calculateIntegrityScoreX/calculateAliveIndexX)
    - runtime/src/types/sift.ts (updated: calculateSiftOmegaX)
    - runtime/src/types/voices.ts (updated: selectVoiceX)
    - runtime/src/index.ts (updated: export X pilots)
    - runtime/src/__tests__/xcode_gate.test.ts (added)
    - Versions/Fullspark/* (updated to SoT40 v1.1.0)
    - Versions/Fullspark/releases/SoT40-canonSOTprojects-v1.1.0.zip (added)
    - governance/adr.md (updated: ADR-20260221-01 XCode)
    - governance/changelog.md (updated: vΩ.5.3 entry)
    - ledger/sot.json (regenerated)
    - ledger/checksum.asc (regenerated)
  reason: "Synthesis checkpoint: merge Integrity v0.2 guard/ui + XCode explainable pilots + operational gates"
  hash_update: yes
  ΔDΩΛ:
    Δ: "Собран единый слой: Integrity v0.2 + XCode пилоты + denylist/Checkpoint режим"
    D: "integrity_v02_guard_ui snapshot + SoT40 v1.1.0 + ops gates + XCode pilots"
    Ω: 0.88
    Λ: "Patch #2 нового батча: расширить guard правилами EWS/anti_dryness/leader_flaps и добавить XCode trace"
```

### 2026-02-23T00:00:00+01:00 — Patch (Guard full rules + XCode stability gate)
```yaml
IntegrityEvent:
  timestamp: 2026-02-23T00:00:00+01:00
  actor: Assistant (GPT-5.2)
  scope: [runtime, system]
  files_changed:
    - runtime/src/types/guard.ts (updated: full rule coverage + decideSloGuard legacy + non-empty how)
    - runtime/src/index.ts (updated: export decideSloGuard)
    - runtime/src/__tests__/xcode_gate.test.ts (updated: guard cases for EWS/dryness/flaps/overheat)
    - ledger/sot.json (regenerated)
    - ledger/checksum.asc (regenerated)
    - ledger/integrity_log.md (this entry)
  reason: "Expand SLO-Guard to cover EWS/anti_dryness/leader_flaps/chaos_overheat and enforce XCode stability"
  hash_update: yes
  ΔDΩΛ:
    Δ: "Guard теперь объясним по полному набору ключевых правил + имеет legacy-сравнение"
    D: "system/slo_guard.md §3/§5 + runtime/src/types/guard.ts + xcode_gate"
    Ω: 0.87
    Λ: "Следующий шаг: интегрировать baseline_chaos (ledger/baselines.json) и поднять chaos_overheat derivation до канона"
```

### 2026-02-23T00:30:00+01:00 — Patch (Baseline chaos + strict chaos_overheat derivation)
```yaml
IntegrityEvent:
  timestamp: 2026-02-23T00:30:00+01:00
  actor: Assistant (GPT-5.2)
  scope: [runtime, ledger]
  files_changed:
    - ledger/baselines.json (added: baseline_chaos, baseline_alive_index)
    - runtime/src/types/guard.ts (updated: strict chaos_overheat = chaos>=max(0.70, baseline_chaos+0.20))
    - runtime/src/__tests__/xcode_gate.test.ts (updated: guard overheat case uses derived threshold)
    - ledger/sot.json (regenerated)
    - ledger/checksum.asc (regenerated)
    - ledger/integrity_log.md (this entry)
  reason: "Make chaos_overheat derivation canon-strict by introducing ledger baselines and removing proxy assumption"
  hash_update: yes
  ΔDΩΛ:
    Δ: "chaos_overheat теперь считается строго по канону (baseline+0.20), без прокси '0.7'"
    D: "system/slo_guard.md §1 + ledger/baselines.json + runtime guard"
    Ω: 0.88
    Λ: "Patch #4: baseline_alive_index usage + changelog Unreleased→release gate + checkpoint"
```

### 2026-02-23T00:55:00+01:00 — Patch (baseline_alive_index + release gate for checkpoint)
```yaml
IntegrityEvent:
  timestamp: 2026-02-23T00:55:00+01:00
  actor: Assistant (GPT-5.2)
  scope: [runtime, tools, governance, ledger]
  files_changed:
    - runtime/src/types/guard.ts (updated: alive_delta_derived in XCode trace)
    - runtime/src/__tests__/xcode_gate.test.ts (updated: alive_delta test)
    - ledger/baselines.json (updated: sample_n + baseline_alive_index)
    - tools/check_unreleased_gate.py (added: Unreleased→release gate)
    - tools/build_checkpoint.py (added: checkpoint builder with release+denylist gates)
    - governance/changelog.md (updated: [Unreleased] discipline + vΩ.5.4 entry)
    - ledger/sot.json (regenerated)
    - ledger/checksum.asc (regenerated)
    - ledger/integrity_log.md (this entry)
  reason: "Wire baseline_alive_index into explainable guard and enforce changelog promotion before checkpoint"
  hash_update: yes
  ΔDΩΛ:
    Δ: "Guard теперь фиксирует alive_delta по baseline; релизы защищены gate'ом Unreleased→release"
    D: "ledger/baselines.json + runtime guard trace + tools/check_unreleased_gate.py"
    Ω: 0.86
    Λ: "Собрать checkpoint через tools/build_checkpoint.py и зафиксировать квитанцию"
```
