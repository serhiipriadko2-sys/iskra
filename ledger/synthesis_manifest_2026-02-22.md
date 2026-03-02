# Synthesis Manifest — vΩ.5.3 (2026-02-22)

Этот файл описывает, из каких версий/архивов собран синтез и какие правила наложения применены.

## Inputs (receipts)

- `iskra-main_lowercanon_promoted_v3_2026-02-20_1.zip` — bytes: `6355137`; sha256: `31f77a1e3b4531a86c7738b59cdfd86379dd686567c53deac95175abd27eddc1`
- `iskra-main_integrity_v02_guard_ui_patch_2026-02-21 (1).zip` — bytes: `6381633`; sha256: `8ca0d04ec0a082387ce7acdec4049a340913d0db55bd1ad32d695e328c51711e`
- `iskra_checkpoint_vOmega_5.2_2026-02-21.zip` — bytes: `6322272`; sha256: `a7e7f8e1295570b9920738b590c07ae967b5e228a6395bb561e6d1fb7432b744`
- `SoT40-canonSOTprojects-v1.1.0.zip` — bytes: `1586567`; sha256: `d518be4d47c51595cc6534f67de477d49b9cc35004975871add978503273cd68`
- `iskra-main_xcode_adr-20260220-11_patch.zip` — bytes: `46822434`; sha256: `ecc1410d5924ebce985d92e35ef2ab971b55479ccf679fb0ab5daa1606dea6f0`
- `iskra_patch1_patchbatch_checkpoint_ops_v0_1.zip` — bytes: `47552`; sha256: `8620fc56701929b44e94abc5395fc9c66d7b3c311727c1254f6fb3cc9c3988c5`
- `iskra_patch2_denylist_gate_build_projects_stack.zip` — bytes: `4003`; sha256: `6757c64c49a67578a0ef2ea8e650ce31d625f44c02cc48bcc2a85cbb9b8b18d8`

## Merge rules

1) Base = `iskra-main_integrity_v02_guard_ui_patch_2026-02-21 (1).zip` (нижний канон + Integrity v0.2 + guard-before-playbook + UI наблюдаемость).
2) Ops layer: добавлен §0.4 PatchBatch→Checkpoint в `system/workflow_ops.md`; добавлен `tools/check_zip_denylist.py`; обновлён `tools/build_projects_stack.py` (denylist gate + --zip + fallback CANON_FULL).
3) XCode layer: добавлены XCode‑пилоты в runtime (`*X` функции) и hard‑gate тест `runtime/src/__tests__/xcode_gate.test.ts` (how not empty + value stable).
4) SoT40 layer: `Versions/Fullspark/` обновлён по релизу SoT40 v1.1.0; zip релиза сохранён в `Versions/Fullspark/releases/`.
5) Ledger: `tools/update_ledger.py` → реген `ledger/sot.json` и `ledger/checksum.asc`; запись в `ledger/integrity_log.md`.
