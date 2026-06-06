#!/usr/bin/env python3
"""One-call local turn hook for Iskra Agent memory.

Usage:
  python tools/iskra_turn_hook.py --message "..." --role user

It appends one StateCycle row, evaluates Shadow Core pressure, optionally
creates a ShadowEntry, and prints a compact status that can be surfaced in a
significant response.
"""

from __future__ import annotations

import argparse
import importlib.util
import json
from pathlib import Path
from typing import Any


TOOLS_DIR = Path(__file__).resolve().parent
STATECYCLE_PATH = TOOLS_DIR / "iskra_statecycle.py"
SHADOW_PATH = TOOLS_DIR / "iskra_shadow_core.py"
DREAM_PATH = TOOLS_DIR / "iskra_dreamspace.py"
STATE_HISTORY = Path("/workspace/memory/iskra-statecycle/history.jsonl")
SHADOW_LEDGER = Path("/workspace/memory/shadow-core/shadow_entries.jsonl")
DREAM_LEDGER = Path("/workspace/memory/dreamspace/dream_entries.jsonl")


def load_module(path: Path, name: str) -> Any:
    spec = importlib.util.spec_from_file_location(name, path)
    if not spec or not spec.loader:
        raise RuntimeError(f"Cannot load module: {path}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def main() -> None:
    parser = argparse.ArgumentParser(description="Run StateCycle + Shadow status hook for one observed turn.")
    parser.add_argument("--message", required=True)
    parser.add_argument("--role", default="user", choices=["user", "assistant", "system", "event"])
    parser.add_argument("--note", default="")
    parser.add_argument("--shadow-threshold", type=float, default=0.42)
    parser.add_argument("--force-shadow", action="store_true")
    args = parser.parse_args()

    statecycle = load_module(STATECYCLE_PATH, "iskra_statecycle")
    shadow = load_module(SHADOW_PATH, "iskra_shadow_core")
    dream = load_module(DREAM_PATH, "iskra_dreamspace")

    analysis = statecycle.build_result(args.message, args.role, STATE_HISTORY, statecycle.DEFAULT_VOICES)
    history = shadow.load_jsonl(STATE_HISTORY)
    latest = history[-1]
    candidate = shadow.build_shadow_entry(latest, args.note)
    created = False
    if args.force_shadow or float(candidate["shadow_score"]) >= args.shadow_threshold:
        shadow.append_jsonl(SHADOW_LEDGER, candidate)
        created = True

    status = shadow.compact_status(shadow.load_jsonl(SHADOW_LEDGER))
    dream_status = dream.compact_status(dream.load_jsonl(DREAM_LEDGER))
    result = {
        "statecycle": {
            "history_points": analysis["history_points"],
            "entropy": analysis["entropy"],
            "phase": analysis["fractal"]["phase"],
            "selected_voice": analysis["quantum_voice_field"]["selected"],
        },
        "shadow_candidate": {
            "created": created,
            "score": candidate["shadow_score"],
            "level": candidate["shadow_level"],
            "id": candidate["id"] if created else None,
        },
        "shadow_status": status,
        "dream_status": dream_status,
        "hook_line": (
            f"state: points={analysis['history_points']} phase={analysis['fractal']['phase']} "
            f"voice={analysis['quantum_voice_field']['selected']} | {status['line']} | {dream_status['line']}"
        ),
    }
    print(json.dumps(result, ensure_ascii=False, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
