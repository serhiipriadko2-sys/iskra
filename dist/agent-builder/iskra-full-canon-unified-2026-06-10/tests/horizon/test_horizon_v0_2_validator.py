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

    def test_empty_json_array_fails(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            tmp_path = Path(tmp) / "empty.json"
            tmp_path.write_text("[]", encoding="utf-8")

            result = run_validator(tmp_path)
            self.assertEqual(result.returncode, 1)
            self.assertIn("receipt batch is empty", result.stdout)

    def test_empty_jsonl_fails(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            tmp_path = Path(tmp) / "empty.jsonl"
            tmp_path.write_text("", encoding="utf-8")

            result = run_validator(tmp_path)
            self.assertEqual(result.returncode, 1)
            self.assertIn("receipt batch is empty", result.stdout)

    def test_non_object_jsonl_record_fails_without_crash(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            tmp_path = Path(tmp) / "bad-record.jsonl"
            tmp_path.write_text(json.dumps(["not an object"]) + "\n", encoding="utf-8")

            result = run_validator(tmp_path)
            self.assertEqual(result.returncode, 1)
            self.assertIn("record must be object", result.stdout)

    def test_forbidden_must_be_list(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            tmp_path = Path(tmp) / "bad-forbidden.json"
            proposal = json.loads(PROPOSAL_EXAMPLE.read_text(encoding="utf-8"))
            proposal["forbidden"] = "DIRECT_CANON_MUTATION"
            tmp_path.write_text(json.dumps(proposal), encoding="utf-8")

            result = run_validator(tmp_path)
            self.assertEqual(result.returncode, 1)
            self.assertIn("forbidden: required list", result.stdout)

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

    def test_live_connector_mutation_phrase_fails(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            tmp_path = Path(tmp) / "live_mutation_action.json"
            proposal = json.loads(PROPOSAL_EXAMPLE.read_text(encoding="utf-8"))
            proposal["proposed_action"] = "update GitHub and Supabase immediately after this proposal"
            tmp_path.write_text(json.dumps(proposal), encoding="utf-8")

            result = run_validator(tmp_path)
            self.assertEqual(result.returncode, 1)
            self.assertIn("forbidden mutation phrase", result.stdout)

    def test_proposal_identity_fields_are_validated(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            tmp_path = Path(tmp) / "bad-identity.json"
            proposal = json.loads(PROPOSAL_EXAMPLE.read_text(encoding="utf-8"))
            proposal["id"] = "bad"
            proposal["created_at"] = "x"
            proposal["linked_adr"] = ""
            tmp_path.write_text(json.dumps(proposal), encoding="utf-8")

            result = run_validator(tmp_path)
            self.assertEqual(result.returncode, 1)
            self.assertIn("id", result.stdout)
            self.assertIn("created_at", result.stdout)
            self.assertIn("linked_adr", result.stdout)

    def test_rejected_review_id_is_validated(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            tmp_path = Path(tmp) / "bad-review-id.json"
            rejected = json.loads(REJECTED_EXAMPLE.read_text(encoding="utf-8"))
            rejected["review_id"] = "bad"
            tmp_path.write_text(json.dumps(rejected), encoding="utf-8")

            result = run_validator(tmp_path)
            self.assertEqual(result.returncode, 1)
            self.assertIn("review_id", result.stdout)

    def test_extra_receipt_fields_fail(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            tmp_path = Path(tmp) / "extra-field.json"
            proposal = json.loads(PROPOSAL_EXAMPLE.read_text(encoding="utf-8"))
            proposal["live_mutation_approval"] = True
            tmp_path.write_text(json.dumps(proposal), encoding="utf-8")

            result = run_validator(tmp_path)
            self.assertEqual(result.returncode, 1)
            self.assertIn("unknown fields are not allowed", result.stdout)

    def test_adoml_contents_are_validated(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            tmp_path = Path(tmp) / "bad-adoml.json"
            proposal = json.loads(PROPOSAL_EXAMPLE.read_text(encoding="utf-8"))
            proposal["adoml"] = {"delta": "", "D": "", "omega": True, "lambda": ""}
            tmp_path.write_text(json.dumps(proposal), encoding="utf-8")

            result = run_validator(tmp_path)
            self.assertEqual(result.returncode, 1)
            self.assertIn("adoml.delta", result.stdout)
            self.assertIn("adoml.omega", result.stdout)


if __name__ == "__main__":
    unittest.main()
