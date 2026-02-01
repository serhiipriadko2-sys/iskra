"""Wrapper for the canonical Horizon validator.

The authoritative implementation lives in `canon/stack_10/` next to the Stack-10 scrolls.
This wrapper exists because some tooling expects `canon/horizon/...` paths.

It forwards both library access and CLI to the stack_10 implementation.
"""

from __future__ import annotations

import importlib.util
import pathlib
import sys


def _load_stack_module(filename: str):
    here = pathlib.Path(__file__).resolve().parent
    stack_dir = here.parent / "stack_10"
    target = (stack_dir / filename).resolve()
    spec = importlib.util.spec_from_file_location("stack10_horizon_validator", target)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Cannot load stack_10 module from {target}")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)  # type: ignore[attr-defined]
    return mod


_stack = _load_stack_module("09_HORIZON_VALIDATOR.py")

# re-export library API
load_contract = getattr(_stack, "load_contract")
run_full_density_guard = getattr(_stack, "run_full_density_guard")
validate = getattr(_stack, "validate")
main = getattr(_stack, "main")


if __name__ == "__main__":
    raise SystemExit(int(main(sys.argv[1:])))
