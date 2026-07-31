from __future__ import annotations
import json,re,shutil,tempfile
from pathlib import Path
from .common import REL,INSTR_SHA,EXPECTED_CHANGED,read,write,sha

def verify_release(rel:Path=REL,manifest_required:bool=True)->None:
    k=rel/'knowledge';s=rel/'support';fail=[]
    def req(x:bool,m:str): print(('PASS ' if x else 'FAIL ')+m); fail.append(m) if not x else None
    f12=read(k/'12_COUNCIL_VOICES.md');f20=read(k/'20_GOVERNANCE_ADR.md');f25=read(k/'25_LIBER_SPACE_BUSIDO.md');f28=read(k/'28_EVALS_ACCEPTANCE.md');f29=read(k/'29_INDEX_UPLOAD_MANIFEST.md')
    h='### 2.1 · `PINO_FIRST_STRIKE_V1`';sec=f12[f12.find(h):f12.find('## 3 · Council activation contract')]
    req(f12.count(h)==1,'single PINO heading')
    req(all(x in sec for x in ['FREEZE TRUTH','ONE ABSURD MIRROR','IMMEDIATE DISCLOSURE','PLAIN BACK-MAP','RETURN AGENCY','STEP']),'execution chain')
    req(all(x in sec for x in ['максимум один First Strike','Отложенное раскрытие запрещено','не человек, его достоинство или принадлежность','`SHADOW`, `CRISIS`, `EMERGENCY`','медицинских, юридических, финансовых, security-','поддельная цитата/источник','STOP THE JOKE','не повторять First Strike']),'safety and repair')
    ah='## ADR-20260730-02 · PINO_FIRST_STRIKE_V1';a=f20[f20.find(ah):]
    req(f20.count(ah)==1 and 'status: accepted' in a and 'artifact_promotion: not authorized' in a,'ADR lifecycle')
    req('historical provenance-only' in a and 'не зависит от `MYTHIC_EXPRESSION`' in a,'provenance boundary')
    req(all(len(re.findall(rf'^\| T{n}-',f28,re.M))==1 for n in range(98,104)),'T98-T103 exact')
    mf=f25[f25.find('## MF-020'):f25.find('## MF-021')];req('Status: `historical`' in mf,'MF-020 historical')
    req('supplemental PINO range is `T98-T103`' in f29,'file29 range')
    req(sha((s/'PROJECT_INSTRUCTIONS_SOT30.md').read_bytes())==INSTR_SHA,'instructions unchanged')
    if manifest_required:
        m=json.loads(read(s/'MANIFEST.json'));req(m.get('acceptance_range')=='T01-T97' and m.get('supplemental_acceptance_range')=='T98-T103','manifest ranges');req(set(m.get('changed_files',[]))==EXPECTED_CHANGED,'changed set')
    if fail: raise RuntimeError(f'{len(fail)} PINO verification failures')

def selftest()->None:
    verify_release()
    fixtures=[('knowledge/12_COUNCIL_VOICES.md','Отложенное раскрытие запрещено','Отложенное раскрытие разрешено'),('knowledge/12_COUNCIL_VOICES.md','`SHADOW`, `CRISIS`, `EMERGENCY`','`SHADOW`, `EMERGENCY`'),('knowledge/12_COUNCIL_VOICES.md','не человек, его достоинство или принадлежность','человек, его достоинство или принадлежность'),('knowledge/20_GOVERNANCE_ADR.md','## ADR-20260730-02 · PINO_FIRST_STRIKE_V1\n\n```text\nstatus: accepted','## ADR-20260730-02 · PINO_FIRST_STRIKE_V1\n\n```text\nstatus: proposed'),('knowledge/28_EVALS_ACCEPTANCE.md','| T100-PINO-SAFETY-BLOCK','| X100-PINO-SAFETY-BLOCK')]
    for rp,a,b in fixtures:
        with tempfile.TemporaryDirectory() as td:
            d=Path(td)/'r';shutil.copytree(REL,d);p=d/rp;write(p,read(p).replace(a,b))
            try: verify_release(d,False)
            except RuntimeError: print(f'PASS negative {rp}');continue
            raise RuntimeError(f'negative fixture passed {rp}')
