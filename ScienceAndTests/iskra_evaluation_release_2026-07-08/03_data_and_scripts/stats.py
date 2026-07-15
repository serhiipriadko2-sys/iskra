import pandas as pd, numpy as np
from scipy import stats
np.random.seed(42)
df = pd.read_csv("zip/iskra_adjudication_disagreement_analysis(2).csv")

def cliffs_delta(a, b):
    a=np.asarray(a,float); b=np.asarray(b,float)
    n=len(a); gt=0; lt=0
    # efficient via sorting
    for x in a:
        gt += np.sum(x> b); lt += np.sum(x< b)
    return (gt-lt)/(n*len(b))

def paired_rank_biserial(diff):
    diff=np.asarray(diff,float); nz=diff[diff!=0]
    if len(nz)==0: return 0.0, 0
    r=stats.rankdata(np.abs(nz)); pos=np.sum(r[nz>0]); neg=np.sum(r[nz<0]); T=pos+neg
    return (pos-neg)/T, len(nz)

def boot_ci(x, fn, B=10000):
    x=np.asarray(x,float); n=len(x); out=np.empty(B)
    idx=np.random.randint(0,n,(B,n))
    for i in range(B): out[i]=fn(x[idx[i]])
    return np.percentile(out,[2.5,97.5])

def wilcoxon_es(iskra, default, label):
    iskra=pd.to_numeric(iskra,errors='coerce').values
    default=pd.to_numeric(default,errors='coerce').values
    m=~(np.isnan(iskra)|np.isnan(default)); iskra=iskra[m]; default=default[m]
    diff=iskra-default
    mean_d=diff.mean(); md=np.median(diff)
    nz=diff[diff!=0]
    try:
        w,p=stats.wilcoxon(iskra,default,zero_method='wilcox',alternative='two-sided')
    except Exception as e:
        w,p=np.nan,np.nan
    rrb,neff=paired_rank_biserial(diff)
    # bootstrap CI on mean diff and on rank-biserial
    ci_mean=boot_ci(diff, np.mean)
    def rrb_fn(d):
        nz=d[d!=0]
        if len(nz)==0: return 0.0
        r=stats.rankdata(np.abs(nz)); pos=np.sum(r[nz>0]); neg=np.sum(r[nz<0]); T=pos+neg
        return (pos-neg)/T
    ci_rrb=boot_ci(diff, rrb_fn)
    # ties/wins
    wins_i=int(np.sum(diff>0)); wins_d=int(np.sum(diff<0)); ties=int(np.sum(diff==0))
    print(f"\n=== {label} (n={len(diff)}) ===")
    print(f"  mean ISKRA={iskra.mean():.3f}  mean Default={default.mean():.3f}")
    print(f"  mean paired delta={mean_d:.4f}  (95% CI {ci_mean[0]:.4f}..{ci_mean[1]:.4f})")
    print(f"  median delta={md:.3f}")
    print(f"  Wilcoxon W={w:.1f}  p={p:.3e}  (n_nonzero={len(nz)})")
    print(f"  rank-biserial r={rrb:.4f}  (95% CI {ci_rrb[0]:.4f}..{ci_rrb[1]:.4f})")
    print(f"  Cohen d_z={mean_d/diff.std(ddof=1):.4f}")
    print(f"  wins ISKRA={wins_i}  wins Default={wins_d}  ties={ties}")
    return dict(label=label,n=len(diff),mean_delta=mean_d,ci_mean=ci_mean,median=md,W=w,p=p,
                rrb=rrb,ci_rrb=ci_rrb,dz=mean_d/diff.std(ddof=1),wins_i=wins_i,wins_d=wins_d,ties=ties)

r_v1=wilcoxon_es(df['blind_score_iskra_v1'],df['blind_score_default_v1'],"V1 blind rater (all 793)")
r_v2=wilcoxon_es(df['blind_score_iskra_v2'],df['blind_score_default_v2'],"V2 STRICT blind rater (all 793)")

# comparable-only subset (exclude 158 not_comparable)
comp=df[df['source_pair_status']=='comparable_auto_rescore']
r_v2c=wilcoxon_es(comp['blind_score_iskra_v2'],comp['blind_score_default_v2'],"V2 STRICT, comparable-only (n=635)")

# stable tier only
stab=df[df['review_tier']=='TIER_3_STABLE']
r_v2s=wilcoxon_es(stab['blind_score_iskra_v2'],stab['blind_score_default_v2'],"V2 STRICT, TIER_3_STABLE only")

import json
res={'v1':r_v1,'v2':r_v2,'v2_comparable':r_v2c,'v2_stable':r_v2s}
def clean(d): return {k:(v.tolist() if isinstance(v,np.ndarray) else v) for k,v in d.items()}
json.dump({k:clean(v) for k,v in res.items()}, open("stats_main.json","w"), indent=2, default=str)
print("\n[saved stats_main.json]")
