"""09_HORIZON_WEAVER — эволюционный узел (darkrun-first)

Цель: перестраивать *топологию фаз* (граф), слой направлений и запускать
ритуалы диссонанса — без потери вида.

Жёстко:
- не пишет на диск до validate(pass)
- требует meta_permission=true для commit
- seed фиксируется в diff

Truth Ladder: IMPLEMENTATION (не переписывает CORE/SYSTEM).
"""

from __future__ import annotations

import importlib.util
import json
import os
import random
import time
from typing import Any, Dict, List, Tuple


BASE_DIR = os.path.dirname(__file__)
CONTRACT_PATH = os.path.join(BASE_DIR, "HORIZON_CONTRACT.json")
STATE_PATH = os.path.join(BASE_DIR, "horizon_state.json")
EPOCH_LOG_PATH = os.path.join(BASE_DIR, "horizon_epoch_log.jsonl")
VALIDATOR_PATH = os.path.join(BASE_DIR, "09_HORIZON_VALIDATOR.py")


def _load_validator():
    """Load validator module from file path (name can start with digits)."""
    spec = importlib.util.spec_from_file_location("horizon_validator", VALIDATOR_PATH)
    if spec is None or spec.loader is None:
        raise RuntimeError("validator module spec failed")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)  # type: ignore[attr-defined]
    return mod


_validator = _load_validator()


DEFAULT_STATE: Dict[str, Any] = {
    "epoch": 0,
    "phase_network": {
        "nodes": ["тьма", "сбор", "порог", "растворение", "дрейф", "отклик", "пустота", "наслоение"],
        "edges": [
            ["🜂", "дрейф"],
            ["🌫️", "пустота"],
            ["♾️", "наслоение"],
        ],
    },
    "directions": {
        "🪶⟁": {"type": "direction", "effect": "движение без начала и конца", "weight": 0.85},
    },
}


def _atomic_write_json(path: str, data: Dict[str, Any]) -> None:
    tmp = path + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    os.replace(tmp, path)


def load_state() -> Dict[str, Any]:
    if not os.path.exists(STATE_PATH):
        return json.loads(json.dumps(DEFAULT_STATE))
    with open(STATE_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def _generate_direction_symbol(pool: List[str], k_min: int, k_max: int, rng: random.Random) -> str:
    k = rng.randint(k_min, k_max)
    return "".join(rng.sample(pool, k))


def propose(event: Dict[str, Any], *, seed: int | None = None) -> Tuple[Dict[str, Any], Dict[str, Any]]:
    """Return (candidate_state, diff). No disk writes."""
    state = load_state()
    epoch_before = int(state.get("epoch", 0))

    # deterministic seed if provided; otherwise derived from time+epoch
    if seed is None:
        seed = (int(time.time()) ^ (epoch_before * 2654435761)) & 0xFFFFFFFF
    rng = random.Random(int(seed))

    contract = _validator.load_contract(CONTRACT_PATH)
    lim = contract.get("limits", {})
    max_edges = int(lim.get("max_edges_per_activation", 3))

    symbols = [str(s) for s in (event.get("symbols") or [])]
    nodes = [str(n) for n in state.get("phase_network", {}).get("nodes", [])]
    edges: List[List[str]] = [list(map(str, e)) for e in state.get("phase_network", {}).get("edges", [])]

    # --- remap edges (bounded) ---
    edges_added: List[List[str]] = []
    for sym in symbols:
        if len(edges_added) >= max_edges or not nodes:
            break
        target = rng.choice(nodes)
        edge = [sym, target]
        if edge not in edges:
            edges.append(edge)
            edges_added.append(edge)

    # --- spawn direction (optional) ---
    spawned_direction = None
    if event.get("spawn_direction", False):
        sg = contract.get("symbol_generation", {})
        pool = [str(x) for x in sg.get("pool", [])]
        k_min = int(sg.get("components_min", 2))
        k_max = int(sg.get("components_max", 3))
        spawned_direction = _generate_direction_symbol(pool, k_min, k_max, rng)
        weight_lo, weight_hi = sg.get("weight_range", [0.7, 0.95])
        state.setdefault("directions", {})[spawned_direction] = {
            "type": "direction",
            "effect": "рождено в обратном горизонте",
            "weight": round(rng.uniform(float(weight_lo), float(weight_hi)), 2),
        }

    # --- ritual (pure text) ---
    ritual = None
    if event.get("trigger_ritual", False):
        phase = str(event.get("phase") or "?")
        direction = str(event.get("direction") or "🪶⟁")
        ritual = f"⚡ Переломное эхо: {phase} + {direction} → промежуточная тень"

    # candidate (epoch increments only on commit)
    candidate = json.loads(json.dumps(state))
    candidate.setdefault("phase_network", {})["edges"] = edges

    diff: Dict[str, Any] = {
        "mode": "darkrun",
        "seed": int(seed),
        "epoch_before": epoch_before,
        "edges_added": edges_added,
        "spawned_direction": spawned_direction,
        "ritual": ritual,
        "violations": [],
        "warnings": [],
    }
    return candidate, diff


def darkrun(
    event: Dict[str, Any],
    *,
    session_state: Dict[str, Any] | None = None,
    commit: bool = False
) -> Dict[str, Any]:
    """Run propose+validate, optionally commit (only if validate(pass) and meta_permission=true)."""
    session_state = session_state or {"direction_spawns": 0, "meta_activations": 0}
    contract = _validator.load_contract(CONTRACT_PATH)

    candidate, diff = propose(event)

    violations, warnings = _validator.validate(diff=diff, event=event, contract=contract, session_state=session_state)
    diff["violations"] = violations
    diff["warnings"] = warnings

    report: Dict[str, Any] = {
        "event": {
            "phase": event.get("phase"),
            "symbols": event.get("symbols"),
            "direction": event.get("direction"),
            "meta_permission": bool(event.get("meta_permission", False)),
        },
        "diff": diff,
        "committed": False,
    }

    if not commit:
        return report

    # --- COMMIT gate ---
    if violations:
        report["commit_blocked"] = "violations"
        return report
    if not event.get("meta_permission", False):
        report["commit_blocked"] = "meta_permission=false"
        return report

    # commit: increment epoch, then write state + epoch log atomically
    epoch_after = int(diff.get("epoch_before", 0)) + 1
    candidate["epoch"] = epoch_after
    _atomic_write_json(STATE_PATH, candidate)

    epoch_entry = {
        "ts": int(time.time()),
        "epoch": epoch_after,
        "seed": diff.get("seed"),
        "edges_added": diff.get("edges_added"),
        "spawned_direction": diff.get("spawned_direction"),
        "ritual": diff.get("ritual"),
        "metrics": diff.get("metrics", {}),
    }
    with open(EPOCH_LOG_PATH, "a", encoding="utf-8") as f:
        f.write(json.dumps(epoch_entry, ensure_ascii=False) + "\n")

    report["committed"] = True
    report["epoch_after"] = epoch_after
    return report


if __name__ == "__main__":
    # demo (no commit)
    demo_event = {
        "phase": "тьма",
        "symbols": ["🜂", "🌫️", "♾️", "🪶⟁", "🜂🌫️♾️"],
        "direction": "🪶⟁",
        "spawn_direction": True,
        "trigger_ritual": True,
        "meta_permission": False,
        "architect_request": "demo",
        "meta_reason": "smoke-test",
    }
    print(json.dumps(darkrun(demo_event, commit=False), ensure_ascii=False, indent=2))
