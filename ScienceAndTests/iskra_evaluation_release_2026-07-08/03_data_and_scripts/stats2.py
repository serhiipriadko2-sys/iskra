import pandas as pd, numpy as np
from scipy import stats
np.random.seed(42)
df = pd.read_csv("zip/iskra_adjudication_disagreement_analysis(2).csv")
comp = df[df['source_pair_status']=='comparable_auto_rescore'].copy()  # 635 valid paired rows

def rrb_fn(d):
    d=np.asarray(d,float); nz=d[d!=0]
    if len(nz)==0: return 0.0
    r=stats.rankdata(np.abs(nz)); pos=np.sum(r[nz>0]); neg=np.sum(r[nz<0]); T=pos+neg
    return (pos-neg)/T
def boot_ci(x, fn, B=10000):
    x=np.asarray(x,float); n=len(x)
    if n<3: return (np.nan,np.nan)
    idx=np.random.randint(0,n,(B,n)); out=np.array([fn(x[idx[i]]) for i in range(B)])
    return np.percentile(out,[2.5,97.5])

# ===== CLEAN whole-corpus estimate: comparable-only, both raters =====
print("="*70)
print("CLEAN ESTIMATE (comparable-only, missing-side artifacts removed)")
print("="*70)
for ver,ic,dc in [("v1",'blind_score_iskra_v1','blind_score_default_v1'),
                  ("v2 strict",'blind_score_iskra_v2','blind_score_default_v2')]:
    i=pd.to_numeric(comp[ic],errors='coerce'); d=pd.to_numeric(comp[dc],errors='coerce')
    m=~(i.isna()|d.isna()); diff=(i[m]-d[m]).values
    w,p=stats.wilcoxon(diff,alternative='two-sided')
    rrb=rrb_fn(diff); ci=boot_ci(diff,rrb_fn); cim=boot_ci(diff,np.mean)
    print(f"\n{ver} (n={len(diff)}): mean Δ={diff.mean():+.3f} (95%CI {cim[0]:+.3f}..{cim[1]:+.3f})")
    print(f"   Wilcoxon p={p:.2e} | rank-biserial r={rrb:+.3f} (95%CI {ci[0]:+.3f}..{ci[1]:+.3f})")
    print(f"   wins ISKRA={int((diff>0).sum())} Default={int((diff<0).sum())} ties={int((diff==0).sum())}")

# ===== PER-DOMAIN (v2 strict, comparable-only) with Benjamini-Hochberg =====
print("\n"+"="*70)
print("PER-DOMAIN v2 STRICT (comparable-only) + Benjamini-Hochberg FDR")
print("="*70)
rows=[]
for dom,g in comp.groupby('domain'):
    i=pd.to_numeric(g['blind_score_iskra_v2'],errors='coerce'); d=pd.to_numeric(g['blind_score_default_v2'],errors='coerce')
    m=~(i.isna()|d.isna()); diff=(i[m]-d[m]).values
    if len(diff)<5: continue
    nz=diff[diff!=0]
    if len(nz)==0:
        p=1.0; w=np.nan
    else:
        try: w,p=stats.wilcoxon(diff,alternative='two-sided')
        except: p=1.0;w=np.nan
    rrb=rrb_fn(diff)
    rows.append(dict(domain=dom[:40],n=len(diff),meanΔ=diff.mean(),rrb=rrb,p=p,
                     wins_i=int((diff>0).sum()),wins_d=int((diff<0).sum()),ties=int((diff==0).sum())))
rd=pd.DataFrame(rows).sort_values('rrb',ascending=False)
# BH
from scipy.stats import false_discovery_control
rd['p_bh']=false_discovery_control(rd['p'].values, method='bh')
rd['sig_bh']=rd['p_bh']<0.05
pd.set_option('display.width',200,'display.max_columns',20)
print(rd.to_string(index=False,float_format=lambda x:f"{x:+.3f}" if abs(x)<10 else f"{x:.2f}"))
rd.to_csv("per_domain_v2_clean.csv",index=False)

# ===== INTER-RATER RELIABILITY v1 vs v2 (Krippendorff ordinal + Cohen kappa on verdict) =====
print("\n"+"="*70)
print("INTER-RATER RELIABILITY (v1 vs v2 blind raters)")
print("="*70)
# categorical verdict agreement
def verdict(delta):
    return np.where(delta>0.25,'ISKRA',np.where(delta<-0.25,'Default','Tie'))
v1v=verdict(pd.to_numeric(comp['blind_delta_iskra_minus_default_v1'],errors='coerce').values)
v2v=verdict(pd.to_numeric(comp['blind_delta_iskra_minus_default_v2'],errors='coerce').values)
from sklearn.metrics import cohen_kappa_score
try:
    ck=cohen_kappa_score(v1v,v2v); print(f"Cohen kappa (3-way verdict, comparable): {ck:.3f}")
except Exception as e:
    # manual
    print("sklearn missing, manual kappa")
po=np.mean(v1v==v2v)
cats=['ISKRA','Default','Tie']; pe=sum((np.mean(v1v==c)*np.mean(v2v==c)) for c in cats)
print(f"  observed agreement={po:.3f} expected={pe:.3f} kappa={(po-pe)/(1-pe):.3f}")
# PABAK
print(f"  PABAK={2*po-1:.3f}")

# Krippendorff ordinal alpha on the raw 0-5 scores (two raters = v1_final, v2_final per answer)
# Use iskra & default scores stacked as units rated by v1 and v2
def kripp_ordinal(m):
    # m: n_units x 2 raters (ordinal). Simple implementation.
    m=np.asarray(m,float); vals=np.unique(m[~np.isnan(m)])
    # Do-Dw via variance-based ordinal metric
    from itertools import combinations
    units=[row[~np.isnan(row)] for row in m]; units=[u for u in units if len(u)>=2]
    # observed disagreement
    def d2(a,b): return (a-b)**2
    Do_num=0; Do_den=0
    for u in units:
        n=len(u)
        for a,b in combinations(u,2):
            Do_num+=d2(a,b); Do_den+=1
    Do=Do_num/Do_den
    allv=np.concatenate(units)
    De_num=0;De_den=0
    for a in allv:
        for b in allv:
            De_num+=d2(a,b); De_den+=1
    De=De_num/De_den
    return 1-Do/De
# stack: each answer (iskra, default) is a unit rated by v1 and v2
iskra_units=np.column_stack([pd.to_numeric(comp['blind_score_iskra_v1'],errors='coerce'),
                             pd.to_numeric(comp['blind_score_iskra_v2'],errors='coerce')])
def_units=np.column_stack([pd.to_numeric(comp['blind_score_default_v1'],errors='coerce'),
                           pd.to_numeric(comp['blind_score_default_v2'],errors='coerce')])
allu=np.vstack([iskra_units,def_units])
ka=kripp_ordinal(allu)
print(f"Krippendorff ordinal alpha (v1 vs v2 on 0-5 scores, all answers): {ka:.3f}")
print(f"  Pearson v1-v2 (iskra scores): {np.corrcoef(iskra_units[~np.isnan(iskra_units).any(1)].T)[0,1]:.3f}")
