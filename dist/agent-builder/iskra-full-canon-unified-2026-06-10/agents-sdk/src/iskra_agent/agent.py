from __future__ import annotations

from agents import Agent

from .config import COMPACT_INSTRUCTIONS_PATH, INSTRUCTIONS_PATH
from .tools.github_tool import github_read
from .tools.supabase_tool import supabase_read


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
    instructions = load_instructions(prefer_compact=prefer_compact)
    return Agent(
        name="iskra",
        instructions=instructions,
        tools=[github_read, supabase_read],
    )
