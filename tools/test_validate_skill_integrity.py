#!/usr/bin/env python3
"""Tests for tools/validate_skill_integrity.py."""

from __future__ import annotations

import copy
import importlib.util
import json
import tempfile
import unittest
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
MODULE_PATH = HERE / "validate_skill_integrity.py"
SPEC = importlib.util.spec_from_file_location("validate_skill_integrity", MODULE_PATH)
assert SPEC and SPEC.loader
MODULE = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = MODULE
SPEC.loader.exec_module(MODULE)

REGISTRY_PATH = HERE.parent / "docs" / "skills" / "registry-v1.json"


class RegistryTests(unittest.TestCase):
    def load_registry(self) -> dict:
        return json.loads(REGISTRY_PATH.read_text(encoding="utf-8"))

    def audit_copy(self, payload: dict) -> dict:
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "registry.json"
            path.write_text(json.dumps(payload, ensure_ascii=False), encoding="utf-8")
            return MODULE.audit_registry(path, strict=True)

    def test_canonical_registry_passes(self) -> None:
        report = MODULE.audit_registry(REGISTRY_PATH, strict=True)
        self.assertEqual(report["summary"], {"skills": 68, "errors": 0, "warnings": 0, "status": "PASS"})

    def test_status_counts_and_unique_names(self) -> None:
        registry = self.load_registry()
        names = [entry["skill"] for entry in registry["skills"]]
        self.assertEqual(len(names), 68)
        self.assertEqual(len(set(names)), 68)
        self.assertEqual(registry["summary"]["active"], 24)
        self.assertEqual(registry["summary"]["absorb"], 27)
        self.assertEqual(registry["summary"]["codex_only"], 17)
        self.assertEqual(registry["summary"]["target_operational_stack"], 41)

    def test_unknown_replacement_fails_closed(self) -> None:
        registry = self.load_registry()
        candidate = copy.deepcopy(registry)
        absorbed = next(entry for entry in candidate["skills"] if entry["status"] == "ABSORB")
        absorbed["replacement"] = "missing-owner"
        report = self.audit_copy(candidate)
        self.assertEqual(report["summary"]["status"], "FAIL")
        self.assertIn("REPLACEMENT_UNKNOWN", {item["code"] for item in report["findings"]})

    def test_summary_drift_fails_closed(self) -> None:
        registry = self.load_registry()
        candidate = copy.deepcopy(registry)
        candidate["summary"]["active"] += 1
        report = self.audit_copy(candidate)
        self.assertEqual(report["summary"]["status"], "FAIL")
        self.assertIn("SUMMARY_MISMATCH", {item["code"] for item in report["findings"]})

    def test_replacement_cycle_fails_closed(self) -> None:
        registry = self.load_registry()
        candidate = copy.deepcopy(registry)
        first = next(entry for entry in candidate["skills"] if entry["status"] == "ABSORB")
        second = next(entry for entry in candidate["skills"] if entry["status"] == "ABSORB" and entry["skill"] != first["skill"])
        first["replacement"] = second["skill"]
        second["replacement"] = first["skill"]
        report = self.audit_copy(candidate)
        codes = {item["code"] for item in report["findings"]}
        self.assertIn("REPLACEMENT_CYCLE", codes)


class FilesystemTests(unittest.TestCase):
    def test_missing_local_reference_is_detected(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            skill = root / "sample"
            (skill / "agents").mkdir(parents=True)
            (skill / "agents" / "openai.yaml").write_text(
                "interface:\n  display_name: Sample\n  short_description: Sample workflow\n",
                encoding="utf-8",
            )
            (skill / "SKILL.md").write_text(
                "---\nname: sample\ndescription: Use for a deterministic sample workflow with explicit validation boundaries.\n---\nRead references/missing.md.\n",
                encoding="utf-8",
            )
            report = MODULE.audit_tree(root)
            self.assertEqual(report["summary"]["status"], "FAIL")
            self.assertIn("REF_MISSING", {item["code"] for item in report["findings"]})

    def test_symlink_entrypoint_is_rejected(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            outside = root / "outside.md"
            outside.write_text("---\nname: leaked\ndescription: External content must not be read through a symlink entrypoint.\n---\n", encoding="utf-8")
            skill = root / "sample"
            skill.mkdir()
            try:
                (skill / "SKILL.md").symlink_to(outside)
            except OSError:
                self.skipTest("symlink creation is unavailable on this platform")
            report = MODULE.audit_tree(root)
            self.assertEqual(report["summary"]["status"], "FAIL")
            self.assertIn("ENTRYPOINT_SYMLINK", {item["code"] for item in report["findings"]})


if __name__ == "__main__":
    unittest.main(verbosity=2)
