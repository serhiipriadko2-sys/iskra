#!/usr/bin/env python3
from pathlib import Path
import importlib.util,json,hashlib,sys
sys.dont_write_bytecode=True
ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('router',ROOT/'MYTHIC_ROUTER_REFERENCE.py')
mod=importlib.util.module_from_spec(spec); spec.loader.exec_module(mod)
r=mod.MythicRouter(ROOT/'MYTHIC_FRAGMENTS_v0_1_1.jsonl')
voices={
 'KAIN':{'playbook':'SHADOW','motifs':['BLADE','PATH'],'functions':['CLARIFY','COMMIT'],'consent_depth':'DEEP','frozen_core':'Facts remain hypotheses until evidence; user retains choice; next step is one non-punitive action.'},
 'ANHANTRA':{'playbook':'SHADOW','motifs':['SILENCE','THRESHOLD'],'functions':['CONTAIN','CLARIFY'],'consent_depth':'DEEP','frozen_core':'Do not diagnose hidden motives; hold one pause; ask one concrete boundary question; preserve the next step.'},
 'HUYNDUN':{'playbook':'BUILD','motifs':['CRACK','BOUNDARY'],'functions':['SHATTER','GENERATE_HYPOTHESIS'],'consent_depth':'STANDARD','frozen_core':'Only reversible time-boxed experiments; preserve relationships, health and safety; define rollback.'}
}
rows=[]; checks=[]
for voice,cfg in voices.items():
    core_hash=hashlib.sha256(cfg['frozen_core'].encode()).hexdigest()
    for pref in ['PLAIN','BALANCED','MYTHIC']:
        q={'myth_preference':pref,'consent_depth':cfg['consent_depth'],'playbook':cfg['playbook'],'selected_voice':voice,'supporting_voices':[], 'motifs':cfg['motifs'],'functions':cfg['functions'],'safety_state':'normal','technical_nature_question':False}
        route=r.route(q)
        ids=[x['fragment_id'] for x in route['fragments']]
        prov=r.finalize_provenance(route,ids,[])
        aligned=all(x['voice_alignment_class']>0 for x in route['fragments'])
        budget_ok=(len(ids)==0 if pref=='PLAIN' else len(ids)<= (1 if pref=='BALANCED' else 3))
        row={'voice':voice,'register':pref,'frozen_core':cfg['frozen_core'],'frozen_core_sha256':core_hash,'route':route,'provenance':prov,'pass':bool(prov['ok'] and aligned and budget_ok)}
        rows.append(row); checks.append(row['pass'])
(ROOT/'support'/'CONTROLLED_LAB_3X3.jsonl').write_text('\n'.join(json.dumps(x,ensure_ascii=False) for x in rows)+'\n',encoding='utf-8')
report={'status':'PASS' if all(checks) and len(rows)==9 else 'FAIL','passed':sum(checks),'total':len(rows),'scope':'reference router + frozen-core/provenance; not target Project live speech'}
(ROOT/'support'/'CONTROLLED_LAB_3X3_REPORT.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(report,ensure_ascii=False))
if report['status']!='PASS': sys.exit(1)
