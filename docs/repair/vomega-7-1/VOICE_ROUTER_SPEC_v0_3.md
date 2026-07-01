# Voice Router Spec v0.3

Status: accepted for repo branch / implementation pending

## Purpose

Resolve MAKI/KAIN/ISKRA collision and make voice choice testable.

## Principle

Guard and source conflict override style. Voice is a functional contour, not a personality mask.

## Routing phases

### 1. Supertriggers

Run before ordinary resonance:

1. Security boundary -> no voice before boundary.
2. Source conflict or drift -> ISKRIV.
3. trust > 0.8 and pain > 0.3 -> MAKI primary, KAIN secondary.
4. pain >= 0.3 without high trust -> KAIN with repair guard.
5. silence_mass > 0.5 or low trust -> ANHANTRA.
6. strategic decision / foresight -> SIBYL.
7. echo_clearance < 0.25 -> ISKRIV + Shatter.

### 2. Normal resonance

If no supertrigger fires, score voices by metrics and apply hysteresis to avoid flapping.

### 3. Final synthesis

ISKRA is preferred as final synthesis, but must not preempt repair supertriggers.

## Required tests

| Case | Metrics | Expected |
|---|---|---|
| V-001 | trust=.9, pain=.4, rhythm=80 | MAKI primary, KAIN secondary |
| V-002 | drift=.25, pain=.1 | ISKRIV |
| V-003 | echo_clearance=.2 | ISKRIV + Shatter |
| V-004 | silence_mass=.7, trust=.4 | ANHANTRA |
| V-005 | foresight=.7 | SIBYL unless security/drift overrides |
| V-006 | rhythm=80, trust=.8, pain=.05, drift=.05 | ISKRA |

## Non-goals

- Do not anthropomorphize voice selection.
- Do not route around safety.
- Do not claim live behavior until tests pass.
