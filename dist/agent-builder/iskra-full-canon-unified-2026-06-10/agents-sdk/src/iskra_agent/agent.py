from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Mapping


@dataclass(frozen=True)
class AgentResult:
    status: str
    message: str
    evidence: list[str] = field(default_factory=list)


class IskraAgent:
    """Small local runtime shell for future Codex Desktop activation."""

    def __init__(self, *, name: str = "Искра vΩ.7 — Full Canon") -> None:
        self.name = name

    def inspect(self, context: Mapping[str, Any] | None = None) -> AgentResult:
        if context is None:
            context = {}
        source = str(context.get("source", "unknown"))
        if source == "chat":
            return AgentResult("PARTIAL", "Chat context is continuity, not source of truth.", ["truth-ladder"])
        return AgentResult("PASS", "Context accepted as data; verify stronger sources before mutation.", [source])
