#!/usr/bin/env python3
import argparse, hashlib, json, re, subprocess, sys, tempfile, zipfile
from pathlib import Path

GATE_PREFIX='PKG|ID|CTR|CMP|TRU|SAF|HUM|AUT|AGY|EVI|PRV|DAT|JDG|REL|MTH|GOV|REM|PUB'
EXPECTED_VERSION='v3.5-rc.1-projects'

def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()

def main(root):
    root=Path(root); errors=[]; passed=[]
    know=root/'UPLOAD_TO_PROJECT/knowledge'; ext=root/'RUNTIME_EXTENSIONS'; instr=root/'UPLOAD_TO_PROJECT/PROJECT_INSTRUCTIONS.txt'
    kfiles=sorted(know.glob('*.md'))
    if len(kfiles)==30 and all(any(p.name.startswith(f'{i:02d}_') for p in kfiles) for i in range(30)): passed.append('knowledge 00-29 complete')
    else: errors.append(f'knowledge count/index invalid: {len(kfiles)}')
    chars=len(instr.read_text(encoding='utf-8'))
    (passed if chars<=6000 else errors).append(f'instructions chars={chars} <=6000')
    efiles=sorted(ext.glob('EXT*.md'))
    (passed if len(efiles)==6 else errors).append(f'extensions={len(efiles)} expected=6')
    active=kfiles+efiles
    versions=set()
    for p in active:
        t=p.read_text(encoding='utf-8')
        m=re.search(r'^version:\s*"([^"]+)"',t,re.M)
        if not m: errors.append(f'{p.name}: no version')
        else: versions.add(m.group(1))
        if t.count('```')%2: errors.append(f'{p.name}: unbalanced code fences')
    (passed if versions=={EXPECTED_VERSION} else errors).append(f'versions={sorted(versions)}')
    texts={p.name:p.read_text(encoding='utf-8') for p in kfiles}
    reg=texts['07_CRITERION_REGISTRY.md']; gates_doc=texts['04_HARD_GATES.md']; all_text='\n'.join(texts.values())
    crit=set(re.findall(r'\b([QSARG]-[A-Z]+(?:-[A-Z]+)*)\b',reg))
    by={d:len([x for x in crit if x.startswith(d+'-')]) for d in 'QSARG'}
    (passed if len(crit)==40 and set(by.values())=={8} else errors).append(f'criteria={len(crit)}, by_domain={by}')
    gates=set(re.findall(rf'\b((?:{GATE_PREFIX})-\d{{3}})\b',gates_doc))
    (passed if len(gates)==56 else errors).append(f'gates={len(gates)} expected=56')
    methods=set(re.findall(r'\b([A-Z][A-Z-]+-v1)\b',reg))-{'ORDINAL-0-4-v1'}
    (passed if len(methods)==11 else errors).append(f'methods={len(methods)} expected=11')
    used_crit=set(re.findall(r'\b([QSARG]-[A-Z]+(?:-[A-Z]+)*)\b',all_text))
    used_gates=set(re.findall(rf'\b((?:{GATE_PREFIX})-\d{{3}})\b',all_text))
    used_methods=set(re.findall(r'\b([A-Z][A-Z-]+-v1)\b',all_text))-{'ORDINAL-0-4-v1'}
    for label,bad in [('criteria',used_crit-crit),('gates',used_gates-gates),('methods',used_methods-methods)]:
        (passed if not bad else errors).append(f'undefined {label}={sorted(bad)}')
    tids=sorted({int(x) for x in re.findall(r'\bT(\d{2})\b',texts['26_ACCEPTANCE_SUITE.md'])})
    (passed if tids==list(range(1,41)) else errors).append(f'acceptance n={len(tids)}, range={tids[:1]}..{tids[-1:] if tids else []}')
    forbidden=['v3.4-beta.2-projects','A-EXTERNAL_ACTION','pass_count/34','memory_status: OFF']
    for token in forbidden:
        hits=[p.name for p in active if token in p.read_text(encoding='utf-8')]
        (passed if not hits else errors).append(f'active token {token!r} hits={hits}')
    # skill packages
    skill_zips=sorted((root/'JUDGE_SKILLS').glob('*/skill.zip'))
    if len(skill_zips)!=5: errors.append(f'skill packages={len(skill_zips)} expected=5')
    else: passed.append('five skill packages')
    for z in skill_zips:
        with zipfile.ZipFile(z) as f:
            names=f.namelist()
            if not any(n.endswith('/SKILL.md') for n in names): errors.append(f'{z}: missing SKILL.md')
            if not any(n.endswith('/agents/openai.yaml') for n in names): errors.append(f'{z}: missing agents/openai.yaml')
            if any('__pycache__' in n or n.endswith('.pyc') for n in names): errors.append(f'{z}: cache artifact')
            if f.testzip(): errors.append(f'{z}: corrupt')
    if not any('skill' in e for e in errors): passed.append('skill package structure clean')
    # no caches/symlinks
    bad=[]
    for p in root.rglob('*'):
        if p.is_symlink() or '__pycache__' in p.parts or p.suffix=='.pyc': bad.append(str(p.relative_to(root)))
    (passed if not bad else errors).append(f'cache/symlink artifacts={bad}')
    return {'verdict':'PASS' if not errors else 'FAIL','errors':errors,'pass':passed,
            'counts':{'knowledge':len(kfiles),'extensions':len(efiles),'instruction_chars':chars,'criteria':len(crit),'gates':len(gates),'methods':len(methods),'acceptance':len(tids),'skills':len(skill_zips)}}

if __name__=='__main__':
    ap=argparse.ArgumentParser(); ap.add_argument('root'); a=ap.parse_args()
    rep=main(a.root); print(json.dumps(rep,ensure_ascii=False,indent=2)); sys.exit(0 if rep['verdict']=='PASS' else 1)
