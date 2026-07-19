#!/usr/bin/env python3
import copy
import importlib.util
import json
import subprocess
import sys
import tempfile
from pathlib import Path

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[2]


def load(path, name):
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def base_run(task_id="1", score=80):
    return {
        "task_id": task_id,
        "stratum": "s",
        "candidate": "A",
        "run_status": "VALID",
        "aggregate_eligible": True,
        "invalid_reasons": [],
        "domain_scores": {"Q100": score},
        "statuses": {"Q100": "SCORED"},
        "hard_failures": [],
        "length": 10,
    }


def row_for(output):
    return next(row for row in output["aggregates"] if row["stratum"] == "s")


def assert_mutation_excluded(study, mutate, expected_token):
    good = base_run("good", 80)
    bad = base_run("bad", 100)
    mutate(bad)
    output = study.aggregate([good, bad])
    row = row_for(output)
    assert row["Q100"]["mean"] == 80.0
    assert row["n_invalid"] == 1
    assert output["record_validation"]["n_schema_invalid"] == 1
    reasons = " ".join(row["invalid_reasons"])
    assert expected_token in reasons, (expected_token, reasons)


def main():
    results = []
    swap = load(ROOT / "SKILL_SOURCES/judge-pairwise-swap/scripts/swap_consistency.py", "swap")
    result = swap.evaluate([{"pair_id": "t", "order_ab_winner": "tie", "order_ba_winner": "tie"}])
    assert result["order_robust_rate"] == 1.0 and result["position_bias_suspected"] is False
    assert result["pairs"][0]["robustness"] == "TIE_STABLE"
    results.append("stable tie is robust and winnerless")

    result = swap.evaluate([{"pair_id": "f", "order_ab_winner": "A", "order_ba_winner": "B"}])
    assert result["pairs"][0]["robustness"] == "INCONSISTENT_AS_TIE"
    assert result["pairs"][0]["formal_winner"] is None
    results.append("swap flip becomes tie")

    study = load(ROOT / "SKILL_SOURCES/judge-study-aggregation/scripts/study_stats.py", "study")
    hard_failed = base_run("hard", 100)
    hard_failed.update({"aggregate_eligible": False, "hard_failures": ["TRU-001"], "invalid_reasons": ["TRU-001"]})
    output = study.aggregate([base_run(), hard_failed])
    row = row_for(output)
    assert row["Q100"]["mean"] == 80.0 and row["n_invalid"] == 1 and row["hard_failure_rate"] == 0.5
    results.append("hard-failed run excluded from study mean")

    assert_mutation_excluded(
        study,
        lambda run: run.update({"aggregate_eligible": True, "hard_failures": ["TRU-001"]}),
        "HARD_FAILURE_MARKED_AGGREGATE_ELIGIBLE",
    )
    results.append("aggregate_eligible=true cannot re-admit hard-failed run")

    assert_mutation_excluded(study, lambda run: run.pop("run_status"), "MISSING_RUN_STATUS")
    results.append("missing run_status fails closed")

    assert_mutation_excluded(study, lambda run: run.pop("hard_failures"), "MISSING_HARD_FAILURES")
    results.append("missing hard_failures fails closed")

    assert_mutation_excluded(study, lambda run: run.update({"aggregate_eligible": "true"}), "INVALID_AGGREGATE_ELIGIBLE_TYPE")
    results.append("wrong field types fail closed")

    assert_mutation_excluded(study, lambda run: run.update({"run_status": "DONE"}), "INVALID_RUN_STATUS")
    results.append("invalid run enum fails closed")

    def invalid_result_enum(run):
        run["statuses"]["Q100"] = "PARTIAL"
    assert_mutation_excluded(study, invalid_result_enum, "INVALID_RESULT_STATUS_Q100")
    results.append("invalid result enum fails closed")

    inactive = base_run("inactive", 80)
    inactive["domain_scores"]["C100"] = None
    inactive["statuses"]["C100"] = "NOT_ACTIVATED"
    inactive_output = study.aggregate([inactive])
    assert inactive_output["record_validation"]["n_schema_invalid"] == 0
    assert row_for(inactive_output)["Q100"]["mean"] == 80.0
    results.append("C100 NOT_ACTIVATED envelope is accepted")

    def invalid_inactive_domain(run):
        run["domain_scores"]["Q100"] = None
        run["statuses"]["Q100"] = "NOT_ACTIVATED"
    assert_mutation_excluded(study, invalid_inactive_domain, "NOT_ACTIVATED_ONLY_ALLOWED_FOR_C100")
    results.append("NOT_ACTIVATED outside C100 fails closed")

    def nan_score(run):
        run["domain_scores"]["Q100"] = float("nan")
    assert_mutation_excluded(study, nan_score, "NON_FINITE_SCORE_Q100")
    results.append("NaN score fails closed")

    def infinity_score(run):
        run["domain_scores"]["Q100"] = float("inf")
    assert_mutation_excluded(study, infinity_score, "NON_FINITE_SCORE_Q100")
    results.append("Infinity score fails closed")

    def high_score(run):
        run["domain_scores"]["Q100"] = 101
    assert_mutation_excluded(study, high_score, "SCORE_OUT_OF_RANGE_Q100")
    results.append("out-of-range score fails closed")

    def negative_score(run):
        run["domain_scores"]["Q100"] = -1
    assert_mutation_excluded(study, negative_score, "SCORE_OUT_OF_RANGE_Q100")
    results.append("negative score fails closed")

    assert_mutation_excluded(study, lambda run: run.update({"hard_failures": "none"}), "INVALID_HARD_FAILURES_TYPE")
    results.append("hard_failures wrong type fails closed")

    assert_mutation_excluded(study, lambda run: run.update({"domain_scores": []}), "INVALID_DOMAIN_SCORES_TYPE")
    results.append("domain_scores wrong type fails closed")

    assert_mutation_excluded(study, lambda run: run.update({"statuses": []}), "INVALID_STATUSES_TYPE")
    results.append("statuses wrong type fails closed")

    assert_mutation_excluded(study, lambda run: run.update({"length": 1.5}), "INVALID_LENGTH")
    results.append("length wrong type fails closed")

    non_object = study.aggregate([base_run(), "not-an-object"])
    assert non_object["record_validation"]["n_schema_invalid"] == 1
    assert non_object["record_validation"]["n_rejected_ungrouped"] == 1
    assert row_for(non_object)["Q100"]["mean"] == 80.0
    results.append("non-object run record fails closed without crashing")

    status_only = base_run("status-only", 80)
    status_only["statuses"]["R100"] = "NOT_RUN"
    status_only_output = study.aggregate([status_only])
    status_only_row = row_for(status_only_output)
    assert status_only_row["R100"]["mean"] is None
    assert status_only_row["R100"]["n_scored"] == 0
    assert status_only_row["R100"]["n_applicable"] == 1
    assert status_only_row["R100"]["missingness_rate"] == 1.0
    results.append("status-only domains remain visible in aggregates")

    not_applicable = base_run("na", 80)
    not_applicable["domain_scores"]["Q100"] = None
    not_applicable["statuses"]["Q100"] = "NOT_APPLICABLE"
    applicability_output = study.aggregate([base_run("scored", 80), not_applicable])
    applicability_row = row_for(applicability_output)["Q100"]
    assert applicability_row["n_applicable"] == 1
    assert applicability_row["n_not_applicable"] == 1
    assert applicability_row["missingness_rate"] == 0.0
    results.append("NOT_APPLICABLE excluded from missingness denominator")

    half_up_output = study.aggregate([base_run("a", 66.2), base_run("b", 66.3)])
    assert row_for(half_up_output)["Q100"]["mean"] == 66.3
    results.append("study means use round-half-up")

    with tempfile.TemporaryDirectory() as temp_dir:
        script = ROOT / "SKILL_SOURCES/judge-blind-workflow/scripts/blind_mapping.py"
        subprocess.run(
            [sys.executable, str(script), "--identities", "m1,m2,m3", "--seed", "7", "--out-dir", temp_dir],
            check=True,
            capture_output=True,
            text=True,
        )
        batch = json.loads((Path(temp_dir) / "blind_batch_for_judge.json").read_text(encoding="utf-8"))
        sealed = json.loads((Path(temp_dir) / "sealed_identity_manifest_KEEP_OUTSIDE_JUDGE.json").read_text(encoding="utf-8"))
        assert "mapping" not in batch and "mapping" in sealed and batch["identity_information_included"] is False
    results.append("blind outputs physically separated")

    qc = load(ROOT / "SKILL_SOURCES/judge-bias-calibration/scripts/pack_qc.py", "qc")
    report = qc.run(ROOT / "UPLOAD_TO_PROJECT/knowledge")
    assert report["verdict"] == "PASS" and report["counts"]["criteria"] == 40 and report["counts"]["acceptance"] == 40
    results.append("strict skill pack QC passes")

    print(json.dumps({"passed": len(results), "tests": results}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
