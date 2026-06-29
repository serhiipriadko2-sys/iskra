from __future__ import annotations

import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[2]
VALIDATOR = REPO_ROOT / "canon" / "horizon" / "10_HORIZON_V0_2_RECEIPT_VALIDATOR.py"
WRAPPER = REPO_ROOT / "tools" / "horizon_v0_2_validator.py"
PROPOSAL_EXAMPLE = REPO_ROOT / "canon" / "horizon" / "horizon_proposal_event.example.json"
REJECTED_EXAMPLE = REPO_ROOT / "canon" / "horizon" / "rejected_horizon_review.example.json"


def run_validator(*paths: Path) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        [sys.executable, str(VALIDATOR), *[str(path) for path in paths]],
        text=True,
        capture_output=True,
        check=False,
    )


class HorizonV02ValidatorTests(unittest.TestCase):
    def test_examples_pass(self) -> None:
        result = run_validator(PROPOSAL_EXAMPLE, REJECTED_EXAMPLE)
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        payload = json.loads(result.stdout)
        self.assertEqual(payload["status"], "PASS")

    def test_wrapper_runs_canonical_validator(self) -> None:
        result = subprocess.run(
            [
                sys.executable,
                str(WRAPPER),
                "--repo-root",
                str(REPO_ROOT),
                str(PROPOSAL_EXAMPLE),
                str(REJECTED_EXAMPLE),
            ],
            text=True,
            capture_output=True,
            check=False,
        )
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertEqual(json.loads(result.stdout)["status"], "PASS")

    def test_json_array_records_pass(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            tmp_path = Path(tmp) / "records.json"
            proposal = json.loads(PROPOSAL_EXAMPLE.read_text(encoding="utf-8"))
            rejected = json.loads(REJECTED_EXAMPLE.read_text(encoding="utf-8"))
            tmp_path.write_text(json.dumps([proposal, rejected]), encoding="utf-8")

            result = run_validator(tmp_path)
            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
            payload = json.loads(result.stdout)
            self.assertEqual(payload["status"], "PASS")
            self.assertEqual(len(payload["results"]), 2)

    def test_non_object_json_record_fails_without_crash(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            tmp_path = Path(tmp) / "bad-record.json"
            tmp_path.write_text(json.dumps(["not an object"]), encoding="utf-8")

            result = run_validator(tmp_path)
            self.assertEqual(result.returncode, 1)
            self.assertIn("record must be object", result.stdout)

    def test_non_object_jsonl_record_fails_without_crash(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            tmp_path = Path(tmp) / "bad-record.jsonl"
            tmp_path.write_text(json.dumps(["not an object"]) + "\n", encoding="utf-8")

            result = run_validator(tmp_path)
            self.assertEqual(result.returncode, 1)
            self.assertIn("record must be object", result.stdout)

    def test_missing_operator_bias_risk_fails(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            tmp_path = Path(tmp) / "missing_operator_bias_risk.json"
            proposal = json.loads(PROPOSAL_EXAMPLE.read_text(encoding="utf-8"))
            proposal.pop("operator_bias_risk")
            tmp_path.write_text(json.dumps(proposal), encoding="utf-8")

            result = run_validator(tmp_path)
            self.assertEqual(result.returncode, 1)
            self.assertIn("operator_bias_risk", result.stdout)

    def test_direct_canon_mutation_phrase_fails(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            tmp_path = Path(tmp) / "forbidden_action.json"
            proposal = json.loads(PROPOSAL_EXAMPLE.read_text(encoding="utf-8"))
            proposal["proposed_action"] = "mutate canon directly"
            tmp_path.write_text(json.dumps(proposal), encoding="utf-8")

            result = run_validator(tmp_path)
            self.assertEqual(result.returncode, 1)
            self.assertIn("forbidden mutation phrase", result.stdout)


if __name__ == "__main__":
    unittest.main()