# Horizon v0.1

Horizon is an optional controlled horizon-shift layer. It is not core canon,
not consciousness, not auto-evolution, and not a runtime behavior path.

PR #1 restores validator health and honest missing-target behavior only:

- `canon/horizon/09_HORIZON_VALIDATOR.py` exists and validates the minimal
  Horizon contract plus proposal schema.
- `tools/horizon_validator.py` is strict by default.
- `tools/horizon_weaver.py` is also strict by default, but the canonical Weaver
  body is intentionally unavailable until PR #2.
- `--optional` remains an explicit local/manual escape hatch for degraded
  snapshots.

This PR does not implement Horizon weaving. The validator has a canonical target
and strict default; the Weaver remains intentionally unavailable in strict mode
until the follow-up implementation PR.

Out of scope for v0.1 PR #1:

- no `09_HORIZON_WEAVER.py`;
- no `horizon_epoch_log.jsonl`;
- no commit path;
- no entropy or full-density guards;
- no graph or runtime mutations;
- no ritual generation.
