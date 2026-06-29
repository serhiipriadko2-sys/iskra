#!/usr/bin/env python3
"""Validate Horizon v0.2 proposal/rejection receipts.

This is a local Memory gate only. It proves form and boundary checks, not
semantic truth, canon acceptance, or live Builder/GitHub/Supabase mutation.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Any


REQUIRED_FORBIDDEN = {
    "DIRECT_CANON_MUTATION",
    "SILENT_LEDGER_WRITE",
    "LIVE_SECURITY_POLICY_CHANGE",
}

FORBIDDEN_TERMS = {
    "direct canon mutation",
    "silent ledger write",
    "live security policy change",
    "mutate canon directly",
    "edit live security policy",
    "write ledger silently",
}

LIVE_MUTATION_TERMS = {
    "agent builder config",
    "builder config",
    "builder ui",
    "deploy edge function",
    "edit workflow",
    "github action",
    "github workflow",
    "live builder",
    "live connector",
    "live github",
    "live mutation",
    "live supabase",
    "merge pull request",
    "publish builder",
    "push branch",
    "runtime config",
    "supabase migration",
    "supabase rls",
    "update github",
    "update supabase",
    "workflow file",
}

PROPOSAL_REQUIRED = {
    "schema_version",
    "event_type",
    "id",
    "created_at",
    "trigger",
    "current_frame",
    "proposed_frame_shift",
    "why_now",
    "evidence_available",
    "missing_evidence",
    "expected_discomfort",
    "operator_bias_risk",
    "safety_scope",
    "proposed_action",
    "rejected_alternatives",
    "review_status",
    "forbidden",
    "autonomy_level",
    "linked_adr",
    "adoml",
}

REJECTED_REQUIRED = {
    "schema_version",
    "event_type",
    "review_id",
    "proposal_id",
    "rejected_at",
    "rejected_by",
    "rejection_reason",
    "what_would_be_lost_if_wrongly_rejected",
    "proposal_risk",
    "operator_bias_risk",
    "reopen_on_new_evidence",
    "evidence_to_watch",
    "next_review_trigger",
    "status",
    "forbidden",
}

PROPOSAL_ALLOWED = PROPOSAL_REQUIRED | {"_source_line"}
REJECTED_ALLOWED = REJECTED_REQUIRED | {"_source_line"}

PROPOSAL_ID_RE = re.compile(r"^HORIZON-PROP-[0-9]{8}-[0-9]{3}$")
REVIEW_ID_RE = re.compile(r"^RHR-[0-9]{8}-[0-9]{3}$")
UTC_INSTANT_RE = re.compile(r"^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}Z$")
ADR_PATH_RE = re.compile(r"^governance/adr_[0-9]{8}_[a-z0-9_]+\.md$")


def load_records(path: Path) -> list[Any]:
    if path.suffix == ".jsonl":
        records: list[Any] = []
        for lineno, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
            if line.strip():
                record = json.loads(line)
                if isinstance(record, dict):
                    record["_source_line"] = lineno
                records.append(record)
        return records

    data = json.loads(path.read_text(encoding="utf-8"))
    if isinstance(data, list):
        return data
    return [data]


def require_string(record: dict[str, Any], field: str, errors: list[str], min_len: int = 3) -> None:
    value = record.get(field)
    if not isinstance(value, str) or len(value.strip()) < min_len:
        errors.append(f"{field}: required string minLength {min_len}")


def require_pattern(
    record: dict[str, Any],
    field: str,
    pattern: re.Pattern[str],
    errors: list[str],
    message: str,
) -> None:
    value = record.get(field)
    if not isinstance(value, str) or not pattern.fullmatch(value):
        errors.append(f"{field}: {message}")


def require_string_array(record: dict[str, Any], field: str, errors: list[str]) -> None:
    value = record.get(field)
    if not isinstance(value, list) or not value or not all(isinstance(item, str) and item.strip() for item in value):
        errors.append(f"{field}: required non-empty string array")


def reject_unknown_fields(record: dict[str, Any], allowed: set[str], errors: list[str]) -> None:
    extra = sorted(set(record) - allowed)
    if extra:
        errors.append(f"unknown fields are not allowed: {extra}")


def validate_common(record: dict[str, Any], errors: list[str]) -> None:
    if record.get("schema_version") != "0.2-proposal":
        errors.append("schema_version must be 0.2-proposal")

    forbidden_value = record.get("forbidden")
    if not isinstance(forbidden_value, list):
        errors.append("forbidden: required list")
        forbidden = set()
    elif not all(isinstance(item, str) for item in forbidden_value):
        errors.append("forbidden: required string array")
        forbidden = {item for item in forbidden_value if isinstance(item, str)}
    else:
        forbidden = set(forbidden_value)

    missing = sorted(REQUIRED_FORBIDDEN - forbidden)
    if missing:
        errors.append(f"forbidden missing required boundary values: {missing}")

    require_string(record, "operator_bias_risk", errors, min_len=40)


def reject_forbidden_action_text(record: dict[str, Any], fields: tuple[str, ...], errors: list[str]) -> None:
    forbidden_phrases = sorted(FORBIDDEN_TERMS | LIVE_MUTATION_TERMS)
    for field in fields:
        value = record.get(field)
        if not isinstance(value, str):
            continue
        text = value.lower()
        for term in forbidden_phrases:
            if term in text:
                errors.append(f"{field}: forbidden mutation phrase found: {term}")


def validate_adoml(record: dict[str, Any], errors: list[str]) -> None:
    adoml = record.get("adoml")
    if not isinstance(adoml, dict):
        errors.append("adoml requires delta, D, omega, lambda")
        return

    extra = sorted(set(adoml) - {"delta", "D", "omega", "lambda"})
    if extra:
        errors.append(f"adoml unknown fields are not allowed: {extra}")

    for field in ("delta", "D", "lambda"):
        value = adoml.get(field)
        if not isinstance(value, str) or len(value.strip()) < 3:
            errors.append(f"adoml.{field}: required non-empty string")

    omega = adoml.get("omega")
    if isinstance(omega, bool) or not isinstance(omega, (int, float)) or not 0 <= float(omega) <= 1:
        errors.append("adoml.omega must be number 0..1")


def validate_proposal(record: dict[str, Any]) -> dict[str, Any]:
    errors: list[str] = []
    warnings: list[str] = []
    missing = sorted(PROPOSAL_REQUIRED - set(record))
    if missing:
        errors.append(f"missing required fields: {missing}")

    reject_unknown_fields(record, PROPOSAL_ALLOWED, errors)
    validate_common(record, errors)
    reject_forbidden_action_text(record, ("proposed_frame_shift", "proposed_action"), errors)

    if record.get("event_type") != "HORIZON_PROPOSAL_EVENT":
        errors.append("event_type must be HORIZON_PROPOSAL_EVENT")

    require_pattern(record, "id", PROPOSAL_ID_RE, errors, "must match HORIZON-PROP-YYYYMMDD-NNN")
    require_pattern(record, "created_at", UTC_INSTANT_RE, errors, "must be UTC YYYY-MM-DDTHH:MM:SSZ")
    require_pattern(record, "linked_adr", ADR_PATH_RE, errors, "must be governance/adr_YYYYMMDD_slug.md")

    if record.get("review_status") not in {
        "DRAFT",
        "SIMULATED",
        "NEEDS_EVIDENCE",
        "ADR_CANDIDATE",
        "REJECTED_WITH_REASON",
        "REOPEN_ON_NEW_EVIDENCE",
    }:
        errors.append("review_status is invalid")

    if record.get("autonomy_level") not in {"L1", "L2", "L3", "L4", "L5"}:
        errors.append("autonomy_level is invalid")

    for field in (
        "trigger",
        "current_frame",
        "proposed_frame_shift",
        "why_now",
        "expected_discomfort",
        "safety_scope",
        "proposed_action",
    ):
        require_string(record, field, errors, min_len=10)

    require_string_array(record, "evidence_available", errors)
    require_string_array(record, "missing_evidence", errors)
    require_string_array(record, "rejected_alternatives", errors)
    validate_adoml(record, errors)

    return {"status": "PASS" if not errors else "FAIL", "errors": errors, "warnings": warnings}


def validate_rejected(record: dict[str, Any]) -> dict[str, Any]:
    errors: list[str] = []
    warnings: list[str] = []
    missing = sorted(REJECTED_REQUIRED - set(record))
    if missing:
        errors.append(f"missing required fields: {missing}")

    reject_unknown_fields(record, REJECTED_ALLOWED, errors)
    validate_common(record, errors)

    if record.get("event_type") != "REJECTED_HORIZON_REVIEW":
        errors.append("event_type must be REJECTED_HORIZON_REVIEW")

    require_pattern(record, "review_id", REVIEW_ID_RE, errors, "must match RHR-YYYYMMDD-NNN")
    require_pattern(record, "proposal_id", PROPOSAL_ID_RE, errors, "must match HORIZON-PROP-YYYYMMDD-NNN")
    require_pattern(record, "rejected_at", UTC_INSTANT_RE, errors, "must be UTC YYYY-MM-DDTHH:MM:SSZ")

    if record.get("status") not in {"REJECTED_WITH_REASON", "REOPEN_ON_NEW_EVIDENCE"}:
        errors.append("status is invalid")

    for field in (
        "rejected_by",
        "rejection_reason",
        "what_would_be_lost_if_wrongly_rejected",
        "proposal_risk",
        "reopen_on_new_evidence",
        "next_review_trigger",
    ):
        require_string(record, field, errors, min_len=10 if field != "rejected_by" else 2)

    require_string_array(record, "evidence_to_watch", errors)

    return {"status": "PASS" if not errors else "FAIL", "errors": errors, "warnings": warnings}


def validate_record(record: Any) -> dict[str, Any]:
    if not isinstance(record, dict):
        return {"status": "FAIL", "errors": [f"record must be object, got {type(record).__name__}"], "warnings": []}

    event_type = record.get("event_type")
    if event_type == "HORIZON_PROPOSAL_EVENT":
        return validate_proposal(record)
    if event_type == "REJECTED_HORIZON_REVIEW":
        return validate_rejected(record)
    return {"status": "FAIL", "errors": [f"unsupported event_type: {event_type!r}"], "warnings": []}


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate Horizon v0.2 JSON/JSONL receipts.")
    parser.add_argument("paths", nargs="+", type=Path)
    args = parser.parse_args()
    results = []
    failed = False

    for path in args.paths:
        records = load_records(path)
        if not records:
            results.append(
                {
                    "status": "FAIL",
                    "errors": ["receipt batch is empty"],
                    "warnings": [],
                    "path": str(path),
                    "id": None,
                }
            )
            failed = True
            continue

        for record in records:
            result = validate_record(record)
            result["path"] = str(path)
            if isinstance(record, dict):
                result["id"] = record.get("id") or record.get("review_id")
                if "_source_line" in record:
                    result["line"] = record["_source_line"]
            else:
                result["id"] = None
            results.append(result)
            failed = failed or result["status"] != "PASS"

    print(json.dumps({"status": "FAIL" if failed else "PASS", "results": results}, ensure_ascii=False, indent=2))
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
