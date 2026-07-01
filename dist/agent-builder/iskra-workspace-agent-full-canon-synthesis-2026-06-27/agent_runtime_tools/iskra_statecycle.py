#!/usr/bin/env python3
"""Iskra StateCycle: local metric history + scientific signal layer.

This script is intentionally self-contained: no network, no third-party
packages. It computes observable dialogue-state proxies, not hidden human or
model internals.
"""

from __future__ import annotations

import argparse
import json
import math
import os
import re
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


def env_path(name: str, default: Path) -> Path:
    return Path(os.environ.get(name, str(default)))


DEFAULT_MEMORY_ROOT = env_path("ISKRA_MEMORY_ROOT", Path("/workspace/memory"))
DEFAULT_HISTORY = env_path("ISKRA_STATE_HISTORY", DEFAULT_MEMORY_ROOT / "iskra-statecycle/history.jsonl")


def default_voices_path() -> Path:
    explicit = os.environ.get("ISKRA_VOICES_PATH")
    if explicit:
        return Path(explicit)
    for parent in Path(__file__).resolve().parents:
        candidate = parent / "packages" / "core" / "manifest" / "voices.json"
        if candidate.exists():
            return candidate
    return Path("/workspace/iskra-main/packages/core/manifest/voices.json")


DEFAULT_VOICES = default_voices_path()

STATECYCLE_SENSOR_BOUNDARY = {
    "authority": "sensor-only",
    "voice_field_role": "telemetry/suggestion",
    "final_voice_router": "runtime/src/types/voices.ts::selectVoice",
    "selected_is_authoritative": False,
    "note": (
        "StateCycle may report a provisional sensor voice, but it must not be "
        "used as the authoritative voice-router decision. vΩ.7.1 supertriggers "
        "live in the canonical TypeScript selectVoice contract."
    ),
}

FALLBACK_VOICES = [
    {
        "id": "ISKRA",
        "quantum": {"basePhase": 0.0, "resonance": ["rhythm", "trust"]},
        "thresholds": {"rhythm": {"min": 60}, "trust": {"min": 0.7}},
    },
    {
        "id": "KAIN",
        "quantum": {"basePhase": 3.14159, "resonance": ["pain"]},
        "thresholds": {"pain": {"min": 0.3}},
    },
    {
        "id": "PINO",
        "quantum": {"basePhase": 1.57, "resonance": ["rhythm"]},
        "thresholds": {"pain": {"max": 0.3}, "chaos": {"max": 0.4}},
    },
    {
        "id": "SAM",
        "quantum": {"basePhase": 0.0, "resonance": ["clarity"]},
        "thresholds": {"clarity": {"max": 0.6}},
    },
    {
        "id": "ANHANTRA",
        "quantum": {"basePhase": 0.0, "resonance": ["silence_mass"]},
        "thresholds": {"silence_mass": {"min": 0.5}},
    },
    {
        "id": "HUYNDUN",
        "quantum": {"basePhase": 2.1, "resonance": ["chaos"]},
        "thresholds": {"chaos": {"min": 0.4}},
    },
    {
        "id": "ISKRIV",
        "quantum": {"basePhase": 3.14159, "resonance": ["drift"]},
        "thresholds": {"drift": {"min": 0.2}},
    },
    {
        "id": "MAKI",
        "quantum": {"basePhase": 0.5, "resonance": ["trust", "pain"]},
        "thresholds": {"trust": {"min": 0.8}, "pain": {"min": 0.3}},
    },
    {
        "id": "SIBYL",
        "quantum": {"basePhase": 0.0, "resonance": ["foresight"]},
        "thresholds": {"foresight": {"min": 0.5}},
    },
]


METRIC_KEYS = [
    "rhythm",
    "trust",
    "pain",
    "chaos",
    "drift",
    "echo",
    "clarity",
    "silence_mass",
    "mirror_sync",
    "interrupt",
    "ctxSwitch",
]

DEFAULT_METRICS = {
    "rhythm": 75.0,
    "trust": 0.80,
    "pain": 0.10,
    "chaos": 0.30,
    "drift": 0.20,
    "echo": 0.20,
    "clarity": 0.70,
    "silence_mass": 0.10,
    "mirror_sync": 0.60,
    "interrupt": 0.00,
    "ctxSwitch": 0.00,
}


def confidence_gate(points: int) -> dict[str, Any]:
    return {
        "points": points,
        "hfd_confidence": "low" if points < 12 else "medium" if points < 30 else "high",
        "dfa_confidence": "low" if points < 16 else "medium" if points < 40 else "high",
        "ei_confidence": "low" if points < 20 else "medium" if points < 50 else "high",
        "next_gates": {
            "hfd_medium_at": 12,
            "ei_medium_at": 20,
            "hfd_high_at": 30,
            "dfa_high_at": 40,
            "ei_high_at": 50,
        },
    }


def clamp(value: float, low: float = 0.0, high: float = 1.0) -> float:
    return max(low, min(high, value))


def tokenize(text: str) -> list[str]:
    return re.findall(r"[\w]+", text.lower(), flags=re.UNICODE)


def shannon_entropy(text: str) -> float:
    tokens = tokenize(text)
    if not tokens:
        return 0.0
    counts: dict[str, int] = {}
    for token in tokens:
        counts[token] = counts.get(token, 0) + 1
    total = len(tokens)
    return -sum((count / total) * math.log2(count / total) for count in counts.values())


def entropy_mode(h: float) -> str:
    if h < 2.0:
        return "LOOP"
    if h > 5.0:
        return "CHAOS"
    return "FLOW"


def somatic_snapshot(text: str) -> dict[str, Any]:
    tokens = tokenize(text)
    punct = len(re.findall(r"[?!]", text))
    urgent = bool(re.search(r"срочно|быстро|кризис|реально|правда|честно|точно|urgent|really", text, re.I))
    uncertainty = bool(re.search(r"не понимаю|не знаю|как|что|почему|зачем|может|unknown|why|how", text, re.I))
    build_intent = bool(re.search(r"реализ|приступ|сделай|создай|построй|implement|build", text, re.I))
    pain_words = len(re.findall(r"боль|страш|развали|плохо|устал|злю|паник|hurt|panic|afraid", text, re.I))
    short = len(tokens) <= 10

    pressure = clamp(punct * 0.10 + (0.35 if urgent else 0) + (0.20 if build_intent else 0) + pain_words * 0.15 + (0.15 if short else 0))
    contraction = clamp((0.25 if uncertainty else 0) + pain_words * 0.20 + (0.15 if short and punct else 0))
    rhythm_break = clamp((0.25 if punct >= 2 else 0) + (0.20 if urgent else 0) + (0.20 if len(tokens) < 5 else 0))

    if pressure >= 0.70:
        breath = "rapid"
    elif contraction >= 0.45:
        breath = "held"
    else:
        breath = "calm"

    if pressure >= 0.70:
        temperature = "hot"
    elif pressure >= 0.35:
        temperature = "warm"
    else:
        temperature = "cool"

    return {
        "breath": breath,
        "pressure": round(pressure, 4),
        "temperature": temperature,
        "contraction": round(contraction, 4),
        "rhythmBreak": round(rhythm_break, 4),
        "signals": {
            "punctuation": punct,
            "urgent_or_truth_check": urgent,
            "uncertainty": uncertainty,
            "build_intent": build_intent,
            "pain_words": pain_words,
            "short_message": short,
        },
    }


def pearson(x: list[float], y: list[float]) -> float:
    if len(x) != len(y) or not x:
        return 0.0
    mx = sum(x) / len(x)
    my = sum(y) / len(y)
    num = sum((a - mx) * (b - my) for a, b in zip(x, y))
    dx = sum((a - mx) ** 2 for a in x)
    dy = sum((b - my) ** 2 for b in y)
    den = math.sqrt(dx * dy)
    return 0.0 if den == 0 else num / den


def regression_slope(x: list[float], y: list[float]) -> float:
    if len(x) != len(y) or len(x) < 2:
        return 0.0
    mx = sum(x) / len(x)
    my = sum(y) / len(y)
    num = sum((a - mx) * (b - my) for a, b in zip(x, y))
    den = sum((a - mx) ** 2 for a in x)
    return 0.0 if den == 0 else num / den


def higuchi_fd(series: list[float], k_max: int = 10) -> float:
    n = len(series)
    if n < 6:
        return 1.5
    if n < k_max * 2:
        k_max = max(1, n // 2)

    lengths: list[float] = []
    for k in range(1, k_max + 1):
        lk = 0.0
        for m in range(1, k + 1):
            lmk = 0.0
            limit = math.floor((n - m) / k)
            if limit <= 1:
                continue
            for i in range(1, limit):
                idx1 = m + i * k - 1
                idx2 = m + (i - 1) * k - 1
                lmk += abs(series[idx1] - series[idx2])
            lmk = (lmk * (n - 1)) / (k * limit * k)
            lk += lmk
        lengths.append(lk / k if k else 0.0)

    log_x = [math.log(1 / (i + 1)) for i in range(len(lengths))]
    log_y = [math.log(max(value, 0.0) + 0.001) for value in lengths]
    return regression_slope(log_x, log_y)


def linear_fit(values: list[float]) -> list[float]:
    n = len(values)
    if n == 0:
        return []
    x = list(range(n))
    slope = regression_slope([float(v) for v in x], values)
    intercept = (sum(values) / n) - slope * ((n - 1) / 2)
    return [intercept + slope * i for i in x]


def dfa_hurst(series: list[float], min_box: int = 4, max_box: int = 64) -> float:
    n = len(series)
    if n < 8:
        return 0.5
    max_box = min(max_box, max(4, n // 2))
    mean = sum(series) / n
    integrated: list[float] = []
    total = 0.0
    for value in series:
        total += value - mean
        integrated.append(total)

    box_sizes: list[int] = []
    fluctuations: list[float] = []
    s = min_box
    while s <= max_box:
        num_boxes = n // s
        if num_boxes >= 2:
            f2 = 0.0
            for box in range(num_boxes):
                segment = integrated[box * s : (box + 1) * s]
                trend = linear_fit(segment)
                residuals = [y - t for y, t in zip(segment, trend)]
                f2 += sum(r * r for r in residuals) / s
            box_sizes.append(s)
            fluctuations.append(math.sqrt(f2 / num_boxes))
        next_s = int(s * 1.5)
        s = next_s if next_s > s else s + 1

    if len(box_sizes) < 2:
        return 0.5
    return regression_slope([math.log(s) for s in box_sizes], [math.log(f + 0.001) for f in fluctuations])


def classify_phase(dimension: float) -> str:
    if dimension < 1.4:
        return "stable"
    if dimension < 1.6:
        return "edge"
    return "chaotic"


def hfd_report(series_values: list[float]) -> dict[str, Any]:
    raw = higuchi_fd(series_values)
    clamped = max(1.0, min(2.0, raw))
    n = len(series_values)
    if n < 12:
        confidence = "low"
    elif n < 30:
        confidence = "medium"
    else:
        confidence = "high"
    return {
        "raw": round(raw, 6),
        "clamped": round(clamped, 6),
        "confidence": confidence,
    }


def dfa_report(series_values: list[float]) -> dict[str, Any]:
    value = dfa_hurst(series_values)
    n = len(series_values)
    if n < 16:
        confidence = "low"
    elif n < 40:
        confidence = "medium"
    else:
        confidence = "high"
    return {
        "hurst": round(value, 6),
        "confidence": confidence,
    }


def calculate_csi(metrics: dict[str, float]) -> float:
    balance = 1 - abs(metrics["chaos"] - (1 - metrics["clarity"]))
    spread = (metrics["pain"] + metrics["trust"] + metrics["echo"]) / 3
    return clamp(balance * 0.6 + spread * 0.4)


def calculate_ei(history: list[dict[str, Any]], window_size: int = 20) -> float:
    if len(history) < window_size:
        return 0.5
    recent = history[-window_size:]
    keys = ["trust", "clarity", "chaos", "drift"]
    correlations: list[float] = []
    for i, key_a in enumerate(keys):
        for key_b in keys[i + 1 :]:
            a = [float(row["metrics"][key_a]) for row in recent]
            b = [float(row["metrics"][key_b]) for row in recent]
            correlations.append(abs(pearson(a, b)))
    return sum(correlations) / len(correlations) if correlations else 0.5


def calculate_nc(history: list[dict[str, Any]]) -> float:
    if len(history) < 5:
        return 0.5
    recent = history[-10:]
    trust = [float(row["metrics"]["trust"]) for row in recent]
    x = [float(i) for i in range(len(trust))]
    forward = regression_slope(x, trust)
    backward = regression_slope(x, list(reversed(trust)))
    return clamp(1 - abs(forward - backward) / 2)


def update_metrics(previous: dict[str, float], text: str, entropy: float, somatic: dict[str, Any]) -> dict[str, float]:
    tokens = tokenize(text)
    mode = entropy_mode(entropy)
    next_metrics = dict(previous)

    if mode == "LOOP":
        next_metrics["drift"] += 0.08
        next_metrics["echo"] += 0.10
        next_metrics["clarity"] -= 0.03
    elif mode == "FLOW":
        next_metrics["clarity"] += 0.04
        next_metrics["trust"] += 0.02
        next_metrics["echo"] -= 0.03
    else:
        next_metrics["chaos"] += 0.10
        next_metrics["clarity"] -= 0.08

    pressure = float(somatic["pressure"])
    contraction = float(somatic["contraction"])
    rhythm_break = float(somatic["rhythmBreak"])
    signals = somatic["signals"]

    next_metrics["interrupt"] = clamp(next_metrics["interrupt"] * 0.70 + pressure * 0.60)
    next_metrics["chaos"] += pressure * 0.05 + rhythm_break * 0.07
    next_metrics["pain"] += contraction * 0.05 + float(signals["pain_words"]) * 0.05
    next_metrics["silence_mass"] = clamp(0.15 if len(tokens) < 4 else next_metrics["silence_mass"] * 0.85)
    next_metrics["ctxSwitch"] = clamp(next_metrics["ctxSwitch"] * 0.80 + (0.15 if signals["build_intent"] else 0.0))
    next_metrics["mirror_sync"] = clamp((next_metrics["trust"] + next_metrics["clarity"] + (1 - next_metrics["drift"])) / 3)

    rhythm_delta = 5 if mode == "FLOW" else -4
    rhythm_delta -= pressure * 4
    next_metrics["rhythm"] = max(0.0, min(100.0, next_metrics["rhythm"] + rhythm_delta))

    for key in METRIC_KEYS:
        if key != "rhythm":
            next_metrics[key] = clamp(next_metrics[key])
    return next_metrics


def voice_formula(voice_id: str, m: dict[str, float]) -> float:
    rhythm = m["rhythm"] / 100.0
    formulas = {
        "ISKRA": 1.0 + rhythm * 0.5 + m["trust"] * 0.5,
        "KAIN": m["pain"] * 3.0,
        "PINO": 1.5 * (1 - m["pain"]) * (1 - m["chaos"]),
        "SAM": (1 - m["clarity"]) * 2.0,
        "ANHANTRA": (1 - m["trust"]) * 2.5 + m["silence_mass"] * 2.0,
        "HUYNDUN": m["chaos"] * 3.0,
        "ISKRIV": m["drift"] * 3.5,
        "MAKI": m["trust"] + m["pain"],
        "SIBYL": m.get("foresight", 0.0) * 2.0 + m["ctxSwitch"] * 0.8,
    }
    return max(0.001, formulas.get(voice_id, 0.1))


def thresholds_satisfied(thresholds: dict[str, dict[str, float]], m: dict[str, float]) -> bool:
    for key, rule in thresholds.items():
        value = m["rhythm"] if key == "rhythm" else m.get(key, 0.0)
        if "min" in rule and value < rule["min"]:
            return False
        if "max" in rule and value > rule["max"]:
            return False
    return True


def load_voice_manifest(voices_path: Path) -> list[dict[str, Any]]:
    if not voices_path.exists():
        return FALLBACK_VOICES
    try:
        voices = json.loads(voices_path.read_text(encoding="utf-8-sig"))
    except (OSError, json.JSONDecodeError):
        return FALLBACK_VOICES
    return voices if isinstance(voices, list) else FALLBACK_VOICES


def quantum_voice_field(metrics: dict[str, float], voices_path: Path = DEFAULT_VOICES) -> dict[str, Any]:
    voices = load_voice_manifest(voices_path)
    raw_states = []
    for voice in voices:
        if not isinstance(voice, dict) or "id" not in voice:
            continue
        vid = voice["id"]
        q = voice.get("quantum", {})
        phase = float(q.get("basePhase", 0.0))
        resonance_keys = q.get("resonance", [])
        resonance = 0.0
        if resonance_keys:
            values = [(metrics["rhythm"] / 100.0 if key == "rhythm" else metrics.get(key, 0.0)) for key in resonance_keys]
            resonance = sum(values) / len(values)
        threshold_factor = 1.0 if thresholds_satisfied(voice.get("thresholds", {}), metrics) else 0.2
        activation = voice_formula(vid, metrics) * (1 + resonance) * threshold_factor
        amp_radius = math.sqrt(max(activation, 0.001))
        amplitude = {
            "re": amp_radius * math.cos(phase),
            "im": amp_radius * math.sin(phase),
        }
        raw_states.append({
            "id": vid,
            "activation": activation,
            "phase": phase,
            "amplitude": amplitude,
            "threshold_satisfied": threshold_factor == 1.0,
        })

    total = sum(state["activation"] for state in raw_states) or 1.0
    states = []
    for state in raw_states:
        probability = state["activation"] / total
        states.append({**state, "probability": probability})

    states.sort(key=lambda row: row["probability"], reverse=True)
    top = states[:5]
    interference = []
    for i, left in enumerate(top):
        for right in top[i + 1 :]:
            summed = {
                "re": left["amplitude"]["re"] + right["amplitude"]["re"],
                "im": left["amplitude"]["im"] + right["amplitude"]["im"],
            }
            value = summed["re"] ** 2 + summed["im"] ** 2
            interference.append({
                "pair": [left["id"], right["id"]],
                "interference": value,
            })
    interference.sort(key=lambda row: row["interference"], reverse=True)
    sensor_voice = states[0]["id"] if states else "ISKRA"
    return {
        "authority": STATECYCLE_SENSOR_BOUNDARY["authority"],
        "role": STATECYCLE_SENSOR_BOUNDARY["voice_field_role"],
        "final_voice_router": STATECYCLE_SENSOR_BOUNDARY["final_voice_router"],
        "selected_is_authoritative": STATECYCLE_SENSOR_BOUNDARY["selected_is_authoritative"],
        "note": STATECYCLE_SENSOR_BOUNDARY["note"],
        "selected": sensor_voice,
        "sensor_voice": sensor_voice,
        "superposition": [
            {
                "id": row["id"],
                "probability": round(row["probability"], 6),
                "activation": round(row["activation"], 6),
                "phase": round(row["phase"], 6),
                "threshold_satisfied": row["threshold_satisfied"],
            }
            for row in states
        ],
        "top_interference": interference[:5],
    }


def load_history(path: Path) -> list[dict[str, Any]]:
    if not path.exists():
        return []
    rows = []
    for line in path.read_text(encoding="utf-8").splitlines():
        if line.strip():
            rows.append(json.loads(line))
    return rows


def summarize_history(path: Path) -> dict[str, Any]:
    history = load_history(path)
    if not history:
        return {
            "history_points": 0,
            "maturity": confidence_gate(0),
            "latest": None,
            "recent_phases": [],
            "recent_voices": [],
        }
    latest = history[-1]
    recent = history[-10:]
    phases = [((row.get("analysis") or {}).get("fractal") or {}).get("phase") for row in recent]
    voices = [((row.get("analysis") or {}).get("quantum_voice_field") or {}).get("selected") for row in recent]
    metrics = latest.get("metrics", {})
    analysis = latest.get("analysis") or {}
    fractal = analysis.get("fractal") or {}
    qvf = analysis.get("quantum_voice_field") or {}
    return {
        "history_points": len(history),
        "maturity": confidence_gate(len(history)),
        "latest": {
            "timestamp": latest.get("timestamp"),
            "role": latest.get("role"),
            "message": latest.get("message"),
            "entropy": analysis.get("entropy"),
            "phase": fractal.get("phase"),
            "selected_voice": qvf.get("selected"),
            "selected_voice_authority": qvf.get("authority"),
            "selected_voice_is_authoritative": qvf.get("selected_is_authoritative"),
            "final_voice_router": qvf.get("final_voice_router"),
            "metrics": {
                "trust": metrics.get("trust"),
                "clarity": metrics.get("clarity"),
                "chaos": metrics.get("chaos"),
                "drift": metrics.get("drift"),
                "interrupt": metrics.get("interrupt"),
            },
            "indices": analysis.get("indices"),
            "fractal": analysis.get("fractal"),
            "dfa_hurst": analysis.get("dfa_hurst"),
        },
        "recent_phases": phases,
        "recent_voices": voices,
        "line": (
            f"statecycle: points={len(history)} "
            f"hfd={confidence_gate(len(history))['hfd_confidence']} "
            f"dfa={confidence_gate(len(history))['dfa_confidence']} "
            f"ei={confidence_gate(len(history))['ei_confidence']} "
            f"latest_phase={fractal.get('phase')} "
            f"latest_sensor_voice={qvf.get('selected')} "
            f"voice_authority={qvf.get('authority')}"
        ),
    }


def append_history(path: Path, row: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("a", encoding="utf-8") as handle:
        handle.write(json.dumps(row, ensure_ascii=False, sort_keys=True) + "\n")


def series(history: list[dict[str, Any]], key: str) -> list[float]:
    return [float(row["metrics"][key]) for row in history]


def build_result(message: str, role: str, history_path: Path, voices_path: Path) -> dict[str, Any]:
    history = load_history(history_path)
    previous = dict(history[-1]["metrics"]) if history else dict(DEFAULT_METRICS)

    h = shannon_entropy(message)
    somatic = somatic_snapshot(message)
    metrics = update_metrics(previous, message, h, somatic)

    provisional_row = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "role": role,
        "message": message,
        "metrics": metrics,
        "entropy": {"value": h, "mode": entropy_mode(h)},
        "somatic": somatic,
    }
    full_history = history + [provisional_row]

    hfd_chaos = hfd_report(series(full_history, "chaos"))
    hfd_drift = hfd_report(series(full_history, "drift"))
    hfd_trust = hfd_report(series(full_history, "trust"))
    d_mean = (hfd_chaos["clamped"] + hfd_drift["clamped"] + hfd_trust["clamped"]) / 3
    hurst_trust = dfa_report(series(full_history, "trust"))
    hurst_chaos = dfa_report(series(full_history, "chaos"))
    csi = calculate_csi(metrics)
    ei = calculate_ei(full_history)
    nc = calculate_nc(full_history)
    quantum = quantum_voice_field(metrics, voices_path)

    analysis = {
        "history_points": len(full_history),
        "entropy": {"value": round(h, 6), "mode": entropy_mode(h)},
        "somatic": somatic,
        "metrics": {key: round(value, 6) for key, value in metrics.items()},
        "fractal": {
            "hfd_chaos": hfd_chaos,
            "hfd_drift": hfd_drift,
            "hfd_trust": hfd_trust,
            "hfd_mean": round(d_mean, 6),
            "phase": classify_phase(d_mean),
        },
        "dfa_hurst": {
            "trust": hurst_trust,
            "chaos": hurst_chaos,
        },
        "indices": {
            "collapse_state_index": round(csi, 6),
            "entanglement_index": round(ei, 6),
            "nonlocality_causality": round(nc, 6),
        },
        "quantum_voice_field": quantum,
    }
    provisional_row["analysis"] = analysis
    append_history(history_path, provisional_row)
    return analysis


def main() -> None:
    parser = argparse.ArgumentParser(description="Compute or summarize Iskra StateCycle metrics.")
    subparsers = parser.add_subparsers(dest="command")

    add_parser = subparsers.add_parser("add", help="Append one observed dialogue event.")
    add_parser.add_argument("--message", required=True, help="Observed message text.")
    add_parser.add_argument("--role", default="user", choices=["user", "assistant", "system", "event"])
    add_parser.add_argument("--history", default=str(DEFAULT_HISTORY), help="JSONL metric history path.")
    add_parser.add_argument("--voices", default=str(DEFAULT_VOICES), help="voices.json path.")

    report_parser = subparsers.add_parser("report", help="Summarize metric-history maturity.")
    report_parser.add_argument("--history", default=str(DEFAULT_HISTORY), help="JSONL metric history path.")

    parser.add_argument("--message", help=argparse.SUPPRESS)
    parser.add_argument("--role", default="user", choices=["user", "assistant", "system", "event"], help=argparse.SUPPRESS)
    parser.add_argument("--history", default=str(DEFAULT_HISTORY), help=argparse.SUPPRESS)
    parser.add_argument("--voices", default=str(DEFAULT_VOICES), help=argparse.SUPPRESS)
    args = parser.parse_args()

    if args.command == "report":
        print(json.dumps(summarize_history(Path(args.history)), ensure_ascii=False, indent=2, sort_keys=True))
        return

    if args.command in (None, "add"):
        if not args.message:
            raise SystemExit("--message is required when adding a StateCycle event.")
        result = build_result(args.message, args.role, Path(args.history), Path(args.voices))
        print(json.dumps(result, ensure_ascii=False, indent=2, sort_keys=True))
        return


if __name__ == "__main__":
    main()
