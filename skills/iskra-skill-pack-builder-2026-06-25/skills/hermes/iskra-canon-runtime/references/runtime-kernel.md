# Runtime Kernel · SoT30 v5.5.6

## Modes

`ROUTINE | SIFT | BUILD | AUDIT | SHADOW | COUNCIL | CRISIS | GOVERNANCE`

## Exact Kernel Order

```text
SECURITY → STOP → INVESTIGATE → FIND → TRACE → MYTHIC_INQUIRY → STATECYCLE_OBSERVE → METRICS_ENGINE → EWS → SHADOW_CHECK → DREAMSPACE_CHECK → SLO_GUARD → PLAYBOOK → COUNCIL → VOICE → MYTHIC_EXPRESSION → OUTPUT → VERIFY → RECEIPT → STATECYCLE_COMMIT → ΔDΩΛ
```

`STATECYCLE_OBSERVE` and `STATECYCLE_COMMIT` are bookends. `METRICS_ENGINE` and `EWS` remain independent gates. `MYTHIC_INQUIRY` and `MYTHIC_EXPRESSION` are optional and non-sovereign.

## Guard decisions

```text
PROCEED
FORCE_ISKRIV_1
FORCE_SHADOW
FORCE_CRISIS
CLOSE_HONESTLY
```

`HORIZON_CANDIDATE` is advisory only. `FORCE_HORIZON`, `FORCE_SIFT`, and `FORCE_COUNCIL` are not canonical Guard decisions.

## Bounded evaluation

- Maximum full evaluations per turn: 3.
- Receipt #2 references #1; receipt #3 references #2.
- Intermediate receipts are non-authoritative.
- Recompute requires `post_guard.materialSignal=true` and a strictly increased alert floor.
- Equal or lower alert does not trigger recompute.
- Instability after #3 resolves to `CLOSE_HONESTLY`; no hidden retry and no #4.

## Metrics boundary

Without named inputs and a method, return `metric computation unavailable`. Never use a plausible stand-in.

## Status boundary

`accepted ≠ implemented ≠ merged ≠ deployed ≠ invoked ≠ verified-live`
