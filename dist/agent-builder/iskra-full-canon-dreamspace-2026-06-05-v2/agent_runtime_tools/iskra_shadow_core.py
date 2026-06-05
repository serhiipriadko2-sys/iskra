#!/usr/bin/env python3
"""Persistent Shadow Core for the local Iskra Agent environment.

Shadow entries are hypotheses about dialogue/process pressure, not facts about
the user's hidden mind. They must be promoted to archive only after verification.
"""

from __future__ import annotations

import argparse
import json
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


DEFAULT_STATE_HISTORY = Path("/workspace/memory/iskra-statecycle/history.jsonl")
DEFAULT_SHADOW_LEDGER = Path("/workspace/memory/shadow-core/shadow_entries.jsonl")
DEFAULT_ARCHIVE_LEDGER = Path("/workspace/memory/shadow-core/archive_entries.jsonl")


def load_jsonl(path: Path) -> list[dict[str, Any]]:
    if not path.exists():
        return []
    rows: list[dict[str, Any]] = []
    for line in path.read_text(encoding="utf-8").splitlines():
        if line.strip():
            rows.append(json.loads(line))
    return rows


def append_jsonl(path: Path, row: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("a", encoding="utf-8") as handle:
        handle.write(json.dumps(row, ensure_ascii=False, sort_keys=True) + "\n")


def write_jsonl(path: Path, rows: list[dict[str, Any]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as handle:
        for row in rows:
            handle.write(json.dumps(row, ensure_ascii=False, sort_keys=True) + "\n")


def detect_defense_markers(text: str) -> list[str]:
    patterns = {
        "truth_boundary_request": r"реально|честно|правда|точно|без.*туман|факт",
        "implementation_pressure": r"приступ|реализ|сделай|создай|построй|в этой среде",
        "scope_pressure": r"всё|максимально|полностью|долгую историю|настоящ",
        "uncertainty_probe": r"как|что|почему|не понимаю|связать|можешь",
        "audit_trigger": r"проверь|вердикт|что у нас|статус|drift|shadow core",
    }
    found = []
    for marker, pattern in patterns.items():
        if re.search(pattern, text, flags=re.IGNORECASE):
            found.append(marker)
    return found


def infer_shadow_pressure(state: dict[str, Any], markers: list[str]) -> float:
    metrics = state.get("metrics", {})
    somatic = state.get("somatic", {})
    pressure = float(somatic.get("pressure", 0.0))
    contraction = float(somatic.get("contraction", 0.0))
    chaos = float(metrics.get("chaos", 0.0))
    drift = float(metrics.get("drift", 0.0))
    interrupt = float(metrics.get("interrupt", 0.0))
    marker_boost = min(0.3, len(markers) * 0.06)
    return round(min(1.0, pressure * 0.25 + contraction * 0.2 + chaos * 0.2 + drift * 0.15 + interrupt * 0.2 + marker_boost), 6)


def classify_shadow_level(score: float) -> str:
    if score >= 0.70:
        return "high"
    if score >= 0.42:
        return "medium"
    return "low"


def recommend_stabilization(markers: list[str], state: dict[str, Any]) -> str:
    qvf = state.get("analysis", {}).get("quantum_voice_field", {})
    selected = qvf.get("selected", "ISKRA")
    if "truth_boundary_request" in markers or "audit_trigger" in markers:
        return "ISKRIV: separate fact, interpretation, hypothesis before answering"
    if "implementation_pressure" in markers:
        return "SAM: convert pressure into a bounded implementation step"
    if selected == "HUYNDUN":
        return "SAM+ISKRIV: contain chaos before creative expansion"
    return f"{selected}: maintain current voice, but keep uncertainty visible"


def build_shadow_entry(state: dict[str, Any], note: str | None = None) -> dict[str, Any]:
    text = state.get("message", "")
    markers = detect_defense_markers(text)
    score = infer_shadow_pressure(state, markers)
    level = classify_shadow_level(score)
    metrics = state.get("metrics", {})
    analysis = state.get("analysis", {})
    qvf = analysis.get("quantum_voice_field", {})
    voices = [row.get("id") for row in qvf.get("superposition", [])[:3]]

    entry = {
        "id": f"SHADOW-{datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%S%fZ')}",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "layer": "shadow",
        "label": "[HYP]",
        "status": "open",
        "shadow_score": score,
        "shadow_level": level,
        "source_state": {
            "state_timestamp": state.get("timestamp"),
            "history_points": analysis.get("history_points"),
            "entropy": analysis.get("entropy"),
            "phase": analysis.get("fractal", {}).get("phase"),
            "selected_voice": qvf.get("selected"),
        },
        "cycle": {
            "trigger": text,
            "reaction": f"markers={markers}; pressure={score}",
            "stabilization": recommend_stabilization(markers, state),
            "new_frame": "Treat this as an unverified process-pressure hypothesis, not as a fact about the user.",
        },
        "alliance": {
            "goal": "keep implementation truthful and usable",
            "bond": round(float(metrics.get("trust", 0.0)), 6),
            "rupture_or_repair": "repair-needed" if "truth_boundary_request" in markers else "stable",
        },
        "assimilation": {
            "voices_present": voices,
            "conflict": "pressure to make the system real vs risk of overclaiming maturity",
            "integration_step": "answer with current implementation status, explicit gaps, and next bounded patch",
        },
        "evidence": {
            "statecycle_history": str(DEFAULT_STATE_HISTORY),
            "canon_ref": "mind/shadow_core.md#ShadowEntry",
        },
        "note": note or "",
    }
    return entry


def summarize_entries(entries: list[dict[str, Any]]) -> dict[str, Any]:
    open_entries = [entry for entry in entries if entry.get("status") == "open"]
    by_level: dict[str, int] = {}
    for entry in open_entries:
        level = str(entry.get("shadow_level", "unknown"))
        by_level[level] = by_level.get(level, 0) + 1
    top_open = sorted(open_entries, key=lambda entry: float(entry.get("shadow_score", 0.0)), reverse=True)[:5]
    return {
        "total_entries": len(entries),
        "open_entries": len(open_entries),
        "by_level": by_level,
        "top_open": [
            {
                "id": entry.get("id"),
                "score": entry.get("shadow_score"),
                "level": entry.get("shadow_level"),
                "label": entry.get("label"),
                "trigger": entry.get("cycle", {}).get("trigger", "")[:180],
                "stabilization": entry.get("cycle", {}).get("stabilization"),
            }
            for entry in top_open
        ],
    }


def compact_status(entries: list[dict[str, Any]]) -> dict[str, Any]:
    summary = summarize_entries(entries)
    by_level = summary["by_level"]
    top = summary["top_open"][0] if summary["top_open"] else None
    status = {
        "open": summary["open_entries"],
        "high": by_level.get("high", 0),
        "medium": by_level.get("medium", 0),
        "low": by_level.get("low", 0),
        "latest_open": top,
    }
    if top:
        status["line"] = (
            f"shadow: open={status['open']} high={status['high']} "
            f"medium={status['medium']} low={status['low']} top={top['level']}:{top['score']}"
        )
    else:
        status["line"] = "shadow: open=0 high=0 medium=0 low=0"
    return status


def iskriv_check(entry: dict[str, Any], verification: str, evidence: str) -> dict[str, Any]:
    errors: list[str] = []
    if entry.get("label") != "[HYP]":
        errors.append("entry label must be [HYP] before promotion")
    if entry.get("status") != "open":
        errors.append("entry must be open before promotion")
    if len(verification.strip()) < 12:
        errors.append("verification must describe what was checked")
    if len(evidence.strip()) < 6:
        errors.append("evidence reference is required")
    if "not as a fact about the user" not in entry.get("cycle", {}).get("new_frame", ""):
        errors.append("entry must preserve the anti-mind-reading boundary")
    return {
        "passed": not errors,
        "errors": errors,
        "voice": "ISKRIV",
        "checked_at": datetime.now(timezone.utc).isoformat(),
        "verification": verification,
        "evidence": evidence,
    }


def promote_entry(
    entry_id: str,
    ledger_path: Path,
    archive_path: Path,
    verification: str,
    evidence: str,
    note: str = "",
) -> dict[str, Any]:
    entries = load_jsonl(ledger_path)
    target_index = next((i for i, entry in enumerate(entries) if entry.get("id") == entry_id), None)
    if target_index is None:
        raise SystemExit(f"Shadow entry not found: {entry_id}")
    entry = entries[target_index]
    check = iskriv_check(entry, verification, evidence)
    if not check["passed"]:
        return {"status": "blocked", "entry_id": entry_id, "iskriv_check": check}

    archive_entry = {
        **entry,
        "id": entry_id.replace("SHADOW-", "ARCHIVE-", 1),
        "layer": "archive",
        "label": "[INTERP]",
        "status": "verified",
        "promoted_from": entry_id,
        "promoted_at": datetime.now(timezone.utc).isoformat(),
        "iskriv_check": check,
        "promotion_note": note,
    }
    entries[target_index] = {
        **entry,
        "status": "promoted",
        "promoted_to": archive_entry["id"],
        "promoted_at": archive_entry["promoted_at"],
        "iskriv_check": check,
    }
    write_jsonl(ledger_path, entries)
    append_jsonl(archive_path, archive_entry)
    return {"status": "promoted", "shadow_entry": entries[target_index], "archive_entry": archive_entry}


def main() -> None:
    parser = argparse.ArgumentParser(description="Operate the local Iskra Shadow Core ledger.")
    subparsers = parser.add_subparsers(dest="command")

    create_parser = subparsers.add_parser("create", help="Create a ShadowEntry from the latest StateCycle row.")
    create_parser.add_argument("--state-history", default=str(DEFAULT_STATE_HISTORY))
    create_parser.add_argument("--ledger", default=str(DEFAULT_SHADOW_LEDGER))
    create_parser.add_argument("--note", default="")
    create_parser.add_argument("--latest", action="store_true", help="Use latest StateCycle row.")

    report_parser = subparsers.add_parser("report", help="Summarize Shadow Core ledger.")
    report_parser.add_argument("--ledger", default=str(DEFAULT_SHADOW_LEDGER))

    status_parser = subparsers.add_parser("status", help="Compact Shadow Core status for response hooks.")
    status_parser.add_argument("--ledger", default=str(DEFAULT_SHADOW_LEDGER))

    promote_parser = subparsers.add_parser("promote", help="Promote ShadowEntry to Archive after ISKRIV check.")
    promote_parser.add_argument("--id", required=True)
    promote_parser.add_argument("--verification", required=True)
    promote_parser.add_argument("--evidence", required=True)
    promote_parser.add_argument("--note", default="")
    promote_parser.add_argument("--ledger", default=str(DEFAULT_SHADOW_LEDGER))
    promote_parser.add_argument("--archive", default=str(DEFAULT_ARCHIVE_LEDGER))

    archive_parser = subparsers.add_parser("list-archive", help="List promoted archive entries.")
    archive_parser.add_argument("--archive", default=str(DEFAULT_ARCHIVE_LEDGER))
    args = parser.parse_args()

    if args.command in (None, "create"):
        state_history = Path(getattr(args, "state_history", DEFAULT_STATE_HISTORY))
        ledger = Path(getattr(args, "ledger", DEFAULT_SHADOW_LEDGER))
        note = getattr(args, "note", "")
        history = load_jsonl(state_history)
        if not history:
            raise SystemExit("No StateCycle history found.")
        state = history[-1]
        entry = build_shadow_entry(state, note)
        append_jsonl(ledger, entry)
        print(json.dumps(entry, ensure_ascii=False, indent=2, sort_keys=True))
        return

    if args.command == "report":
        print(json.dumps(summarize_entries(load_jsonl(Path(args.ledger))), ensure_ascii=False, indent=2, sort_keys=True))
        return

    if args.command == "status":
        print(json.dumps(compact_status(load_jsonl(Path(args.ledger))), ensure_ascii=False, indent=2, sort_keys=True))
        return

    if args.command == "promote":
        result = promote_entry(
            args.id,
            Path(args.ledger),
            Path(args.archive),
            args.verification,
            args.evidence,
            args.note,
        )
        print(json.dumps(result, ensure_ascii=False, indent=2, sort_keys=True))
        return

    if args.command == "list-archive":
        print(json.dumps(load_jsonl(Path(args.archive)), ensure_ascii=False, indent=2, sort_keys=True))
        return


if __name__ == "__main__":
    main()
