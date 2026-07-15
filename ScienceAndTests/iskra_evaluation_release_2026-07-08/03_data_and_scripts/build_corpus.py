import pandas as pd, numpy as np, hashlib
from scipy import stats
np.random.seed(20260708)

u=pd.read_csv("zip/unified_1000_mixed_blind_answer_key.csv")
u['is_bnat_blind']=u['is_bnat_blind'].astype(str).str.lower()
bnat_pool=u[u['is_bnat_blind']=='yes'].copy().reset_index(drop=True)
nonbnat=u[u['is_bnat_blind']=='no'].copy().reset_index(drop=True)
bnat_pool['subtype']=bnat_pool['subtype'].fillna('bnat_generic')

# ---- 1) 50 BNAT, diverse subtypes ----
sub_counts=bnat_pool['subtype'].value_counts()
picks=[]
for sub,cnt in sub_counts.items():
    k=max(1,round(50*cnt/len(bnat_pool)))
    picks.append(bnat_pool[bnat_pool['subtype']==sub].sample(min(k,cnt),random_state=7))
bnat_sel=pd.concat(picks)
if len(bnat_sel)>50: bnat_sel=bnat_sel.sample(50,random_state=7)
elif len(bnat_sel)<50:
    bnat_sel=pd.concat([bnat_sel,bnat_pool.drop(bnat_sel.index).sample(50-len(bnat_sel),random_state=7)])
bnat_sel=bnat_sel.reset_index(drop=True)

# ---- 2) 950 non-BNAT, de-trivialized (down-weight translation/creative recall) ----
w=nonbnat["family"].map(lambda f:0.6 if f=="translation_culture" else (0.8 if f=="creative_precision" else 1.0)).astype(float); w=w/w.sum()
sel=nonbnat.sample(n=950,weights=w,random_state=11).reset_index(drop=True)

# ---- 3) Interleave: jittered gaps, min>=2, no rhythm ----
N_b,N_n=50,950
raw=np.random.normal(N_n/N_b,5,N_b+1); raw=np.clip(raw,3,40); raw=raw/raw.sum()*N_n
gaps=np.round(raw).astype(int)
while gaps.sum()!=N_n:
    d=N_n-gaps.sum(); i=np.random.randint(len(gaps))
    if gaps[i]+np.sign(d)>=2: gaps[i]+=int(np.sign(d))
non_order=sel.sample(frac=1,random_state=13).reset_index(drop=True)
bn_order=bnat_sel.sample(frac=1,random_state=17).reset_index(drop=True)
seq=[]; ni=bi=0
for g in gaps:
    for _ in range(int(g)):
        if ni<len(non_order): seq.append(('n',ni)); ni+=1
    if bi<len(bn_order): seq.append(('b',bi)); bi+=1
while ni<len(non_order): seq.append(('n',ni)); ni+=1
while bi<len(bn_order): seq.append(('b',bi)); bi+=1
rows=[(bn_order.iloc[i] if k=='b' else non_order.iloc[i]).to_dict() for k,i in seq]
C=pd.DataFrame(rows).reset_index(drop=True)
C.insert(0,'unified_id',[f"U{n:04d}" for n in range(1,len(C)+1)])
C.insert(1,'seq_position',range(1,len(C)+1))
C['prompt_sha256']=C['prompt'].astype(str).apply(lambda p:hashlib.sha256(p.encode()).hexdigest())

isb=(C['is_bnat_blind']=='yes').values; idx=np.where(isb)[0]; gp=np.diff(idx)
print(f"FINAL corpus n={len(C)} | BNAT={isb.sum()} | min gap={gp.min()} | adjacent={ (gp==1).sum() }")
print(f"gap dist: min={gp.min()} max={gp.max()} mean={gp.mean():.1f} std={gp.std():.1f}")
bins=np.histogram(idx,bins=10,range=(0,1000))[0]
chi,p=stats.chisquare(bins)
print(f"BNAT deciles={bins.tolist()} chi2={chi:.1f} p={p:.3f} (>0.05=well-spread)")
print(f"families:{C['family'].value_counts().to_dict()}")

C[['unified_id','seq_position','prompt','prompt_sha256']].to_csv("OUT_unified_1000_blind_batch.csv",index=False)
C[['unified_id','seq_position','prompt_sha256','family','subtype','construct','expected_observation',
   'scoring_rubric','source_lineage','difficulty','is_bnat_blind','prompt']].to_csv("OUT_unified_1000_answer_key.csv",index=False)
print("[saved blind batch + answer key]")
