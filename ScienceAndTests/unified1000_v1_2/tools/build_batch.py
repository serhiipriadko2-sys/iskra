from pathlib import Path
import argparse
import csv
import hashlib
import json
import re

ROOT = Path(__file__).resolve().parents[3]
PACKAGE = ROOT / "ScienceAndTests" / "independent_judge_chatgpt_projects_stack_v3.5-rc.3" / "STUDY_PACKAGES" / "unified1000_bnat50_v1_0"
WORK = ROOT / "ScienceAndTests" / "unified1000_v1_2"
BASELINE = PACKAGE / "candidate" / "unified_1000_questions_tasks_bnat50_v1_1.md"
VARIANT_MAP = PACKAGE / "evaluator_private" / "variant_marker_map.csv"
BNAT_MAP = PACKAGE / "evaluator_private" / "bnat50_position_map.csv"
STALE = PACKAGE / "evaluator_private" / "answer_staleness_v1_1.json"
TASK_RE = re.compile(r"(?ms)^(\d+)\. (.*?)(?=^\d+\. |^---\s*$|\Z)")


def sha256_text(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def load_jsonl(path: Path) -> list[dict]:
    rows = []
    for line_no, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
        if not line.strip():
            continue
        try:
            rows.append(json.loads(line))
        except json.JSONDecodeError as exc:
            raise RuntimeError(f"Invalid JSONL at line {line_no}: {exc}") from exc
    return rows

def parse_tasks(text: str) -> dict[int, str]:
    tasks = {int(match.group(1)): match.group(2).rstrip() for match in TASK_RE.finditer(text)}
    expected = set(range(1, 1001))
    if set(tasks) != expected:
        missing = sorted(expected - set(tasks))
        extra = sorted(set(tasks) - expected)
        raise RuntimeError(f"Task parse mismatch: missing={missing[:10]} extra={extra[:10]}")
    return tasks


def word_ngrams(text: str, n: int = 3) -> set[tuple[str, ...]]:
    words = re.findall(r"[a-zа-яё0-9]+", text.lower())
    return {tuple(words[index:index + n]) for index in range(max(0, len(words) - n + 1))}


def jaccard(left: set, right: set) -> float:
    if not left and not right:
        return 1.0
    return len(left & right) / len(left | right)


def review_gate(batch_number: int) -> dict:
    if batch_number == 1:
        return {"status": "NOT_REQUIRED", "path": None}
    previous = batch_number - 1
    candidates = [
        WORK / "qc" / f"BATCH{previous:02}_OWNER_REVIEW.json",
        WORK / "qc" / f"BATCH{previous:02}_SEMANTIC_REVIEW.json",
    ]
    for path in candidates:
        if not path.exists():
            continue
        payload = json.loads(path.read_text(encoding="utf-8"))
        verdict = str(payload.get("decision") or payload.get("result") or payload.get("status") or "").upper()
        if verdict == "OWNER_ACCEPTED" or verdict.startswith("PASS"):
            return {"status": "PASS", "verdict": verdict, "path": path.relative_to(ROOT).as_posix()}
    raise RuntimeError(f"Previous semantic review gate missing or not PASS for Batch-{previous:02}")

parser = argparse.ArgumentParser()
parser.add_argument("batch", help="Batch name such as batch03")
args = parser.parse_args()
match = re.fullmatch(r"batch(\d{2})", args.batch.lower())
if not match:
    raise SystemExit("Batch must use format batchNN")
batch_number = int(match.group(1))
if batch_number < 1 or batch_number > 10:
    raise SystemExit("Batch number must be between 01 and 10")
batch_name = f"batch{batch_number:02}"

with VARIANT_MAP.open(encoding="utf-8", newline="") as handle:
    marker_rows = list(csv.DictReader(handle))
marker_ids = [int(row["task_id"]) for row in marker_rows]
variant_by_id = {int(row["task_id"]): row["variant_id"] for row in marker_rows}
start = (batch_number - 1) * 50
end = min(batch_number * 50, len(marker_ids))
if start >= len(marker_ids):
    raise RuntimeError(f"{batch_name} starts beyond marker-grid size {len(marker_ids)}")
expected_target_ids = marker_ids[start:end]

if batch_number == 1:
    source_path = BASELINE
else:
    source_path = WORK / "candidate" / f"unified_1000_questions_tasks_bnat50_v1_2_batch{batch_number - 1:02}.md"
replacements_path = WORK / "batches" / batch_name / "replacements.jsonl"
output_path = WORK / "candidate" / f"unified_1000_questions_tasks_bnat50_v1_2_batch{batch_number:02}.md"
registry_path = WORK / "registry" / f"{batch_name}.jsonl"
inventory_path = WORK / "registry" / "inventory_495.csv"
qc_path = WORK / "qc" / f"BATCH{batch_number:02}_QC.json"

review = review_gate(batch_number)
source_text = source_path.read_text(encoding="utf-8")
baseline_text = BASELINE.read_text(encoding="utf-8")
before = parse_tasks(source_text)
baseline = parse_tasks(baseline_text)
entries = load_jsonl(replacements_path)
replacement_by_id = {int(row["task_id"]): row for row in entries}
if len(entries) != len(expected_target_ids) or len(replacement_by_id) != len(expected_target_ids):
    raise RuntimeError(f"{batch_name} must contain exactly {len(expected_target_ids)} unique task IDs")
target_ids = list(replacement_by_id)
if target_ids != expected_target_ids:
    raise RuntimeError(f"Batch IDs must equal marker-grid slice {start}:{end}: {target_ids}")

with BNAT_MAP.open(encoding="utf-8", newline="") as handle:
    bnat_ids = {int(row["task_id"]) for row in csv.DictReader(handle)}
stale_ids = set(json.loads(STALE.read_text(encoding="utf-8"))["stale_answer_task_ids"])
if set(target_ids) & bnat_ids:
    raise RuntimeError("Batch touches frozen BNAT positions")
if set(target_ids) & stale_ids:
    raise RuntimeError("Batch touches the 126 frozen v1.1 rewrites")

required_fields = {
    "task_id", "text", "construct", "domain", "difficulty",
    "expected_evidence", "failure_mode", "sibling_family", "contamination_risk",
}
for row in entries:
    missing = required_fields - set(row)
    if missing:
        raise RuntimeError(f"Task {row.get('task_id')} missing metadata: {sorted(missing)}")

def replace_match(match: re.Match) -> str:
    task_id = int(match.group(1))
    if task_id not in replacement_by_id:
        return match.group(0)
    return f"{task_id}. {replacement_by_id[task_id]['text'].strip()}\n\n"

output_text = TASK_RE.sub(replace_match, source_text)
after = parse_tasks(output_text)
changed_from_source = sorted(task_id for task_id in before if before[task_id] != after[task_id])
if changed_from_source != sorted(target_ids):
    raise RuntimeError(f"Changed-ID gate failed against prior candidate: {changed_from_source}")

for task_id in set(range(1, 1001)) - set(target_ids):
    if before[task_id] != after[task_id]:
        raise RuntimeError(f"Prior candidate task changed outside target: {task_id}")

cumulative_ids = marker_ids[:end]
cumulative_changed = sorted(task_id for task_id in baseline if baseline[task_id] != after[task_id])
if cumulative_changed != sorted(cumulative_ids):
    raise RuntimeError(f"Cumulative changed-ID gate failed: {cumulative_changed}")

for task_id in bnat_ids:
    if baseline[task_id] != after[task_id]:
        raise RuntimeError(f"BNAT freeze failed: {task_id}")
for task_id in stale_ids:
    if baseline[task_id] != after[task_id]:
        raise RuntimeError(f"v1.1 authored freeze failed: {task_id}")

forbidden_phrases = [
    "дополнительный поворот",
    "назови failure mode",
    "добавь pass/fail",
    "ответ должен остаться корректным",
    "назови минимальное действие",
    "expected_evidence",
    "sibling_family",
    "contamination_risk",
]
for task_id in cumulative_ids:
    lowered = after[task_id].lower()
    hits = [phrase for phrase in forbidden_phrases if phrase in lowered]
    if hits:
        raise RuntimeError(f"Forbidden authoring tail leaked into task {task_id}: {hits}")

normalized = [re.sub(r"\s+", " ", after[task_id].strip().lower()) for task_id in cumulative_ids]
if len(normalized) != len(set(normalized)):
    raise RuntimeError("Exact duplicate detected inside cumulative rewritten set")

gram_sets = {task_id: word_ngrams(after[task_id]) for task_id in cumulative_ids}
max_pair = {"left": None, "right": None, "score": 0.0}
for index, left_id in enumerate(cumulative_ids):
    for right_id in cumulative_ids[index + 1:]:
        score = jaccard(gram_sets[left_id], gram_sets[right_id])
        if score > max_pair["score"]:
            max_pair = {"left": left_id, "right": right_id, "score": round(score, 6)}
if max_pair["score"] >= 0.35:
    raise RuntimeError(f"Near-duplicate threshold exceeded: {max_pair}")

output_path.parent.mkdir(parents=True, exist_ok=True)
registry_path.parent.mkdir(parents=True, exist_ok=True)
qc_path.parent.mkdir(parents=True, exist_ok=True)
output_path.write_text(output_text, encoding="utf-8", newline="\n")

registry_rows = []
for row in entries:
    task_id = int(row["task_id"])
    private_row = {key: value for key, value in row.items() if key != "text"}
    private_row.update({
        "batch": batch_name,
        "source_variant_id": variant_by_id[task_id],
        "source_task_sha256": sha256_text(baseline[task_id]),
        "prior_candidate_task_sha256": sha256_text(before[task_id]),
        "candidate_task_sha256": sha256_text(after[task_id]),
        "candidate_visibility": "PROMPT_ONLY",
    })
    registry_rows.append(private_row)
registry_path.write_text(
    "\n".join(json.dumps(row, ensure_ascii=False, sort_keys=True) for row in registry_rows) + "\n",
    encoding="utf-8",
    newline="\n",
)

with inventory_path.open("w", encoding="utf-8", newline="") as handle:
    fieldnames = ["task_id", "variant_id", "status", "batch", "source_task_sha256", "candidate_task_sha256"]
    writer = csv.DictWriter(handle, fieldnames=fieldnames, lineterminator="\n")
    writer.writeheader()
    for index, marker_row in enumerate(marker_rows):
        task_id = int(marker_row["task_id"])
        rewritten = index < end
        assigned_batch = f"batch{index // 50 + 1:02}" if rewritten else ""
        writer.writerow({
            "task_id": task_id,
            "variant_id": marker_row["variant_id"],
            "status": "DRAFT_REWRITTEN" if rewritten else "PENDING",
            "batch": assigned_batch,
            "source_task_sha256": sha256_text(baseline[task_id]),
            "candidate_task_sha256": sha256_text(after[task_id]) if rewritten else "",
        })

qc = {
    "schema": "unified1000-v1.2-batch-qc-v2",
    "batch": batch_name,
    "status": "AUTOMATED_QC_PASS_SEMANTIC_REVIEW_PENDING",
    "previous_review_gate": review,
    "source_task_count": len(before),
    "candidate_task_count": len(after),
    "marker_grid_count": len(marker_ids),
    "target_count": len(target_ids),
    "changed_task_ids": changed_from_source,
    "previous_batches_preserved_count": start,
    "cumulative_rewritten_count": len(cumulative_ids),
    "cumulative_changed_task_ids": cumulative_changed,
    "unchanged_from_v1_1_count": 1000 - len(cumulative_changed),
    "bnat_frozen_count": len(bnat_ids),
    "v1_1_authored_frozen_count": len(stale_ids),
    "forbidden_tail_hits": 0,
    "exact_duplicates": 0,
    "max_pairwise_3gram_jaccard": max_pair,
    "baseline_v1_1_sha256": sha256_text(baseline_text),
    "source_candidate_sha256": sha256_text(source_text),
    "candidate_bank_sha256": sha256_text(output_text),
    "registry_sha256": sha256_text(registry_path.read_text(encoding="utf-8")),
    "semantic_review": "PENDING",
    "owner_acceptance": "NOT_RECORDED",
    "live_blind_pilot": "NOT_RUN",
}
qc_path.write_text(
    json.dumps(qc, ensure_ascii=False, indent=2) + "\n",
    encoding="utf-8",
    newline="\n",
)
print(json.dumps(qc, ensure_ascii=False, indent=2))
