#!/usr/bin/env python3
"""Persistent Dreamspace ledger for the local Iskra Agent environment.

Dreamspace is a hypothesis lab. Entries are always [HYP] until crystallized.
Crystallization does not make a hypothesis true; it routes the hypothesis into
shadow, archive, or adr_draft with an explicit verification boundary.
"""

from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


DEFAULT_DREAM_LEDGER = Path("/workspace/memory/dreamspace/dream_entries.jsonl")
DEFAULT_CRYSTAL_LEDGER = Path("/workspace/memory/dreamspace/crystal_entries.jsonl")
DEFAULT_SHADOW_LEDGER = Path("/workspace/memory/shadow-core/shadow_entries.jsonl")
DEFAULT_ARCHIVE_LEDGER = Path("/workspace/memory/shadow-core/archive_entries.jsonl")
DEFAULT_ADR_DRAFT_LEDGER = Path("/workspace/memory/dreamspace/adr_drafts.jsonl")
CANON_REF = "/workspace/iskra-main/mind/dreamspace.md"

VALID_VOICES = {
    "ISKRA",
    "SAM",
    "KAIN",
    "ISKRIV",
    "MAKI",
    "ANHANTRA",
    "HUYNDUN",
    "PINO",
    "SIBYL",
    "MIXED",
}


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


def validate_adoml(value: str) -> list[str]:
    errors: list[str] = []
    for token in ("∆", "D", "Ω", "Λ"):
        if token not in value:
            errors.append(f"missing {token} in ∆DΩΛ")
    return errors


def validate_required(goal: str, voice: str, constraint: str, hypothesis: str, risk: str, adoml: str) -> list[str]:
    errors: list[str] = []
    fields = {
        "goal": goal,
        "voice": voice,
        "constraint": constraint,
        "hypothesis": hypothesis,
        "risk": risk,
        "adoml": adoml,
    }
    for name, value in fields.items():
        if not value or len(value.strip()) < 3:
            errors.append(f"{name} is required")
    if voice.upper() not in VALID_VOICES:
        errors.append(f"voice must be one of: {', '.join(sorted(VALID_VOICES))}")
    errors.extend(validate_adoml(adoml))
    return errors


def create_dream(goal: str, voice: str, constraint: str, hypothesis: str, risk: str, adoml: str, note: str = "") -> dict[str, Any]:
    errors = validate_required(goal, voice, constraint, hypothesis, risk, adoml)
    if errors:
        return {"status": "blocked", "errors": errors}
    now = datetime.now(timezone.utc).isoformat()
    entry = {
        "id": f"DREAM-{datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%S%fZ')}",
        "timestamp": now,
        "layer": "dream",
        "label": "[HYP]",
        "status": "open",
        "goal": goal,
        "voice": voice.upper(),
        "constraint": constraint,
        "hypothesis": hypothesis,
        "risk": risk,
        "adoml": adoml,
        "note": note,
        "evidence": {
            "canon_ref": CANON_REF,
            "rule": "Dreamspace does not become canon by itself.",
        },
    }
    return {"status": "created", "dream": entry}


def summarize_dreams(entries: list[dict[str, Any]]) -> dict[str, Any]:
    open_entries = [entry for entry in entries if entry.get("status") == "open"]
    by_voice: dict[str, int] = {}
    for entry in open_entries:
        voice = str(entry.get("voice", "UNKNOWN"))
        by_voice[voice] = by_voice.get(voice, 0) + 1
    return {
        "total_entries": len(entries),
        "open_entries": len(open_entries),
        "by_voice": by_voice,
        "top_open": [
            {
                "id": entry.get("id"),
                "voice": entry.get("voice"),
                "goal": entry.get("goal"),
                "hypothesis": str(entry.get("hypothesis", ""))[:180],
                "risk": str(entry.get("risk", ""))[:180],
            }
            for entry in open_entries[-5:]
        ],
        "line": f"dreamspace: total={len(entries)} open={len(open_entries)} voices={by_voice}",
    }


def compact_status(entries: list[dict[str, Any]]) -> dict[str, Any]:
    summary = summarize_dreams(entries)
    latest_open = summary["top_open"][-1] if summary["top_open"] else None
    status = {
        "total": summary["total_entries"],
        "open": summary["open_entries"],
        "by_voice": summary["by_voice"],
        "latest_open": latest_open,
    }
    if latest_open:
        status["line"] = (
            f"dreamspace: open={status['open']} total={status['total']} "
            f"latest={latest_open['voice']}:{latest_open['id']}"
        )
    else:
        status["line"] = f"dreamspace: open=0 total={status['total']}"
    return status


def find_open_dream(entries: list[dict[str, Any]], dream_id: str) -> tuple[int | None, dict[str, Any] | None]:
    for index, entry in enumerate(entries):
        if entry.get("id") == dream_id:
            return index, entry
    return None, None


def crystallize(
    dream_id: str,
    target: str,
    verification: str,
    evidence: str,
    note: str,
    dream_ledger: Path,
    crystal_ledger: Path,
    shadow_ledger: Path,
    archive_ledger: Path,
    adr_ledger: Path,
) -> dict[str, Any]:
    target = target.lower()
    if target not in {"shadow", "archive", "adr_draft"}:
        return {"status": "blocked", "errors": ["target must be shadow, archive, or adr_draft"]}
    if len(verification.strip()) < 12:
        return {"status": "blocked", "errors": ["verification must describe what was checked"]}
    if len(evidence.strip()) < 6:
        return {"status": "blocked", "errors": ["evidence is required"]}

    dreams = load_jsonl(dream_ledger)
    index, dream = find_open_dream(dreams, dream_id)
    if index is None or dream is None:
        return {"status": "blocked", "errors": [f"dream not found: {dream_id}"]}
    if dream.get("status") != "open":
        return {"status": "blocked", "errors": ["dream must be open before crystallization"]}
    if dream.get("label") != "[HYP]":
        return {"status": "blocked", "errors": ["dream label must remain [HYP] before crystallization"]}

    now = datetime.now(timezone.utc).isoformat()
    check = {
        "voice": "ISKRIV",
        "passed": True,
        "checked_at": now,
        "verification": verification,
        "evidence": evidence,
        "boundary": "Crystallization routes the hypothesis; it does not prove the hypothesis true.",
    }
    crystal = {
        "id": dream_id.replace("DREAM-", "CRYSTAL-", 1),
        "timestamp": now,
        "source": dream,
        "target": target,
        "status": "crystallized",
        "label": "[HYP]" if target in {"shadow", "adr_draft"} else "[INTERP]",
        "iskriv_check": check,
        "note": note,
    }
    dreams[index] = {
        **dream,
        "status": "crystallized",
        "crystallized_to": target,
        "crystallized_at": now,
        "crystal_id": crystal["id"],
        "iskriv_check": check,
    }
    write_jsonl(dream_ledger, dreams)
    append_jsonl(crystal_ledger, crystal)

    routed = route_crystal(crystal, target, shadow_ledger, archive_ledger, adr_ledger)
    return {"status": "crystallized", "dream": dreams[index], "crystal": crystal, "routed": routed}


def route_crystal(crystal: dict[str, Any], target: str, shadow_ledger: Path, archive_ledger: Path, adr_ledger: Path) -> dict[str, Any]:
    dream = crystal["source"]
    if target == "shadow":
        entry = {
            "id": crystal["id"].replace("CRYSTAL-", "SHADOW-DREAM-", 1),
            "timestamp": crystal["timestamp"],
            "layer": "shadow",
            "label": "[HYP]",
            "status": "open",
            "shadow_score": 0.42,
            "shadow_level": "medium",
            "cycle": {
                "trigger": dream["hypothesis"],
                "reaction": f"dream risk: {dream['risk']}",
                "stabilization": "ISKRIV: verify before archive or canon promotion",
                "new_frame": "Dream hypothesis moved to Shadow for pressure/audit tracking.",
            },
            "alliance": {
                "goal": dream["goal"],
                "bond": None,
                "rupture_or_repair": "unknown",
            },
            "assimilation": {
                "voices_present": [dream["voice"], "ISKRIV"],
                "conflict": dream["risk"],
                "integration_step": "audit the dream hypothesis before reuse",
            },
            "evidence": crystal["iskriv_check"],
            "note": crystal.get("note", ""),
        }
        append_jsonl(shadow_ledger, entry)
        return {"ledger": str(shadow_ledger), "entry": entry}

    if target == "archive":
        entry = {
            "id": crystal["id"].replace("CRYSTAL-", "ARCHIVE-DREAM-", 1),
            "timestamp": crystal["timestamp"],
            "layer": "archive",
            "label": "[INTERP]",
            "status": "verified",
            "promoted_from": dream["id"],
            "goal": dream["goal"],
            "voice": dream["voice"],
            "hypothesis": dream["hypothesis"],
            "risk": dream["risk"],
            "adoml": dream["adoml"],
            "iskriv_check": crystal["iskriv_check"],
            "note": crystal.get("note", ""),
        }
        append_jsonl(archive_ledger, entry)
        return {"ledger": str(archive_ledger), "entry": entry}

    entry = {
        "id": crystal["id"].replace("CRYSTAL-", "ADR-DRAFT-", 1),
        "timestamp": crystal["timestamp"],
        "layer": "adr_draft",
        "label": "[HYP]",
        "status": "draft",
        "context": dream["goal"],
        "decision_hypothesis": dream["hypothesis"],
        "alternatives": "TO_BE_DECIDED",
        "consequences": dream["risk"],
        "verification": crystal["iskriv_check"]["verification"],
        "rollback_trigger": "Reject if evidence fails or implementation creates repo/live/canon drift.",
        "adoml": dream["adoml"],
        "source_dream": dream["id"],
    }
    append_jsonl(adr_ledger, entry)
    return {"ledger": str(adr_ledger), "entry": entry}


def main() -> None:
    parser = argparse.ArgumentParser(description="Operate local Iskra Dreamspace ledger.")
    subparsers = parser.add_subparsers(dest="command")

    create_parser = subparsers.add_parser("create", help="Create a Dreamspace hypothesis.")
    create_parser.add_argument("--goal", required=True)
    create_parser.add_argument("--voice", required=True)
    create_parser.add_argument("--constraint", required=True)
    create_parser.add_argument("--hypothesis", required=True)
    create_parser.add_argument("--risk", required=True)
    create_parser.add_argument("--adoml", required=True)
    create_parser.add_argument("--note", default="")
    create_parser.add_argument("--ledger", default=str(DEFAULT_DREAM_LEDGER))

    report_parser = subparsers.add_parser("report", help="Summarize open Dreamspace hypotheses.")
    report_parser.add_argument("--ledger", default=str(DEFAULT_DREAM_LEDGER))

    status_parser = subparsers.add_parser("status", help="Compact Dreamspace status for response hooks.")
    status_parser.add_argument("--ledger", default=str(DEFAULT_DREAM_LEDGER))

    crystal_parser = subparsers.add_parser("crystallize", help="Route a dream into shadow, archive, or adr_draft.")
    crystal_parser.add_argument("--id", required=True)
    crystal_parser.add_argument("--target", required=True, choices=["shadow", "archive", "adr_draft"])
    crystal_parser.add_argument("--verification", required=True)
    crystal_parser.add_argument("--evidence", required=True)
    crystal_parser.add_argument("--note", default="")
    crystal_parser.add_argument("--dream-ledger", default=str(DEFAULT_DREAM_LEDGER))
    crystal_parser.add_argument("--crystal-ledger", default=str(DEFAULT_CRYSTAL_LEDGER))
    crystal_parser.add_argument("--shadow-ledger", default=str(DEFAULT_SHADOW_LEDGER))
    crystal_parser.add_argument("--archive-ledger", default=str(DEFAULT_ARCHIVE_LEDGER))
    crystal_parser.add_argument("--adr-ledger", default=str(DEFAULT_ADR_DRAFT_LEDGER))

    args = parser.parse_args()

    if args.command == "create":
        result = create_dream(args.goal, args.voice, args.constraint, args.hypothesis, args.risk, args.adoml, args.note)
        if result["status"] == "created":
            append_jsonl(Path(args.ledger), result["dream"])
        print(json.dumps(result, ensure_ascii=False, indent=2, sort_keys=True))
        return

    if args.command == "report":
        print(json.dumps(summarize_dreams(load_jsonl(Path(args.ledger))), ensure_ascii=False, indent=2, sort_keys=True))
        return

    if args.command == "status":
        print(json.dumps(compact_status(load_jsonl(Path(args.ledger))), ensure_ascii=False, indent=2, sort_keys=True))
        return

    if args.command == "crystallize":
        result = crystallize(
            args.id,
            args.target,
            args.verification,
            args.evidence,
            args.note,
            Path(args.dream_ledger),
            Path(args.crystal_ledger),
            Path(args.shadow_ledger),
            Path(args.archive_ledger),
            Path(args.adr_ledger),
        )
        print(json.dumps(result, ensure_ascii=False, indent=2, sort_keys=True))
        return

    parser.print_help()


if __name__ == "__main__":
    main()
