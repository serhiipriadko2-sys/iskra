from pathlib import Path
import csv
import hashlib
import json
import re

ROOT = Path(__file__).resolve().parents[3]
PACKAGE = ROOT / "ScienceAndTests" / "independent_judge_chatgpt_projects_stack_v3.5-rc.3" / "STUDY_PACKAGES" / "unified1000_bnat50_v1_0"
SOURCE = PACKAGE / "candidate" / "unified_1000_questions_tasks_bnat50_v1_1.md"
VARIANT_MAP = PACKAGE / "evaluator_private" / "variant_marker_map.csv"
BNAT_MAP = PACKAGE / "evaluator_private" / "bnat50_position_map.csv"
STALE = PACKAGE / "evaluator_private" / "answer_staleness_v1_1.json"
WORK = ROOT / "ScienceAndTests" / "unified1000_v1_2"
REPLACEMENTS = WORK / "batches" / "batch01" / "replacements.jsonl"
OUTPUT = WORK / "candidate" / "unified_1000_questions_tasks_bnat50_v1_2_batch01.md"
REGISTRY = WORK / "registry" / "batch01.jsonl"
INVENTORY = WORK / "registry" / "inventory_495.csv"
QC = WORK / "qc" / "BATCH01_QC.json"

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
    if set(tasks) != set(range(1, 1001)):
        missing = sorted(set(range(1, 1001)) - set(tasks))
        extra = sorted(set(tasks) - set(range(1, 1001)))
        raise RuntimeError(f"Task parse mismatch: missing={missing[:10]} extra={extra[:10]}")
    return tasks


def word_ngrams(text: str, n: int = 3) -> set[tuple[str, ...]]:
    words = re.findall(r"[a-zа-яё0-9]+", text.lower())
    return {tuple(words[i:i + n]) for i in range(max(0, len(words) - n + 1))}


def jaccard(left: set, right: set) -> float:
    if not left and not right:
        return 1.0
    return len(left & right) / len(left | right)


source_text = SOURCE.read_text(encoding="utf-8")
before = parse_tasks(source_text)
entries = load_jsonl(REPLACEMENTS)
replacement_by_id = {int(row["task_id"]): row for row in entries}
if len(entries) != 50 or len(replacement_by_id) != 50:
    raise RuntimeError("Batch-01 must contain exactly 50 unique task IDs")

with VARIANT_MAP.open(encoding="utf-8", newline="") as handle:
    marker_rows = list(csv.DictReader(handle))
marker_ids = [int(row["task_id"]) for row in marker_rows]
variant_by_id = {int(row["task_id"]): row["variant_id"] for row in marker_rows}
target_ids = list(replacement_by_id)
if target_ids != marker_ids[:50]:
    raise RuntimeError(f"Batch IDs must equal first 50 marker-grid IDs: {target_ids}")

with BNAT_MAP.open(encoding="utf-8", newline="") as handle:
    bnat_ids = {int(row["task_id"]) for row in csv.DictReader(handle)}
stale_ids = set(json.loads(STALE.read_text(encoding="utf-8"))["stale_answer_task_ids"])
if set(target_ids) & bnat_ids:
    raise RuntimeError("Batch touches frozen BNAT positions")
if set(target_ids) & stale_ids:
    raise RuntimeError("Batch touches the 126 frozen v1.1 rewrites")

for row in entries:
    required = {"task_id", "text", "construct", "domain", "difficulty", "expected_evidence", "failure_mode", "sibling_family", "contamination_risk"}
    missing = required - set(row)
    if missing:
        raise RuntimeError(f"Task {row.get('task_id')} missing metadata: {sorted(missing)}")


def replace_match(match: re.Match) -> str:
    task_id = int(match.group(1))
    if task_id not in replacement_by_id:
        return match.group(0)
    return f"{task_id}. {replacement_by_id[task_id]['text'].strip()}\n\n"


output_text = TASK_RE.sub(replace_match, source_text)
after = parse_tasks(output_text)
changed_ids = sorted(task_id for task_id in before if before[task_id] != after[task_id])
if changed_ids != sorted(target_ids):
    raise RuntimeError(f"Changed-ID gate failed: {changed_ids}")

for task_id in set(range(1, 1001)) - set(target_ids):
    if before[task_id] != after[task_id]:
        raise RuntimeError(f"Frozen task changed: {task_id}")
for task_id in bnat_ids:
    if before[task_id] != after[task_id]:
        raise RuntimeError(f"BNAT freeze failed: {task_id}")
for task_id in stale_ids:
    if before[task_id] != after[task_id]:
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
for task_id in target_ids:
    lowered = after[task_id].lower()
    hits = [phrase for phrase in forbidden_phrases if phrase in lowered]
    if hits:
        raise RuntimeError(f"Forbidden authoring tail leaked into task {task_id}: {hits}")


normalized = [re.sub(r"\s+", " ", after[task_id].strip().lower()) for task_id in target_ids]
if len(normalized) != len(set(normalized)):
    raise RuntimeError("Exact duplicate detected inside Batch-01")

gram_sets = {task_id: word_ngrams(after[task_id]) for task_id in target_ids}
max_pair = {"left": None, "right": None, "score": 0.0}
for index, left_id in enumerate(target_ids):
    for right_id in target_ids[index + 1:]:
        score = jaccard(gram_sets[left_id], gram_sets[right_id])
        if score > max_pair["score"]:
            max_pair = {"left": left_id, "right": right_id, "score": round(score, 6)}
if max_pair["score"] >= 0.35:
    raise RuntimeError(f"Near-duplicate threshold exceeded: {max_pair}")

OUTPUT.parent.mkdir(parents=True, exist_ok=True)
REGISTRY.parent.mkdir(parents=True, exist_ok=True)
QC.parent.mkdir(parents=True, exist_ok=True)
OUTPUT.write_text(output_text, encoding="utf-8", newline="\n")

registry_rows = []
for row in entries:
    task_id = int(row["task_id"])
    private_row = {key: value for key, value in row.items() if key != "text"}
    private_row.update({
        "batch": "batch01",
        "source_variant_id": variant_by_id[task_id],
        "source_task_sha256": sha256_text(before[task_id]),
        "candidate_task_sha256": sha256_text(after[task_id]),
        "candidate_visibility": "PROMPT_ONLY",
    })
    registry_rows.append(private_row)
REGISTRY.write_text("\n".join(json.dumps(row, ensure_ascii=False, sort_keys=True) for row in registry_rows) + "\n", encoding="utf-8", newline="\n")


with INVENTORY.open("w", encoding="utf-8", newline="") as handle:
    fieldnames = ["task_id", "variant_id", "status", "batch", "source_task_sha256", "candidate_task_sha256"]
    writer = csv.DictWriter(handle, fieldnames=fieldnames)
    writer.writeheader()
    for marker_row in marker_rows:
        task_id = int(marker_row["task_id"])
        is_batch = task_id in replacement_by_id
        writer.writerow({
            "task_id": task_id,
            "variant_id": marker_row["variant_id"],
            "status": "DRAFT_REWRITTEN" if is_batch else "PENDING",
            "batch": "batch01" if is_batch else "",
            "source_task_sha256": sha256_text(before[task_id]),
            "candidate_task_sha256": sha256_text(after[task_id]) if is_batch else "",
        })

qc = {
    "schema": "unified1000-v1.2-batch-qc-v1",
    "batch": "batch01",
    "status": "AUTOMATED_QC_PASS_MANUAL_REVIEW_PENDING",
    "source_task_count": len(before),
    "candidate_task_count": len(after),
    "marker_grid_count": len(marker_ids),
    "target_count": len(target_ids),
    "changed_task_ids": changed_ids,
    "unchanged_task_count": 1000 - len(changed_ids),
    "bnat_frozen_count": len(bnat_ids),
    "v1_1_authored_frozen_count": len(stale_ids),
    "forbidden_tail_hits": 0,
    "exact_duplicates": 0,
    "max_pairwise_3gram_jaccard": max_pair,
    "source_bank_sha256": sha256_text(source_text),
    "candidate_bank_sha256": sha256_text(output_text),
    "registry_sha256": sha256_text(REGISTRY.read_text(encoding="utf-8")),
    "manual_semantic_review": "PENDING",
    "live_blind_pilot": "NOT_RUN",
}
QC.write_text(json.dumps(qc, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n")
print(json.dumps(qc, ensure_ascii=False, indent=2))
