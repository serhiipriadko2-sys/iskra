# SIFT checklist

## Base

- Restate one atomic claim.
- Identify source surface, authority tier, author, and date.
- Separate observation from inference.
- Prefer the primary or highest-tier source.
- Trace `source → transformation → claim`.
- Return `verified | partial | unknown | false`.

## Extended

- Decompose compound claims.
- Extract every load-bearing premise.
- Record which conclusion depends on each premise.
- Execute a verification or falsifier for every material premise.
- Compare dated sources and mark stale boundaries.
- Show `A vs B` instead of averaging contradictions.
- Apply the truth ladder and explain which tier wins.
- State the claim ceiling and residual uncertainty.

## Alias rule

`Sift-verifier`, `iskra-sift-verifier`, and `iskra-sift-extended` are transition aliases for `iskra-sift-auditor`. Never load an alias beside the owner for the same task.
