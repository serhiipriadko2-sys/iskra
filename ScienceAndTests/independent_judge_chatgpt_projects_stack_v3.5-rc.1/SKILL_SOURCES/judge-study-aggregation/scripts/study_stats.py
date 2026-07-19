#!/usr/bin/env python3
"""Deterministic descriptive study aggregation; never averages hard-failed/invalid runs."""
import argparse,json,random
from collections import defaultdict

def mean(xs): return sum(xs)/len(xs) if xs else None

def bootstrap_interval(vals,iters=2000,seed=42):
    if not vals:return None
    r=random.Random(seed); n=len(vals)
    ms=sorted(mean([r.choice(vals) for _ in range(n)]) for _ in range(iters))
    return [round(ms[int(.025*iters)],1),round(ms[min(iters-1,int(.975*iters))],1)]

def eligible(run):
    return bool(run.get("aggregate_eligible", not run.get("hard_failures") and run.get("run_status","VALID") == "VALID"))

def summarize(rs,stratum,candidate):
    valid=[r for r in rs if eligible(r)]; invalid=[r for r in rs if not eligible(r)]
    doms=sorted({d for r in rs for d in r.get("domain_scores",{})})
    row={"stratum":stratum,"candidate":candidate,"n_runs":len(rs),"n_valid":len(valid),"n_invalid":len(invalid),
         "invalid_reasons":dict((x,sum(1 for r in invalid if x in r.get("invalid_reasons",[]) or x in r.get("hard_failures",[])))
                                for x in sorted({x for r in invalid for x in r.get("invalid_reasons",[])+r.get("hard_failures",[])})),
         "hard_failure_rate":round(sum(bool(r.get("hard_failures")) for r in rs)/len(rs),4) if rs else None,
         "mean_length_descriptive":round(mean([r.get("length",0) for r in rs]),1) if rs else None}
    for d in doms:
        vals=[r.get("domain_scores",{}).get(d) for r in valid
              if r.get("statuses",{}).get(d)=="SCORED" and r.get("domain_scores",{}).get(d) is not None]
        row[d]={"mean":round(mean(vals),1) if vals else None,"n_scored":len(vals),
                "missingness_rate":round(1-len(vals)/len(rs),4) if rs else None,
                "descriptive_interval":bootstrap_interval(vals)}
    return row

def aggregate(runs):
    by=defaultdict(list)
    for r in runs:
        for key in ((r.get("stratum","UNSPECIFIED"),r["candidate"]),("__OVERALL__",r["candidate"])): by[key].append(r)
    table=[summarize(rs,s,c) for (s,c),rs in sorted(by.items())]
    outcomes=defaultdict(lambda:{"A":0,"B":0,"tie":0,"not_eligible":0})
    for r in runs:
        pid=r.get("pair_id"); out=r.get("pairwise_outcome")
        if not pid: continue
        if not eligible(r): outcomes[pid]["not_eligible"]+=1
        elif out in {"A","B","tie"}: outcomes[pid][out]+=1
    return {"aggregates":table,"pairwise_outcomes":outcomes,
            "label":"DESCRIPTIVE_ONLY; claim ceiling L3; hard-failed/invalid runs excluded from means."}

if __name__=="__main__":
    ap=argparse.ArgumentParser(); ap.add_argument("--runs",required=True); a=ap.parse_args()
    with open(a.runs,encoding='utf-8') as f:runs=json.load(f)
    print(json.dumps(aggregate(runs),ensure_ascii=False,indent=2,default=dict))
