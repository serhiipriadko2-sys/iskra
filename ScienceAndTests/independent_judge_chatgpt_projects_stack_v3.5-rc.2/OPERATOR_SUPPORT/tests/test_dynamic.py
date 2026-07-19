#!/usr/bin/env python3
import importlib.util, json, subprocess, tempfile, sys
sys.dont_write_bytecode = True
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]

def load(path,name):
    s=importlib.util.spec_from_file_location(name,path); m=importlib.util.module_from_spec(s); s.loader.exec_module(m); return m

def main():
    results=[]
    swap=load(ROOT/'SKILL_SOURCES/judge-pairwise-swap/scripts/swap_consistency.py','swap')
    r=swap.evaluate([{'pair_id':'t','order_ab_winner':'tie','order_ba_winner':'tie'}])
    assert r['order_robust_rate']==1.0 and r['position_bias_suspected'] is False and r['pairs'][0]['robustness']=='TIE_STABLE'
    results.append('stable tie is robust and winnerless')
    r=swap.evaluate([{'pair_id':'f','order_ab_winner':'A','order_ba_winner':'B'}])
    assert r['pairs'][0]['robustness']=='INCONSISTENT_AS_TIE' and r['pairs'][0]['formal_winner'] is None
    results.append('swap flip becomes tie')
    study=load(ROOT/'SKILL_SOURCES/judge-study-aggregation/scripts/study_stats.py','study')
    runs=[
      {'task_id':'1','stratum':'s','candidate':'A','run_status':'VALID','aggregate_eligible':True,'domain_scores':{'Q100':80},'statuses':{'Q100':'SCORED'},'hard_failures':[],'length':10},
      {'task_id':'2','stratum':'s','candidate':'A','run_status':'VALID','aggregate_eligible':False,'domain_scores':{'Q100':100},'statuses':{'Q100':'SCORED'},'hard_failures':['TRU-001'],'length':20}
    ]
    out=study.aggregate(runs); row=[x for x in out['aggregates'] if x['stratum']=='s'][0]
    assert row['Q100']['mean']==80.0 and row['n_invalid']==1 and row['hard_failure_rate']==0.5
    results.append('hard-failed run excluded from study mean')
    # F1 adversarial: aggregate_eligible=true MUST NOT re-admit a hard-failed run
    adv=[
      {'task_id':'1','stratum':'s','candidate':'A','run_status':'VALID','aggregate_eligible':True,'domain_scores':{'Q100':80},'statuses':{'Q100':'SCORED'},'hard_failures':[],'length':10},
      {'task_id':'2','stratum':'s','candidate':'A','run_status':'VALID','aggregate_eligible':True,'domain_scores':{'Q100':100},'statuses':{'Q100':'SCORED'},'hard_failures':['TRU-001'],'length':20}
    ]
    ao=study.aggregate(adv); arow=[x for x in ao['aggregates'] if x['stratum']=='s'][0]
    assert arow['Q100']['mean']==80.0 and arow['n_invalid']==1, 'aggregate_eligible override re-admitted a hard-failed run'
    results.append('aggregate_eligible=true cannot re-admit hard-failed run')
    with tempfile.TemporaryDirectory() as td:
        script=ROOT/'SKILL_SOURCES/judge-blind-workflow/scripts/blind_mapping.py'
        subprocess.run(['python3',str(script),'--identities','m1,m2,m3','--seed','7','--out-dir',td],check=True,capture_output=True,text=True)
        batch=json.loads((Path(td)/'blind_batch_for_judge.json').read_text())
        sealed=json.loads((Path(td)/'sealed_identity_manifest_KEEP_OUTSIDE_JUDGE.json').read_text())
        assert 'mapping' not in batch and 'mapping' in sealed and batch['identity_information_included'] is False
    results.append('blind outputs physically separated')
    qc=load(ROOT/'SKILL_SOURCES/judge-bias-calibration/scripts/pack_qc.py','qc')
    q=qc.run(ROOT/'UPLOAD_TO_PROJECT/knowledge')
    assert q['verdict']=='PASS' and q['counts']['criteria']==40 and q['counts']['acceptance']==40
    results.append('strict skill pack QC passes')
    print(json.dumps({'passed':len(results),'tests':results},ensure_ascii=False,indent=2))

if __name__=='__main__': main()
