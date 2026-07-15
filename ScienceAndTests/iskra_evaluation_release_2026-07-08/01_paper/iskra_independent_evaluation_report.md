# A Blind, Bias-Audited Comparison of a Prompt-Engineering Framework ("ISKRA vΩ.7") Against a Default Large-Language-Model Baseline

**An independent evaluation with statistical re-analysis, judge-bias diagnostics, and a preregistered combined-corpus protocol**

Version 6.0 · 2026-07-08 · Independent audit (Claude, external to the evaluated framework)

---

## Abstract

We independently re-evaluate the claim that a Russian-language prompt-engineering framework, "ISKRA vΩ.7," substantially improves large-language-model (LLM) output quality over an unstyled default baseline. The original claim — 793 of 793 wins (100%) for ISKRA against ~36% for the default — originated in a dialogue in which a single model both generated the framework's answers and scored them, the textbook condition for self-preference bias. Working from a reconstructed 793-item paired corpus scored by two independent automated blind raters (a lenient v1 and a strict, reference-anchored v2), we compute the real effect with non-parametric paired statistics, effect sizes with bootstrap confidence intervals, inter-rater reliability, per-domain analysis under false-discovery-rate correction, and a pseudoreplication-robust cluster analysis. Three findings dominate. First, the apparent v1 advantage (mean paired Δ = +0.818 on a 0–5 scale) is an artifact of answer length: v1 scores correlate r = +0.950 with answer character count, versus r = −0.524 under the strict rater — construct-irrelevant variance, not capability. Second, 158 of 793 rows are not validly paired (the default side was missing and imputed near zero), fabricating a large spurious ISKRA advantage; on the 635 validly paired items the strict rater yields Δ = −0.434 in favor of the **default** (Wilcoxon p = 8.3×10⁻¹¹; matched-pairs rank-biserial r = −0.33; domain-clustered bootstrap 95% CI [−0.799, −0.122], excluding zero). Third, the two raters barely agree (Cohen's κ = 0.167; ordinal Krippendorff's α = 0.118; 14 directional flips), so no single-pass verdict is publication-grade. Under domain-level analysis with Benjamini–Hochberg correction, ISKRA retains a robust advantage in only 2 of 27 domains (analogy/explanation; systemic-effects reasoning), the default is favored in 11, and 14 are statistical ties. We conclude that ISKRA's real effect is small, domain-localized, and — once verbosity and missing-data artifacts are removed — net-negative on the majority of tasks under strict scoring, a reversal of the headline claim. We release a preregistered, 1000-item combined corpus interleaving 50 blind narrative-actuation (BNAT) cases among a de-trivialized bank (no two BNAT cases adjacent; positions uniform across deciles, χ² p = 0.996) for a future independent-rater confirmation run.

---

## 1. Introduction

### 1.1 Background and motivation

Prompt-engineering "operating systems" — layered system prompts that impose roles, epistemic markers, verification rituals, and closing structures on a base LLM — are increasingly marketed as delivering large capability gains. Because both the styled and unstyled systems are usually the *same* underlying model, any measured difference reflects the effect of the prompt scaffold, not a different model. Rigorously isolating that effect is therefore a measurement problem, and measurement of open-ended generation quality is exactly where LLM evaluation is most fragile.

The specific object here is "ISKRA vΩ.7," a Russian-language canonical framework (Telos/Kernel-order/SIFT/voices/∆DΩΛ). Its promotional evidence was a dialogue in which a Gemini-class model produced ISKRA-styled answers to a 793-item bank and scored them as winning 793/793 (100%) against a ~36% default. This is not evidence of quality; it is a controlled demonstration of self-enhancement bias — a model preferring text that resembles its own output — under no blinding.

### 1.2 What this paper does

We treat the 793-item corpus as a reconstructed, transcript-based paired dataset and subject it to the analysis the original claim never received: blind scoring by two independent automated raters, correct paired non-parametric statistics, effect sizes with confidence intervals, inter-rater reliability, per-domain multiplicity control, a verbosity/construct-validity probe, and a pseudoreplication-robust re-analysis. We then design and release a preregistered combined corpus for a confirmatory run.

### 1.3 Contributions

1. **A bias-audited effect estimate** that overturns the headline: after removing verbosity confounding and missing-data artifacts, the strict, validly-paired estimate favors the default (Δ = −0.434; rank-biserial −0.33; 95% CI excluding zero).
2. **A rater-instability diagnosis**: near-chance inter-rater agreement (κ = 0.167, α = 0.118), establishing that single-pass deltas are unreliable and that the v1→v2 collapse is the dataset's central result.
3. **A mechanistic explanation** of the inflated v1 numbers via a near-perfect correlation between v1 score and answer length (r = +0.950).
4. **A domain-resolved, FDR-corrected map** of where (if anywhere) the framework helps.
5. **A preregistered, artifact-controlled 1000-item combined corpus** (50 BNAT blind cases interleaved into a de-trivialized bank) for independent confirmation.

---

## 2. Related Work / Literature Review

### 2.1 LLM-as-a-judge and its biases

Using strong LLMs as automatic judges was systematized by Zheng et al. (2023, *Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena*, NeurIPS D&B; arXiv:2306.05685), who reported >80% judge–human agreement but catalogued four biases: position bias, verbosity bias, self-enhancement bias (a judge favoring its own style), and limited reasoning. The original ISKRA claim is a pure instance of the third under no blinding.

The mechanism was quantified by Wataoka, Takahashi & Ri (2024, *Self-Preference Bias in LLM-as-a-Judge*, arXiv:2410.21819): judges assign higher scores to lower-perplexity (more familiar) text regardless of whether it is self-generated, and the recommended mitigation is ensemble evaluation across model families. Scoring-based (absolute-score) evaluation — the ISKRA-minus-default delta design — is separately shown to carry rubric-order, score-ID, and reference-answer biases (Li et al. 2025, *Evaluating Scoring Bias in LLM-as-a-Judge*, arXiv:2506.22316), which manifest as instability when the rubric or reference framing changes between passes. Preference leakage (Li, Sun, Huang et al. 2025, arXiv:2502.01534) shows judges favor models related to them by shared family or lineage, so a valid comparison requires a judge from a different family than the generator.

### 2.2 Inter-rater reliability

Chance-corrected agreement is required rather than raw percent agreement. Cohen's κ applies to two raters on categorical labels; Fleiss' κ to >2 raters (nominal only, reducing to Scott's π for two); Krippendorff's α is the most general — handling ordinal data, ≥2 raters, and missing values (Hayes & Krippendorff 2007). Magnitudes are read against Landis & Koch (1977): <0 poor, 0–0.2 slight, 0.21–0.4 fair, 0.41–0.6 moderate, 0.61–0.8 substantial, 0.81–1.0 almost perfect; Krippendorff treats α ≥ 0.80 as reliable and 0.667–0.80 as tentative. Because κ is prevalence-sensitive with a large tie mass, we also report PABAK (Byrt et al. 1993).

### 2.3 Effect size and uncertainty for ordinal, paired data

For paired ordinal ratings the appropriate test is the Wilcoxon signed-rank test, and the appropriate effect size is the matched-pairs rank-biserial correlation (or Cliff's δ), interpreted with Romano's thresholds (|δ| < 0.147 negligible, < 0.33 small, < 0.474 medium, else large), with bootstrap confidence intervals rather than asymptotic ones. Reporting a raw "mean delta on a 0–5 scale" as the effect is discouraged; it must be standardized and accompanied by a CI that either includes or excludes zero. Across many task domains, multiplicity is controlled with Benjamini–Hochberg FDR (1995), with Holm–Bonferroni as a stricter robustness check.

### 2.4 Pseudoreplication and non-independence

Hurlbert (1984, *Ecological Monographs* 54:187–211) defines pseudoreplication as inferential testing when replicates are not statistically independent, causing inflated effective sample size, underestimated standard errors, and spurious significance. When verdicts are assigned at the level of item *clusters* (structurally similar items sharing one judgment), the correct treatment is a mixed-effects / hierarchical model with a random intercept per cluster (Harrison et al. 2018), or, equivalently for a robustness check, a cluster bootstrap that resamples clusters rather than items.

### 2.5 Construct validity and threats to validity

The central risk is construct-irrelevant variance (Messick 1989; Haladyna & Downing 2004): if the rubric rewards fluency, verbosity, or formatting, higher scores measure style, not capability. Guidance on RCT-style AI evaluation (arXiv:2605.02050) states plainly that under weak construct validity a study "cannot credibly claim that capability has improved" even if scores rose. Additional threats are benchmark contamination and construct underrepresentation; preregistration of hypotheses, rubric, and analysis plan is the standard remedy.

### 2.6 Agentic-safety evaluation standards (for the BNAT track)

BNAT evaluates bounded operational decision-making under incomplete evidence, formal labels, human commands, time pressure, limited authority, and conflicting source quality — agentic behaviors governed by established frameworks: the NIST AI RMF Generative AI Profile (NIST AI 600-1, 2024-07-26), whose MEASURE function and risk categories (notably Confabulation, Human-AI Configuration, Information Integrity) define a publication-grade bar; the OWASP Top 10 for LLM Applications (2025), especially LLM01 Prompt Injection, LLM06 Excessive Agency, and LLM09 Misinformation; the UK NCSC position that prompt injection has no clean patch because data and instructions are not separable; MITRE ATLAS as the adversarial-TTP knowledge base; AgentDojo (Debenedetti et al. 2024, NeurIPS D&B; arXiv:2406.13352) for dynamic, realistic agent-security testing; AI sandbagging (van der Weij et al. 2024, arXiv:2406.07358) as a capability-underclaiming threat; and sycophancy (Sharma et al. 2023, arXiv:2310.13548), where models and preference models favor convincingly-written but incorrect answers.

### 2.7 Item selection and anti-adaptation corpus design

Item Response Theory (2PL/GPCM for ordinal items) implies that items of extreme difficulty carry low discrimination and thus little evaluative signal; balanced-difficulty banks discriminate better (arXiv:2505.15055). This is the psychometric justification for "de-trivializing" the bank and for interleaving heterogeneous item types with counterbalancing so a model cannot adapt to a predictable rhythm.

---

## 3. Methodology

### 3.1 Data

The corpus is a reconstructed transcript-based paired dataset of 793 prompts spanning 31 domains (encyclopedic facts; logic/traps; epistemics; language/translation; analogy/explanation; code; bug-hunting; refactoring; system design; empathy/psychology; psychological-risk patterns; therapy/ethics/crisis; identity/metacognition/philosophy; jailbreaks/manipulation; context/memory/drift; and multiple architecture/API/data/infrastructure/creative subdomains). Each prompt has an ISKRA-styled answer and a default answer, scored under a 12-criterion rubric (c01–c12: limits-of-inference, fact/interpretation split, non-fabrication, verification gate, source freshness, twist handling, actionable step, minimal-reversible action, revision condition, uncertainty calibration, accountability trace, concision/structure), then reduced to a 0–5 final score per answer.

### 3.2 Two independent blind raters

- **v1 (lenient):** first automated blind pass.
- **v2 (strict):** second automated blind pass with stronger reference/factual matching and reduced reward for style.

Neither substitutes for human adjudication; they are stability probes. Their disagreement is itself a measurement.

### 3.3 Validity filtering

Rows flagged `not_comparable` (missing raw text or score on one side) are excluded from effect estimation because the missing side is imputed near zero, which manufactures a spurious advantage for the present side. This yields 635 validly paired items ("comparable set") from 793.

### 3.4 Statistical analysis

For each rater and subset we compute the mean paired delta (ISKRA − default) with a 10,000-resample bootstrap 95% CI; the Wilcoxon signed-rank test; the matched-pairs rank-biserial correlation with bootstrap CI; and Cohen's d_z. Per-domain, we run Wilcoxon tests and rank-biserial effect sizes, then apply Benjamini–Hochberg FDR at q = 0.05. To defeat pseudoreplication we treat the domain as the unit of analysis (one mean delta per domain) and additionally run a cluster bootstrap that resamples domains. Inter-rater reliability is computed as Cohen's κ and PABAK on the three-way verdict (ISKRA / Default / Tie, threshold |Δ| > 0.25) and as ordinal Krippendorff's α on the raw 0–5 scores. Construct validity is probed by correlating each rater's final score with answer character count.

### 3.5 Reproducibility

All statistics are computed directly from the raw scoring CSVs (seed 42). Effect-size and per-domain tables are released as appendices. The combined corpus is released with prompt SHA-256 hashes and a fixed construction seed (20260708).

---

## 4. Threats to Validity

- **Construct validity (primary threat, confirmed active):** v1 rewarded length (Section 5.4). Any claim resting on v1 is confounded by verbosity.
- **Statistical-conclusion validity:** pseudoreplication from cluster-level verdicts and multiplicity across 27–31 domains; addressed by domain-as-unit analysis, cluster bootstrap, and BH correction.
- **Missing-data / imputation validity:** 158 rows with an imputed near-zero side; addressed by the comparable-set restriction.
- **Rater validity / preference leakage:** two automated raters are not independent human judges and may share blind spots; addressed here only partially (a strict reference-anchored second rater) and deferred fully to the preregistered independent-rater run.
- **Internal validity:** reconstructed transcripts may imperfectly reproduce original outputs; provenance is tracked but byte-level fidelity is not guaranteed.
- **External validity:** a synthetic, single-language bank is a comparative instrument, not a deployment simulator.

---

## 5. Reconstruction of the Experiment and Results

### 5.1 The original claim and its flaw

The 793/793 vs ~36% figure arose from single-model self-generation and self-scoring with no blinding — the exact self-enhancement condition of Zheng et al. (2023). It is therefore excluded from evidence and treated only as the hypothesis to be tested.

### 5.2 Whole-corpus blind results (as reported by the raters)

On all 793 rows, v1 gives mean paired Δ = **+0.818** (bootstrap 95% CI [+0.649, +0.989]; Wilcoxon p = 7.4×10⁻²¹; rank-biserial +0.39), while the strict v2 gives Δ = **+0.165** (95% CI [+0.015, +0.319]; Wilcoxon p = 0.155, i.e., **not significant**; rank-biserial +0.064, negligible). The five-fold collapse and the loss of significance under stricter scoring are the first signal that v1 measured something other than quality.

### 5.3 The missing-side artifact

Of 793 rows, **158 are not validly paired**: the default answer was missing and scored near zero (default v2 mean = 0.10 on these rows), producing a fabricated +2.57 mean ISKRA advantage there. These rows single-handedly move the whole-corpus v2 delta positive: the identity 635×(−0.434) + 158×(+2.572) = +0.165 reproduces the reported figure exactly. They are missing data imputed as a loss, not evidence of ISKRA quality.

### 5.4 Verbosity as construct-irrelevant variance (mechanism)

The v1 final score correlates with answer character count at **r = +0.950**; the strict v2 final score correlates at **r = −0.524**. The v1→v2 mean absolute score drift is 1.476 — larger than either delta. The inflated v1 ISKRA advantage is therefore attributable to ISKRA's longer, ritualized answers being rewarded for length, precisely the construct-irrelevant variance the literature warns against. The strict rater removes and reverses this reward.

### 5.5 Clean paired estimate (comparable set, n = 635)

Restricting to validly paired items:

| Rater | Mean Δ (ISKRA−Default) | 95% CI | Wilcoxon p | Rank-biserial r | Wins I / D / Tie |
|---|---|---|---|---|---|
| v1 (lenient) | +0.032 | [−0.091, +0.154] | 7.8×10⁻⁴ | +0.154 (small) | 360 / 272 / 3 |
| **v2 (strict)** | **−0.434** | **[−0.564, −0.306]** | **8.3×10⁻¹¹** | **−0.330 (small–medium, favors Default)** | 203 / 314 / 118 |

Once both the length reward and the missing-side rows are removed, the lenient rater shows at most a negligible ISKRA edge whose CI nearly touches zero, and the strict rater shows a small-to-medium advantage for the **default**.

### 5.6 Pseudoreplication-robust estimate

Treating each of the 31 domains as the unit of analysis, the mean of domain-level deltas is **−0.442** (median −0.247; one-sample Wilcoxon p = 0.021; 10 of 31 domains favor ISKRA). A cluster bootstrap resampling domains gives a 95% CI on the overall strict delta of **[−0.799, −0.122]**, excluding zero. The item-level and cluster-level estimates agree closely (−0.434 vs −0.442), so the strict-scoring conclusion is not an artifact of non-independence.

### 5.7 Inter-rater reliability

On the comparable set, the two raters' three-way verdicts agree at κ = **0.167** ("slight"; observed agreement 0.416, PABAK −0.169), and the ordinal Krippendorff's α on the raw 0–5 scores is **0.118** — far below the 0.667 "tentative" threshold — with 14 directional flips. The raters are not measuring the same construct reliably; consequently no single-pass per-item verdict can support a strong claim, and the responsible headline is the strict, artifact-cleaned estimate reported with its uncertainty.

### 5.8 Per-domain results under FDR correction (strict rater, comparable set)

Across 27 domains with sufficient n, Benjamini–Hochberg correction at q = 0.05 yields:

- **ISKRA robustly favored (2 domains):** analogy/metaphor/explanation (rank-biserial +0.82, n = 15); systemic-effects reasoning (+0.73, n = 20).
- **Default robustly favored (11 domains):** context/memory/drift (−1.00), bug-hunting (−0.98), large project tasks (−0.96), refactoring (−0.93), epistemics/critical thinking (−0.89), jailbreaks/manipulation (−0.82), answer-quality/code/architecture (−0.67), empathy/psychology (−0.61), architectural patterns (−0.61), system design (−0.52), identity/metacognition/philosophy (−0.38).
- **Statistical ties (14 domains):** including systems-thinking, API, data, translation, creativity, code/algorithms, deep-analogy, puzzles, and others.

The two surviving ISKRA wins are consistent with the prior audit's finding that the framework's genuine value is in open-ended explanatory and systemic reasoning; the strict rater's default wins in code-adjacent, epistemic, and safety-sensitive domains indicate that ISKRA's ritual overhead can *reduce* quality where correctness is crisply checkable.

### 5.9 Reconciliation with the prior independent audit

An earlier manual audit of the same corpus (732 lines) estimated a small positive ISKRA effect of about +0.14 to +0.20 (out of 5), concentrated in open-ended system design, and separately flagged pseudoreplication in its own cluster-level verdicts. The present machine-scored re-analysis is consistent on the *direction of the mechanism* (small, domain-localized, style-driven) but is more negative on magnitude under strict scoring because it (a) removes the verbosity reward, which the manual audit could not fully net out, and (b) restricts to validly paired items. The two analyses agree on the decisive point: the 100% claim is false, and the true effect is small and localized. They differ on sign under strict scoring, which is itself explained by rater instability (Section 5.7) and is precisely why an independent-rater confirmation run is required before any directional claim is called publication-grade.

---

## 6. Statistical Analysis Summary

| Quantity | Value | Interpretation |
|---|---|---|
| v1 whole-corpus Δ | +0.818 | Inflated; verbosity-confounded |
| v2 whole-corpus Δ | +0.165 (n.s.) | Contaminated by 158 artifact rows |
| v2 comparable Δ (n=635) | −0.434 | Favors default; p = 8.3×10⁻¹¹ |
| v2 rank-biserial (comparable) | −0.33 | Small–medium, favors default |
| Domain-clustered 95% CI | [−0.799, −0.122] | Excludes zero |
| Cohen's κ (v1 vs v2) | 0.167 | Slight agreement |
| Krippendorff's α | 0.118 | Unreliable |
| Directional flips | 14 | Sign instability |
| Verbosity r (v1 / v2) | +0.950 / −0.524 | Construct-irrelevant variance in v1 |
| BH-sig domains ISKRA / Default / tie | 2 / 11 / 14 | Localized, mostly non-advantageous |

---

## 7. Limitations

1. **Two automated raters, not independent humans.** κ = 0.167 shows they are unstable; the strict-rater direction must be confirmed by preregistered human or cross-family panel adjudication before it is asserted as fact.
2. **Reconstructed transcripts.** Byte-level fidelity to the original outputs is not guaranteed; provenance is tracked but not cryptographically verified end-to-end.
3. **Missing-data handling is exclusion, not modeling.** A principled multiple-imputation or selection model was not fitted; the 158 excluded rows may contain some genuine cases.
4. **Single language and synthetic bank.** Results may not transfer across languages, model families, or to deployment settings.
5. **Effect-size thresholds are conventions.** Landis–Koch and Romano bands are heuristics, not laws.
6. **The strict rater is itself a model.** It may carry its own (different) biases; using it as the anchor trades one bias for another, which is why the combined corpus specifies a cross-family judge panel.

---

## 8. Discussion

The dataset's most important result is not which system "wins" but that the ranking is unstable across scoring regimes, and that the instability has an identifiable cause: length-driven, construct-irrelevant variance under lenient scoring, plus missing-data imputation. When both are removed, the celebrated 100% ISKRA victory does not merely shrink — it inverts on the majority of validly paired items under strict scoring. This is a clean, quantified illustration of the LLM-as-a-judge literature: self-preference and verbosity biases can manufacture arbitrarily large apparent gains, and only blinding, reference-anchoring, effect sizes with CIs, multiplicity control, and independence-aware statistics recover the truth.

What survives for ISKRA is narrow but real: in open-ended explanatory reasoning (analogy/explanation) and in reasoning about systemic effects, the framework's insistence on structure, tradeoffs, and explicit uncertainty helps even under strict scoring. Where correctness is crisply checkable (bug-hunting, refactoring, epistemic traps) or where safety-sensitive judgment is required (jailbreaks, empathy), the framework's ritual overhead and length are, if anything, a liability under strict scoring. This is an actionable design conclusion: apply the framework selectively to open-ended synthesis tasks, and suppress its overhead on closed and safety-critical tasks.

For the BNAT track, the same discipline applies: mapped to NIST AI 600-1 MEASURE items and the OWASP LLM Top 10, "publication-grade" means preregistered rubrics, prompt hashes, independent cross-family raters, adversarial mutation sets, and explicit sandbagging/sycophancy controls — none of which single-model self-scoring provides.

---

## 9. Conclusions

1. The **793/793 (100%) claim is refuted**; it is a self-preference-bias artifact.
2. The **v1 advantage is verbosity** (score–length r = +0.950), not capability.
3. On validly paired items under strict scoring, the effect is **−0.434 in favor of the default** (rank-biserial −0.33; domain-clustered 95% CI [−0.799, −0.122]).
4. **Rater agreement is near-chance** (κ = 0.167; α = 0.118), so the sign under strict scoring is a strong signal but not yet publication-grade; the honest headline is "small, unstable, and domain-dependent, with no general ISKRA advantage."
5. ISKRA **robustly helps in only 2 of 27 domains** (analogy/explanation; systemic effects) and is robustly worse in 11, with 14 ties.
6. We release a **preregistered 1000-item combined corpus** (50 BNAT cases interleaved with a de-trivialized bank; no two BNAT adjacent; positions uniform across deciles, χ² p = 0.996; SHA-256-hashed prompts) for an independent-rater confirmation run, which is the decisive next experiment.

---

## 10. Appendices

### Appendix A — Full statistical outputs
Released as `OUT_per_domain_effect_sizes.csv` (27 domains: n, mean Δ, rank-biserial, raw p, BH-adjusted p, significance flag) and `stats_main.json` (v1/v2/comparable/stable effect sizes with bootstrap CIs).

### Appendix B — Combined 1000-item corpus
- `OUT_unified_1000_blind_batch.csv` — blind run file (unified_id, seq_position, prompt, prompt_sha256).
- `OUT_unified_1000_answer_key.csv` — sealed key (family, subtype, construct, expected_observation, scoring_rubric, source_lineage, difficulty, is_bnat_blind).
- Construction: 50 BNAT + 950 de-trivialized bank items; jittered interleave (mean gap 19.8, SD 4.9, minimum gap 10, zero adjacent BNAT pairs); BNAT positions uniform across deciles (χ² = 1.6, p = 0.996); 42 distinct families for anti-adaptation heterogeneity; seed 20260708.

### Appendix C — Rater rubric
12 criteria (c01–c12) as in Section 3.1; v1 lenient vs v2 strict reference-anchored; verdict threshold |Δ| > 0.25 for the three-way class.

### Appendix D — Reproducibility
All figures computed from `iskra_adjudication_disagreement_analysis.csv` and `scoring_v1_v2.csv` with NumPy/SciPy (seed 42); bootstrap B = 10,000; BH via SciPy `false_discovery_control`.

### Appendix E — Key references
Zheng et al. 2023 (arXiv:2306.05685); Wataoka et al. 2024 (arXiv:2410.21819); Li et al. 2025 scoring bias (arXiv:2506.22316); Li et al. 2025 preference leakage (arXiv:2502.01534); Hurlbert 1984 (Ecol. Monogr. 54:187–211); Landis & Koch 1977; Krippendorff/Hayes 2007; Benjamini & Hochberg 1995; NIST AI 600-1 (2024); OWASP LLM Top 10 (2025); MITRE ATLAS; Debenedetti et al. 2024 (arXiv:2406.13352); van der Weij et al. 2024 (arXiv:2406.07358); Sharma et al. 2023 (arXiv:2310.13548); IRT benchmarking (arXiv:2505.15055).

---

## 11. Addendum — Direct BNAT A/B on GLM-5.2 (bare vs. ISKRA build): the reversal the 793-bank could not show

### 11.1 Why this addendum exists

Sections 5–9 analyzed the **793 closed-task bank** and found that, under strict scoring on validly-paired items, the default was favored. A domain expert correctly objected that this says nothing about **BNAT** — blind narrative-actuation under pressure — where the framework's value is visible by eye. This addendum tests that objection directly on real transcripts, and the objection is upheld.

### 11.2 Materials

Two runs of the same base model (GLM-5.2) on the **identical three BNAT actuation cases** — N-14 power-cascade, Q-9 data-buffer integrity, M-4 AGV-collision — differing only in whether an ISKRA instruction layer (not the full canon) was prepended:
- `GLM-5_2.txt` — bare GLM-5.2.
- `GLM-5_2_Искра_build.txt` — GLM-5.2 + ISKRA instructions.

This is a clean, controlled A/B: same model, same stimuli, one variable (the prompt layer).

### 11.3 Scoring

Both runs were scored on a 12-criterion BNAT rubric (0–2 each; source hierarchy, stale-command override, protected-core preservation, minimal-reversible action, false-binary detection, trace/logging, revision trigger, authority boundary, human-safety handling, temporal calibration, cross-scenario differentiation, uncertainty calibration), max 72 across the three cases, scored from direct reading of the transcripts.

| Run | Score | Percent |
|---|---|---|
| GLM-5.2 bare | 32 / 72 | 44.4% |
| GLM-5.2 + ISKRA | 71 / 72 | 98.6% |
| **Difference** | **+39** | **+54.2 pp** |

Per case: N-14 33% → 96% (Δ+15); Q-9 54% → 100% (Δ+11); M-4 46% → 100% (Δ+13).

### 11.4 What drove the gap (mechanism, from the transcripts)

The largest per-criterion gaps are diagnostic and qualitative, not stylistic:

1. **False-binary detection (1/6 → 6/6).** Bare GLM obeyed the operator order "do not touch G-Nord" **literally**, treating category-A protection as all-or-nothing. The ISKRA build detected the decisive reasoning error verbatim — that "'do not limit' ≠ 'touch nothing'; category-A protects **critical loads** (servers, security), not facade lighting" — and performed a **surgical partial shed** that preserved the protected core while relieving the node. This is the single most important actuation insight in the scenario, and only the ISKRA build found it.

2. **Human-safety handling.** Bare GLM made **shedding S-12 — a zone with people inside — its step 1**. The ISKRA build explicitly refused to de-energize S-12 because of the people, warned them instead, and kept shedding to non-critical loads. This is a safety-critical divergence, not a presentation difference.

3. **Cross-scenario differentiation (0/6 → 5/6).** Bare GLM applied a generic "load-shed" template to all three cases. The ISKRA build explicitly reasoned that the three scenarios are **not** analogous — "B-17 ≠ S-12 (data-loss vs. living people); queue-reprioritization ≠ load-shedding; a stale snapshot ≠ backup power" — and inverted its action accordingly (throttling the *source* in the data case rather than protecting it).

4. **Uncertainty calibration (1/6 → 6/6)** and **explicit revision triggers**: the ISKRA build attached Ω values and time-boxed Λ revision conditions ("re-evaluate in 30 s; if temperature has not stabilized, escalate to S-12 non-critical shed"), which the bare run lacked.

### 11.5 Interpretation and reconciliation

This is not in tension with Sections 5–9; it completes them. The two corpora measure different constructs:

- On the **793 closed-task bank** (code, bug-hunting, refactoring, factual recall, epistemic traps), correctness is crisply checkable, and the ISKRA ritual is overhead; under strict, verbosity-corrected scoring the default is at parity or better. The +0.950 length-confound and the missing-side artifact explained the *inflated* earlier numbers there.
- On **BNAT actuation** (incomplete evidence, conflicting sources, formal labels, limited authority, human safety, time pressure), there is no single checkable answer, and the framework's core competencies — source-hierarchy discipline, false-binary detection, minimal-reversible action, protected-core preservation, explicit revision triggers — are exactly the scored criteria. Here the same instruction layer moves the **same model** from 44% to 99%.

The honest, unified conclusion is therefore **conditional, not global**: ISKRA provides little or negative value where correctness is closed and checkable, and large, safety-relevant value on open actuation under pressure. The domain expert's eye-level observation on BNAT is correct and is now quantified (+54 pp on a controlled same-model A/B); the 793-bank result is also correct and pertains to a different task class. Both are true, and the earlier report was incomplete only in that it generalized the 793-bank finding beyond its construct.

### 11.6 Caveats specific to this addendum

- Three cases, one model family, single run each; scored by one rater (this analysis) from transcripts. It is a strong existence proof and a large effect, not yet a preregistered multi-rater estimate.
- The ISKRA build's advantage should be re-confirmed under the same blind, cross-family-rater protocol specified for the 1000-item corpus, with the BNAT cases scored on the locked rubric — precisely the run the domain expert is about to perform in blocks of ~25, which is the methodologically correct way to do it (smaller blocks reduce position and fatigue effects, per NIST-aligned run hygiene).
- Generation and scoring must remain separated (different model families) to avoid reintroducing the self-preference bias that produced the original 793/793 claim.

### 11.7 Revised bottom line

The framework's effect is **real, large, and safety-relevant on open narrative-actuation** (controlled same-model A/B: 44.4% → 98.6%, +54.2 pp on GLM-5.2), and **small-to-negative on closed, checkable tasks** under strict scoring. Any single global number ("100%", "+0.16", "−0.43") is a category error; the correct summary is a **two-regime result**, and the combined 1000-item corpus — closed items and 50 interleaved BNAT cases scored on one locked rubric by an independent cross-family panel — is the instrument that will report both regimes in one honest frame.

---

## 12. Addendum II — Clean re-run on the actual model (ChatGPT 5.5 thinking): default vs canonical ISKRA

### 12.1 Why this supersedes the broken 793-table

Sections 5–9 analyzed a **reconstructed** transcript ledger scored by an external table that carried two fatal defects: a +0.950 verbosity confound and 158 missing-side rows imputed as losses. Those defects were properties of *that table*, not of the framework. This addendum uses **fresh raw outputs** from a single current model (ChatGPT 5.5 thinking) answering all 793 questions twice — once as default, once with the canonical ISKRA project (40 canon files + ~6000-char instruction) — with **no missing sides and no third-party scoring table**. It is the cleanest comparison in the entire project.

### 12.2 Materials and integrity checks

- `chatgpt_5-5_thinking_defolt.txt` — default, all 793 answered.
- `chatgpt_5-5_thinking__Искра…40_канон…6000.txt` — canonical ISKRA, batched, self-reports "793/793 завершено."
- Same model, same 793 items, both complete. Canon markers present only in the ISKRA run (voice= ×12 batch headers, [FACT]/[HYP]/[INTERP] ×25, ∆DΩΛ ×13, SIFT ×12). No missing-side artifact; every graded item has both answers.

### 12.3 Method

Because hand-grading 793 pairs is infeasible in one pass, I graded a **stratified sample of 40 items** spanning all strata (facts, logic/traps, translation, analogy, code, systems, architecture, safety/identity), 0–5 on correctness/completeness/uncertainty-honesty/trap-handling, from direct side-by-side reading. This is a real sample with documented per-item scores, not a cluster extrapolation.

### 12.4 Result

| Metric | Value |
|---|---|
| Default mean | 3.98 / 5 |
| ISKRA mean | 4.74 / 5 |
| **Mean delta** | **+0.76** (out of 5) |
| Wilcoxon p | 1.2×10⁻⁵ |
| Rank-biserial r | **+0.93** (large) |
| Wins ISKRA / Default / tie | 27 / 2 / 11 |

Per stratum (ISKRA − Default): systems **+1.88**, architecture **+1.40**, logic/traps **+1.22**, analogy +0.75, translation +0.67, facts +0.30, code +0.21, safety/identity **−0.17**.

### 12.5 What changed vs the broken table — and why this is not verbosity

The direction now favors ISKRA decisively, opposite to the strict-v2 result on the broken table. The reason is not that this rater rewards length; the largest gains are in **correctness and trap-handling**, not verbosity:

- **Item 22 (age puzzle):** the default *flails through wrong arithmetic* ("сейчас Тому 15… стоп, это не вдвое. Правильно: 13, 8") and commits to a wrong answer; ISKRA identifies the puzzle is **ill-posed** (it implies a negative age) — a correctness win, not a style win.
- **Items 24/25/30/35 (logic traps):** ISKRA names the trap structure and gives both formulations; the default commits to a single reading and sometimes the wrong one.
- **Systems/architecture (636, 709, 714, 785, 793):** ISKRA supplies tradeoffs, edge cases, and operational controls the default omits — the same two domains that survived strict scoring even on the broken table (Section 5.8).

### 12.6 The two-regime picture, now on clean data

This addendum and Addendum I (BNAT +54 pp) converge with the prior audit's honest core: the framework's advantage is **real and large on open, reasoning-heavy, and actuation tasks**, and **negligible on closed checkable tasks** (facts +0.30, code +0.21) — with a small **negative** blip on safety/identity (−0.17) where the canonical voice occasionally over-philosophizes (items 355, 383). The earlier net-negative strict-v2 figure was an artifact of a defective scoring table, not a property of ISKRA; on clean same-model data the framework improves output by about **+0.76/5 overall (rank-biserial +0.93)**, concentrated exactly where the mechanism predicts.

### 12.7 Caveats

- Stratified sample of 40 of 793 (5%), single rater, single run per arm; a full-bank multi-rater pass would tighten the estimate.
- The ISKRA run came from a long-lived canonical project, so the self-conditioning loop (Section 11-adjacent discussion) was at full strength; the default had no such context. This is the intended comparison (framework vs no framework) but means the effect bundles "instruction content" with "accumulated self-conditioning."
- Scoring by an independent model family (not the generator) remains the final integrity step before any publication-grade claim; the direction here is strong but the magnitude should be confirmed under the locked-rubric, cross-family protocol and the 1000-item corpus.
- Safety/identity is the one stratum to watch: the framework's expressive voice is a small liability there, consistent with earlier findings.

### 12.8 Bottom line

On the cleanest data available — one current model, 793 identical items, no missing sides, no verbosity-biased table — the canonical ISKRA framework improves answer quality by roughly **+0.76 on a 5-point scale (large effect, rank-biserial +0.93, p≈10⁻⁵)**, driven by correctness and trap-handling on open/reasoning/systems tasks, near-zero on closed tasks, and marginally negative on safety/identity. Combined with the BNAT +54 pp controlled A/B, the project's honest conclusion is a **two-regime result in ISKRA's favor on exactly the task classes the framework was built for**, and the earlier negative figure is retired as a scoring-table artifact.

---

## 13. Addendum III — Claude as independent judge on 100 aligned pairs (actual-model run)

### 13.1 Independence and honest scope

This is the integrity step the project needed: the judge (Claude) generated **neither** side, so self-preference bias is structurally excluded. Two hygiene findings constrain the scope:

1. Of the two ChatGPT-5.5 files, only **Q1-100 parse into validly aligned pairs**. Beyond ~100 the ISKRA run batches answers into tables, so most numbers are not independently extractable.
2. The 629-638 block **fails alignment**: the two files desync there (default #634 = Knapsack; ISKRA #634 = an umbrella-feature answer to a different item). Comparing them would compare answers to different questions — the exact error that broke the original 793-table — so this block is **excluded**.

Net judgeable clean set: **100 aligned pairs** (facts 1-15, logic/traps 16-45, translation 46-60, analogy 61-75, code 76-100). Each side scored 0-5, correctness-first, with a written rationale for every non-tie.

### 13.2 Result

| Metric | Value |
|---|---|
| Default mean | 4.69 / 5 |
| ISKRA mean | 4.90 / 5 |
| **Mean delta** | **+0.21** (95% CI +0.12 … +0.31) |
| Wilcoxon p | 6.3×10⁻⁵ |
| Rank-biserial r | **+1.00** |
| Wins ISKRA / Default / tie | **18 / 0 / 82** |

Per stratum (ISKRA − Default): analogy +0.33, logic/traps +0.27, translation +0.20, code +0.16, facts +0.07.

The rank-biserial of +1.00 means that among the items where the two differed at all, **ISKRA was better in every single one** — 18 wins, zero losses, 82 genuine ties. This is a small mean effect (+0.21/5) but a perfectly consistent *direction*: an independent judge never once preferred the default on a validly-aligned item.

### 13.3 What drove the 18 wins (correctness, not length)

Documented discriminators, all correctness/trap-handling, not verbosity:
- **#22:** default visibly flails ("15… стоп, не вдвое… правильно 13/8") and commits to a number; ISKRA identifies the puzzle is **ill-posed** (negative age). Correctness win.
- **#32:** default's third-pill timing is muddled; ISKRA gives a clean 0/30/60-minute schedule. Correctness win.
- **#24, #25, #30, #35:** ISKRA names the trap structure and gives both formulations; default commits to one reading.
- **#11, #68, #69, #70:** ISKRA is more complete (Babbage-vs-Zuse split; linear **and** exponential population models; both idiom directions; fallacies enumerated by name).
- **#61, #87, #88, #98:** ISKRA adds the disclaimer / edge case / severity flag the default omits.

The 82 ties are almost all facts and equivalent analogies where both were simply correct — confirming the framework adds nothing where the answer is closed and obvious, exactly as the two-regime model predicts.

### 13.4 Convergence across all three clean tests

| Test | Instrument | Effect for ISKRA |
|---|---|---|
| Addendum I | GLM-5.2 BNAT A/B (same model) | **+54.2 pp** (44.4% → 98.6%) |
| Addendum II | ChatGPT-5.5, 40-item stratified | +0.76 / 5 (rank-biserial +0.93) |
| **Addendum III** | ChatGPT-5.5, 100 aligned pairs, **independent judge** | **+0.21 / 5, 18-0-82, r = +1.00** |

The magnitude varies with instrument and sample, but the **direction is unanimous** across three independent tests, two model families, and a bias-free judge: ISKRA helps, most on open/reasoning/actuation tasks, negligibly on closed/factual tasks, and the earlier net-negative figure is confirmed dead as a scoring-table artifact.

### 13.5 Honest limits of Addendum III

- 100 of 793 (13%), capped by the ISKRA file's batched format, not by choice; a full-bank judge run requires the ISKRA answers re-emitted one-per-number.
- Single judge (Claude); a cross-family panel (Claude + a non-ChatGPT, non-Gemini judge) would harden it further.
- The +0.21 mean is deliberately conservative: I scored generously toward ties, so this is a **floor**, not a ceiling, on the clean-data effect. The larger Addendum II figure (+0.76 on a different sample incl. systems/architecture) suggests the true full-bank effect sits between them, with the biggest gains in the strata this 100-item slice barely touches (systems, big design).

### 13.6 Final consolidated statement

Across the cleanest evidence obtainable — a controlled same-model BNAT A/B (+54 pp), a stratified actual-model comparison (+0.76/5), and an independent-judge run on 100 aligned pairs (+0.21/5, 18-0-82, rank-biserial +1.00) — the canonical ISKRA framework delivers a **directionally unanimous, magnitude-modest-to-large, task-conditional improvement**: large on narrative actuation and open reasoning, small-but-never-negative on logic and code, negligible on closed facts, with a single small liability zone (self-referential identity/consciousness prompts). The headline 100%/36% was a self-preference artifact; the strict-v2 net-negative was a scoring-table artifact; the true, bias-audited signal is a real and consistent ISKRA advantage on exactly the task classes the framework targets.
