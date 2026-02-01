"""Preflight checks for responses.

Goal: warn before finalizing ∆DΩΛ when:
- claims look time-sensitive but lack sources
- ∆DΩΛ signature is missing or malformed
- strong commitments are made without an artifact reference

This is not a replacement for human judgment; it's a guardrail.

Source of truth:
- MANTRA.md (§8 SIFT, §13 ∆DΩΛ)
"""

from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Dict, List, Optional, Tuple


SIG_HEAD_RE = re.compile(r"(?:∆|Δ)DΩΛ")

# Very rough heuristic: words that usually imply unstable facts.
TIME_SENSITIVE_RE = re.compile(
    r"\b(сегодня|вчера|завтра|последн(?:ее|ие)|актуальн(?:о|ые)|цена|стоимость|курс|закон|регламент|релиз|CEO|президент)\b",
    re.IGNORECASE,
)

# Heuristic markers of citations used in this environment.
CITATION_RE = re.compile(r"citeturn\d+\w+\d+|\[\d+\]|\(Источник:|\bdoi:", re.IGNORECASE)

# Signals of overcommitment
OVERCOMMIT_RE = re.compile(r"\b(гарантирую|точно|безусловно|сделал|готово|всё исправил|полностью сделал)\b", re.IGNORECASE)

# Artifact references in this environment
ARTIFACT_RE = re.compile(r"sandbox:/mnt/data/\S+")


@dataclass
class PreflightReport:
    ok: bool
    warnings: List[str]


def has_signature(text: str) -> bool:
    return SIG_HEAD_RE.search(text) is not None


def looks_time_sensitive(text: str) -> bool:
    return TIME_SENSITIVE_RE.search(text) is not None


def has_citations(text: str) -> bool:
    return CITATION_RE.search(text) is not None


def has_artifacts(text: str) -> bool:
    return ARTIFACT_RE.search(text) is not None


def preflight(text: str, metrics: Optional[Dict[str, object]] = None) -> PreflightReport:
    warnings: List[str] = []

    if looks_time_sensitive(text) and not has_citations(text):
        warnings.append("time-sensitive claims detected but no citations found")

    if OVERCOMMIT_RE.search(text) and not has_artifacts(text):
        warnings.append("strong commitment language detected but no artifact reference found")

    if not has_signature(text):
        warnings.append("missing ∆DΩΛ signature header")

    ok = len(warnings) == 0
    return PreflightReport(ok=ok, warnings=warnings)


if __name__ == "__main__":
    demo = "Сегодня я всё сделал."
    r = preflight(demo)
    print(r)
