from __future__ import annotations

import json
import shutil
import subprocess
import sys
import unittest
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[2]
VALIDATOR = REPO_ROOT / "canon" / "horizon" / "09_HORIZON_VALIDATOR.py"
CONTRACT = REPO_ROOT / "canon" / "horizon" / "HORIZON_CONTRACT.json"
PROPOSAL_SCHEMA = REPO_ROOT / "canon" / "horizon" / "HORIZON_PROPOSAL_SCHEMA.json"


def run_validator(repo_root: Path) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        [sys.executable, str(VALIDATOR), "--strict", "--repo-root", str(repo_root)],
        text=True,
        capture_output=True,
        check=False,
    )


def write_valid_targets(repo_root: Path) -> Path:
    horizon_root = repo_root / "canon" / "horizon"
    horizon_root.mkdir(parents=True)
    shutil.copyfile(CONTRACT, horizon_root / "HORIZON_CONTRACT.json")
    shutil.copyfile(PROPOSAL_SCHEMA, horizon_root / "HORIZON_PROPOSAL_SCHEMA.json")
    return horizon_root


class HorizonValidatorTests(unittest.TestCase):
    def test_valid_contract_passes(self) -> None:
        result = run_validator(REPO_ROOT)
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertIn("VALIDATOR_PASS", result.stdout)

    def test_invalid_contract_fails(self) -> None:
        with self.subTest("meta_permission_required must stay true"):
            import tempfile

            with tempfile.TemporaryDirectory() as tmp:
                tmp_path = Path(tmp)
                horizon_root = write_valid_targets(tmp_path)
                contract = json.loads((horizon_root / "HORIZON_CONTRACT.json").read_text(encoding="utf-8"))
                contract["meta_permission_required"] = False
                (horizon_root / "HORIZON_CONTRACT.json").write_text(json.dumps(contract), encoding="utf-8")

                result = run_validator(tmp_path)
                self.assertEqual(result.returncode, 1)
                self.assertIn("INVALID_CONTRACT", result.stdout)

    def test_semantic_pass_rejected_from_contract(self) -> None:
        import tempfile

        with tempfile.TemporaryDirectory() as tmp:
            tmp_path = Path(tmp)
            horizon_root = write_valid_targets(tmp_path)
            contract = json.loads((horizon_root / "HORIZON_CONTRACT.json").read_text(encoding="utf-8"))
            contract["semantic_labels_allowed"].append("SEMANTIC_PASS")
            (horizon_root / "HORIZON_CONTRACT.json").write_text(json.dumps(contract), encoding="utf-8")

            result = run_validator(tmp_path)
            self.assertEqual(result.returncode, 1)
            self.assertIn("INVALID_CONTRACT", result.stdout)
            self.assertIn("SEMANTIC_PASS", result.stdout)

    def test_semantic_pass_rejected_from_proposal_schema(self) -> None:
        import tempfile

        with tempfile.TemporaryDirectory() as tmp:
            tmp_path = Path(tmp)
            horizon_root = write_valid_targets(tmp_path)
            schema = json.loads((horizon_root / "HORIZON_PROPOSAL_SCHEMA.json").read_text(encoding="utf-8"))
            schema["properties"]["semantic_label"]["enum"].append("SEMANTIC_PASS")
            (horizon_root / "HORIZON_PROPOSAL_SCHEMA.json").write_text(json.dumps(schema), encoding="utf-8")

            result = run_validator(tmp_path)
            self.assertEqual(result.returncode, 1)
            self.assertIn("INVALID_PROPOSAL_SCHEMA", result.stdout)
            self.assertIn("SEMANTIC_PASS", result.stdout)


if __name__ == "__main__":
    unittest.main()
