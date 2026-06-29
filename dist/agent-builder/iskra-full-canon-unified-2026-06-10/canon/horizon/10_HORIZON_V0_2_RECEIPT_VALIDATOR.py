#!/usr/bin/env python3
"""Validate Horizon v0.2 proposal/rejection receipts.

This is a local Memory gate only. It proves form and boundary checks, not
semantic truth, canon acceptance, or live Builder/GitHub/Supabase mutation.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any


FORBIDDEN_TERMS = {
    "direct canon mutation",
    "silent ledger write",
    "live security policy change",
    "mutate canon directly",
    "edit live security policy",
    "write ledger silently",
}

REQUIRED_FORBIDDEN = {
    "DIRECT_CANON_MUTATION",
    "SILENT_LEDGER_WRITE",
    "LIVE_SECURITY_POLICY_CHANGE",
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


def require_string_array(record: dict[str, Any], field: str, errors: list[str]) -> None:
    value = record.get(field)
    if not isinstance(value, list) or not value or not all(isinstance(item, str) and item.strip() for item in value):
        errors.append(f"{field}: required non-empty string array")


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
    return


def reject_forbidden_action_text(record: dict[str, Any], fields: tuple[str, ...], errors: list[str]) -> None:
    for field in fields:
        value = record.get(field)
        if not isinstance(value, str):
            continue
        text = value.lower()
        for term in sorted(FORBIDDEN_TERMS):
            if term in text:
                errors.append(f"{field}: forbidden mutation phrase found: {term}")


def validate_proposal(record: dict[str, Any]) -> dict[str, Any]:
    errors: list[str] = []
    warnings: list[str] = []
    missing = sorted(PROPOSAL_REQUIRED - set(record))
    if missing:
        errors.append(f"missing required fields: {missing}")
    validate_common(record, errors)
    reject_forbidden_action_text(record, ("proposed_frame_shift", "proposed_action"), errors)
    if record.get("event_type") != "HORIZON_PROPOSAL_EVENT":
        errors.append("event_type must be HORIZON_PROPOSAL_EVENT")
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
    adoml = record.get("adoml")
    if not isinstance(adoml, dict) or not {"delta", "D", "omega", "lambda"}.issubset(adoml):
        errors.append("adoml requires delta, D, omega, lambda")
    elif not isinstance(adoml.get("omega"), (int, float)) or not 0 <= float(adoml["omega"]) <= 1:
        errors.append("adoml.omega must be number 0..1")
    return {"status": "PASS" if not errors else "FAIL", "errors": errors, "warnings": warnings}


def validate_rejected(record: dict[str, Any]) -> dict[str, Any]:
    errors: list[str] = []
    warnings: list[str] = []
    missing = sorted(REJECTED_REQUIRED - set(record))
    if missing:
        errors.append(f"missing required fields: {missing}")
    validate_common(record, errors)
    if record.get("event_type") != "REJECTED_HORIZON_REVIEW":
        errors.append("event_type must be REJECTED_HORIZON_REVIEW")
    if record.get("status") not in {"REJECTED_WITH_REASON", "REOPEN_ON_NEW_EVIDENCE"}:
        errors.append("status is invalid")
    for field in (
        "proposal_id",
        "rejected_at",
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
        for record in load_records(path):
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