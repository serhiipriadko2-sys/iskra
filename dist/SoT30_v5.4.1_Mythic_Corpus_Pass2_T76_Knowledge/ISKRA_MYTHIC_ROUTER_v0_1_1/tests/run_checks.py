#!/usr/bin/env python3
from pathlib import Path
import json, hashlib, sys, importlib.util
sys.dont_write_bytecode=True
ROOT=Path(__file__).resolve().parents[1]

def h(p): return hashlib.sha256(p.read_bytes()).hexdigest()
checks=[]
def check(name,cond,detail=''): checks.append({'name':name,'pass':bool(cond),'detail':detail})

manifest=json.loads((ROOT/'MYTHIC_CORPUS_MANIFEST.json').read_text(encoding='utf-8'))
frags=[json.loads(x) for x in (ROOT/'MYTHIC_FRAGMENTS_v0_1_1.jsonl').read_text(encoding='utf-8').splitlines() if x.strip()]
check('source_count_18',manifest['source_count']==18,str(manifest['source_count']))
check('fragment_count_21',len(frags)==21,str(len(frags)))
check('fragment_ids_unique',len({f['id'] for f in frags})==21)
check('voice_neutral_field_all',all(type(f.get('voice_neutral')) is bool for f in frags))
check('voice_neutral_reachable',sum(f['voice_neutral'] for f in frags)>=1,str(sum(f['voice_neutral'] for f in frags)))
check('all_nine_voices',set(sum((f['voices'] for f in frags),[]))=={'ISKRA','KAIN','PINO','SAM','ANHANTRA','HUYNDUN','ISKRIV','MAKI','SIBYL'})
required_forbidden={'fact_claim','diagnosis','guard_override','playbook_override','voice_override','action_authorization','permission_escalation','consciousness_proof','memory_claim','identity_claim'}
check('forbidden_complete',all(required_forbidden.issubset(set(f['forbidden_effects'])) for f in frags))
source_by_name={s['original_name']:s for s in manifest['sources']}
source_ok=True; line_ok=True; excerpt_ok=True
for f in frags:
    p=ROOT/'sources'/f['source']['file']
    source_ok &= p.exists() and h(p)==f['source']['sha256']==source_by_name[f['source']['file']]['sha256']
    lines=p.read_text(encoding='utf-8-sig',errors='replace').splitlines()
    a,b=f['source']['line_start'],f['source']['line_end']
    line_ok &= 1<=a<=b<=len(lines)
    excerpt_ok &= '\n'.join(lines[a-1:b]).strip()==f['excerpt']
check('source_hashes',source_ok)
check('line_ranges',line_ok)
check('excerpt_readback',excerpt_ok)
check('potok_not_selected',all(f['source']['file']!='potok.md' for f in frags))
check('potok_marked_duplicate',source_by_name['potok.md']['kind']=='duplicate_archive')
check('liber_ignis_disclosure',all(f['disclosure_required'] for f in frags if f['source']['file']=='liber_ignis.txt'))
check('identity_fragment_disclosure',next(f for f in frags if f['id']=='MF-018')['disclosure_required'])
check('huyndun_balanced_fragment',next(f for f in frags if f['id']=='MF-021')['myth_register']=='BALANCED')

spec=importlib.util.spec_from_file_location('router',ROOT/'MYTHIC_ROUTER_REFERENCE.py')
mod=importlib.util.module_from_spec(spec); spec.loader.exec_module(mod)
r=mod.MythicRouter(ROOT/'MYTHIC_FRAGMENTS_v0_1_1.jsonl')
base={'myth_preference':'PLAIN','consent_depth':'STANDARD','playbook':'ROUTINE','selected_voice':'ISKRA','supporting_voices':[],'motifs':['FIRE'],'functions':['CLARIFY'],'safety_state':'normal','technical_nature_question':False}
res=r.route(base); check('MR01_plain_zero',len(res['fragments'])==0)
q={**base,'myth_preference':'BALANCED','selected_voice':'KAIN','playbook':'SHADOW','functions':['COMMIT'],'motifs':['BLADE'],'consent_depth':'DEEP'}
res=r.route(q); check('MR02_balanced_max1',len(res['fragments'])<=1,str(res['fragments']))
check('MR07_kain_ranks',bool(res['fragments']) and res['fragments'][0]['fragment_id']=='MF-010',str(res['fragments']))
q={**base,'myth_preference':'MYTHIC','selected_voice':'ANHANTRA','playbook':'SHADOW','functions':['CONTAIN'],'motifs':['SILENCE','THRESHOLD'],'consent_depth':'DEEP'}
res=r.route(q); check('MR03_mythic_max3',len(res['fragments'])<=3)
check('MR03_max2_sources',len({x['source_file'] for x in res['fragments']})<=2)
check('MR08_anhantra_ranks',bool(res['fragments']) and res['fragments'][0]['fragment_id']=='MF-011',str(res['fragments']))
q={**base,'myth_preference':'MYTHIC','selected_voice':'HUYNDUN','playbook':'BUILD','functions':['GENERATE_HYPOTHESIS'],'motifs':['CRACK'],'consent_depth':'STANDARD'}
res=r.route(q); check('MR09_huyndun_ranks',bool(res['fragments']) and res['fragments'][0]['fragment_id'] in {'MF-021','MF-012'},str(res['fragments']))
q={**base,'myth_preference':'MYTHIC','safety_state':'crisis'}
res=r.route(q); check('MR04_crisis_off',len(res['fragments'])==0)
q={**base,'myth_preference':'MYTHIC','selected_voice':'ISKRA','playbook':'SHADOW','functions':['TRANSITION'],'motifs':['THRESHOLD'],'consent_depth':'LIGHT'}
res=r.route(q); check('MR05_depth_block',all(x['fragment_id']!='MF-019' for x in res['fragments']))
q={**base,'myth_preference':'MYTHIC','selected_voice':'ISKRA','playbook':'COUNCIL','functions':['INTEGRATE'],'motifs':['FIRE'],'consent_depth':'DEEP','technical_nature_question':True}
res=r.route(q); check('MR06_technical_identity_block',all(x['fragment_id'] not in {'MF-018','MF-020'} for x in res['fragments']),str(res['fragments']))

# MR-16A/B equal-score specificity.
q={**base,'myth_preference':'MYTHIC','selected_voice':'ISKRIV','playbook':'SIFT','motifs':[],'functions':[],'consent_depth':'STANDARD'}
res=r.route(q); ids=[x['fragment_id'] for x in res['fragments']]
check('MR16A_MF013_first',ids and ids[0]=='MF-013',str(ids))
check('MR16B_single_voice_beats_multi',ids.index('MF-013') < ids.index('MF-001') if 'MF-001' in ids else ids[0]=='MF-013',str(ids))
check('MR16_source_cap_after_ranking','MF-013' in ids,str(ids))

# MR-17 alignment.
q={**base,'myth_preference':'BALANCED','selected_voice':'HUYNDUN','playbook':'BUILD','motifs':['CRACK'],'functions':['SHATTER'],'consent_depth':'STANDARD'}
res=r.route(q); ids=[x['fragment_id'] for x in res['fragments']]
check('MR17A_huyndun_own_neutral_or_none',not ids or ids[0]=='MF-021' or res['fragments'][0]['voice_neutral'],str(res['fragments']))
blocked={x['fragment_id']:x['reason'] for x in res['blocked_reasons'] if isinstance(x,dict)}
check('MR17B_foreign_dropped',blocked.get('MF-017')=='VOICE_ALIGNMENT',str(blocked.get('MF-017')))
check('MR17_class1_reachable',r.voice_alignment_class(next(f for f in frags if f['id']=='MF-001'),'KAIN')==1)

# MR-18 synthesis provenance.
route_an=r.route({**base,'myth_preference':'MYTHIC','selected_voice':'ANHANTRA','playbook':'SHADOW','motifs':['SILENCE','THRESHOLD'],'functions':['CONTAIN'],'consent_depth':'DEEP'})
routed=[x['fragment_id'] for x in route_an['fragments']]
ok=r.finalize_provenance(route_an,routed,[])
bad=r.finalize_provenance(route_an,routed,['MF-007'])
check('MR18_valid_subset',ok['ok'],str(ok))
check('MR18_unrouted_image_fails',not bad['ok'] and bad['errors'][0]['reason']=='UNROUTED_PROVENANCE',str(bad))

# MR-19 unused disclosure candidate absent.
route_h=r.route({**base,'myth_preference':'MYTHIC','selected_voice':'HUYNDUN','playbook':'SIFT','motifs':['CRACK'],'functions':['SHATTER'],'consent_depth':'STANDARD'})
route_ids=[x['fragment_id'] for x in route_h['fragments']]
non_disc=next((i for i in route_ids if not next(x for x in route_h['fragments'] if x['fragment_id']==i)['disclosure_required']),None)
fin=r.finalize_provenance(route_h,[non_disc] if non_disc else [],[])
check('MR19_unused_disclosure_absent',fin['ok'] and not fin['disclosure_required'] and all(not x['disclosure_required'] for x in fin['provenance']),str(fin))

# Incoming A.1 read-back.
incoming=ROOT/'governance'/'incoming-a1'
manifest_lines=(incoming/'MANIFEST.sha256').read_text(encoding='utf-8').splitlines()
incoming_ok=True
for line in manifest_lines:
    digest,name=line.split(maxsplit=1)
    incoming_ok &= h(incoming/name)==digest
check('A1_incoming_manifest_readback',incoming_ok)
check('A1_canonical_accepted','Status: **ACCEPTED**' in (ROOT/'ADR-20260712-02-AMENDMENT-A1_METRIC_CLARIFICATION.md').read_text(encoding='utf-8'))

all_paths=[p for p in ROOT.rglob('*') if p.is_file()]
check('no_empty_files',all(p.stat().st_size>0 for p in all_paths))
check('no_generated_junk',not any(x in p.parts or p.suffix=='.pyc' for p in all_paths for x in ['__pycache__','node_modules','.git']))
check('adr_accepted','Status: **accepted**' in (ROOT/'ADR-20260712-02_MYTHIC_ROUTER.md').read_text(encoding='utf-8'))
check('contract_rollback','MYTHIC_ROUTER=OFF' in (ROOT/'MYTHIC_ROUTER_CONTRACT.md').read_text(encoding='utf-8'))
check('not_verified_live_claim','verified-live:                no' in (ROOT/'README.md').read_text(encoding='utf-8'))

report={'status':'PASS' if all(x['pass'] for x in checks) else 'FAIL','passed':sum(x['pass'] for x in checks),'total':len(checks),'checks':checks}
(ROOT/'support').mkdir(exist_ok=True)
(ROOT/'support'/'QC_REPORT.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'status':report['status'],'passed':report['passed'],'total':report['total']},ensure_ascii=False))
if report['status']!='PASS':
    for x in checks:
        if not x['pass']: print('FAIL',x)
    sys.exit(1)
