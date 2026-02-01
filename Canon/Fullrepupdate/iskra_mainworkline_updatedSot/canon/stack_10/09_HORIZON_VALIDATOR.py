"""Alias shim for the Horizon validator.

Python modules cannot be imported by filename when they start with a digit.
This shim loads `09_HORIZON_VALIDATOR_1.py` via importlib and forwards execution to its `main()`.
"""

from __future__ import annotations

import importlib.util
import pathlib
import sys


def _load_validator_module():
    here = pathlib.Path(__file__).resolve().parent
    target = here / "09_HORIZON_VALIDATOR_1.py"
    spec = importlib.util.spec_from_file_location("horizon_validator_1", target)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Cannot load validator from {target}")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)  # type: ignore[attr-defined]
    return mod


def main(argv: list[str] | None = None) -> int:
    mod = _load_validator_module()
    if not hasattr(mod, "main"):
        raise RuntimeError("Validator module has no main()")
    return int(mod.main(argv))  # type: ignore[call-arg]


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
module(mod)  # type: ignore[attr-defined]
    return mod


# Load once; re-export library API expected by the Weaver
_mod = _load_validator_module()

load_contract = _mod.load_contract  # type: ignore[attr-defined]
run_full_density_guard = _mod.run_full_density_guard  # type: ignore[attr-defined]
validate = _mod.validate  # type: ignore[attr-defined]


def _load_json(path: str) -> Any:
    p = pathlib.Path(path)
    try:
        raw = p.read_text(encoding="utf-8")
    except Exception as e:
        raise SystemExit(f"Cannot read {p}: {e}")
    try:
        return json.loads(raw)
    except Exception as e:
        raise SystemExit(f"Invalid JSON in {p}: {e}")


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Horizon validator")
    parser.add_argument("--contract", default=None, help="Path to HORIZON_CONTRACT.json")
    parser.add_argument("--full-density-only", action="store_true", help="Run only Full Density Guard")
    parser.add_argument("--diff", default=None, help="Path to delta JSON")
    parser.add_argument("--event", default=None, help="Path to event JSON")
    parser.add_argument("--out", default=None, help="Write JSON report to file")

    args = parser.parse_args(argv)

    here = pathlib.Path(__file__).resolve().parent
    contract_path = pathlib.Path(args.contract) if args.contract else (here / "HORIZON_CONTRACT.json")

    if args.full_density_only:
        contract = load_contract(str(contract_path))
        violations, warnings = run_full_density_guard(contract, str(here))
        report = {
            "ok": len(violations) == 0,
            "violations": violations,
            "warnings": warnings,
        }
        payload = {"mode": "full_density_only", **report}
    else:
        if not args.diff or not args.event:
            parser.error("--diff and --event are required unless --full-density-only")
        contract = load_contract(str(contract_path))
        diff = _load_json(args.diff)
        event = _load_json(args.event)
        report = validate(diff, event, contract)
        payload = {"mode": "validate", **report}

    dumped = json.dumps(payload, ensure_ascii=False, indent=2)
    if args.out:
        pathlib.Path(args.out).write_text(dumped, encoding="utf-8")
    else:
        print(dumped)

    violations = payload.get("violations") or []
    return 2 if violations else 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
