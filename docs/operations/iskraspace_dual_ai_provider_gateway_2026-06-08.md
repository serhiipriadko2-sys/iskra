# IskraSpace Dual AI Provider Gateway - 2026-06-08

> Historical decision — superseded on 2026-07-28 by
> `ADR-20260728-001`. The production source no longer accepts a browser or
> request-controlled provider, OpenAI fallback, or arbitrary model selection.
> This file is retained as provenance and must not be used as the current
> deployment runbook.

## Context

`runtime/iskraSpace` previously used a single Supabase Edge Function named
`gemini` for generation, streaming, and embeddings. The frontend kept provider
keys out of Vite by sending signed Supabase requests to the Edge Function.

This document records the repo-side plan and implementation boundary for
keeping Gemini while adding OpenAI as an optional second provider. No live
Supabase mutation is included in this repository change.

## Decision

Keep the public frontend API stable:

- `runtime/iskraSpace/services/geminiService.ts` remains the app-facing import.
- The frontend may set `VITE_AI_PROVIDER=gemini|openai|auto`.
- The default provider remains `gemini`.
- Provider API keys stay server-side in Supabase Edge Function secrets.
- The Edge Function slug remains `gemini` by default; `VITE_AI_EDGE_FUNCTION_SLUG`
  is a generic alias, with legacy Gemini slug aliases still supported.

The `gemini` Edge Function now routes:

| Provider | Generate | Stream | Embeddings |
| --- | --- | --- | --- |
| Gemini | `@google/genai` `generateContent` | Native Gemini stream chunks | Gemini `embedContent` |
| OpenAI | `POST /v1/responses` | Single compatible SSE chunk in this first pass | `POST /v1/embeddings` |

## Server Environment

Gemini default:

```text
AI_PROVIDER=gemini
GEMINI_API_KEY=...
```

OpenAI optional:

```text
AI_PROVIDER=openai
OPENAI_API_KEY=...
OPENAI_TEXT_MODEL=gpt-5
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
```

Hybrid fallback example:

```text
AI_PROVIDER=openai
AI_FALLBACK_PROVIDER=gemini
OPENAI_API_KEY=...
GEMINI_API_KEY=...
```

Client-safe Vite selectors:

```text
VITE_AI_PROVIDER=gemini
VITE_AI_EDGE_FUNCTION_SLUG=gemini
```

## Evidence

- Repository source: `runtime/iskraSpace/services/geminiService.ts`.
- Repository source: `runtime/iskraSpace/supabase/functions/gemini/index.ts`.
- OpenAI Responses API reference: `POST /v1/responses`.
- OpenAI embeddings reference: `POST /v1/embeddings`.
- OpenAI embedding model reference: `text-embedding-3-small`.

## Security Boundary

- No provider key is accepted from Vite or browser payload.
- Error messages may mention missing env var names, but must not print secret values.
- Supabase `verify_jwt=true` for the live `gemini` function remains release-required.
- Live deployment requires explicit approval and a fresh read-only baseline.

## Rollout Plan

1. Merge repo-side dual-provider code and docs.
2. Refresh Supabase read-only function baseline.
3. Decide provider mode:
   - `gemini` for current production parity,
   - `openai` for OpenAI-only test,
   - `openai` + `gemini` fallback for hybrid.
4. Configure Edge Function secrets in Supabase.
5. Deploy the `gemini` function only after approval.
6. Smoke test:
   - generation,
   - streaming,
   - embeddings,
   - fallback behavior with one provider key intentionally absent in staging.

## Acceptance

- Default Gemini behavior remains compatible.
- OpenAI can be selected without exposing `OPENAI_API_KEY` to the frontend.
- Embeddings still return `{ embedding: { values: number[] } }` to the app.
- No live Supabase mutation happens in this PR.

## Delta

Delta: IskraSpace now has a repo-side dual-provider AI gateway.
D: repo Edge Function source, frontend proxy source, official OpenAI API references.
Omega: 0.82 before live Supabase deploy; runtime proof still requires staged Edge Function smoke.
Lambda: revise if OpenAI model defaults change, live Supabase source drifts, or public release target stops using `runtime/iskraSpace`.
