# Iskra Agents SDK Fallback

Status: `[HYP]` strategic fallback skeleton  
Scope: code-first agent runtime independent of ChatGPT Workspace Agents UI.

## Why This Exists

OpenAI has deprecated the visual Agent Builder / AgentKit path and is moving
toward Workspace Agents and the Agents SDK. This skeleton keeps Iskra runnable
as a local code-first fallback when the hosted UI is unavailable or unsuitable.

## Prerequisites

Verified local dependency: `openai-agents==0.17.6`.

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
