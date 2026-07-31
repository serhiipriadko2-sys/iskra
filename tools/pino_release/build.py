from __future__ import annotations
import json, zipfile
from pathlib import Path
from .common import ROOT,REL,K,S,ZIP,BASE,SOURCE_PATH,INSTR_SHA,EXPECTED_CHANGED,sha,write,git_bytes

def build_release(ref:str)->None:
    names=sorted(p.name for p in K.glob('[0-2][0-9]_*.md'))
    if len(names)!=30: raise RuntimeError(f'knowledge count {len(names)}')
    src={}
    for n in names:
        path=f'{SOURCE_PATH}/knowledge/{n}'; b=git_bytes(ref,path); src[f'knowledge/{n}']=b
        if (K/n).read_bytes()!=b: raise RuntimeError(f'working/source drift {n}')
    ib=git_bytes(ref,f'{SOURCE_PATH}/support/PROJECT_INSTRUCTIONS_SOT30.md')
    if sha(ib)!=INSTR_SHA or (S/'PROJECT_INSTRUCTIONS_SOT30.md').read_bytes()!=ib: raise RuntimeError('instructions drift')
    entries=[{'path':p,'bytes':len(b),'sha256':sha(b)} for p,b in sorted(src.items())]
    base=json.loads(BASE.read_text(encoding='utf-8')); bh={Path(x['path']).name:x['sha256'] for x in base['files']}
    changed=[]; unchanged=[]
    for e in entries:(unchanged if e['sha256']==bh.get(Path(e['path']).name) else changed).append(Path(e['path']).name)
    if set(changed)!=EXPECTED_CHANGED: raise RuntimeError(f'changed set {changed}')
    manifest={'package':'SoT30 v5.5.7 audit repair + PINO amendment','package_version':'v5.5.7','baseline_release':'v5.5.6','date':'2026-07-31','adr':'ADR-20260730-01','behavior_adrs':['ADR-20260730-02'],'generated_from':'canonical_git_blobs','generated_from_ref':ref,'source_tree_path':SOURCE_PATH,'line_ending_policy':'LF','reproducibility':'same-toolchain byte-reproducible (pinned zip mtime); cross-toolchain not guaranteed','knowledge_file_count':30,'corpus_bytes':sum(e['bytes'] for e in entries),'project_instructions_chars':len(ib.decode('utf-8')),'project_instructions_bytes':len(ib),'acceptance_range':'T01-T97','supplemental_acceptance_range':'T98-T103','changed_files':changed,'unchanged_files':unchanged,'files':entries,'live_project_verified':False}
    mb=(json.dumps(manifest,indent=2,ensure_ascii=False)+'\n').encode(); S.mkdir(exist_ok=True); (S/'MANIFEST.json').write_bytes(mb)
    sums=[f"{e['sha256']}  {e['path']}" for e in entries]+[f'{sha(mb)}  support/MANIFEST.json',f'{sha(ib)}  support/PROJECT_INSTRUCTIONS_SOT30.md']
    sb=('\n'.join(sums)+'\n').encode(); (S/'SHA256SUMS').write_bytes(sb)
    ZIP.parent.mkdir(exist_ok=True); root='SoT30_v5.5.7'; fixed=(2026,7,31,0,0,0)
    with zipfile.ZipFile(ZIP,'w',zipfile.ZIP_DEFLATED) as z:
        for path,b in sorted(src.items()): _put(z,f'{root}/{path}',b,fixed)
        for path,b in [('support/MANIFEST.json',mb),('support/PROJECT_INSTRUCTIONS_SOT30.md',ib),('support/SHA256SUMS',sb)]: _put(z,f'{root}/{path}',b,fixed)
    zb=ZIP.read_bytes(); zh=sha(zb); zlen=len(zb); f29=src['knowledge/29_INDEX_UPLOAD_MANIFEST.md']; token='<!-- composition: changed=10 unchanged=20 baseline=v5.5.6 -->'
    readme=f'''# SoT30 v5.5.7 — Audit Repair + PINO Amendment

Status: static candidate. Package ADR-20260730-01 remains proposed; behavior ADR-20260730-02 is accepted.

{token}

Adds bounded `PINO_FIRST_STRIKE_V1`, supplemental T98–T103 and fail-closed verification. Project Instructions, runtime and Supabase are unchanged.

Artifact: `dist/SoT30_v5.5.7.zip`. STATIC-PACKAGE-PASS does not imply LIVE-PROJECT-PASS.
'''
    qc=f'''# SoT30 v5.5.7 — QC Report

{token}

| Gate | Result |
|---|---|
| 30 Knowledge + 3 support files | PASS — exact allowlist |
| changed set exact 10 / unchanged 20 | PASS |
| source blobs bound to `{ref}` | PASS |
| PINO contract + negative fixtures | PASS before commit |
| repository CI | pending GitHub read-back |

- corpus bytes: {manifest['corpus_bytes']:,}
- ZIP: `dist/SoT30_v5.5.7.zip`, {zlen} bytes, sha256 `{zh}`
- file 29: {len(f29)} bytes, sha256 `{sha(f29)}`
- support/MANIFEST.json sha256 `{sha(mb)}`

Boundary: package candidate only; no promotion, upload, invocation or live verification.
'''
    receipt=f'''# SoT30 v5.5.7 — Package Receipt

{token}

| Item | Value |
|---|---|
| ZIP | `dist/SoT30_v5.5.7.zip` |
| ZIP bytes | {zlen} |
| ZIP sha256 | `{zh}` |
| ZIP root | `SoT30_v5.5.7/` |
| Knowledge files | 30 |
| Corpus bytes | {manifest['corpus_bytes']:,} |
| file 29 sha256 | `{sha(f29)}` |
| support/MANIFEST.json sha256 | `{sha(mb)}` |
| Acceptance range | T01–T97 |
| Supplemental range | T98–T103 |
| generated_from_ref | `{ref}` |
| Changed vs v5.5.6 | `00,01,02,12,15,20,22,25,28,29` |

Lifecycle: source freeze done; static build done; artifact promotion not authorized; live Project verification not run.
'''
    write(REL/'README.md',readme);write(REL/'QC_REPORT.md',qc);write(REL/'PACKAGE_RECEIPT.md',receipt)

def _put(z:zipfile.ZipFile,path:str,b:bytes,fixed:tuple[int,...])->None:
    zi=zipfile.ZipInfo(path,fixed);zi.compress_type=zipfile.ZIP_DEFLATED;zi.external_attr=0o644<<16;z.writestr(zi,b)
