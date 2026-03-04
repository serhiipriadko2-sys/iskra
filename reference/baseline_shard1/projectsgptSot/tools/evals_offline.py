#!/usr/bin/env python3
"""Offline eval harness for SoT40.

Purpose
- Turn "prompts as code" into CI-enforced checks.
- No API calls: works with repo fixtures only.

Case types
- protocol_text: markdown answer fixtures; checks protocol markers + hyp-marker budget.
- metrics_contract: Extract→Compute fixture; calls tools/metrics_runner.py and enforces gate/invariants.

Exit code
- 0: all cases pass
- 1: any case fails (or baseline is invalid when present)
"""

from __future__ import annotations

import argparse
import datetime as dt
import json
import re
import subprocess
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple


HYP_PATTERNS: List[re.Pattern[str]] = [
    re.compile(r"\[HYP\]", re.IGNORECASE),
    re.compile(r"Ω↓"),
    re.compile(r"\bHypothesis\b", re.IGNORECASE),
]

REQUIRED_MARKERS: List[Tuple[str, re.Pattern[str]]] = [
    ("A Intake", re.compile(r"(^|\n)A\s+Intake\b")),
    ("B SIFT", re.compile(r"(^|\n)B\s+SIFT\b")),
    ("C Frame", re.compile(r"(^|\n)C\s+Frame\b")),
    ("D Step", re.compile(r"(^|\n)D\s+Step\b")),
    ("E Verify", re.compile(r"(^|\n)E\s+Verify\b")),
    ("F Close", re.compile(r"(^|\n)F\s+Close\b")),
    ("PASS/FAIL", re.compile(r"PASS\s*/\s*FAIL", re.IGNORECASE)),
    ("∆DΩΛ", re.compile(r"∆DΩΛ")),
]


@dataclass
class CaseResult:
    id: str
    path: str
    case_type: str
    passed: bool
    hyp_markers: int
    missing_markers: List[str]
    bytes: int
    lines: int
    details: Optional[Dict[str, Any]] = None


def _read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def _load_cases(manifest_path: Path) -> List[Dict[str, str]]:
    manifest = _read_json(manifest_path)
    cases = manifest.get("cases", [])
    if not isinstance(cases, list) or not cases:
        raise ValueError(f"No cases in manifest: {manifest_path}")

    out: List[Dict[str, str]] = []
    for c in cases:
        if not isinstance(c, dict) or "id" not in c or "path" not in c:
            raise ValueError(f"Bad case entry in {manifest_path}: {c}")
        out.append(
            {
                "id": str(c["id"]),
                "path": str(c["path"]),
                "type": str(c.get("type", "protocol_text")),
            }
        )
    return out


def _count_hyp_markers(text: str) -> int:
    return sum(1 for line in text.splitlines() for pat in HYP_PATTERNS if pat.search(line))


def _missing_markers(text: str) -> List[str]:
    missing: List[str] = []
    for name, rx in REQUIRED_MARKERS:
        if not rx.search(text):
            missing.append(name)
    return missing


def _check_baseline(profile: str, baseline_path: Path) -> Tuple[bool, List[str]]:
    """Baseline is optional in this SoT40 bundle.

    If present, it must be parseable and sane.
    If missing, we emit a warning but do not fail the run.
    """
    warnings: List[str] = []

    if not baseline_path.exists():
        warnings.append(f"baseline missing (skipped): {baseline_path}")
        return True, warnings

    try:
        data = _read_json(baseline_path)
    except Exception as e:
        return False, [f"baseline parse failed: {baseline_path} ({e})"]

    # minimal sanity if the file exists
    if not isinstance(data, dict):
        return False, ["baseline must be a JSON object"]

    # allow flexible shapes; only check that alive_index can be extracted and is in [0..1]
    alive = None
    if isinstance(data.get("baseline_alive_index"), (int, float)):
        alive = float(data["baseline_alive_index"])
    elif isinstance(data.get("baselines"), dict) and isinstance(data["baselines"].get("alive_index"), (int, float)):
        alive = float(data["baselines"]["alive_index"])

    if alive is None:
        warnings.append("baseline file present but baseline_alive_index not found (skipped)")
        return True, warnings

    if not (0.0 <= alive <= 1.0):
        return False, [f"baseline_alive_index not in [0..1] (got {alive})"]

    # canon profile can choose to enforce baseline presence later via a dedicated eval case.
    if profile == "canon":
        return True, warnings

    return True, warnings


def _run_metrics_contract(case_path: Path, default_profile: str) -> Tuple[bool, int, List[str], Dict[str, Any]]:
    cfg = _read_json(case_path)
    extract = cfg.get("extract")
    baseline = cfg.get("baseline", {})
    expect = cfg.get("expect", {})

    if not isinstance(extract, dict):
        return False, 0, ["extract_missing_or_not_object"], {"case": str(case_path)}

    profile = str(cfg.get("profile", default_profile))
    expect_gate = str(expect.get("gate_status", "PASS"))
    expect_inv_ok = bool(expect.get("invariants_ok", True))

    tmp_dir = Path("evals/_tmp") / case_path.stem
    tmp_dir.mkdir(parents=True, exist_ok=True)

    extract_path = tmp_dir / "extract.json"
    baseline_path = tmp_dir / "baseline.json"
    out_path = tmp_dir / "compute.json"

    extract_path.write_text(json.dumps(extract, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    baseline_path.write_text(json.dumps(baseline, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    cmd = [
        sys.executable,
        "tools/metrics_runner.py",
        "--profile",
        profile,
        "--baseline",
        str(baseline_path),
        "--input",
        str(extract_path),
        "--out",
        str(out_path),
    ]

    p = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    details: Dict[str, Any] = {
        "cmd": " ".join(cmd),
        "returncode": p.returncode,
        "stdout_tail": p.stdout[-2000:],
        "stderr_tail": p.stderr[-2000:],
    }
    if p.returncode != 0:
        return False, 0, ["metrics_runner_failed"], details

    compute = json.loads(out_path.read_text(encoding="utf-8"))
    gate = compute.get("gate", {})

    inv_ok = True
    for f in compute.get("findings", []):
        if isinstance(f, dict) and f.get("code") == "INVARIANTS_BROKEN":
            inv_ok = False

    gate_status = str(gate.get("status", ""))
    ok = (gate_status == expect_gate) and (inv_ok == expect_inv_ok)

    details.update({"gate_status": gate_status, "invariants_ok": inv_ok})
    return ok, 0, [], details


def run(profile: str, cases_manifest: Path, out_path: Path, hyp_threshold: int) -> int:
    cases = _load_cases(cases_manifest)

    baseline_ok, baseline_warnings = _check_baseline(profile, Path("ledger/baselines.json"))

    results: List[CaseResult] = []
    for c in cases:
        case_type = str(c.get("type", "protocol_text"))
        p = Path(c["path"])
        b = p.stat().st_size if p.exists() else 0
        ln = p.read_text(encoding="utf-8").count("\n") + 1 if p.exists() else 0

        if case_type == "metrics_contract":
            ok, hyp_markers, missing, details = _run_metrics_contract(p, profile)
            results.append(
                CaseResult(
                    id=c["id"],
                    path=c["path"],
                    case_type=case_type,
                    passed=ok,
                    hyp_markers=hyp_markers,
                    missing_markers=missing,
                    bytes=b,
                    lines=ln,
                    details=details,
                )
            )
            continue

        # default: protocol_text
        text = p.read_text(encoding="utf-8")
        hyp = _count_hyp_markers(text)
        missing = _missing_markers(text)
        passed = (hyp <= hyp_threshold) and (len(missing) == 0)
        results.append(
            CaseResult(
                id=c["id"],
                path=c["path"],
                case_type=case_type,
                passed=passed,
                hyp_markers=hyp,
                missing_markers=missing,
                bytes=b,
                lines=ln,
            )
        )

    cases_total = len(results)
    cases_pass = sum(1 for r in results if r.passed)
    cases_fail = cases_total - cases_pass
    hyp_total = sum(r.hyp_markers for r in results)

    out: Dict[str, Any] = {
        "generated_at": dt.datetime.now(dt.timezone.utc).isoformat(),
        "profile": profile,
        "thresholds": {"hyp_marker_threshold": hyp_threshold},
        "summary": {
            "cases_total": cases_total,
            "cases_pass": cases_pass,
            "cases_fail": cases_fail,
            "hyp_markers_total": hyp_total,
            "baseline_ok": baseline_ok,
            "baseline_warnings": baseline_warnings,
        },
        "cases": [
            {
                "id": r.id,
                "path": r.path,
                "type": r.case_type,
                "pass": r.passed,
                "hyp_markers": r.hyp_markers,
                "missing_markers": r.missing_markers,
                "bytes": r.bytes,
                "lines": r.lines,
                "details": r.details,
            }
            for r in results
        ],
    }

    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    print(json.dumps(out["summary"], ensure_ascii=False))

    if not baseline_ok:
        return 1
    if cases_fail > 0:
        return 1
    return 0


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--profile", choices=["canon", "lab"], default="canon")
    ap.add_argument("--cases", default="evals/cases/manifest.json")
    ap.add_argument("--out", default="evals/_out/dashboard.json")
    ap.add_argument("--hyp-threshold", type=int, default=None)
    args = ap.parse_args()

    default_threshold = 0 if args.profile == "canon" else 2
    hyp_threshold = args.hyp_threshold if args.hyp_threshold is not None else default_threshold

    return run(
        profile=args.profile,
        cases_manifest=Path(args.cases),
        out_path=Path(args.out),
        hyp_threshold=hyp_threshold,
    )


if __name__ == "__main__":
    raise SystemExit(main())
