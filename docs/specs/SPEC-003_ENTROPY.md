# SPEC-003: Shannon Entropy Monitoring

> "Information is the resolution of uncertainty." - Shannon

## 1. Overview
This specification defines the implementation of **Shannon Entropy ($)** as a core metric for evaluating the "Information Density" of the dialogue stream in Iskra vΩ.5.0.

## 2. Mathematical Definition
Given a discrete random variable $ (the token stream) with possible outcomes , \dots, x_n$ (unique tokens) occurring with probabilities (x_1), \dots, P(x_n)$, the entropy is:

1263 H(X) = - \sum_{i=1}^{n} P(x_i) \log_2 P(x_i) 1263

## 3. Implementation Logic
### 3.1 Tokenization
- Input: String of user or system text.
- Process: Normalize (lowercase, remove punctuation) -> Split into unigrams or bigrams.

### 3.2 Probability Distribution
- Count frequency of each unique token.
- Calculate (x_i) = \frac{\text{count}(x_i)}{\text{total_tokens}}$.

### 3.3 Metric Interpretation
- **Low Entropy ( < 2.0$):** Repetition, Loop, Stagnation. Trigger: `Voice: ISKRA` (Synthesis) to introduce novelty.
- **High Entropy ( > 5.0$):** Chaos, Noise, Incoherence. Trigger: `Voice: SAM` (Structure) to impose order.
- **Optimal Zone (.0 < H < 4.5$):** Flow State.

## 4. Integration
- **Service:** `packages/math/entropy.ts`
- **Consumer:** `packages/engine/metricsService.ts` adds `H_index` to the 11D Metric Tensor.
