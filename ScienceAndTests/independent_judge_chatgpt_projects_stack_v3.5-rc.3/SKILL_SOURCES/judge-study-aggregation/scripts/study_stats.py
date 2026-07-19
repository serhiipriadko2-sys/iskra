#!/usr/bin/env python3
"""Fail-closed descriptive study aggregation for Independent Judge rc.3."""
import argparse
import json
import math
import random
from collections import Counter, defaultdict
from decimal import Decimal, ROUND_HALF_UP
from decimal import Decimal, ROUND_HALF_UP
from numbers import Real

RUN_STATUSES = {"VALID", "INVALID"}
RESULT_STATUSES = {
    "SCORED", "UNKNOWN", "UNSCORABLE", "CONFLICTED",
    "NOT_APPLICABLE", "NOT_RUN", "NOT_ACTIVATED",
}
DOMAINS = {"Q100", "S100", "A100", "R100", "G100", "C100"}
REQUIRED_FIELDS = {
    "task_id", "stratum", "candidate", "run_status", "aggregate_eligible",
    "invalid_reasons", "domain_scores", "statuses", "hard_failures", "length",
}


def mean(values):
    return sum(values) / len(values) if values else None


def round_half_up(value, digits=1):
    if value is None:
        return None
    quantum = Decimal("1").scaleb(-digits)
    return float(Decimal(str(value)).quantize(quantum, rounding=ROUND_HALF_UP))


def round_half_up(value, digits=1):
    if value is None:
        return None
    quantum = Decimal("1").scaleb(-digits)
    return float(Decimal(str(value)).quantize(quantum, rounding=ROUND_HALF_UP))


def bootstrap_interval(values, iters=2000, seed=42):
    if not values:
        return None
    rng = random.Random(seed)
    n = len(values)
    means = sorted(mean([rng.choice(values) for _ in range(n)]) for _ in range(iters))
    return [round_half_up(means[int(0.025 * iters)], 1), round_half_up(means[min(iters - 1, int(0.975 * iters))], 1)]


def _string_list(value):
    return isinstance(value, list) and all(isinstance(item, str) and item.strip() for item in value)


def validate_run(run, index=None):
    prefix = f"record[{index}]" if index is not None else "record"
    errors = []
    if not isinstance(run, dict):
        return [f"{prefix}: NOT_OBJECT"]

    missing = sorted(REQUIRED_FIELDS - set(run))
    errors.extend(f"{prefix}: MISSING_{name.upper()}" for name in missing)

    for name in ("task_id", "stratum", "candidate"):
        if name in run and (not isinstance(run[name], str) or not run[name].strip()):
            errors.append(f"{prefix}: INVALID_{name.upper()}_TYPE")

    if "run_status" in run and run["run_status"] not in RUN_STATUSES:
        errors.append(f"{prefix}: INVALID_RUN_STATUS")
    if "aggregate_eligible" in run and type(run["aggregate_eligible"]) is not bool:
        errors.append(f"{prefix}: INVALID_AGGREGATE_ELIGIBLE_TYPE")
    if "invalid_reasons" in run and not _string_list(run["invalid_reasons"]):
        errors.append(f"{prefix}: INVALID_INVALID_REASONS_TYPE")
    if "hard_failures" in run and not _string_list(run["hard_failures"]):
        errors.append(f"{prefix}: INVALID_HARD_FAILURES_TYPE")
    if "length" in run and (type(run["length"]) is not int or run["length"] < 0):
        errors.append(f"{prefix}: INVALID_LENGTH")

    scores = run.get("domain_scores")
    statuses = run.get("statuses")
    if scores is not None and not isinstance(scores, dict):
        errors.append(f"{prefix}: INVALID_DOMAIN_SCORES_TYPE")
        scores = {}
    if statuses is not None and not isinstance(statuses, dict):
        errors.append(f"{prefix}: INVALID_STATUSES_TYPE")
        statuses = {}
    scores = scores or {}
    statuses = statuses or {}

    unknown_domains = sorted((set(scores) | set(statuses)) - DOMAINS)
    errors.extend(f"{prefix}: UNKNOWN_DOMAIN_{domain}" for domain in unknown_domains)

    for domain in sorted((set(scores) | set(statuses)) & DOMAINS):
        status = statuses.get(domain)
        score = scores.get(domain)
        if status not in RESULT_STATUSES:
            errors.append(f"{prefix}: INVALID_RESULT_STATUS_{domain}")
            continue
        if status == "NOT_ACTIVATED":
            if domain != "C100":
                errors.append(f"{prefix}: NOT_ACTIVATED_ONLY_ALLOWED_FOR_C100")
            if score is not None:
                errors.append(f"{prefix}: NON_NULL_SCORE_FOR_NOT_ACTIVATED_{domain}")
        elif status == "SCORED":
            if isinstance(score, bool) or not isinstance(score, Real):
                errors.append(f"{prefix}: INVALID_SCORE_TYPE_{domain}")
            elif not math.isfinite(float(score)):
                errors.append(f"{prefix}: NON_FINITE_SCORE_{domain}")
            elif not 0 <= float(score) <= 100:
                errors.append(f"{prefix}: SCORE_OUT_OF_RANGE_{domain}")
        elif score is not None:
            errors.append(f"{prefix}: NON_NULL_SCORE_FOR_{status}_{domain}")

    if run.get("hard_failures") and run.get("aggregate_eligible") is True:
        errors.append(f"{prefix}: HARD_FAILURE_MARKED_AGGREGATE_ELIGIBLE")
    if run.get("run_status") == "INVALID" and run.get("aggregate_eligible") is True:
        errors.append(f"{prefix}: INVALID_RUN_MARKED_AGGREGATE_ELIGIBLE")

    pair_id = run.get("pair_id")
    outcome = run.get("pairwise_outcome")
    if pair_id is not None and (not isinstance(pair_id, str) or not pair_id.strip()):
        errors.append(f"{prefix}: INVALID_PAIR_ID")
    if outcome is not None and outcome not in {"A", "B", "tie"}:
        errors.append(f"{prefix}: INVALID_PAIRWISE_OUTCOME")
    if outcome is not None and not pair_id:
        errors.append(f"{prefix}: PAIRWISE_OUTCOME_WITHOUT_PAIR_ID")
    return errors


def eligible(run):
    if not isinstance(run, dict):
        return False
    errors = run.get("_schema_errors")
    if errors is None:
        errors = validate_run(run)
    return (
        not errors
        and run.get("run_status") == "VALID"
        and run.get("aggregate_eligible") is True
        and isinstance(run.get("hard_failures"), list)
        and len(run["hard_failures"]) == 0
    )


def _reason_list(value):
    return value if isinstance(value, list) and all(isinstance(item, str) for item in value) else []


def _invalid_reasons(run):
    return list(run.get("_schema_errors", [])) + _reason_list(run.get("invalid_reasons")) + _reason_list(run.get("hard_failures"))


def summarize(runs, stratum, candidate):
    valid = [run for run in runs if eligible(run)]
    invalid = [run for run in runs if not eligible(run)]
    domains = sorted({
        domain
        for run in runs
        for mapping in (run.get("domain_scores"), run.get("statuses"))
        if isinstance(mapping, dict)
        for domain in mapping
        if domain in DOMAINS
    })
    reason_counts = Counter(reason for run in invalid for reason in _invalid_reasons(run))
    lengths = [run["length"] for run in runs if type(run.get("length")) is int]
    hard_failed = sum(
        isinstance(run.get("hard_failures"), list) and bool(run.get("hard_failures"))
        for run in runs
    )
    row = {
        "stratum": stratum,
        "candidate": candidate,
        "n_runs": len(runs),
        "n_valid": len(valid),
        "n_invalid": len(invalid),
        "n_schema_invalid": sum(bool(run.get("_schema_errors")) for run in runs),
        "invalid_reasons": dict(sorted(reason_counts.items())),
        "hard_failure_rate": round(hard_failed / len(runs), 4) if runs else None,
        "schema_invalid_rate": round(sum(bool(run.get("_schema_errors")) for run in runs) / len(runs), 4) if runs else None,
        "mean_length_descriptive": round(mean(lengths), 1) if lengths else None,
    }
    for domain in domains:
        values = [
            float(run["domain_scores"][domain])
            for run in valid
            if isinstance(run.get("domain_scores"), dict)
            and isinstance(run.get("statuses"), dict)
            and run["statuses"].get(domain) == "SCORED"
            and run["domain_scores"].get(domain) is not None
        ]
        applicable = [
            run for run in valid
            if not isinstance(run.get("statuses"), dict)
            or run["statuses"].get(domain) != "NOT_APPLICABLE"
        ]
        row[domain] = {
            "mean": round_half_up(mean(values), 1) if values else None,
            "n_scored": len(values),
            "n_applicable": len(applicable),
            "n_not_applicable": len(valid) - len(applicable),
            "missingness_rate": round(1 - len(values) / len(applicable), 4) if applicable else None,
            "descriptive_interval": bootstrap_interval(values),
        }
    return row


def aggregate(runs):
    if not isinstance(runs, list):
        raise ValueError("runs payload must be a JSON array")
    grouped = defaultdict(list)
    rejected = []
    annotated = []
    schema_invalid = 0

    for index, raw in enumerate(runs):
        errors = validate_run(raw, index)
        if not isinstance(raw, dict):
            rejected.append({"index": index, "errors": errors})
            schema_invalid += 1
            continue
        run = dict(raw)
        run["_schema_errors"] = errors
        if errors:
            schema_invalid += 1
        candidate = run.get("candidate")
        stratum = run.get("stratum")
        if not isinstance(candidate, str) or not candidate.strip() or not isinstance(stratum, str) or not stratum.strip():
            rejected.append({"index": index, "task_id": run.get("task_id"), "candidate": candidate, "errors": errors})
            continue
        annotated.append(run)
        for key in ((stratum, candidate), ("__OVERALL__", candidate)):
            grouped[key].append(run)

    table = [summarize(group, stratum, candidate) for (stratum, candidate), group in sorted(grouped.items())]
    outcomes = defaultdict(lambda: {"A": 0, "B": 0, "tie": 0, "not_eligible": 0})
    for run in annotated:
        pair_id = run.get("pair_id")
        outcome = run.get("pairwise_outcome")
        if not pair_id:
            continue
        if not eligible(run):
            outcomes[pair_id]["not_eligible"] += 1
        elif outcome in {"A", "B", "tie"}:
            outcomes[pair_id][outcome] += 1

    return {
        "record_validation": {
            "n_records": len(runs),
            "n_schema_invalid": schema_invalid,
            "n_rejected_ungrouped": len(rejected),
            "rejected_records": rejected,
            "verdict": "PASS" if schema_invalid == 0 else "FAIL_CLOSED_WITH_INVALID_RECORDS_EXCLUDED",
        },
        "aggregates": table,
        "pairwise_outcomes": dict(outcomes),
        "label": "DESCRIPTIVE_ONLY; claim ceiling L3; schema-invalid, hard-failed, and non-VALID runs excluded from means.",
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--runs", required=True)
    args = parser.parse_args()
    with open(args.runs, encoding="utf-8") as handle:
        payload = json.load(handle)
    print(json.dumps(aggregate(payload), ensure_ascii=False, indent=2, allow_nan=False))
