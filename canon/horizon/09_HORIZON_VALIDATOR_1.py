"""09_HORIZON_VALIDATOR — стражи Horizon Weaver (darkrun-first)

Этот модуль не “разрешает магию”. Он делает ровно одно:
проверяет предложение изменения (diff) на квоты/инварианты/триггеры.

Truth Ladder: IMPLEMENTATION (не переписывает CORE/SYSTEM).
"""

from __future__ import annotations

import json
import math
import os
from pathlib import Path
from typing import Any, Dict, List, Tuple


BASE_DIR = os.path.dirname(__file__)


def load_contract(path: str) -> Dict[str, Any]:
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def shannon_entropy_nats(symbols: List[str]) -> float:
    """Shannon entropy in nats (natural log)."""
    if not symbols:
        return 0.0
    total = len(symbols)
    counts: Dict[str, int] = {}
    for s in symbols:
        counts[s] = counts.get(s, 0) + 1
    h = 0.0
    for c in counts.values():
        p = c / total
        h -= p * math.log(p)
    return float(h)


def _count_lines_binary(path: str) -> int:
    """Fast line count without loading whole file into memory."""
    n = 0
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            n += chunk.count(b"\n")
    return n


def run_full_density_guard(contract: Dict[str, Any], base_dir: str = BASE_DIR) -> Tuple[List[str], List[str]]:
    """Return (violations, warnings) for Gate D (full-density)."""
    guard = contract.get("full_density_guard") or {}
    if not bool(guard.get("enabled", False)):
        return [], []

    violations: List[str] = []
    warnings: List[str] = []

    rules = guard.get("rules") or []
    if not isinstance(rules, list) or not rules:
        warnings.append("full_density_guard enabled, but rules are empty")
        return violations, warnings

    for rule in rules:
        rel = str(rule.get("path") or "").strip()
        if not rel:
            warnings.append("full_density_guard: rule has no path")
            continue

        fp = os.path.join(base_dir, rel)
        if not os.path.exists(fp):
            violations.append(f"full_density: missing file: {rel}")
            continue

        # current size
        bytes_now = int(os.path.getsize(fp))
        lines_now = int(_count_lines_binary(fp))

        # baseline
        baseline = rule.get("baseline") or {}
        b_bytes = baseline.get("bytes")
        b_lines = baseline.get("lines")

        if not isinstance(b_bytes, int) or not isinstance(b_lines, int):
            warnings.append(f"full_density: no baseline for {rel} (cannot enforce ratios)")
        else:
            min_ratio_bytes = float(rule.get("min_ratio_bytes", 0.0))
            min_ratio_lines = float(rule.get("min_ratio_lines", 0.0))
            min_bytes = int(b_bytes * min_ratio_bytes)
            min_lines_ratio = int(b_lines * min_ratio_lines)
            if bytes_now < min_bytes:
                violations.append(
                    f"full_density: {rel} bytes={bytes_now} < min={min_bytes} (baseline={b_bytes}, ratio={min_ratio_bytes})"
                )
            if lines_now < min_lines_ratio:
                violations.append(
                    f"full_density: {rel} lines={lines_now} < min={min_lines_ratio} (baseline={b_lines}, ratio={min_ratio_lines})"
                )

        # absolute minima
        abs_min_lines = rule.get("min_lines")
        if isinstance(abs_min_lines, int) and lines_now < abs_min_lines:
            violations.append(f"full_density: {rel} lines={lines_now} < abs_min_lines={abs_min_lines}")

        # marker checks
        must = rule.get("must_contain") or []
        if must:
            try:
                content = Path(fp).read_text(encoding="utf-8", errors="replace")
            except Exception as e:
                violations.append(f"full_density: failed to read {rel} as utf-8: {e}")
                continue
            for m in must:
                s = str(m)
                if s and s not in content:
                    violations.append(f"full_density: {rel} missing marker: {s}")

    return violations, warnings


def validate(
    *,
    diff: Dict[str, Any],
    event: Dict[str, Any],
    contract: Dict[str, Any],
    session_state: Dict[str, Any] | None = None
) -> Tuple[List[str], List[str]]:
    """Return (violations, warnings)."""
    session_state = session_state or {}
    violations: List[str] = []
    warnings: List[str] = []

    # --- trigger guard ---
    trig = contract.get("trigger", {})
    if trig.get("meta_permission_required", True):
        if not event.get("meta_permission", False):
            violations.append("meta_permission=false (коммит запрещён)")
    if trig.get("user_symbol_is_not_trigger", True):
        # We don't block propose; we block commit that is based only on symbols.
        # If caller didn't set an explicit reason, warn.
        if event.get("meta_permission", False) and not event.get("meta_reason") and not event.get("architect_request") :
            warnings.append("meta_permission=true, но нет meta_reason/architect_request — проверь осознанность запроса")

    # --- limits ---
    lim = contract.get("limits", {})
    edges_added = diff.get("edges_added", []) or []
    if len(edges_added) > int(lim.get("max_edges_per_activation", 3)):
        violations.append(f"edges_added={len(edges_added)} > max_edges_per_activation")

    spawned = diff.get("spawned_direction")
    if spawned:
        spawns = int(session_state.get("direction_spawns", 0))
        if spawns + 1 > int(lim.get("max_direction_spawns_per_session", 1)):
            violations.append("direction spawn quota exceeded for session")

    # --- entropy guard ---
    eg = contract.get("entropy_guard", {})
    window = int(eg.get("window", 32))
    max_h = float(eg.get("symbol_entropy_nats_max", 1.45))
    symbols = (event.get("symbols") or [])[-window:]
    h = shannon_entropy_nats([str(s) for s in symbols])
    diff.setdefault("metrics", {})["symbol_entropy_nats"] = h
    if h > max_h:
        warnings.append(f"symbol_entropy_nats={h:.3f} > guard={max_h} (рост может стать шумом)")

    # --- hygiene ---
    if "seed" not in diff:
        warnings.append("diff has no seed — воспроизводимость потеряна")

    # --- Gate D (full-density) ---
    fd_v, fd_w = run_full_density_guard(contract, BASE_DIR)
    violations.extend(fd_v)
    warnings.extend(fd_w)

    return violations, warnings


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Horizon Validator (includes Gate D full-density check)")
    parser.add_argument(
        "--full-density-only",
        action="store_true",
        help="Run only Gate D full-density check (no Horizon diff/event validation).",
    )
    args = parser.parse_args()

    contract = load_contract(os.path.join(BASE_DIR, "HORIZON_CONTRACT.json"))

    if args.full_density_only:
        v, w = run_full_density_guard(contract, BASE_DIR)
        print(json.dumps({"violations": v, "warnings": w}, ensure_ascii=False, indent=2))
    else:
        print("Use --full-density-only to run Gate D full-density check.")
