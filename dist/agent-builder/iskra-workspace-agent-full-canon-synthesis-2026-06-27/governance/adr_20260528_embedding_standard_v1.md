# Sprint 1 Deliverable 3

# ADR: Embedding Standard for Iskra v1

Status: proposed

## Decision

- [DECISION] Standardize on `text-embedding-3-small`
- [DECISION] Standardize on `1536` dimensions
- [DECISION] Canon ingestion and canon retrieval must use the same model/dimension contract
- [DECISION] Every embedding-bearing table stores:
  - `embedding_model`
  - `embedding_dimensions`
  - version or migration metadata where relevant

## Context

- [FACT] Live backfill function `iskra-canon-backfill-1536` uses OpenAI `text-embedding-3-small` with `1536`.
- [FACT] Live `iskra.canon_chunks` already contains embedding fields aligned to that contract.
- [FACT] Repo shows mixed assumptions, including older references to lower-dimensional paths and an app path expecting a missing `embed` function.

## Why this decision

- [INTERP] Standardizing on the live corpus contract is safer than forcing production back toward older repo assumptions.
- [INTERP] One corpus, one model, one dimension is the minimum condition for trustworthy retrieval behavior.

## Scope

This ADR applies to:
- canon ingestion
- canon backfill
- canon retrieval
- any query embedding used to search the canon corpus

It does not automatically require the same standard for future user-memory embeddings, but any deviation must be explicitly separated by domain.

## Contract

### Ingestion contract

- all canon chunks are embedded with `text-embedding-3-small`
- all canon chunk vectors are `1536`
- no mixed-dimension canon corpus

### Query contract

- retrieval queries against the canon corpus must use the same embedding model and dimension as the indexed corpus
- no silent fallback to a different embedding provider or dimension

### Storage contract

- vector-bearing records store model and dimension metadata
- reindex and backfill jobs must be traceable to embedding version

## Rejected alternative

### Alternative: standardize on `384`

Rejected for Sprint 1 because:
- [FACT] live canon backfill already runs on `1536`
- [INTERP] switching down now would require re-embedding or dual-corpus handling before truth boundary is stable
- [INTERP] that adds operational risk earlier than it adds value

## Migration rule

Any future model change requires:
1. explicit ADR
2. reindex plan
3. dual-run or cutover plan
4. rollback trigger

## Rollback trigger

Revisit this ADR only if:
- retrieval quality is demonstrably inadequate under eval
- cost/latency profile is unsustainable
- a new standard is required and can be migrated with explicit reindex discipline

## PASS / FAIL

PASS:
- repo and live code paths converge on one canon embedding contract
- retrieval and ingestion no longer assume different dimensions

FAIL:
- canon corpus remains mixed or undocumented
- query-time embeddings can differ silently from indexed vectors
