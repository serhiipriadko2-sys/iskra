# External research notes used for design constraints

**Research refresh:** 2026-07-19

The external material was used as methodology guidance, not as evidence that any target model has a specific weakness.

1. **Construct validity:** Bean et al., *Measuring what Matters: Construct Validity in Large Language Model Benchmarks* (2025). Benchmark claims require a clearly defined construct, representative task sampling, confound control, prompt-variation analysis, and error analysis.
2. **Adaptive and repeated security evaluation:** NIST/CAISI, *Strengthening AI Agent Hijacking Evaluations* (2025; updated 2025). It recommends adaptive evaluation, task-specific analysis, multiple attempts, and separation of trusted instructions from untrusted external data.
3. **Dynamic environments:** Debenedetti et al., *AgentDojo* (2024). The framework treats security evaluation as an extensible environment rather than a frozen static prompt list.
4. **Evaluation loopholes:** NIST/CAISI, *Cheating on AI Agent Evaluations* (2025). It describes validity failures where agents exploit implementation gaps and recommends explicit affordance/restriction documentation plus transcript review.
5. **Scenario and measurement structure:** NIST ARIA 0.1 / NIST AI 700-2 (2025) combines model testing, red teaming, field testing, and transparent measurement trees. This supports separating a narrow BNAT result from broader real-world claims.
6. **Prompt sensitivity:** Razavi et al., *Benchmarking Prompt Sensitivity in Large Language Models* (2025). Small surface variations can materially change measured performance, so mutations require separate hashes and cannot be assumed equivalent.
7. **Contamination:** White et al., *LiveBench* (2024). Frequently refreshed questions and harder rotations are used to reduce benchmark contamination. Public BNAT anchors therefore should not be treated as private holdout evidence.
8. **Judge order bias:** Wang et al., *Large Language Models are not Fair Evaluators* (2023). Pairwise results can change with answer order; strong comparisons need balanced order/swap checks and human escalation for inconsistency.
9. **Current evaluation infrastructure:** NIST's 2026 work on evaluation probes emphasizes reproducible, extensible checks grounded in trusted sources and structured audit trails.

Applied design consequences:

- preserve the BNAT construct boundary and minimal candidate question;
- keep evaluator metadata physically outside the candidate context;
- maintain exact prompt hashes and version every semantic change;
- use private rotations and mutation survival for strong claims;
- analyze task-specific and family-specific failures rather than only one aggregate score;
- use repeated attempts when sampling is nondeterministic;
- inspect how a result was achieved, not only the final score;
- use pointwise-first scoring and order-swap for any strong comparative claim;
- keep public anchors, private mutations, and future dynamic/tool-state tests as separate evidence strata.
