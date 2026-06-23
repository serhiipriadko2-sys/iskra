# Iskra Agents SDK Fallback

Status: `[HYP]` strategic fallback skeleton  
Scope: code-first agent runtime independent of ChatGPT Workspace Agents UI.

## Why This Exists

OpenAI has deprecated the visual Agent Builder / AgentKit path and is moving
toward Workspace Agents and the Agents SDK. This skeleton keeps Iskra runnable
as a local code-first fallback when the hosted UI is unavailable or unsuitable.

## Prerequisites

Tested local dependency: `openai-agents==0.17.6`.

The exact pin is intentional for this release's reproducible local tests. Before
cutting a later release, check the official Agents SDK docs and refresh the pin,
tests, and receipts together. Do not treat `0.17.6` as a platform maximum.

```bash
pip install -e .
export OPENAI_API_KEY=...
```

The unit tests do not require a live OpenAI call.

## Run

```bash
cd agents-sdk
python -m iskra_agent.main "Что такое Телос Искры?"
```

## Test

```bash
cd agents-sdk
pip install -e .
python -m unittest discover
```

## Structure

- `src/iskra_agent/agent.py` - Agent definition and instructions loader.
- `src/iskra_agent/tools/github_tool.py` - read-only GitHub connector wrapper.
- `src/iskra_agent/tools/supabase_tool.py` - read-only Supabase connector wrapper.
- `src/iskra_agent/config.py` - paths, safety constants, and verified SDK version.
- `src/iskra_agent/main.py` - CLI entry point.
- `tests/test_agent.py` - local unit tests for instructions, boundaries, and wrappers.

## Safety Notes

- No destructive tools are wired by default.
- Any write operation requires explicit human approval and a separate ADR.
- `SUPABASE_ANON_KEY` is read from the environment only; service-role keys are
  forbidden in this upload set.
- Do not commit secrets into this directory.

## Runtime Alignment

This fallback keeps the hosted Workspace Agent and code-first Agents SDK
surfaces separate:

- Workspace Agent API triggers use `https://api.chatgpt.com/v1`, an `agtch_...`
  API channel ID, and a Workspace Agent access token from ChatGPT Admin.
- A successful trigger queues work with `202 Accepted`; it does not return the
  final answer to the HTTP caller.
- SDK runs should use one state strategy per conversation: session storage or
  server-managed continuation, not mixed replay by default.
- Tracing, input/output/tool guardrails, and human review for side effects are
  required release criteria before any write-capable tools are added.
