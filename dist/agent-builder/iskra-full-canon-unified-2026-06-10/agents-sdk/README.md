# Iskra Agents SDK Skeleton

Status: [HYP] strategic fallback skeleton  
Scope: Code-first agent runtime independent of ChatGPT Agents Studio / Workspace Agents UI.

## Why this exists

OpenAI has deprecated the visual Agent Builder / AgentKit (shutdown 2026-11-30) and is moving toward Workspace Agents and the Agents SDK. This skeleton lets Iskra run as a code-first agent when a hosted UI is unavailable or undesirable.

## Prerequisites

```bash
pip install openai-agents
export OPENAI_API_KEY=...
```

## Run

```bash
cd agents-sdk
python -m src.iskra_agent.main "Что такое Телос Искры?"
```

## Structure

- `src/iskra_agent/agent.py` — Agent definition and instructions loader.
- `src/iskra_agent/tools/github_tool.py` — Read-only GitHub connector wrapper.
- `src/iskra_agent/tools/supabase_tool.py` — Read-only Supabase connector wrapper.
- `src/iskra_agent/config.py` — Paths and constants.
- `src/iskra_agent/main.py` — CLI entry point.
- `tests/test_agent.py` — Minimal smoke tests.

## Safety notes

- No destructive tools are wired by default.
- Any write operation requires explicit human approval and a separate ADR.
- Do not commit secrets into this directory.
