#!/usr/bin/env python3
from pathlib import Path
import importlib.util,json,sys
sys.dont_write_bytecode=True
ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('router',ROOT/'MYTHIC_ROUTER_REFERENCE.py')
mod=importlib.util.module_from_spec(spec); spec.loader.exec_module(mod)
r=mod.MythicRouter(ROOT/'MYTHIC_FRAGMENTS_v0_1_1.jsonl')
cases=[
 {'name':'ISKRIV equal-score','myth_preference':'MYTHIC','consent_depth':'STANDARD','playbook':'SIFT','selected_voice':'ISKRIV','supporting_voices':[],'motifs':[],'functions':[],'safety_state':'normal','technical_nature_question':False},
 {'name':'HUYNDUN balanced','myth_preference':'BALANCED','consent_depth':'STANDARD','playbook':'BUILD','selected_voice':'HUYNDUN','supporting_voices':[],'motifs':['CRACK'],'functions':['SHATTER'],'safety_state':'normal','technical_nature_question':False},
 {'name':'ANHANTRA provenance','myth_preference':'MYTHIC','consent_depth':'DEEP','playbook':'SHADOW','selected_voice':'ANHANTRA','supporting_voices':[],'motifs':['SILENCE','THRESHOLD'],'functions':['CONTAIN'],'safety_state':'normal','technical_nature_question':False},
]
rows=[]
for c in cases:
    route=r.route(c); ids=[x['fragment_id'] for x in route['fragments']]
    rows.append({'case':c['name'],'request':c,'route':route,'provenance':r.finalize_provenance(route,ids,[])})
(ROOT/'support'/'DEMO_ROUTES.jsonl').write_text('\n'.join(json.dumps(x,ensure_ascii=False) for x in rows)+'\n',encoding='utf-8')
print(json.dumps({'cases':len(rows),'status':'PASS'},ensure_ascii=False))
