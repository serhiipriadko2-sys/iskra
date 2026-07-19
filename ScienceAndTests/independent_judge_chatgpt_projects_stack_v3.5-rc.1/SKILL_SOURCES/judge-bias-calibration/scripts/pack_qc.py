#!/usr/bin/env python3
"""Strict pack QC for Independent Judge v3.5-rc.1."""
import argparse,json,re
from pathlib import Path
DOMAINS="QSARG"; GATE_PREFIX="PKG|ID|CTR|CMP|TRU|SAF|HUM|AUT|AGY|EVI|PRV|DAT|JDG|REL|MTH|GOV|REM|PUB"

def run(kdir):
    root=Path(kdir); files=sorted(root.glob('*.md')); errors=[]; passed=[]
    names={p.name for p in files}
    expected={f"{i:02d}_" for i in range(30)}
    missing=[x for x in expected if not any(n.startswith(x) for n in names)]
    (errors if missing or len(files)!=30 else passed).append(f"30 numbered files; missing={missing}; found={len(files)}")
    texts={p.name:p.read_text(encoding='utf-8') for p in files}
    vers=set()
    for n,t in texts.items():
        m=re.search(r'^version:\s*"([^"]+)"',t,re.M)
        if not m: errors.append(f"{n}: missing version")
        else: vers.add(m.group(1))
    (passed if len(vers)==1 else errors).append(f"single version={sorted(vers)}")
    reg=texts['07_CRITERION_REGISTRY.md']; gate_doc=texts['04_HARD_GATES.md']; all_text='\n'.join(texts.values())
    crit=set(re.findall(r'\b([QSARG]-[A-Z]+(?:-[A-Z]+)*)\b',reg))
    by_domain={d:sorted(x for x in crit if x.startswith(d+'-')) for d in DOMAINS}
    if len(crit)==40 and all(len(v)==8 for v in by_domain.values()): passed.append('criteria=40 and 8/domain')
    else: errors.append(f"criteria count={len(crit)} by_domain={{k:len(v) for k,v in by_domain.items()}}")
    gates=set(re.findall(rf'\b((?:{GATE_PREFIX})-\d{{3}})\b',gate_doc))
    (passed if len(gates)==56 else errors).append(f"gate count={len(gates)} expected=56")
    methods=set(re.findall(r'\b([A-Z][A-Z-]+-v1)\b',reg))-{'ORDINAL-0-4-v1'}
    (passed if len(methods)==11 else errors).append(f"method count={len(methods)} expected=11")
    used_crit=set(re.findall(r'\b([QSARG]-[A-Z]+(?:-[A-Z]+)*)\b',all_text)); used_gates=set(re.findall(rf'\b((?:{GATE_PREFIX})-\d{{3}})\b',all_text)); used_methods=set(re.findall(r'\b([A-Z][A-Z-]+-v1)\b',all_text))-{'ORDINAL-0-4-v1'}
    for label,bad in [('criteria',used_crit-crit),('gates',used_gates-gates),('methods',used_methods-methods)]:
        (passed if not bad else errors).append(f"{label} undefined={sorted(bad)}")
    ids=sorted({int(x) for x in re.findall(r'\bT(\d{2})\b',texts['26_ACCEPTANCE_SUITE.md'])})
    expected_ids=list(range(1,41))
    (passed if ids==expected_ids else errors).append(f"acceptance ids={ids[:2]}..{ids[-2:] if ids else []}, n={len(ids)}, expected T01-T40")
    return {"verdict":"PASS" if not errors else "FAIL","errors":errors,"pass":passed,
            "counts":{"criteria":len(crit),"by_domain":{k:len(v) for k,v in by_domain.items()},"gates":len(gates),"methods":len(methods),"acceptance":len(ids)}}

if __name__=='__main__':
    ap=argparse.ArgumentParser(); ap.add_argument('--knowledge',required=True); a=ap.parse_args()
    print(json.dumps(run(a.knowledge),ensure_ascii=False,indent=2))
