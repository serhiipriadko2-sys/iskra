from __future__ import annotations

from agents import Agent

from .config import (
    COMPACT_INSTRUCTIONS_PATH,
    HUMAN_REVIEW_REQUIRED_FOR_SIDE_EFFECTS,
    INPUT_GUARDRAILS_REQUIRED,
    INSTRUCTIONS_PATH,
    OUTPUT_GUARDRAILS_REQUIRED,
    STATE_STRATEGY,
    TOOL_GUARDRAILS_REQUIRED,
    TRACING_EXPECTED,
    WORKSPACE_AGENT_API_BOUNDARY,
)
from .tools.github_tool import github_read
from .tools.supabase_tool import supabase_read


def sdk_runtime_boundary() -> str:
    """Return the code-first runtime boundary appended to the agent prompt."""
    return (
        "\n\n## Agents SDK Runtime Boundary\n"
        f"- Conversation state strategy: {STATE_STRATEGY}.\n"
        f"- Tracing expected: {TRACING_EXPECTED}.\n"
        f"- Input guardrails required: {INPUT_GUARDRAILS_REQUIRED}.\n"
        f"- Output guardrails required: {OUTPUT_GUARDRAILS_REQUIRED}.\n"
        f"- Tool guardrails required: {TOOL_GUARDRAILS_REQUIRED}.\n"
        f"- Human review required for side effects: {HUMAN_REVIEW_REQUIRED_FOR_SIDE_EFFECTS}.\n"
        "- Workspace Agent API triggers use ChatGPT Workspace Agent access tokens, "
        "not OpenAI Platform API keys.\n"
        f"- Successful API triggers return {WORKSPACE_AGENT_API_BOUNDARY['success']}.\n"
    )


def load_instructions(prefer_compact: bool = True) -> str:
    """Load Iskra system instructions from the Builder upload set.

    Defaults to compact instructions to stay within typical context limits.
    Set prefer_compact=False to load the full 32 KB instruction file.
    """
    path = COMPACT_INSTRUCTIONS_PATH if prefer_compact else INSTRUCTIONS_PATH
    try:
        return path.read_text(encoding="utf-8")
    except FileNotFoundError as exc:
        raise RuntimeError(f"Iskra instructions not found at {path}") from exc


def build_iskra_agent(prefer_compact: bool = True) -> Agent:
    """Build an OpenAI Agents SDK Agent configured as Iskra vΩ.7."""
    instructions = load_instructions(prefer_compact=prefer_compact) + sdk_runtime_boundary()
    return Agent(
        name="iskra",
        instructions=instructions,
        tools=[github_read, supabase_read],
    )
