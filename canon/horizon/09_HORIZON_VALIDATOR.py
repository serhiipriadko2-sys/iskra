"""Horizon v0.1 validator.

PR #1 restores honest validator health only. It does not implement weaving,
epoch commits, entropy guards, full-density guards, graph mutation, or ritual
generation.
"""

from __future__ import annotations

import argparse
import json
import os
from pathlib import Path
from typing import Any


VALID_LABELS = {
    "FORM_PASS",
    "FORM_PASS_NEEDS_HUMAN_REVIEW",
    "SHIFT_BLOCKED",
}


def emit(code: str, message: str, *, path: Path | None = None, status: str = "fail") -> None:
    payload: dict[str, Any] = {
        "code": code,
        "message": message,
        "status": status,
    }
    if path is not None:
        payload["path"] = str(path)
    print(json.dumps(payload, ensure_ascii=False, sort_keys=True))


def load_json(path: Path, invalid_code: str) -> tuple[dict[str, Any] | None, str | None]:
    try:
        with path.open("r", encoding="utf-8") as handle:
            data = json.load(handle)
    except json.JSONDecodeError as exc:
        return None, f"{invalid_code}: {path}: {exc}"
    except OSError as exc:
        return None, f"{invalid_code}: {path}: {exc}"
    if not isinstance(data, dict):
        return None, f"{invalid_code}: {path}: root must be an object"
    return data, None


def validate_contract(contract: dict[str, Any], path: Path) -> str | None:
    if contract.get("schema_version") != "0.1":
        return "schema_version must be 0.1"
    if contract.get("default_wrapper_mode") != "strict":
        return "default_wrapper_mode must be strict"
    if contract.get("meta_permission_required") is not True:
        return "meta_permission_required must be true"

    labels = contract.get("semantic_labels_allowed")
    if not isinstance(labels, list) or not labels:
        return "semantic_labels_allowed must be a non-empty list"
    if "SEMANTIC_PASS" in labels:
        return "SEMANTIC_PASS is not allowed in Horizon v0.1"
    unknown = sorted(set(labels) - VALID_LABELS)
    if unknown:
        return f"unknown semantic labels in {path}: {unknown}"
    return None


def validate_proposal_schema(schema: dict[str, Any], path: Path) -> str | None:
    required = schema.get("required")
    if not isinstance(required, list):
        return "proposal schema required must be a list"
    for field in ("schema_version", "trigger", "mode", "base_epoch", "mutations", "rollback_hint", "semantic_label"):
        if field not in required:
            return f"proposal schema missing required field: {field}"

    properties = schema.get("properties")
    if not isinstance(properties, dict):
        return "proposal schema properties must be an object"
    semantic_label = properties.get("semantic_label")
    if not isinstance(semantic_label, dict):
        return "proposal schema missing semantic_label property"
    labels = semantic_label.get("enum")
    if not isinstance(labels, list) or not labels:
        return "semantic_label enum must be a non-empty list"
    if "SEMANTIC_PASS" in labels:
        return "SEMANTIC_PASS is not allowed in Horizon v0.1"
    unknown = sorted(set(labels) - VALID_LABELS)
    if unknown:
        return f"unknown semantic labels in {path}: {unknown}"

    if "epoch" in properties or "commit" in properties:
        return "commit/epoch fields are out of scope for Horizon v0.1 PR #1"
    return None


def resolve_repo_root(raw: str | None) -> Path:
    if raw:
        return Path(raw).resolve()
    env_root = os.environ.get("HORIZON_REPO_ROOT")
    if env_root:
        return Path(env_root).resolve()
    return Path(__file__).resolve().parents[2]


def main() -> None:
    parser = argparse.ArgumentParser(description="Validate Horizon v0.1 canonical contract.")
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument("--strict", action="store_true", help="Fail when canonical Horizon targets are missing.")
    mode.add_argument("--optional", action="store_true", help="Warn and exit 0 when canonical Horizon targets are missing.")
    parser.add_argument("--repo-root", default=None, help="Repository root. Defaults to HORIZON_REPO_ROOT or script parents.")
    args = parser.parse_args()

    optional = args.optional
    repo_root = resolve_repo_root(args.repo_root)
    horizon_root = repo_root / "canon" / "horizon"
    contract_path = horizon_root / "HORIZON_CONTRACT.json"
    proposal_schema_path = horizon_root / "HORIZON_PROPOSAL_SCHEMA.json"

    missing = [path for path in (contract_path, proposal_schema_path) if not path.exists()]
    if missing:
        code = "MISSING_CANONICAL_TARGET"
        message = "Missing Horizon canonical target(s): " + ", ".join(str(path) for path in missing)
        if optional:
            emit(code, message, status="warn")
            raise SystemExit(0)
        emit(code, message)
        raise SystemExit(1)

    contract, contract_error = load_json(contract_path, "INVALID_CONTRACT")
    if contract_error or contract is None:
        emit("INVALID_CONTRACT", contract_error or "Invalid contract", path=contract_path)
        raise SystemExit(1)
    contract_error = validate_contract(contract, contract_path)
    if contract_error:
        emit("INVALID_CONTRACT", contract_error, path=contract_path)
        raise SystemExit(1)

    proposal_schema, schema_error = load_json(proposal_schema_path, "INVALID_PROPOSAL_SCHEMA")
    if schema_error or proposal_schema is None:
        emit("INVALID_PROPOSAL_SCHEMA", schema_error or "Invalid proposal schema", path=proposal_schema_path)
        raise SystemExit(1)
    schema_error = validate_proposal_schema(proposal_schema, proposal_schema_path)
    if schema_error:
        emit("INVALID_PROPOSAL_SCHEMA", schema_error, path=proposal_schema_path)
        raise SystemExit(1)

    emit("VALIDATOR_PASS", "Horizon validator canonical targets are present and valid.", status="pass")
    raise SystemExit(0)


if __name__ == "__main__":
    main()
