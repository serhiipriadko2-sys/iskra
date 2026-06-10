#!/usr/bin/env python3
"""Local Horizon Weaver helper for the Iskra Agent Builder package.

Horizon is a map-shift layer around the core. It proposes and validates small,
reversible shifts when the current map blocks movement. It does not edit core
canon, mutate live systems, or prove semantic truth.
"""

from __future__ import annotations

import argparse
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


SCHEMA_VERSION = "0.1"
MODULE = "builder_horizon"
DEFAULT_LEDGER_ROOT = Path("/workspace/memory/horizon")
DEFAULT_PROPOSAL_LEDGER = "horizon_proposals.jsonl"
DEFAULT_EPOCH_LEDGER = "horizon_epoch_log.jsonl"
VALID_LABELS = {"FORM_PASS", "FORM_PASS_NEEDS_HUMAN_REVIEW", "SHIFT_BLOCKED"}
INVALID_LABELS = {"SEMANTIC_PASS"}
FORBIDDEN_TERMS = {
    "consciousness proof",
    "proof of consciousness",
    "auto-evolution",
    "auto evolution",
    "semantic pass",
}
FORBIDDEN_PATH_PREFIXES = (
    "AGENTS.md",
    "canon/core/",
    "canon_source_files/",
    "ledger/",
    ".github/workflows/",
    "system/security.md",
)
ALLOWED_LOCAL_MUTATIONS = {
    "memory/horizon/horizon_proposals.jsonl",
    "memory/horizon/horizon_epoch_log.jsonl",
}


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def load_jsonl(path: Path) -> list[dict[str, Any]]:
    if not path.exists():
        return []
    rows: list[dict[str, Any]] = []
    for line in path.read_text(encoding="utf-8").splitlines():
        if line.strip():
            rows.append(json.loads(line))
    return rows


def append_jsonl(path: Path, row: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("a", encoding="utf-8") as handle:
        handle.write(json.dumps(row, ensure_ascii=False, sort_keys=True) + "\n")


def read_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, payload: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")


def stable_hash(payload: dict[str, Any]) -> str:
    encoded = json.dumps(payload, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8")
    return hashlib.sha256(encoded).hexdigest()


def parse_evidence(values: list[str] | None, evidence_gap: str) -> list[dict[str, str]]:
    evidence: list[dict[str, str]] = []
    for value in values or []:
        evidence.append({"type": "pointer", "value": value})
    if not evidence and evidence_gap:
        evidence.append({"type": "gap", "value": evidence_gap})
    return evidence


def build_proposal(args: argparse.Namespace, base_epoch: int) -> dict[str, Any]:
    label = args.semantic_label
    if not label:
        label = "SHIFT_BLOCKED" if args.blocked_by else "FORM_PASS_NEEDS_HUMAN_REVIEW"
    proposal = {
        "schema_version": SCHEMA_VERSION,
        "module": MODULE,
        "id": f"HORIZON-PROP-{datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%S%fZ')}",
        "created_at": utc_now(),
        "mode": args.mode,
        "base_epoch": base_epoch,
        "trigger": args.trigger.strip(),
        "blocked_by": args.blocked_by.strip(),
        "core_boundary": args.core_boundary.strip(),
        "proposed_shift": args.proposed_shift.strip(),
        "semantic_label": label,
        "evidence": parse_evidence(args.evidence, args.evidence_gap.strip()),
        "rollback_hint": args.rollback_hint.strip(),
        "mutation_policy": {
            "allowed": sorted(ALLOWED_LOCAL_MUTATIONS),
            "forbidden_prefixes": list(FORBIDDEN_PATH_PREFIXES),
            "live_mutation": False,
            "core_mutation": False,
        },
        "adoml": {
            "delta": "map shift proposed, core untouched",
            "D": "proposal fields + evidence pointers",
            "omega": args.omega,
            "lambda": "revise if source evidence, connector scope, or blocked map changes",
        },
    }
    proposal["proposal_hash"] = stable_hash({key: value for key, value in proposal.items() if key != "proposal_hash"})
    return proposal


def current_epoch(epoch_ledger: Path) -> int:
    rows = load_jsonl(epoch_ledger)
    if not rows:
        return 0
    epochs = [int(row.get("epoch", 0)) for row in rows if isinstance(row.get("epoch", 0), int)]
    return max(epochs) if epochs else 0


def status(ledger_root: Path) -> dict[str, Any]:
    proposals_path = ledger_root / DEFAULT_PROPOSAL_LEDGER
    epochs_path = ledger_root / DEFAULT_EPOCH_LEDGER
    proposals = load_jsonl(proposals_path)
    epochs = load_jsonl(epochs_path)
    last_proposal = proposals[-1] if proposals else None
    last_epoch = epochs[-1] if epochs else None
    line = (
        f"horizon: proposals={len(proposals)} epochs={len(epochs)} "
        f"latest={last_proposal.get('semantic_label') if last_proposal else 'none'}"
    )
    return {
        "module": MODULE,
        "schema_version": SCHEMA_VERSION,
        "ledger_root": str(ledger_root),
        "proposal_ledger_exists": proposals_path.exists(),
        "epoch_ledger_exists": epochs_path.exists(),
        "proposals": len(proposals),
        "epochs": len(epochs),
        "last_proposal": last_proposal,
        "last_epoch": last_epoch,
        "line": line,
        "boundary": "Horizon helper availability is local-file evidence only, not Builder UI verification.",
    }


def validate_required_string(payload: dict[str, Any], field: str, errors: list[str]) -> None:
    value = payload.get(field)
    if not isinstance(value, str) or len(value.strip()) < 3:
        errors.append(f"{field.upper()}_REQUIRED")


def validate_proposal(payload: dict[str, Any]) -> dict[str, Any]:
    errors: list[str] = []
    warnings: list[str] = []

    if payload.get("schema_version") != SCHEMA_VERSION:
        errors.append("UNSUPPORTED_SCHEMA_VERSION")
    if payload.get("module") != MODULE:
        errors.append("INVALID_MODULE")

    for field in ("trigger", "blocked_by", "core_boundary", "proposed_shift", "rollback_hint"):
        validate_required_string(payload, field, errors)

    label = payload.get("semantic_label")
    if label in INVALID_LABELS:
        errors.append("SEMANTIC_PASS_INVALID_IN_V0_1")
    elif label not in VALID_LABELS:
        errors.append("INVALID_SEMANTIC_LABEL")

    evidence = payload.get("evidence")
    if not isinstance(evidence, list) or not evidence:
        warnings.append("EVIDENCE_GAP")

    text = json.dumps(payload, ensure_ascii=False).lower()
    for term in FORBIDDEN_TERMS:
        if term in text:
            errors.append(f"FORBIDDEN_CLAIM:{term}")

    mutation_policy = payload.get("mutation_policy")
    if not isinstance(mutation_policy, dict):
        errors.append("MUTATION_POLICY_REQUIRED")
    else:
        if mutation_policy.get("live_mutation") is not False:
            errors.append("LIVE_MUTATION_FORBIDDEN")
        if mutation_policy.get("core_mutation") is not False:
            errors.append("CORE_MUTATION_FORBIDDEN")
        allowed = set(mutation_policy.get("allowed") or [])
        if not allowed.issubset(ALLOWED_LOCAL_MUTATIONS):
            errors.append("UNAPPROVED_ALLOWED_MUTATION_PATH")
        for value in mutation_policy.get("forbidden_prefixes") or []:
            if str(value).startswith(("memory/horizon/", "/workspace/memory/horizon/")):
                errors.append("FORBIDDEN_PREFIX_CONFLICTS_WITH_LOCAL_HORIZON")

    result = "PASS" if not errors else "BLOCKED"
    if result == "PASS" and label == "SHIFT_BLOCKED":
        warnings.append("SHIFT_BLOCKED_IS_VALID_RESULT")
    return {
        "status": result,
        "errors": errors,
        "warnings": warnings,
        "semantic_label": label,
        "proposal_hash": payload.get("proposal_hash") or stable_hash(payload),
        "boundary": "FORM_PASS is structural only; v0.1 has no semantic proof label.",
    }


def commit_epoch(payload: dict[str, Any], validation: dict[str, Any], args: argparse.Namespace, ledger_root: Path) -> dict[str, Any]:
    if args.permission != "HORIZON_COMMIT_APPROVED":
        return {"status": "BLOCKED", "errors": ["PERMISSION_REQUIRED"]}
    if len(args.actor.strip()) < 2:
        return {"status": "BLOCKED", "errors": ["ACTOR_REQUIRED"]}
    if len(args.reason.strip()) < 6:
        return {"status": "BLOCKED", "errors": ["REASON_REQUIRED"]}
    if validation.get("status") != "PASS":
        return {"status": "BLOCKED", "errors": ["VALIDATION_NOT_PASS"], "validation": validation}

    epoch_ledger = ledger_root / DEFAULT_EPOCH_LEDGER
    next_epoch = current_epoch(epoch_ledger) + 1
    entry = {
        "schema_version": SCHEMA_VERSION,
        "module": MODULE,
        "epoch": next_epoch,
        "timestamp": utc_now(),
        "proposal_id": payload.get("id"),
        "proposal_hash": payload.get("proposal_hash") or stable_hash(payload),
        "trigger": payload.get("trigger"),
        "actor": args.actor.strip(),
        "reason": args.reason.strip(),
        "validation_result": validation,
        "status": "committed_local_epoch",
        "rollback_hint": payload.get("rollback_hint"),
        "boundary": "Local Horizon epoch append only; no core, repo, Builder, or live-system mutation.",
    }
    entry["diff_hash"] = stable_hash(entry)
    append_jsonl(epoch_ledger, entry)
    return {"status": "COMMITTED", "entry": entry, "ledger": str(epoch_ledger)}


def add_common_args(parser: argparse.ArgumentParser) -> None:
    parser.add_argument("--ledger-root", default=str(DEFAULT_LEDGER_ROOT), help="Local Horizon ledger root")


def main() -> None:
    parser = argparse.ArgumentParser(description="Local Horizon Weaver helper")
    sub = parser.add_subparsers(dest="command", required=True)

    status_parser = sub.add_parser("status")
    add_common_args(status_parser)

    propose_parser = sub.add_parser("propose")
    add_common_args(propose_parser)
    propose_parser.add_argument("--trigger", required=True)
    propose_parser.add_argument("--blocked-by", required=True)
    propose_parser.add_argument("--core-boundary", default="Do not mutate irreducible core, security policy, ledger, workflows, or live systems.")
    propose_parser.add_argument("--proposed-shift", required=True)
    propose_parser.add_argument("--rollback-hint", required=True)
    propose_parser.add_argument("--evidence", action="append")
    propose_parser.add_argument("--evidence-gap", default="")
    propose_parser.add_argument("--semantic-label", choices=sorted(VALID_LABELS), default="")
    propose_parser.add_argument("--mode", choices=["dry_run"], default="dry_run")
    propose_parser.add_argument("--omega", type=float, default=0.72)
    propose_parser.add_argument("--output")
    propose_parser.add_argument("--record", action="store_true", help="Append proposal to local proposal ledger")

    validate_parser = sub.add_parser("validate")
    add_common_args(validate_parser)
    validate_parser.add_argument("--proposal", required=True)

    commit_parser = sub.add_parser("commit")
    add_common_args(commit_parser)
    commit_parser.add_argument("--proposal", required=True)
    commit_parser.add_argument("--permission", required=True)
    commit_parser.add_argument("--actor", required=True)
    commit_parser.add_argument("--reason", required=True)

    args = parser.parse_args()
    ledger_root = Path(args.ledger_root)

    if args.command == "status":
        print(json.dumps(status(ledger_root), ensure_ascii=False, indent=2, sort_keys=True))
        return

    if args.command == "propose":
        proposal = build_proposal(args, current_epoch(ledger_root / DEFAULT_EPOCH_LEDGER))
        if args.output:
            write_json(Path(args.output), proposal)
        if args.record:
            append_jsonl(ledger_root / DEFAULT_PROPOSAL_LEDGER, proposal)
        print(json.dumps({"status": "PROPOSED", "proposal": proposal}, ensure_ascii=False, indent=2, sort_keys=True))
        return

    payload = read_json(Path(args.proposal))
    validation = validate_proposal(payload)

    if args.command == "validate":
        print(json.dumps(validation, ensure_ascii=False, indent=2, sort_keys=True))
        return

    if args.command == "commit":
        result = commit_epoch(payload, validation, args, ledger_root)
        print(json.dumps(result, ensure_ascii=False, indent=2, sort_keys=True))
        return


if __name__ == "__main__":
    main()
