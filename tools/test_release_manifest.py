#!/usr/bin/env python3
"""Acceptance tests for the release-manifest transport contract."""

from __future__ import annotations

import contextlib
import hashlib
import importlib.util
import io
import json
import stat
import sys
import tempfile
import unittest
import warnings
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / (
    "skills/iskra-skill-pack-builder-2026-06-25/skills/hermes/"
    "iskra-release-ledger/scripts/release_manifest.py"
)
SPEC = importlib.util.spec_from_file_location("release_manifest", SCRIPT)
if SPEC is None or SPEC.loader is None:
    raise RuntimeError(f"cannot import {SCRIPT}")
release_manifest = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = release_manifest
SPEC.loader.exec_module(release_manifest)


class ReleaseManifestTransportTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temp = tempfile.TemporaryDirectory(prefix="iskra-release-manifest-")
        self.root = Path(self.temp.name)
        self.source = self.root / "source"
        self.source.mkdir()
        (self.source / "a.txt").write_bytes(b"same-content\n")
        self.manifest = self.root / "manifest.json"
        code, payload, _ = self.run_cli(
            ["build", str(self.source), "--output", str(self.manifest)]
        )
        self.assertEqual(code, 0, payload)

    def tearDown(self) -> None:
        self.temp.cleanup()

    @staticmethod
    def run_cli(args: list[str]) -> tuple[int, dict, dict]:
        stdout = io.StringIO()
        stderr = io.StringIO()
        with contextlib.redirect_stdout(stdout), contextlib.redirect_stderr(stderr):
            code = release_manifest.main(args)
        out = json.loads(stdout.getvalue()) if stdout.getvalue().strip() else {}
        err = json.loads(stderr.getvalue()) if stderr.getvalue().strip() else {}
        return code, out, err

    def write_zip(self, path: Path, files: dict[str, bytes]) -> None:
        with zipfile.ZipFile(path, "w", zipfile.ZIP_DEFLATED) as archive:
            for name, data in files.items():
                archive.writestr(name, data)

    def test_t1_directory_to_directory_strict_passes(self) -> None:
        code, payload, _ = self.run_cli(
            ["verify", str(self.source), "--manifest", str(self.manifest)]
        )
        self.assertEqual(code, 0, payload)
        self.assertTrue(payload["ok"])
        self.assertIsNone(payload["transport_transition"])

    def test_t2_zip_to_zip_strict_passes(self) -> None:
        archive = self.root / "artifact.zip"
        self.write_zip(archive, {"a.txt": b"same-content\n"})
        zip_manifest = self.root / "zip-manifest.json"
        code, _, _ = self.run_cli(
            ["build", str(archive), "--output", str(zip_manifest)]
        )
        self.assertEqual(code, 0)
        code, payload, _ = self.run_cli(
            ["verify", str(archive), "--manifest", str(zip_manifest)]
        )
        self.assertEqual(code, 0, payload)
        self.assertTrue(payload["ok"])

    def test_t3_directory_to_zip_without_transition_fails(self) -> None:
        archive = self.root / "artifact.zip"
        self.write_zip(archive, {"a.txt": b"same-content\n"})
        code, payload, _ = self.run_cli(
            ["verify", str(archive), "--manifest", str(self.manifest)]
        )
        self.assertEqual(code, 1, payload)
        self.assertEqual(payload["differences"][0]["kind"], "artifact_type")

    def test_t4_explicit_directory_to_zip_transition_passes(self) -> None:
        archive = self.root / "artifact.zip"
        self.write_zip(archive, {"a.txt": b"same-content\n"})
        code, payload, _ = self.run_cli(
            [
                "verify",
                str(archive),
                "--manifest",
                str(self.manifest),
                "--transport-transition",
                "directory:zip",
            ]
        )
        self.assertEqual(code, 0, payload)
        self.assertTrue(payload["ok"])
        self.assertEqual(payload["transport_transition"]["source_type"], "directory")
        self.assertEqual(payload["transport_transition"]["target_type"], "zip")

    def test_t5_transition_with_tampered_content_fails(self) -> None:
        archive = self.root / "tampered.zip"
        self.write_zip(archive, {"a.txt": b"tampered\n"})
        code, payload, _ = self.run_cli(
            [
                "verify",
                str(archive),
                "--manifest",
                str(self.manifest),
                "--transport-transition",
                "directory:zip",
            ]
        )
        self.assertEqual(code, 1, payload)
        self.assertFalse(payload["transport_transition"]["content_identity_verified"])
        self.assertTrue(
            any(item["kind"] in {"bytes", "sha256"} for item in payload["differences"])
        )

    def test_t6_unsafe_zip_members_fail_closed(self) -> None:
        cases = {
            "duplicate": self.root / "duplicate.zip",
            "casefold": self.root / "casefold.zip",
            "symlink": self.root / "symlink.zip",
        }
        with warnings.catch_warnings():
            warnings.simplefilter("ignore", UserWarning)
            with zipfile.ZipFile(cases["duplicate"], "w") as archive:
                archive.writestr("a.txt", b"one")
                archive.writestr("a.txt", b"two")
        self.write_zip(cases["casefold"], {"A.txt": b"one", "a.txt": b"two"})
        link_info = zipfile.ZipInfo("link")
        link_info.create_system = 3
        link_info.external_attr = (stat.S_IFLNK | 0o777) << 16
        with zipfile.ZipFile(cases["symlink"], "w") as archive:
            archive.writestr(link_info, "target")

        expected_fragments = {
            "duplicate": "duplicate path",
            "casefold": "case-fold collision",
            "symlink": "ZIP symlink rejected",
        }
        for name, archive in cases.items():
            with self.subTest(name=name):
                code, _, error = self.run_cli(["build", str(archive)])
                self.assertEqual(code, 2, error)
                self.assertIn(expected_fragments[name], error["message"])

    def test_t7_transition_receipt_records_both_identities(self) -> None:
        archive = self.root / "artifact.zip"
        self.write_zip(archive, {"a.txt": b"same-content\n"})
        code, payload, _ = self.run_cli(
            [
                "verify",
                str(archive),
                "--manifest",
                str(self.manifest),
                "--transport-transition",
                "directory:zip",
            ]
        )
        self.assertEqual(code, 0, payload)
        self.assertEqual(payload["transport_transition"]["declared"], "directory:zip")
        self.assertTrue(payload["transport_transition"]["content_identity_verified"])
        self.assertEqual(
            payload["artifact_sha256"],
            hashlib.sha256(archive.read_bytes()).hexdigest(),
        )
        self.assertRegex(payload["manifest_sha256"], r"^[0-9a-f]{64}$")


if __name__ == "__main__":
    unittest.main()
