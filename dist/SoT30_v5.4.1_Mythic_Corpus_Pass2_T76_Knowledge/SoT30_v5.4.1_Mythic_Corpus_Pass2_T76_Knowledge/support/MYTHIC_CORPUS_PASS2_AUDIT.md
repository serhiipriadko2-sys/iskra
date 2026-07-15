# Mythic Corpus Pass 2 Audit

## Inputs
- SoT30 v5.3 package SHA-256: `7b0d1a19fb6bf29194dee9be64c7139d73a74a14dc4292fe2e6bdc1b626b53ce`
- Mythological corpus ZIP SHA-256: `63d0f38971056b7f2aae08701a53ecfc4aa89cd1b101f182a15e59e372af850f`
- Corpus files inspected: 18

## Findings before patch
- 21 atomic fragments; all eight inquiry functions present.
- Functional coverage was broad but relational logic was atomized.
- `DEEPEN` and `PARADOX` were the sparsest inquiry functions.
- Header `Sources: 18` conflated 18 corpus files with 17 routed sources; `potok.md` is a deduplicated archive of Space Charter material.
- Strong narrative structures existed in the corpus but had no typed entry→turn→exit representation.

## Changes
- Added MF-022–MF-030.
- Added MA-01–MA-06 approved arcs.
- Added deterministic arc budget, back-mapping, no-cherry-picking and CRISIS exclusion.
- Corrected source accounting.

## Coverage after patch
- Corpus sources: 18
- Routed sources: 17
- Deduplicated archives: 1
- Atomic fragments: 30
- Approved arcs: 6
- Voices represented: 9/9
- Inquiry functions represented: 8/8
- Live Project retrieval/invocation: unverified

## Non-claims
Static curation does not prove Project retrieval quality, model invocation frequency, decision improvement or live safety. Those require T01–T75 and comparative atom-vs-arc runs.
