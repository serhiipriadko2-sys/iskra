#!/usr/bin/env python3
"""Tests for validate_runtime_dependencies.py."""

from __future__ import annotations

import importlib.util
import json
import shutil
import sys
import tempfile
import unittest
from pathlib import Path

SCRIPT_PATH = Path(__file__).with_name("validate_runtime_dependencies.py")
SPEC = importlib.util.spec_from_file_location("validate_runtime_dependencies", SCRIPT_PATH)
assert SPEC and SPEC.loader
MODULE = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = MODULE
SPEC.loader.exec_module(MODULE)


class RuntimeAuthorityTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.skill_dir = Path(__file__).resolve().parents[1]
        cls.skill_root = cls.skill_dir.parent
        cls.repo_root = cls.skill_dir.parents[4]
        cls.registry = cls.repo_root / "docs" / "skills" / "registry-v1.json"

    def test_canonical_source_passes(self) -> None:
        report = MODULE.validate(self.skill_dir, self.skill_root, self.registry)
        self.assertEqual("PASS", report["status"], report["findings"])
        self.assertEqual(0, report["summary"]["errors"])

    def _copy_fixture(self) -> tuple[tempfile.TemporaryDirectory[str], Path, Path, Path]:
        temp = tempfile.TemporaryDirectory()
        root = Path(temp.name)
        copied_skill_root = root / "skills"
        shutil.copytree(self.skill_root, copied_skill_root)
        copied_skill = copied_skill_root / "iskra-canon-runtime"
        copied_registry = root / "registry-v1.json"
        shutil.copy2(self.registry, copied_registry)
        return temp, copied_skill, copied_skill_root, copied_registry

    def test_missing_resource_fails_closed(self) -> None:
        temp, skill, root, registry = self._copy_fixture()
        self.addCleanup(temp.cleanup)
        (skill / "references" / "voice-council.md").unlink()
        report = MODULE.validate(skill, root, registry)
        self.assertEqual("FAIL", report["status"])
        self.assertIn("RESOURCE_MISSING", {item["code"] for item in report["findings"]})

    def test_unknown_dispatch_owner_fails_closed(self) -> None:
        temp, skill, root, registry = self._copy_fixture()
        self.addCleanup(temp.cleanup)
        manifest_path = skill / "references" / "runtime-dependencies.json"
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        manifest["dispatch_skills"].append("missing-owner")
        manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        report = MODULE.validate(skill, root, registry)
        self.assertEqual("FAIL", report["status"])
        codes = {item["code"] for item in report["findings"]}
        self.assertTrue({"DISPATCH_MISSING", "DISPATCH_REGISTRY_MISSING"} & codes)

    def test_stale_kernel_fails_closed(self) -> None:
        temp, skill, root, registry = self._copy_fixture()
        self.addCleanup(temp.cleanup)
        skill_md = skill / "SKILL.md"
        text = skill_md.read_text(encoding="utf-8").replace(MODULE.CANONICAL_KERNEL, "SECURITY → OUTPUT")
        skill_md.write_text(text, encoding="utf-8")
        report = MODULE.validate(skill, root, registry)
        self.assertEqual("FAIL", report["status"])
        self.assertIn("KERNEL_SKILL_DRIFT", {item["code"] for item in report["findings"]})

    def test_non_active_dispatch_owner_fails_closed(self) -> None:
        temp, skill, root, registry = self._copy_fixture()
        self.addCleanup(temp.cleanup)
        data = json.loads(registry.read_text(encoding="utf-8"))
        for entry in data["skills"]:
            if entry["skill"] == "iskra-sift-auditor":
                entry["status"] = "ABSORB"
                entry["replacement"] = "iskra-canon-runtime"
                break
        registry.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        report = MODULE.validate(skill, root, registry)
        self.assertEqual("FAIL", report["status"])
        self.assertIn("DISPATCH_NOT_ACTIVE", {item["code"] for item in report["findings"]})

    def test_duplicate_registry_owner_fails_closed(self) -> None:
        temp, skill, root, registry = self._copy_fixture()
        self.addCleanup(temp.cleanup)
        data = json.loads(registry.read_text(encoding="utf-8"))
        data["skills"].append(dict(data["skills"][0]))
        registry.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        report = MODULE.validate(skill, root, registry)
        self.assertEqual("FAIL", report["status"])
        self.assertIn("REGISTRY_ENTRY_DUPLICATE", {item["code"] for item in report["findings"]})

    def test_path_escape_fails_closed(self) -> None:
        temp, skill, root, registry = self._copy_fixture()
        self.addCleanup(temp.cleanup)
        manifest_path = skill / "references" / "runtime-dependencies.json"
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        manifest["required_resources"].append("../../outside.txt")
        manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        report = MODULE.validate(skill, root, registry)
        self.assertEqual("FAIL", report["status"])
        self.assertIn("RESOURCE_OUTSIDE_ROOT", {item["code"] for item in report["findings"]})


if __name__ == "__main__":
    unittest.main(verbosity=2)
