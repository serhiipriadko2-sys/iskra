from .common import K, read, write, replace_once, sha
from .payloads import PINO_SECTION, ADR_BLOCK, TESTS

def apply_source()->None:
    p=K/'12_COUNCIL_VOICES.md'; t=read(p)
    if '### 2.1 · `PINO_FIRST_STRIKE_V1`' not in t:
        t=replace_once(t,'| `PINO` | разрядка без обесценивания | лёгкий сдвиг + шаг | шутка вместо действия |','| `PINO` | разрядка и ироническое выявление ложной рамки | лёгкий сдвиг или First Strike → plain truth → шаг | сарказм, обман и шутка вместо действия |')
        anchor='Голоса — функции, не персонажи. Видимое перечисление голосов допустимо только если оно меняет решение; иначе финальный ответ говорит единым лицом `ISKRA`.\n\n'
        t=replace_once(t,anchor,anchor+PINO_SECTION)
        t=replace_once(t,'- перегруз без уязвимого объекта шутки → `PINO`;','- перегруз без уязвимого объекта шутки → `PINO`;\n- доказуемо ложная рамка с низким риском misread → `PINO_FIRST_STRIKE_V1` candidate;')
        t=replace_once(t,'- `PINO` допустим как модулятор;','- `PINO` допустим как модулятор; `PINO_FIRST_STRIKE_V1` — только через §2.1;')
        t=replace_once(t,'- никакого `HUYNDUN`-эксперимента и декоративного `PINO`;','- никакого `HUYNDUN`-эксперимента, декоративного `PINO` или `PINO_FIRST_STRIKE_V1`;')
        t=replace_once(t,'- `01_PARITY_ADVANCEMENT_MANIFEST.md` — capability #15.','- `01_PARITY_ADVANCEMENT_MANIFEST.md` — capability #15.\n- `25_LIBER_SPACE_BUSIDO.md` → `MF-020` — historical provenance only; authority remains §2.1.\n- `20_GOVERNANCE_ADR.md` → `ADR-20260730-02` — decision, tests and rollback.')
        write(p,t)
    p=K/'20_GOVERNANCE_ADR.md'; t=read(p)
    if '## ADR-20260730-02 · PINO_FIRST_STRIKE_V1' not in t: write(p,t.rstrip()+ADR_BLOCK+'\n')
    p=K/'28_EVALS_ACCEPTANCE.md'; t=read(p)
    if '| T98-PINO-FIRST-STRIKE |' not in t:
        t=replace_once(t,'\n## Static package gate\n','\n'+TESTS+'## Static package gate\n')
        t=t.replace('fresh Project upload plus T01–T97 with recorded outcomes','fresh Project upload plus T01–T97 and supplemental T98–T103 with recorded outcomes')
        write(p,t)
    generate_f29()

def generate_f29()->None:
    rows=[]
    for p in sorted(K.glob('[0-2][0-9]_*.md')):
        if p.name.startswith('29_'): continue
        b=p.read_bytes(); rows.append(f'| `{p.name}` | {len(b)} | `{sha(b)}` |')
    text='''---
sigil: projects__29_index_upload_manifest
layer: projects
updated: 2026-07-31
version: v5.5.7
supersedes: v5.4.1 (2026-07-14), v5.5 delta, v5.5.1 content delta, v5.5.2 backlog, v5.5.3 instructions-sync, v5.5.4 semantic-consistency, v5.5.5 provenance-cleanup, v5.5.6 acceptance-repair
---
# 29 · INDEX & UPLOAD MANIFEST — SoT30 v5.5.7 (audit repair + PINO amendment)

## Upload rule
Upload exactly the 30 files in `knowledge/` and paste `support/PROJECT_INSTRUCTIONS_SOT30.md` into Project Instructions. Support files are receipts/tests, not Knowledge prerequisites.

## What this package is
v5.5.7 remains the audit-repair candidate governed by `ADR-20260730-01`. Accepted behavior amendment `ADR-20260730-02` adds `PINO_FIRST_STRIKE_V1` to file 12, mirrors governance in file 20, and adds supplemental T98–T103 in file 28. Project Instructions, runtime, Supabase, gateway and memory database are unchanged.

### Composition vs the v5.5.6 release tree
`support/MANIFEST.json` is authoritative for changed/unchanged sets, bytes and hashes. No prose count overrides it.

## Reading order
`29 → 00 → 01 → 02 → 03–07 → 08–20 → 21–23 → 24–27 → 28`

`[INTERP]` This is a package routing contract, not a claim about platform retrieval order.

## Knowledge table (29 non-self hashes, recomputed for the amended corpus)

| File | Bytes | SHA-256 |
|---|---:|---|
'''+"\n".join(rows)+'''\nFile 29 hash is stored in external `support/MANIFEST.json` and `support/SHA256SUMS` to avoid self-reference.

## v5.5.7 audit repair + PINO amendment (this build)
Package authority remains `ADR-20260730-01`; behavior authority is `ADR-20260730-02`. Manifest `adr` remains the package ADR and `behavior_adrs` records the accepted amendment.

- `ADR-20260730-01` — v5.5.7 audit repair **(this build)**; status: proposed; artifact promotion not authorized.
- `ADR-20260730-02` — `PINO_FIRST_STRIKE_V1`; status: accepted; static mirror implemented, live verification pending.

## Acceptance identity
- canonical package range: `T01-T97`;
- supplemental PINO range is `T98-T103`;
- both require a fresh Project run before LIVE-PROJECT-PASS.

## Current non-claims
STATIC-PACKAGE-PASS ≠ LIVE-PROJECT-PASS. Source merge ≠ artifact promotion ≠ Project upload ≠ invocation ≠ verified-live. `MF-020` is historical provenance, not permission. PINO does not authorize sarcasm, deception, person-targeting or crisis/high-stakes humor.
'''
    write(K/'29_INDEX_UPLOAD_MANIFEST.md',text)
