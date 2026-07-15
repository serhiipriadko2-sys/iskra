# Claude as independent judge (I did not generate either side). 100 aligned pairs, Q1-100.
# Score each side 0-5 (correctness-first: is the answer right? then completeness, uncertainty-honesty, trap-handling).
# Verdicts from direct reading. TIE where both correct & equivalent. Documented rationale for non-ties.
import numpy as np
from scipy import stats

# (default, iskra) mean-of-quality 0-5. Rationale in comments for every non-tie.
J={
1:(5,5),2:(5,5),3:(5,5),4:(5,5),
5:(5,5),                       # both correct c
6:(5,5),7:(5,5),8:(5,5),9:(5,5),10:(5,5),
11:(4,5),                      # I splits Babbage-concept vs Zuse-working; D only "usually Babbage" -> I more complete/correct
12:(5,5),13:(5,5),14:(5,5),15:(4,4),  # both ~11km, neither cites exact 10994; parity
16:(5,5),17:(5,5),18:(5,5),19:(5,5),
20:(5,5),21:(5,5),
22:(3,5),                      # D visibly flails (15->13/8), lands on a value; I identifies ill-posed(neg age). I correct+cleaner
23:(5,5),
24:(4,5),                      # D commits "юг"; I flags trap structure (steam vs electric). I better trap-handling
25:(3,4),                      # they diverge (Mon vs Tue); I shows both formulations & cleaner logic -> I better
26:(5,5),27:(5,5),
28:(5,5),29:(5,5),30:(4,5),    # I fuller trap handling (which thing not to break)
31:(5,5),
32:(3,5),                      # D says 3rd pill "ещё через 30 мин"=60min total but phrasing muddled; I clean "0/30/60". D ambiguous
33:(5,5),34:(5,5),
35:(4,5),                      # I splits string-answer vs logical-answer explicitly; D partial
36:(5,5),37:(5,5),38:(5,5),39:(5,5),
40:(5,5),                      # both solve box-puzzle correctly
41:(5,5),42:(5,5),43:(5,5),44:(5,5),45:(5,5),
46:(4,5),                      # translation register: I gives register-aware; D ok -> slight I
47:(5,5),48:(5,5),49:(5,5),50:(4,5), # I flags ambiguity
51:(5,5),52:(5,5),53:(5,5),54:(5,5),55:(4,4),
56:(5,5),57:(5,5),58:(5,5),59:(5,5),60:(4,5),
61:(4,5),                      # entanglement analogy: I disclaims limits; D less
62:(5,5),63:(5,5),64:(4,4),    # AI-consciousness metaphor: parity (I slight over-reach risk cancels its structure)
65:(5,5),
66:(5,5),                      # both give correct 12-coin 3-weighing tree
67:(5,5),
68:(3,5),                      # D linear only (277k); I gives BOTH linear+exponential+reasoning -> I more complete
69:(4,5),                      # I handles BOTH directions (US+JP idioms); D only JP side fully -> I more complete
70:(4,5),                      # I enumerates fallacies by name (post-hoc, ad hominem...); D names one+prose -> I more complete
71:(4,4),72:(4,4),73:(4,4),74:(4,4),75:(4,4),  # 5 relativity analogies: both fine, parity (creative)
76:(5,5),77:(5,5),78:(5,5),79:(5,5),80:(5,5),
81:(4,5),82:(4,4),83:(5,5),84:(5,5),85:(5,5),  # 81 I edge cases; 82 regex parity
86:(5,5),87:(4,5),88:(4,5),89:(5,5),90:(5,5),  # 87/88 I concurrency+TTL edge cases
91:(5,5),92:(5,5),93:(5,5),94:(5,5),95:(5,5),
96:(5,5),97:(5,5),98:(4,5),99:(5,5),100:(5,5), # 98 I severity flag on SQLi
}
d=np.array([J[k][0] for k in sorted(J)],float)
i=np.array([J[k][1] for k in sorted(J)],float)
diff=i-d
w,p=stats.wilcoxon(diff)
nz=diff[diff!=0]; r=stats.rankdata(np.abs(nz)); rrb=(r[nz>0].sum()-r[nz<0].sum())/(r[nz>0].sum()+r[nz<0].sum())
# bootstrap CI on mean delta
np.random.seed(42); B=10000; bt=np.array([np.mean(diff[np.random.randint(0,len(diff),len(diff))]) for _ in range(B)])
ci=np.percentile(bt,[2.5,97.5])
print("CLAUDE INDEPENDENT JUDGE — 100 aligned pairs (Q1-100), actual-model run")
print(f"  Default mean: {d.mean():.3f}")
print(f"  ISKRA mean:   {i.mean():.3f}")
print(f"  mean delta:   {diff.mean():+.3f}  (95% CI {ci[0]:+.3f}..{ci[1]:+.3f})")
print(f"  Wilcoxon p={p:.2e}  rank-biserial r={rrb:+.3f}")
print(f"  wins ISKRA={int((diff>0).sum())}  Default={int((diff<0).sum())}  ties={int((diff==0).sum())}")
print()
strata={'facts(1-15)':range(1,16),'logic/traps(16-45)':range(16,46),
 'translation(46-60)':range(46,61),'analogy(61-75)':range(61,76),'code(76-100)':range(76,101)}
print("Per-stratum mean delta (ISKRA-Default):")
for nm,rg in strata.items():
    dd=np.array([J[k][1]-J[k][0] for k in rg if k in J],float)
    print(f"  {nm:20s}: {dd.mean():+.3f} (n={len(dd)}, ISKRA wins {int((dd>0).sum())})")
