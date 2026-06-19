from __future__ import annotations

import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[2]
VALIDATOR_WRAPPER = REPO_ROOT / "tools" / "horizon_validator.py"
WEAVER_WRAPPER = REPO_ROOT / "tools" / "horizon_weaver.py"


def run_script(script: Path, *args: str) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        [sys.executable, str(script), *args],
        text=True,
        capture_output=True,
        check=False,
    )


class HorizonWrapperTests(unittest.TestCase):
    def test_validator_wrapper_strict_passes(self) -> None:
        result = run_script(VALIDATOR_WRAPPER, "--strict", "--repo-root", str(REPO_ROOT))
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertIn("VALIDATOR_PASS", result.stdout)

    def test_validator_missing_target_strict_fails(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            result = run_script(VALIDATOR_WRAPPER, "--strict", "--repo-root", tmp)
        self.assertEqual(result.returncode, 1)
        self.assertIn("MISSING_CANONICAL_TARGET", result.stdout)

    def test_validator_missing_target_optional_warns_and_passes(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            result = run_script(VALIDATOR_WRAPPER, "--optional", "--repo-root", tmp)
        self.assertEqual(result.returncode, 0)
        self.assertIn("WARN:", result.stdout)
        self.assertIn("MISSING_CANONICAL_TARGET", result.stdout)

    def test_weaver_missing_target_strict_fails(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            result = run_script(WEAVER_WRAPPER, "--strict", "--repo-root", tmp)
        self.assertEqual(result.returncode, 1)
        self.assertIn("MISSING_CANONICAL_TARGET", result.stdout)

    def test_weaver_missing_target_optional_warns_and_passes(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            result = run_script(WEAVER_WRAPPER, "--optional", "--repo-root", tmp)
        self.assertEqual(result.returncode, 0)
        self.assertIn("WARN:", result.stdout)
        self.assertIn("MISSING_CANONICAL_TARGET", result.stdout)


if __name__ == "__main__":
    unittest.main()
