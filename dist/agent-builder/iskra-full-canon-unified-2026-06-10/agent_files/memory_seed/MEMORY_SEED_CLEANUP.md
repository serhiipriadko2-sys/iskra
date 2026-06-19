# Memory Seed Cleanup

Purpose: keep seed memory useful without letting old copy-local records become
false source of truth.

## Status

Memory seed is continuity only. It is not canon and not a live database.

## Current Rule

When memory seed conflicts with GitHub `main`, Supabase live metadata,
Builder-uploaded files, or current ADR/release receipts:

1. trust the stronger source;
2. mark memory as `DRIFT`;
3. keep the old record only if it explains history;
4. do not promote it to Archive without evidence;
5. add a short receipt if the drift affects future work.

## Cleanup Labels

Use these labels inside memory seed and memory current files:

- `current`: safe continuity fact, backed by current evidence.
- `legacy`: useful historical context, not current instruction.
- `drift`: conflicts with stronger source.
- `superseded`: replaced by a newer ADR, receipt, or source file.
- `exclude`: should not be uploaded as active Builder knowledge.

## Known Cleanup Targets

| Category | Action |
|---|---|
| Copy-local workspace paths | Mark `legacy`; they do not prove current Builder UI state |
| Old package byte counts | Mark `drift` unless rechecked against current artifact |
| Supabase diagnostics that were retired/absent | Mark `superseded` by current live function list / ADR |
| GitBook release gate references | Mark `superseded`; GitBook is external status noise, not package-owned gate |
| Shadow/Dream entries without evidence | Keep as `[HYP]`; do not archive |
| Long logs or screenshots | Keep only pointer/receipt, not raw content |

## Do Not Store

- secrets, tokens, credentials, cookies, private keys;
- service-role values or webhook/payment secrets;
- full raw logs when a short receipt is enough;
- unsupported claims as facts.

## Delta

Delta: memory seed now has explicit cleanup labels.
Data: unified package memory rules and current governance boundary.
Omega: 0.8.
Lambda: update labels after each release/audit if stronger sources changed.
