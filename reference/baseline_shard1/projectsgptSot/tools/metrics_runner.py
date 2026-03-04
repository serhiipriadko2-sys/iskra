#!/usr/bin/env python3
"""
Iskra Metrics Runner (no-runtime-in-Projects)

Goal:
- Allow deterministic metric computation from extracted features (JSON),
  while also providing a copy/paste prompt path for ChatGPT Projects.

CLI exit codes:
- 0: PASS (no findings beyond profile threshold)
- 1: WARN (findings exist but within profile threshold)
- 2: FAIL (profile threshold exceeded, baseline missing in canon, invariants broken, or redundancy mismatch)
"""
from __future__ import annotations

import argparse
import json
import math
from dataclasses import dataclass
from decimal import Decimal, getcontext
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple


DEFAULT_SPEC_PATH = Path("metrics/metrics_spec.json")


@dataclass
class Finding:
    code: str
    severity: str  # INFO|WARN|FAIL
    message: str

    def as_dict(self) -> Dict[str, str]:
        return {"code": self.code, "severity": self.severity, "message": self.message}


def _round(x: Optional[float], digits: int) -> Optional[float]:
    if x is None:
        return None
    # stable rounding: avoid "-0.0"
    r = round(float(x), digits)
    return 0.0 if r == -0.0 else r


def _is_number(x: Any) -> bool:
    return isinstance(x, (int, float)) and not isinstance(x, bool) and not (isinstance(x, float) and math.isnan(x))


def _load_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def _try_read_baseline(baseline_obj: Any) -> Optional[float]:
    """
    Accept a few possible shapes:
    - {"baseline_alive_index": 0.73}
    - {"alive_index": {"median": 0.73}}
    - {"baselines": {"alive_index": 0.73}}
    """
    if isinstance(baseline_obj, dict):
        if "baseline_alive_index" in baseline_obj and _is_number(baseline_obj["baseline_alive_index"]):
            return float(baseline_obj["baseline_alive_index"])
        ai = baseline_obj.get("alive_index")
        if isinstance(ai, dict) and _is_number(ai.get("median")):
            return float(ai["median"])
        baselines = baseline_obj.get("baselines")
        if isinstance(baselines, dict) and _is_number(baselines.get("alive_index")):
            return float(baselines["alive_index"])
    return None


def _in_range(x: float, lo: float, hi: float) -> bool:
    return lo <= x <= hi


def _weights_sum_to_one(weights: Dict[str, float], eps: float = 1e-9) -> bool:
    return abs(sum(weights.values()) - 1.0) <= eps


def compute_metrics(extract: Dict[str, Any], spec: Dict[str, Any], profile: str, baseline_alive_index: Optional[float]) -> Tuple[Dict[str, Any], List[Finding]]:
    findings: List[Finding] = []

    prof = spec.get("profiles", {}).get(profile, {})
    max_findings = int(prof.get("max_findings", 0))
    require_baseline = bool(prof.get("require_baseline", False))
    digits = int(spec.get("rounding", {}).get("digits", 4))

    # required fields
    required = ["clarity", "trust", "drift", "echo_clearance", "protocol", "trace_count"]
    missing = [k for k in required if k not in extract]
    if missing:
        findings.append(Finding("INPUT_MISSING", "FAIL", f"Missing keys in extract: {missing}"))
        # keep going but will fail by threshold

    # type checks
    for k in ["clarity", "trust", "drift", "echo_clearance", "protocol"]:
        v = extract.get(k)
        if v is None:
            continue
        if not _is_number(v):
            findings.append(Finding("INPUT_TYPE", "FAIL", f"{k} must be a number in [0..1]. got={type(v).__name__}"))
        else:
            if not _in_range(float(v), 0.0, 1.0):
                findings.append(Finding("OUT_OF_RANGE", "FAIL", f"{k} out of range [0..1]: {v}"))

    tc = extract.get("trace_count")
    if tc is not None:
        if not isinstance(tc, int) or isinstance(tc, bool):
            findings.append(Finding("INPUT_TYPE", "FAIL", f"trace_count must be integer [0..5]. got={type(tc).__name__}"))
        else:
            if not (0 <= tc <= 5):
                findings.append(Finding("OUT_OF_RANGE", "FAIL", f"trace_count out of range [0..5]: {tc}"))

    # baseline rules
    if require_baseline and baseline_alive_index is None:
        findings.append(Finding("BASELINE_MISSING", "FAIL", "canon profile требует baseline_alive_index (см. ledger/baselines.json)."))

    # compute
    clarity = float(extract.get("clarity", 0.0) or 0.0)
    trust = float(extract.get("trust", 0.0) or 0.0)
    drift = float(extract.get("drift", 0.0) or 0.0)
    echo_clearance = float(extract.get("echo_clearance", 0.0) or 0.0)
    protocol = float(extract.get("protocol", 0.0) or 0.0)
    trace_count = int(extract.get("trace_count", 0) or 0)

    trace_factor = trace_count / 5.0
    # This is intentional: we do NOT clamp; instead we validate invariants and surface findings.
    alive_index = ((clarity + trust) / 2.0 - drift) * trace_factor

    weights = spec.get("derived", {}).get("eval_score", {}).get("weights", {})
    if not isinstance(weights, dict) or not weights:
        findings.append(Finding("SPEC_WEIGHTS", "FAIL", "Spec missing eval_score.weights."))
        weights = {"clarity": 0.25, "trust": 0.25, "echo_clearance": 0.25, "protocol": 0.25}

    # weight invariants
    bad_weights = [k for k, v in weights.items() if not _is_number(v) or float(v) < 0]
    if bad_weights:
        findings.append(Finding("SPEC_WEIGHTS", "FAIL", f"Invalid weights entries: {bad_weights}"))
    if not _weights_sum_to_one({k: float(v) for k, v in weights.items() if _is_number(v)}):
        findings.append(Finding("SPEC_WEIGHTS_SUM", "FAIL", "Weights must sum to 1.0."))

    metric_map = {
        "clarity": clarity,
        "trust": trust,
        "echo_clearance": echo_clearance,
        "protocol": protocol,
        "drift": drift,
        "trace_factor": trace_factor,
        "alive_index": alive_index,
    }

    eval_score = 0.0
    for k, w in weights.items():
        if k not in metric_map:
            findings.append(Finding("SPEC_WEIGHTS_KEY", "FAIL", f"Weight key '{k}' not found in available metrics."))
            continue
        eval_score += float(w) * float(metric_map[k])

    alive_delta = None
    if baseline_alive_index is not None:
        alive_delta = alive_index - baseline_alive_index

    # redundancy check using Decimal
    getcontext().prec = 28
    try:
        d_clarity = Decimal(str(clarity))
        d_trust = Decimal(str(trust))
        d_drift = Decimal(str(drift))
        d_trace_factor = Decimal(str(trace_count)) / Decimal("5")
        d_alive = ((d_clarity + d_trust) / Decimal("2") - d_drift) * d_trace_factor
        if abs(float(d_alive) - float(alive_index)) > 1e-9:
            findings.append(Finding("REDUNDANCY_MISMATCH", "FAIL", "alive_index mismatch between float and Decimal computation."))
    except Exception as e:
        findings.append(Finding("REDUNDANCY_ERROR", "FAIL", f"Decimal redundancy computation failed: {e}"))

    # invariants
    inv_errors: List[str] = []
    for name, val in [("trace_factor", trace_factor), ("alive_index", alive_index), ("eval_score", eval_score)]:
        if not _is_number(val):
            inv_errors.append(f"{name} is not a number.")
        else:
            if name == "trace_factor":
                if not _in_range(float(val), 0.0, 1.0):
                    inv_errors.append(f"{name} out of range [0..1]: {val}")
            else:
                if not _in_range(float(val), 0.0, 1.0):
                    inv_errors.append(f"{name} out of range [0..1]: {val}")

    if inv_errors:
        findings.append(Finding("INVARIANTS_BROKEN", "FAIL", "; ".join(inv_errors)))

    # gate status
    findings_count = len(findings)
    hard_fail = any(f.severity == "FAIL" for f in findings)

    if hard_fail:
        status = "FAIL"
    else:
        if findings_count == 0:
            status = "PASS"
        else:
            status = "WARN" if findings_count <= max_findings else "FAIL"

    result = {
        "profile": profile,
        "metrics": {
            "clarity": _round(clarity, digits),
            "trust": _round(trust, digits),
            "drift": _round(drift, digits),
            "echo_clearance": _round(echo_clearance, digits),
            "protocol": _round(protocol, digits),
            "trace_count": trace_count,
        },
        "derived": {
            "trace_factor": _round(trace_factor, digits),
            "alive_index": _round(alive_index, digits),
            "eval_score": _round(eval_score, digits),
            "baseline_alive_index": _round(baseline_alive_index, digits) if baseline_alive_index is not None else None,
            "alive_delta": _round(alive_delta, digits) if alive_delta is not None else None,
        },
        "gate": {
            "status": status,
            "max_findings": max_findings,
            "findings_count": findings_count,
        },
        "findings": [f.as_dict() for f in findings],
        "trace": [
            {
                "step": "extract→compute",
                "rule": "trace_factor = trace_count/5",
                "inputs": {"trace_count": trace_count},
                "output": {"trace_factor": _round(trace_factor, digits)},
            },
            {
                "step": "alive_index",
                "rule": "alive_index = ((clarity + trust)/2 - drift) * trace_factor",
                "inputs": {"clarity": clarity, "trust": trust, "drift": drift, "trace_factor": trace_factor},
                "output": {"alive_index": _round(alive_index, digits)},
            },
            {
                "step": "eval_score",
                "rule": "eval_score = Σ(w_i * m_i)",
                "inputs": {"weights": weights, "m": {"clarity": clarity, "trust": trust, "echo_clearance": echo_clearance, "protocol": protocol}},
                "output": {"eval_score": _round(eval_score, digits)},
            },
        ],
        "invariants_check": {"ok": not inv_errors, "errors": inv_errors},
    }

    return result, findings


def _selftest() -> int:
    spec = {
        "profiles": {"canon": {"max_findings": 0, "require_baseline": True}, "lab": {"max_findings": 2, "require_baseline": False}},
        "rounding": {"digits": 4},
        "derived": {"eval_score": {"weights": {"clarity": 0.25, "trust": 0.25, "echo_clearance": 0.25, "protocol": 0.25}}},
    }
    extract_ok = {"clarity": 0.8, "trust": 0.7, "drift": 0.1, "echo_clearance": 0.9, "protocol": 1.0, "trace_count": 5}
    # lab should pass (no findings)
    res_lab, f_lab = compute_metrics(extract_ok, spec, "lab", baseline_alive_index=None)
    assert res_lab["gate"]["status"] == "PASS", res_lab
    assert len(f_lab) == 0, f_lab

    # canon without baseline must fail
    res_canon, f_canon = compute_metrics(extract_ok, spec, "canon", baseline_alive_index=None)
    assert res_canon["gate"]["status"] == "FAIL", res_canon
    assert any(f["code"] == "BASELINE_MISSING" for f in res_canon["findings"]), res_canon["findings"]

    # canon with baseline should pass
    res_canon2, f_canon2 = compute_metrics(extract_ok, spec, "canon", baseline_alive_index=0.6)
    assert res_canon2["gate"]["status"] == "PASS", res_canon2
    assert len(f_canon2) == 0, f_canon2

    # out-of-range should fail
    extract_bad = dict(extract_ok)
    extract_bad["clarity"] = 1.2
    res_bad, _ = compute_metrics(extract_bad, spec, "lab", baseline_alive_index=None)
    assert res_bad["gate"]["status"] == "FAIL", res_bad

    return 0


def main() -> int:
    ap = argparse.ArgumentParser(description="Iskra metrics runner (no-runtime-in-Projects).")
    ap.add_argument("--profile", choices=["canon", "lab"], default="lab", help="Policy profile for gating.")
    ap.add_argument("--spec", type=Path, default=DEFAULT_SPEC_PATH, help="Path to metrics spec JSON.")
    ap.add_argument("--baseline", type=Path, default=None, help="Path to baselines JSON (optional).")
    ap.add_argument("--input", type=Path, default=None, help="Path to extract JSON. If omitted, read stdin.")
    ap.add_argument("--out", type=Path, default=None, help="Write output JSON to file (optional).")
    ap.add_argument("--selftest", action="store_true", help="Run internal self-test and exit.")
    args = ap.parse_args()

    if args.selftest:
        return _selftest()

    if args.spec.exists():
        spec = _load_json(args.spec)
    else:
        # fallback minimal
        spec = {
            "profiles": {"canon": {"max_findings": 0, "require_baseline": True}, "lab": {"max_findings": 2, "require_baseline": False}},
            "rounding": {"digits": 4},
            "derived": {"eval_score": {"weights": {"clarity": 0.25, "trust": 0.25, "echo_clearance": 0.25, "protocol": 0.25}}},
        }

    extract = {}
    if args.input:
        extract = _load_json(args.input)
    else:
        extract = json.loads(Path("/dev/stdin").read_text(encoding="utf-8"))

    baseline_alive_index = None
    if args.baseline and args.baseline.exists():
        baseline_alive_index = _try_read_baseline(_load_json(args.baseline))

    result, findings = compute_metrics(extract, spec, args.profile, baseline_alive_index)

    out_text = json.dumps(result, ensure_ascii=False, indent=2) + "\n"
    if args.out:
        args.out.write_text(out_text, encoding="utf-8")
    else:
        print(out_text, end="")

    # exit code policy
    prof = spec.get("profiles", {}).get(args.profile, {})
    max_findings = int(prof.get("max_findings", 0))
    findings_count = len(findings)

    if args.profile == "canon":
        return 0 if findings_count <= max_findings else 2
    else:
        if findings_count == 0:
            return 0
        return 1 if findings_count <= max_findings else 2


if __name__ == "__main__":
    raise SystemExit(main())
