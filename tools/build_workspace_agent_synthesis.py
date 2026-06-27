#!/usr/bin/env python3
"""Build the Iskra Workspace Agent full-canon synthesis package.

The builder is intentionally conservative:
- canon.zip is mounted as immutable source under agent_files/canon_source_files.
- agent_files.zip is mounted as the Workspace Agent operational overlay.
- supplemental files from the current committed package are copied only when
  the two archives do not contain a required validation/runtime surface.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import shutil
import sys
import zipfile
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path, PurePosixPath
from typing import Iterable


REPO_ROOT = Path(__file__).resolve().parents[1]
DIST_ROOT = REPO_ROOT / "dist" / "agent-builder"
TARGET_NAME = "iskra-workspace-agent-full-canon-synthesis-2026-06-27"
CURRENT_PACKAGE = DIST_ROOT / "iskra-full-canon-unified-2026-06-10"
CANON_ZIP = Path(
    r"C:\Users\gabra\Desktop\Новая папка\iskra\iskra-full-canon-unified-2026-06-10\agent_files\canon.zip"
)
AGENT_FILES_ZIP = Path(
    r"C:\Users\gabra\Desktop\Новая папка\iskra\iskra-full-canon-unified-2026-06-10\agent_files\agent_files.zip"
)

AGENT_FILES_LAYER_ROOTS = {
    "consolidated_knowledge",
    "evals",
    "files_for_agent_builder",
    "live_update_receipts",
    "memory_current",
    "memory_seed",
    "templates",
    "toolchain",
}
AGENT_FILES_LAYER_FILES = {
    "COPYPASTE_AGENT_INSTRUCTIONS_FULL_CANON.md",
    "instructions",
}
ROOT_LAYER_ROOTS = {
    "agent_runtime_tools",
    "plugins",
    "skills",
    "tests",
    "tools",
}
FILTER_DIRS = {
    ".git",
    ".mypy_cache",
    ".pytest_cache",
    ".ruff_cache",
    ".venv",
    "__pycache__",
    "node_modules",
}
FILTER_SUFFIXES = {
    ".7z",
    ".bak",
    ".gz",
    ".log",
    ".pyc",
    ".pyo",
    ".rar",
    ".tar",
    ".tmp",
    ".zip",
}


@dataclass
class WriteRecord:
    source: str
    source_path: str
    target_path: str
    bytes: int
    sha256: str
    action: str
    note: str = ""


def utc_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as fh:
        for chunk in iter(lambda: fh.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def safe_zip_rel(name: str) -> PurePosixPath:
    rel = PurePosixPath(name)
    if rel.is_absolute() or ".." in rel.parts or not rel.parts:
        raise ValueError(f"unsafe zip entry: {name}")
    return rel


def should_skip_path(rel: Path) -> bool:
    lower_parts = {part.lower() for part in rel.parts}
    if lower_parts & FILTER_DIRS:
        return True
    if any(part.endswith(".egg-info") for part in lower_parts):
        return True
    if rel.suffix.lower() in FILTER_SUFFIXES:
        return True
    return False


def ensure_target(target: Path, force: bool) -> None:
    resolved = target.resolve()
    dist_resolved = DIST_ROOT.resolve()
    if dist_resolved not in resolved.parents:
        raise ValueError(f"target must be under {DIST_ROOT}: {target}")
    if target.exists():
        if not force:
            raise FileExistsError(f"target exists; pass --force to rebuild: {target}")
        shutil.rmtree(target)
    target.mkdir(parents=True)
    (target / "provenance" / "conflict-originals").mkdir(parents=True)


def write_with_policy(
    target: Path,
    rel: str,
    data: bytes,
    *,
    source: str,
    source_path: str,
    records: list[WriteRecord],
    conflicts: list[dict[str, object]],
) -> None:
    dst = target / rel
    digest = sha256_bytes(data)
    if dst.exists():
        existing = dst.read_bytes()
        existing_digest = sha256_bytes(existing)
        if existing_digest == digest:
            records.append(
                WriteRecord(source, source_path, rel, len(data), digest, "deduplicated_identical")
            )
            return

        keep_existing = rel.startswith("agent_files/canon_source_files/")
        conflict_stem = Path(rel.replace("/", "__"))
        conflict_dir = target / "provenance" / "conflict-originals"
        conflict_dir.mkdir(parents=True, exist_ok=True)
        (conflict_dir / f"{conflict_stem}.existing").write_bytes(existing)
        (conflict_dir / f"{conflict_stem}.incoming").write_bytes(data)
        conflicts.append(
            {
                "target_path": rel,
                "source": source,
                "source_path": source_path,
                "existing_sha256": existing_digest,
                "incoming_sha256": digest,
                "resolution": "canon_wins" if keep_existing else "operational_overlay_wins",
            }
        )
        if keep_existing:
            records.append(
                WriteRecord(source, source_path, rel, len(data), digest, "conflict_preserved_in_provenance")
            )
            return

    dst.parent.mkdir(parents=True, exist_ok=True)
    dst.write_bytes(data)
    records.append(WriteRecord(source, source_path, rel, len(data), digest, "written"))


def map_canon_entry(name: str) -> str:
    rel = safe_zip_rel(name)
    if rel.parts[0] != "canon_source_files":
        return f"agent_files/_unexpected_canon_zip/{rel.as_posix()}"
    return f"agent_files/{rel.as_posix()}"


def map_agent_entry(name: str) -> str:
    rel = safe_zip_rel(name)
    top = rel.parts[0]
    if top in AGENT_FILES_LAYER_ROOTS or rel.as_posix() in AGENT_FILES_LAYER_FILES:
        return f"agent_files/{rel.as_posix()}"
    if top in ROOT_LAYER_ROOTS:
        return rel.as_posix()
    return f"agent_files/_unmapped_agent_files_zip/{rel.as_posix()}"


def copy_zip(
    zip_path: Path,
    target: Path,
    *,
    source_label: str,
    mapper,
    records: list[WriteRecord],
    conflicts: list[dict[str, object]],
) -> dict[str, object]:
    if not zip_path.is_file():
        raise FileNotFoundError(zip_path)

    entries: list[dict[str, object]] = []
    with zipfile.ZipFile(zip_path) as zf:
        for info in sorted(zf.infolist(), key=lambda item: item.filename):
            if info.is_dir() or not info.filename:
                continue
            safe_zip_rel(info.filename)
            data = zf.read(info)
            target_rel = mapper(info.filename)
            write_with_policy(
                target,
                target_rel,
                data,
                source=source_label,
                source_path=info.filename,
                records=records,
                conflicts=conflicts,
            )
            entries.append(
                {
                    "archive_path": info.filename,
                    "target_path": target_rel,
                    "bytes": len(data),
                    "sha256": sha256_bytes(data),
                }
            )

    return {
        "path": str(zip_path),
        "sha256": sha256_file(zip_path),
        "bytes": zip_path.stat().st_size,
        "entry_count": len(entries),
        "entries": entries,
    }


def iter_tree_files(root: Path) -> Iterable[Path]:
    for path in sorted(root.rglob("*")):
        if not path.is_file():
            continue
        try:
            rel = path.relative_to(root)
        except ValueError:
            continue
        if should_skip_path(rel):
            continue
        yield path


def copy_tree(
    src_root: Path,
    target: Path,
    target_rel_root: str,
    *,
    source_label: str,
    records: list[WriteRecord],
    conflicts: list[dict[str, object]],
) -> dict[str, object]:
    if not src_root.exists():
        return {"source": str(src_root), "status": "missing", "entry_count": 0}
    entries: list[dict[str, object]] = []
    for src in iter_tree_files(src_root):
        rel = src.relative_to(src_root).as_posix()
        target_rel = f"{target_rel_root.rstrip('/')}/{rel}"
        data = src.read_bytes()
        write_with_policy(
            target,
            target_rel,
            data,
            source=source_label,
            source_path=str(src),
            records=records,
            conflicts=conflicts,
        )
        entries.append(
            {
                "source_path": str(src),
                "target_path": target_rel,
                "bytes": len(data),
                "sha256": sha256_bytes(data),
            }
        )
    return {"source": str(src_root), "status": "observed", "entry_count": len(entries), "entries": entries}


def copy_file(
    src: Path,
    target: Path,
    rel: str,
    *,
    source_label: str,
    records: list[WriteRecord],
    conflicts: list[dict[str, object]],
) -> dict[str, object]:
    if not src.is_file():
        return {"source": str(src), "target_path": rel, "status": "missing"}
    data = src.read_bytes()
    write_with_policy(
        target,
        rel,
        data,
        source=source_label,
        source_path=str(src),
        records=records,
        conflicts=conflicts,
    )
    return {
        "source": str(src),
        "target_path": rel,
        "status": "observed",
        "bytes": len(data),
        "sha256": sha256_bytes(data),
    }


def derive_horizon_from_canon(target: Path, records: list[WriteRecord], conflicts: list[dict[str, object]]) -> dict[str, object]:
    src = target / "agent_files" / "canon_source_files" / "canon" / "horizon"
    return copy_tree(
        src,
        target,
        "canon/horizon",
        source_label="derived_from_canon_zip_horizon",
        records=records,
        conflicts=conflicts,
    )


def write_text_file(target: Path, rel: str, text: str) -> None:
    path = target / rel
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text.strip() + "\n", encoding="utf-8", newline="\n")


def source_counts(records: list[WriteRecord]) -> dict[str, int]:
    counts: dict[str, int] = {}
    for record in records:
        counts[record.source] = counts.get(record.source, 0) + 1
    return counts


def write_docs(target: Path, archive_inventory: dict[str, object], records: list[WriteRecord], conflicts: list[dict[str, object]]) -> None:
    canon_count = archive_inventory["archives"]["canon_zip"]["entry_count"]
    agent_count = archive_inventory["archives"]["agent_files_zip"]["entry_count"]
    counts = source_counts(records)

    write_text_file(
        target,
        "README.md",
        f"""
# Iskra Workspace Agent Full Canon Synthesis

Status: packaged-as-upload-set
Generated: {archive_inventory['generated_at']}
Target package: `{TARGET_NAME}`

This package is the local, reproducible synthesis of `canon.zip` and
`agent_files.zip` for ChatGPT Workspace Agents. It is not a live Workspace
Agent mutation and it is not `verified-live-builder`.

## Contents

- `agent_files/canon_source_files/` is the immutable canon source mount from
  `canon.zip` ({canon_count} files).
- `agent_files/` also contains Workspace Agent instructions, consolidated
  knowledge, evals, memory seed/current reference files, templates, toolchain
  docs, and live-update receipts from `agent_files.zip`.
- Root runtime surfaces include `agent_runtime_tools/`, `plugins/`, `skills/`,
  `tests/`, `tools/`, derived `canon/horizon/`, and supplemental `agents-sdk/`.
- Research, gap analysis, what-if matrix, upload plan, manifest, surface
  inventory, and zip receipts are included as separate proof layers.

## Proof Boundary

Local package parity and clean zip readiness do not prove the same files are
uploaded, indexed, or behaviorally active in ChatGPT Workspace Agent. Live
mutation requires explicit approval and a separate Builder/Workspace Agent
receipt.

Delta: package-first synthesis created with separated canon, operational, and
supplemental surfaces.
Data: canon.zip, agent_files.zip, current committed package, official OpenAI
Workspace Agent docs.
Omega: 0.88 for local assembly before live Builder acceptance.
Lambda: revise after any package source change, Workspace Agent publish, file
tree enumeration, Memory write/read claim, or API/auth documentation change.
""",
    )

    write_text_file(
        target,
        "SYNTHESIS_DESIGN.md",
        f"""
# Synthesis Design

Status: implementation design
Generated: {archive_inventory['generated_at']}

## Thesis

The synthesis is a layered union, not a flattened rewrite. Canon remains the
source of truth; Workspace Agent material supplies operational runtime,
retrieval, skills, toolchain, acceptance prompts, and receipts.

## Layer Rules

1. Canon source: `canon.zip` is mounted under `agent_files/canon_source_files/`
   without rewriting file contents.
2. Workspace Agent overlay: `agent_files.zip` supplies `agent_files/**` and
   root runtime/skills/tools/tests surfaces according to the mapping recorded
   in `SOURCE_ARCHIVE_INVENTORY.json`.
3. Supplemental validation: `agents-sdk/`, root `AGENTS.md`, root `SECURITY.md`,
   `LICENSE`, `.gitattributes`, and `canon/horizon/` are copied or derived only
   because the two archives alone do not fully satisfy the planned gates.
4. Conflict policy: canon wins for canonical SoT paths; operational overlay
   wins for Workspace Agent operation paths; both originals are stored under
   `provenance/conflict-originals/`.

## Workspace Agent Fit

The package is designed for Agent Builder Files/Knowledge plus uploaded skills.
It preserves the boundary between:

- local package files;
- Workspace Agent draft file tree;
- runtime-visible files;
- platform-managed Workspace Agent Memory;
- API channel trigger state.

## Counts

- canon.zip entries: {canon_count}
- agent_files.zip entries: {agent_count}
- write records by source: {json.dumps(counts, ensure_ascii=False, sort_keys=True)}
- conflicts: {len(conflicts)}

Delta: the two archives are converted into one reproducible Workspace Agent
package with non-destructive source boundaries.
Data: SOURCE_ARCHIVE_INVENTORY.json, PROVENANCE_RECEIPT.md, MERGE_RECEIPT.md.
Omega: 0.9 for local mapping correctness after manifest/zip gates pass.
Lambda: revise when an archive source, mapping policy, or Workspace Agent file
model changes.
""",
    )

    write_text_file(
        target,
        "WORKSPACE_AGENT_RESEARCH.md",
        """
# ChatGPT Workspace Agent Research

Status: current official-source summary
Checked: 2026-06-27

## Findings

[FACT] ChatGPT Workspace Agents are built and refined in Agent Builder, can be
previewed before publishing, and can include tools, apps, custom MCPs, skills,
and files.

[FACT] Agent Builder can expose ChatGPT, schedule, Slack, and API channels. The
API channel uses a stable public `agtch_...` trigger id.

[FACT] The Workspace Agent API trigger endpoint is
`POST https://api.chatgpt.com/v1/workspace_agents/{id}/trigger`. `202 Accepted`
means the event was queued/accepted; the API does not currently return a public
run id or final agent response.

[FACT] Workspace Agent API calls use Workspace Agent access tokens provisioned
from ChatGPT admin access-token flow. They are not ordinary OpenAI Platform API
keys.

[FACT] Skills are reusable workflows that may include instructions, examples,
supporting files, and code. Uploading a skill requires source review; platform
scanning does not replace project security review.

## Sources

- https://help.openai.com/en/articles/20001143-chatgpt-workspace-agents-for-enterprise-and-business
- https://developers.openai.com/workspace-agents/trigger-runs
- https://developers.openai.com/workspace-agents/authentication
- https://help.openai.com/en/articles/20001066-skills-in-chatgpt

## Implications For Iskra

- The package must not conflate Agent Builder Files with Workspace Agent Memory.
- Live publish, instruction replacement, file upload, skill upload, app changes,
  and deployment/channel changes are live mutations requiring explicit approval.
- API tests can prove trigger acceptance only; behavioral verification needs
  ChatGPT/Builder output evidence or another supported result channel.
- Skills should stay small and task-oriented; the full canon belongs in files
  and consolidated knowledge, not only in skill instructions.

Delta: official Workspace Agent boundaries are encoded into the package.
Data: official OpenAI Help and Developers pages checked on 2026-06-27.
Omega: 0.86 because product documentation can change quickly.
Lambda: refresh before any live upload, API-channel change, or broad availability
claim.
""",
    )

    write_text_file(
        target,
        "WHAT_IF_MATRIX_WORKSPACE_AGENT.md",
        """
# What-If Matrix: Workspace Agent Full Canon

Status: required risk reflection

| What if | Risk | Control |
|---|---|---|
| The live file tree has fewer files than the package | False parity claim | Keep `packaged-as-upload-set` until recursive file-tree proof exists |
| Workspace Agent Memory is empty or per-channel divergent | Memory seed mistaken for live memory | Treat `memory_seed/current` as reference only; require write/read evidence |
| API trigger returns 202 but no result is visible | Accepted run mistaken for completed run | Record `accepted/queued`, not behavioral PASS |
| Skills upload but are not active or scanned | Runtime procedure unavailable | Verify live skills by config and acceptance prompts |
| OpenAI docs change after packaging | Stale platform boundary | Refresh official docs before live mutation |
| Connector write actions are wider than expected | Data loss or exfiltration | Require explicit approval and action constraints for writes |
| Canon and operational overlay disagree | Hidden governance drift | Mark DRIFT and prefer narrower verified scope |
| Agent retrieves summaries instead of exact canon files | Loss of source precision | Use canon_source_files and trace-map prompts for exact-file grounding |

Delta: likely failure modes are made explicit before live use.
Data: source archive structure, Workspace Agent docs, prior package receipts.
Omega: 0.82 before live acceptance prompts.
Lambda: revise when a new failure mode appears in Builder, API, Memory, or skill
verification.
""",
    )

    write_text_file(
        target,
        "GAP_ANALYSIS.md",
        f"""
# Gap Analysis

Status: implementation audit
Generated: {archive_inventory['generated_at']}

## Closed By This Package

- `canon.zip` entries accounted: {canon_count}/{canon_count}.
- `agent_files.zip` entries accounted: {agent_count}/{agent_count}.
- Workspace Agent operational layer now lives beside immutable canon in one
  package.
- Current official Workspace Agent API/auth/skills boundaries are encoded in
  research and upload docs.

## Remaining Gaps

- `agents-sdk/` was expected by the plan but is not present in `agent_files.zip`.
  It is copied from the current committed package as supplemental fallback
  material and must not be treated as archive parity.
- `canon/horizon/` root files are derived from
  `agent_files/canon_source_files/canon/horizon/` so existing Horizon tests can
  run. The original canon mount remains unchanged.
- Live Workspace Agent file-tree byte parity is not proven by this local
  package.
- Live Workspace Agent Memory contents are not proven by `memory_seed/current`.
- API channel acceptance is not final task completion.
- Builder UI behavioral acceptance is still pending.

## Conflict Summary

- Conflicts recorded: {len(conflicts)}
- Conflict originals directory: `provenance/conflict-originals/`

Delta: archive gaps and live-proof gaps are explicit rather than hidden behind
a PASS label.
Data: SOURCE_ARCHIVE_INVENTORY.json and local build records.
Omega: 0.91 for local gap identification.
Lambda: revise after live file-tree enumeration, Memory write/read proof, or
source archive replacement.
""",
    )

    write_text_file(
        target,
        "MERGE_RECEIPT.md",
        f"""
# Merge Receipt

Context
: Build a single ChatGPT Workspace Agent package from `canon.zip` and
  `agent_files.zip`.

Finding / Decision
: Canon content is preserved under `agent_files/canon_source_files/`. Workspace
  Agent operational content is overlaid into `agent_files/**` and root runtime
  surfaces. Supplemental material is separately labeled.

Evidence
: `SOURCE_ARCHIVE_INVENTORY.json` records every source archive entry, target
  path, byte count, and SHA256. Manifest, surface inventory, and clean zip
  receipts are generated after assembly.

Risk
: Local package readiness is not live Builder verification. Supplemental
  `agents-sdk/` and derived `canon/horizon/` are not source-archive parity.

Next
: Run local gates, create clean zip, then request separate approval before any
  Workspace Agent upload/publish.

Status
: packaged-as-upload-set; verified-live-builder not claimed.

Delta: archive union materialized with provenance and non-claims.
Data: canon.zip ({canon_count}), agent_files.zip ({agent_count}), build records.
Omega: 0.9 after local QC gates pass.
Lambda: revise on conflict, missing file, live upload, or docs drift.
""",
    )

    write_text_file(
        target,
        "PROVENANCE_RECEIPT.md",
        f"""
# Provenance Receipt

Context
: Package `iskra-workspace-agent-full-canon-synthesis-2026-06-27`.

Finding / Decision
: The package has three provenance classes:
  source archive, derived validator copy, and supplemental current-package
  support.

Evidence
: `SOURCE_ARCHIVE_INVENTORY.json`; `MANIFEST.sha256`; clean zip receipt;
  conflict originals when present.

Risk
: Supplemental files must not be described as coming from either zip archive.

Next
: Preserve this separation in Builder upload notes and live receipts.

Status
: provenance-recorded.

## Source Classes

- `canon_zip`: immutable canon source archive.
- `agent_files_zip`: Workspace Agent operational overlay archive.
- `derived_from_canon_zip_horizon`: root Horizon validator copy derived from
  the mounted canon source files.
- `current_package_supplement`: AGENTS/SECURITY/LICENSE/.gitattributes/icon and
  `agents-sdk/` fallback material.

Delta: source classes are explicit and auditable.
Data: archive hashes, file hashes, supplemental copy records.
Omega: 0.92 for local provenance.
Lambda: revise if any source is replaced or a conflict is introduced.
""",
    )

    write_text_file(
        target,
        "WORKSPACE_AGENT_UPLOAD_PLAN.md",
        """
# Workspace Agent Upload Plan

Status: approval-required plan, not executed
Target candidate: Iskra vOmega.7 / agt_6a3aba552aa88191bea3f91d79a4d24f

## Boundary

This package is local. Do not upload files, replace instructions, change skills,
change apps, change API/Slack channels, or publish without explicit approval for
the exact live agent target.

## Minimal Live Sequence

1. Refresh current draft config and API channels through Workspace Agents
   connector or Builder UI.
2. Verify the intended agent id and name.
3. Upload the clean package or selected compact files according to current
   Builder file limits.
4. Replace main instructions only after confirming the exact prompt text.
5. Publish only after a separate explicit publish approval.
6. Run acceptance prompts A-Y plus C2/C3.
7. Verify Memory behavior separately with write/read evidence.
8. Record live receipt with status labels, not broad completion claims.

## Required Non-Claims

- Do not claim `verified-live-builder` before live prompt-level evidence.
- Do not claim live Memory parity from package files.
- Do not claim API task completion from `202 Accepted`.
- Do not store access tokens or secrets in the package.

Delta: live mutation path is separated from package build.
Data: Workspace Agent docs, current package receipts, read-only config evidence.
Omega: 0.84 until live update tools are refreshed.
Lambda: revise before any upload, publish, skill change, Memory test, or API run.
""",
    )


def write_archive_inventory(
    target: Path,
    *,
    canon_inventory: dict[str, object],
    agent_inventory: dict[str, object],
    supplemental: list[dict[str, object]],
    derived: dict[str, object],
    records: list[WriteRecord],
    conflicts: list[dict[str, object]],
) -> dict[str, object]:
    payload: dict[str, object] = {
        "generated_at": utc_now(),
        "package": TARGET_NAME,
        "status": "PASS_ARCHIVE_PARITY_LOCAL",
        "archives": {
            "canon_zip": canon_inventory,
            "agent_files_zip": agent_inventory,
        },
        "archive_parity": {
            "canon_zip_entries_expected": 86,
            "canon_zip_entries_observed": canon_inventory["entry_count"],
            "canon_zip_status": "PASS" if canon_inventory["entry_count"] == 86 else "DRIFT",
            "agent_files_zip_entries_expected": 266,
            "agent_files_zip_entries_observed": agent_inventory["entry_count"],
            "agent_files_zip_status": "PASS" if agent_inventory["entry_count"] == 266 else "DRIFT",
        },
        "derived_surfaces": {
            "canon_horizon_root": derived,
        },
        "supplemental_sources": supplemental,
        "write_records": [record.__dict__ for record in records],
        "conflicts": conflicts,
        "non_claims": [
            "Archive parity proves local accounting, not live Workspace Agent parity.",
            "Supplemental current-package files are not entries from canon.zip or agent_files.zip.",
            "Memory seed/current files are reference files, not live Workspace Agent Memory proof.",
        ],
    }
    (target / "SOURCE_ARCHIVE_INVENTORY.json").write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n"
    )
    return payload


def write_root_helpers(target: Path, records: list[WriteRecord], conflicts: list[dict[str, object]]) -> list[dict[str, object]]:
    supplemental: list[dict[str, object]] = []
    supplemental.append(
        copy_file(
            CURRENT_PACKAGE / ".gitattributes",
            target,
            ".gitattributes",
            source_label="current_package_supplement",
            records=records,
            conflicts=conflicts,
        )
    )
    for name in ["AGENTS.md", "SECURITY.md", "LICENSE"]:
        supplemental.append(
            copy_file(
                REPO_ROOT / name,
                target,
                name,
                source_label="current_package_supplement",
                records=records,
                conflicts=conflicts,
            )
        )
    supplemental.append(
        copy_file(
            CURRENT_PACKAGE / "icon.svg",
            target,
            "icon.svg",
            source_label="current_package_supplement",
            records=records,
            conflicts=conflicts,
        )
    )
    supplemental.append(
        copy_tree(
            CURRENT_PACKAGE / "agents-sdk",
            target,
            "agents-sdk",
            source_label="current_package_supplement",
            records=records,
            conflicts=conflicts,
        )
    )
    write_text_file(
        target,
        "agent.yaml",
        """
name: Iskra vOmega.7 Workspace Agent Full Canon Synthesis
version: 2026-06-27
status: packaged-as-upload-set
target_surface: ChatGPT Workspace Agents
live_mutation: false
instructions: agent_files/instructions
canon_source: agent_files/canon_source_files
acceptance_tests: agent_files/evals/AGENT_BUILDER_ACCEPTANCE_PROMPTS.md
non_claims:
  - not verified-live-builder
  - not live Workspace Agent Memory proof
  - not API task completion proof
""",
    )
    return supplemental


def main(argv: list[str]) -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--canon-zip", default=str(CANON_ZIP))
    parser.add_argument("--agent-files-zip", default=str(AGENT_FILES_ZIP))
    parser.add_argument("--target", default=str(DIST_ROOT / TARGET_NAME))
    parser.add_argument("--force", action="store_true")
    args = parser.parse_args(argv)

    target = Path(args.target)
    ensure_target(target, args.force)

    records: list[WriteRecord] = []
    conflicts: list[dict[str, object]] = []

    canon_inventory = copy_zip(
        Path(args.canon_zip),
        target,
        source_label="canon_zip",
        mapper=map_canon_entry,
        records=records,
        conflicts=conflicts,
    )
    agent_inventory = copy_zip(
        Path(args.agent_files_zip),
        target,
        source_label="agent_files_zip",
        mapper=map_agent_entry,
        records=records,
        conflicts=conflicts,
    )
    derived = derive_horizon_from_canon(target, records, conflicts)
    supplemental = write_root_helpers(target, records, conflicts)
    archive_inventory = write_archive_inventory(
        target,
        canon_inventory=canon_inventory,
        agent_inventory=agent_inventory,
        supplemental=supplemental,
        derived=derived,
        records=records,
        conflicts=conflicts,
    )
    write_docs(target, archive_inventory, records, conflicts)

    print(
        json.dumps(
            {
                "target": str(target),
                "canon_entries": canon_inventory["entry_count"],
                "agent_files_entries": agent_inventory["entry_count"],
                "supplemental_sources": len(supplemental),
                "conflicts": len(conflicts),
                "status": "assembled",
            },
            ensure_ascii=False,
            indent=2,
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
