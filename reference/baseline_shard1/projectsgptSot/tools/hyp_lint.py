#!/usr/bin/env python3
"""Hypothesis linter (Hyp-Lint) for ISKRA SoT.

Goal
- Enforce low hypothesis budget in CANON (threshold 0 by default).
- Optionally allow a small budget in LAB (threshold 2 by default).
- Exclude citation/quote corpora via allowlist.

What is a "finding"?
- Any line (outside code fences) that appears to explicitly mark hypothesis,
  e.g. contains "Ω↓", "Hypothesis:", "Гипотеза:", "[HYP]".

This is intentionally conservative and mechanical.
It does NOT attempt to infer implicit hypotheses.

Exit codes
- 0: findings <= threshold
- 2: findings > threshold
- 3: usage / internal error

Usage examples
- Canon gate (diff-only):
    python tools/hyp_lint.py --profile canon --threshold 0 --diff-base origin/main

- Lab gate (full scan):
    python tools/hyp_lint.py --profile lab --threshold 2
"""

from __future__ import annotations

import argparse
import fnmatch
import json
import os
import re
import subprocess
import sys
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Iterable, List, Optional, Sequence, Tuple

ROOT = Path(__file__).resolve().parents[1]

DIFF_FALLBACK = False
DIFF_ERROR: str | None = None

CANON_DIRS = ["core", "system", "governance", "metrics", "mind", "ledger"]
LAB_EXTRA_DIRS = ["appendix"]

# Patterns that count as explicit hypotheses.
HYP_PATTERNS: List[re.Pattern[str]] = [
    re.compile(r"Ω↓"),
    # Explicit hypothesis statements (avoid matching the concept word in prose).
    re.compile(r"\bHypothesis\s*:\b", re.IGNORECASE),
    re.compile(r"\bГипотеза\s*:\b", re.IGNORECASE),
    re.compile(r"\[HYP\]\b"),
]


@dataclass
class Finding:
    path: str
    line: int
    excerpt: str
    pattern: str


def _load_allowlist(path: Optional[Path]) -> List[str]:
    if path is None:
        return []
    if not path.exists():
        raise FileNotFoundError(f"allowlist not found: {path}")
    out: List[str] = []
    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        out.append(line)
    return out


def _is_allowlisted(rel: str, allow_globs: Sequence[str]) -> bool:
    # Normalize to forward slashes.
    rel_norm = rel.replace(os.sep, "/")
    return any(fnmatch.fnmatch(rel_norm, g) for g in allow_globs)


def _git_changed_files(diff_base: str, diff_head: str) -> List[str]:
    # Returns repo-relative paths.
    cmd = ["git", "diff", "--name-only", "--diff-filter=ACMRT", f"{diff_base}..{diff_head}"]
    p = subprocess.run(cmd, cwd=str(ROOT), stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if p.returncode != 0:
        raise RuntimeError(f"git diff failed: {p.stderr.strip()}")
    files = [line.strip() for line in p.stdout.splitlines() if line.strip()]
    return files


def _iter_candidate_files(
    profile: str,
    changed_only: Optional[Tuple[str, str]],
    allow_globs: Sequence[str],
    exts: Sequence[str],
) -> List[Path]:
    sot40_bundle = (ROOT / "00_ROUTER.md").exists() and not (ROOT / "core").exists()

    def in_scope(rel: str) -> bool:
        parts = rel.split("/")
        top = parts[0] if parts else ""
        # SoT40 bundles can live at repo root (40 files, no core/system dirs).
        if sot40_bundle and ("/" not in rel):
            return True
        if profile == "canon":
            return top in CANON_DIRS
        return top in (CANON_DIRS + LAB_EXTRA_DIRS)

    candidates: List[str]
    global DIFF_FALLBACK, DIFF_ERROR

    if changed_only is not None:
        base, head = changed_only
        try:
            candidates = _git_changed_files(base, head)
        except Exception as e:
            # If git diff is unavailable (shallow fetch, detached ref, etc.),
            # fall back to a full scan. This keeps CI deterministic and avoids
            # false negatives due to GitHub checkout edge cases.
            DIFF_FALLBACK = True
            DIFF_ERROR = str(e)
            candidates = []
    else:
        candidates = []

    if not candidates:
        dirs = CANON_DIRS if profile == "canon" else (CANON_DIRS + LAB_EXTRA_DIRS)
        for d in dirs:
            root = ROOT / d
            if not root.exists():
                continue
            for p in root.rglob("*"):
                if p.is_file():
                    candidates.append(str(p.relative_to(ROOT)).replace(os.sep, "/"))


        # If this is a SoT40-root bundle, also scan root-level docs as a last-resort fallback.
        if sot40_bundle:
            for ext in exts:
                for p in ROOT.glob(f"*{ext}"):
                    if p.is_file():
                        candidates.append(str(p.relative_to(ROOT)).replace(os.sep, "/"))

    out: List[Path] = []
    for rel in candidates:
        rel = rel.replace(os.sep, "/")
        if not in_scope(rel):
            continue
        if _is_allowlisted(rel, allow_globs):
            continue
        if not any(rel.lower().endswith(e) for e in exts):
            continue
        p = ROOT / rel
        if p.exists() and p.is_file():
            out.append(p)
    return sorted(set(out))


def _scan_file(path: Path) -> List[Finding]:
    # Skip binary-ish files.
    try:
        text = path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        return []

    rel = str(path.relative_to(ROOT)).replace(os.sep, "/")
    findings: List[Finding] = []
    in_fence = False

    for idx, raw in enumerate(text.splitlines(), start=1):
        line = raw.rstrip("\n")

        # Toggle fenced code blocks.
        if line.strip().startswith("```"):
            in_fence = not in_fence
            continue
        if in_fence:
            continue

        for pat in HYP_PATTERNS:
            m = pat.search(line)
            if not m:
                continue
            excerpt = line.strip()
            if len(excerpt) > 200:
                excerpt = excerpt[:200] + "…"
            findings.append(
                Finding(path=rel, line=idx, excerpt=excerpt, pattern=pat.pattern)
            )
            break

    return findings


def main(argv: Optional[Sequence[str]] = None) -> int:
    ap = argparse.ArgumentParser(prog="hyp_lint", add_help=True)
    ap.add_argument("--profile", choices=["canon", "lab"], default="canon")
    ap.add_argument(
        "--threshold",
        type=int,
        default=None,
        help="Max allowed findings. Default: canon=0, lab=2",
    )
    ap.add_argument(
        "--allowlist",
        type=str,
        default="tools/hyp_lint_allowlist.txt",
        help="Path to allowlist file (glob patterns). Default: tools/hyp_lint_allowlist.txt",
    )
    ap.add_argument(
        "--diff-base",
        type=str,
        default=None,
        help="Git ref to diff from (changed-files only).",
    )
    ap.add_argument(
        "--diff-head",
        type=str,
        default="HEAD",
        help="Git ref to diff to (default: HEAD).",
    )
    ap.add_argument(
        "--ext",
        action="append",
        default=None,
        help="File extensions to scan (repeatable). Default: .md,.txt",
    )
    ap.add_argument(
        "--json",
        action="store_true",
        help="Output machine-readable JSON to stdout (in addition to summary).",
    )

    args = ap.parse_args(argv)

    threshold = args.threshold
    if threshold is None:
        threshold = 0 if args.profile == "canon" else 2

    allow_path = (ROOT / args.allowlist).resolve() if args.allowlist else None
    allow_globs = _load_allowlist(allow_path) if allow_path else []

    # Auto-diff base for GitHub PRs if present.
    diff_base = args.diff_base
    if diff_base is None:
        env_base = os.getenv("GITHUB_BASE_REF")
        if env_base:
            diff_base = f"origin/{env_base}"

    changed_only: Optional[Tuple[str, str]] = None
    if diff_base:
        changed_only = (diff_base, args.diff_head)

    exts = args.ext if args.ext else [".md", ".txt"]

    try:
        files = _iter_candidate_files(
            profile=args.profile,
            changed_only=changed_only,
            allow_globs=allow_globs,
            exts=exts,
        )
        all_findings: List[Finding] = []
        for f in files:
            all_findings.extend(_scan_file(f))

        # Group counts by file.
        by_file: dict[str, int] = {}
        for fd in all_findings:
            by_file[fd.path] = by_file.get(fd.path, 0) + 1

        print(
            f"Hyp-Lint: profile={args.profile} files={len(files)} findings={len(all_findings)} threshold={threshold}"
        )
        if all_findings:
            print("Findings:")
            for fd in all_findings[:200]:
                print(f"- {fd.path}:{fd.line}: {fd.excerpt}")
            if len(all_findings) > 200:
                print(f"… truncated ({len(all_findings) - 200} more)")

        payload = {
            "profile": args.profile,
            "threshold": threshold,
            "files_scanned": [str(p.relative_to(ROOT)).replace(os.sep, "/") for p in files],
            "findings": [asdict(f) for f in all_findings],
            "counts_by_file": by_file,
            "allowlist": allow_globs,
            "mode": "changed-only" if (changed_only and not DIFF_FALLBACK) else "full-scan",
            "diff_fallback": DIFF_FALLBACK,
            "diff_error": DIFF_ERROR,
            "diff_base": diff_base,
            "diff_head": args.diff_head,
        }
        if args.json:
            print(json.dumps(payload, ensure_ascii=False, indent=2))

        return 0 if len(all_findings) <= threshold else 2

    except Exception as e:
        print(f"hyp_lint error: {e}", file=sys.stderr)
        return 3


if __name__ == "__main__":
    raise SystemExit(main())
