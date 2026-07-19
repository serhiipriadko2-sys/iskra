#!/usr/bin/env python3
"""Held-out rotation sampler for the 495 templated tasks (v1.1).

Purpose: the 495 templated tasks are combinatorially similar by construction
(~60 kernels x requirement forms x 20 twists). Scoring the whole grid inflates
apparent sample size. For any strong claim, draw ONE deterministic rotation per
run: at most `per_kernel` tasks per kernel, so no kernel dominates and reruns
with a new seed give a genuinely different, non-overlapping-ish subset.

This is evaluator-private tooling. It does not enter the candidate session.
Deterministic given (seed, per_kernel); prints task_ids + a coverage receipt.
"""
import argparse, csv, json, random, re
from pathlib import Path
from collections import defaultdict

HERE = Path(__file__).resolve().parent
BANK = HERE.parent / "candidate" / "unified_1000_questions_tasks_bnat50_v1_1.md"

def load_templated():
    text = BANK.read_text(encoding="utf-8")
    pat = re.compile(r"^(\d{1,4})\.\s", re.M); ms = list(pat.finditer(text))
    with open(HERE / "variant_marker_map.csv", encoding="utf-8-sig", newline="") as handle:
        marker_ids = {int(r["task_id"]) for r in csv.DictReader(handle)}
    tasks = {}
    for i, m in enumerate(ms):
        tid = int(m.group(1)); end = ms[i + 1].start() if i + 1 < len(ms) else len(text)
        body = re.sub(r"\n## Блок.*$", "", text[m.end():end], flags=re.S)
        tasks[tid] = re.sub(r"\n-{3,}\s*$", "", body.rstrip()).strip()
    return {t: tasks[t] for t in marker_ids}

def kernel_of(body: str) -> str:
    # kernel = first sentence after the leading "<prefix>: " up to the first period
    part = body.split(":", 1)[1] if ":" in body else body
    return re.split(r"\.\s", part.strip())[0][:80].strip().lower()

def rotate(seed: int, per_kernel: int):
    tasks = load_templated()
    by_kernel = defaultdict(list)
    for t, b in tasks.items():
        by_kernel[kernel_of(b)].append(t)
    rng = random.Random(seed)
    chosen = []
    for k in sorted(by_kernel):
        ids = sorted(by_kernel[k]); rng.shuffle(ids)
        chosen.extend(sorted(ids[:per_kernel]))
    return {
        "seed": seed, "per_kernel": per_kernel,
        "templated_total": len(tasks), "kernels": len(by_kernel),
        "rotation_size": len(chosen), "task_ids": sorted(chosen),
    }

if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--seed", type=int, required=True)
    ap.add_argument("--per-kernel", type=int, default=2)
    a = ap.parse_args()
    print(json.dumps(rotate(a.seed, a.per_kernel), ensure_ascii=False, indent=2))
