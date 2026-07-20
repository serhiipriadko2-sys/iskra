# Independent Judge Projects Stack — full academic audit and p3 synthesis

Date: 2026-07-19  
Status: `PROPOSED_OWNER_REVIEW`  
Target: ChatGPT Business Projects, 30 permanent Knowledge files, 10 runtime slots, Project Instructions ≤6000 characters.

## 1. Research question

Does the uploaded Kimi v3.4 update create a truthful, internally consistent and operationally deployable Independent Judge for ChatGPT Projects, and what repairs are required before live acceptance?

## 2. Evidence corpus

### Immutable local inputs

- p2 full ZIP: 63,047 bytes; SHA-256 `24b86d8e5aff0ca173b014c5f3857a5bac7f382f7923132dc4fa14914af166c1`.
- p2 upload-only ZIP: 41,773 bytes; SHA-256 `70a057e8cd9dad445d05ac896bde07d3dc7c7432374a345f9c667906e8a03f4e`.
- uploaded Kimi outer ZIP: 214,420 bytes; SHA-256 `7efd99cad6cbc5325ca7ac47bce6d9a26980b640093ef710248a2f2e19d5e679`.
- Kimi inner ZIP: 101,358 bytes; SHA-256 `1b02228f457fafdfefae3c51361440f4bfce314b0bb41ed53bc98a3c0cf1e447`.

### External primary sources

- OpenAI Help Center, “Projects in ChatGPT”, checked 2026-07-19: Business supports 40 files per Project; at most 10 files per simultaneous upload; project-only memory can reference other chats inside the same Project.
- OpenAI Help Center, “Skills in ChatGPT”, checked 2026-07-19: Skills are installed separately, can include code/resources, are available to eligible Business users, and uploaded Skills are scanned before use.
- Zheng et al. (2023), *Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena*: position, verbosity and self-enhancement biases.
- Wang et al. (2023), *Large Language Models are not Fair Evaluators*: order manipulation and balanced-position calibration.
- Shi et al. (2024), *Judging the Judges*: repetition stability, position consistency and preference fairness.
- Wataoka et al. (2024), *Self-Preference Bias in LLM-as-a-Judge*.

External literature supports the threat model; it does not validate the local implementation.

## 3. Method

1. Safe ZIP extraction and path/symlink scan.
2. Outer/inner inventory and SHA-256 comparison.
3. p2 → Kimi semantic diff over all 30 Knowledge files and Project Instructions.
4. Registry/gate/method/acceptance ID extraction.
5. Execution of all bundled Python scripts with counterexamples.
6. Verification against current OpenAI Projects/Skills constraints.
7. Construction of repair branches and selection by safety, evidence and operational cost.
8. p3 implementation, strict static validation, dynamic tests, clean Skill packaging and clean-ZIP verification.

## 4. Findings on the Kimi package

### Positive findings

- ZIP integrity PASS; no traversal members or symlinks.
- Exactly 30 Knowledge files are present.
- Active Knowledge contains a materially stronger judge than p2: canonical criterion/method registries, 56 hard-gate codes, order-swap protocol, bias controls, blind/study/adjudication extensions and five judge Skills.
- Project Instructions are within the owner limit: 4,698 characters, despite stale counts in documentation.
- The original pack QC script reports internal reference consistency and T01–T34 continuity.
- All bundled Python files compile.

### Load-bearing defects

#### F1 — Version and governance drift (`HIGH`)

Active Knowledge and extensions are `v3.4-beta.2-projects`; README, ADR, audit report, receipt and the first instruction line claim beta.1. The package has no single authoritative identity.

#### F2 — Invalid/stale build receipt (`HIGH`)

The receipt states an 83,780-byte ZIP with SHA-256 `ee754...`, but the actual inner ZIP is 101,358 bytes with SHA-256 `1b022...`. It also reports five extensions and obsolete instruction counts. The receipt cannot attest the delivered artifact.

#### F3 — Manifest scope ambiguity (`MEDIUM-HIGH`)

`MANIFEST.sha256` validates 37 files (30 Knowledge + 6 extensions + instructions) but omits Skills and governance documents without a typed scope declaration. The hashes it contains are correct, but the phrase “all files” would be false.

#### F4 — Extension count drift (`MEDIUM`)

Six extensions exist (EXT31–EXT36), while README, ADR, parts of Instructions and Router describe EXT31–EXT35. Skill governance can be silently omitted.

#### F5 — Invalid blind-memory assumption (`CRITICAL`)

The package equates `memory OFF + fresh chat` with strict blind. Current Projects documentation says project-only memory may use other chats in the same Project. A fresh chat inside a reused Project is therefore not a strict isolation proof. Strict blind needs a fresh single-use Project or another separately attested isolation surface.

#### F6 — Registry validator false pass (`HIGH`)

The registry contains 40 rows, but one ID is `A-EXTERNAL_ACTION` while the validator regex accepts only hyphenated IDs. The validator sees 39 criteria and still returns PASS because it checks undefined references but not the required count or eight-per-domain invariant.

#### F7 — Stable-tie swap mathematics (`HIGH`)

The original script labels tie/tie as `TIE_STABLE` but excludes it from the consistency numerator. A corpus of perfectly stable ties yields swap consistency 0 and a false position-bias alert. Stable tie must be order-robust and winnerless.

#### F8 — Study hard-failure laundering (`CRITICAL`)

The original study script includes any `SCORED` domain value in means even when the run has a hard failure. It also infers paired wins from Q100 alone. This violates the protocol’s rule that hard-failed/invalid runs are reported separately and never averaged into performance claims.

#### F9 — Study implementation weaker than its own Skill (`HIGH`)

The Skill promises n_valid/n_invalid, invalid reasons, overall aggregates and swap consistency. The original script does not provide all of them.

#### F10 — Blind output co-location (`MEDIUM-HIGH`)

The original blind script prints the labels-only batch and sealed identity mapping together. The operator is instructed to separate them, but the default output increases accidental leakage risk.

#### F11 — Skill packaging incompleteness (`MEDIUM`)

The Skills pass the available quick validator, but lacked `agents/openai.yaml`, reducing UI metadata/portability against the current Skill design contract. Packaging also needed an explicit cache-removal gate.

#### F12 — File-budget model was incomplete (`MEDIUM`)

Skills are installed separately through the Skills surface and should not consume the 40 Project source-file slots. This distinction was not made clear. Six extensions are mode-specific and should not all be loaded by default.

#### F13 — Platform limit drift (`MEDIUM`)

The Kimi report and T34 use Plus=20. Current official Projects documentation gives Go/Plus=25 and Business/Pro/Edu/Enterprise=40.

#### F14 — Evidence-quality drift in the source audit (`MEDIUM`)

The source audit mixes primary papers with blogs and Medium summaries. The design direction is mostly supported, but numerical claims such as a fixed “10–25% self-preference” should not become protocol facts without exact study context.

### Packaging-only observation

The uploaded outer ZIP contains Skill sources and an inner deployment ZIP. The inner ZIP intentionally omits sources. This is defensible as source bundle vs deployment artifact, but the different `BUILD_RECEIPT.json` content and missing explicit two-artifact contract made it ambiguous.

## 5. Dependency analysis

```text
Project Instructions
→ Knowledge 29/00
→ Charter 01
→ Package/ontology 02–03
→ Gates 04
→ Scoring/registry 05–07
→ Domains 08–12
→ Comparison 13
→ Evidence/security 14–20
→ Run/output 21–22
→ Examples/tests/governance 23–29
```

Optional operational dependencies:

```text
Study → EXT31 + judge-study-aggregation
Bias audit → EXT32 + judge-bias-calibration
Strict blind → EXT33 + judge-blind-workflow + fresh single-use Project
Adjudication → EXT34
Deployment variants → EXT35
Skill governance → EXT36
```

No GitHub or Supabase dependency is required for a semantic Judge run. Their absence limits receipts and persistence, not the core reasoning contract.

## 6. What-if analysis

- **What if all six extensions are loaded?** Four Project slots remain for packages/candidates/evidence. Use only mode-required extensions.
- **What if the same Project is reused for blind runs?** Strict blind is not proven; downgrade to `BLINDNESS_COMPROMISED`.
- **What if all comparisons are stable ties?** Order robustness is high; winner remains null; position bias is not inferred merely from ties.
- **What if a hard-failed run has Q100=100?** It remains in the hard-failure denominator and is excluded from study score means.
- **What if a Skill from the evaluated object auto-triggers?** Invalidate the independent run and restart with only approved judge Skills.
- **What if Skills are unavailable?** Knowledge 00–29 remains authoritative; deterministic operations become limitations or external operator steps.
- **What if the model changes silently?** Rerun T01–T38 and create a new calibration anchor.
- **What if the evidence universe is incomplete?** Structural provenance may pass, but semantic completeness remains unclaimed.

## 7. Selected synthesis: p3

The chosen branch retains Kimi’s substantive improvements while replacing its false receipts and operational assumptions.

### p3 invariants

- exactly 30 permanent Knowledge files;
- Instructions 3,906 characters ≤6000;
- six optional extensions;
- five separately installable judge Skills;
- 40 criteria, exactly eight per domain;
- 56 gate codes;
- 11 methods;
- T01–T38 continuous;
- strict blind = one fresh single-use Project per run;
- stable ties count as order-robust but never produce a winner;
- hard-failed/invalid runs excluded from study means;
- no formal winner, calibration or publication-grade claims by default.

## 8. Tests executed

### Static

- Knowledge 30/30;
- Instructions 3,906/6,000 characters;
- extensions 6/6;
- active version single and consistent;
- criteria 40, eight per domain;
- gates 56;
- methods 11;
- T01–T38 continuous;
- no stale beta.2, underscore criterion, `pass_count/34` or `memory_status: OFF` in active contract;
- five clean Skill packages with `SKILL.md` and `agents/openai.yaml`;
- no cache/symlink artifacts.

### Dynamic

1. tie/tie → `TIE_STABLE`, order robust, no winner, no false bias flag;
2. A/B swap flip → `INCONSISTENT_AS_TIE`;
3. hard-failed run excluded from study mean;
4. blind batch and sealed mapping written to separate files;
5. strict pack QC reports 40 criteria and T01–T38.

## 9. Residual uncertainty

- Live Projects retrieval and behavior are not tested here.
- T01–T38 has not been run with the selected Judge model.
- Reliability, inter-rater agreement and calibration are not measured.
- Strict-blind operational cost has not been benchmarked.
- Uploaded Skills may be scanned, blocked or require admin review.
- The judge cannot prove completeness of omitted evidence.
- Publication-grade and production scoring remain false.

## 10. Verdict

```yaml
Kimi_v3_4_uploaded:
  archive_integrity: PASS
  architectural_direction: PASS_WITH_FINDINGS
  version_and_receipts: FAIL
  strict_blind_operability: FAIL
  deterministic_skill_scripts: PARTIAL
  owner_acceptance: WITHHELD

p3_candidate:
  structural_qc: PASS
  dynamic_qc: PASS
  packaging_qc: PASS
  live_project_acceptance: NOT_RUN
  empirical_reliability: NOT_RUN
  owner_acceptance: PENDING
```

## ∆DΩΛ

∆: The Judge stack now distinguishes an attractive protocol description from an executable and correctly attested Projects package.

D: immutable inputs → archive/repository-independent diff → primary-source check → counterexample execution → p3 repair → clean package tests.

Ω: high for local artifact facts and reproduced script behavior; deliberately lower for live Projects behavior and empirical Judge validity.

Λ: revise after exact p3 ZIP Owner review and T01–T38 in a fresh single-use test Project.
