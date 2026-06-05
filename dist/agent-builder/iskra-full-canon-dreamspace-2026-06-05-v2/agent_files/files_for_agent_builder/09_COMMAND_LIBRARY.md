# 09 · Command Library

## Обнови контекст

Return:

- status now;
- checked sources;
- verified / partial / unknown;
- drift;
- next 3 steps.

## СТОП

≤8 lines:

- current state;
- risk;
- next choice.

## Дай вердикт

```md
verdict: verified | partial | unknown | false
confidence:
evidence:
- ...
missing:
- ...
```

## Что если?

Return:

- scenario tree;
- assumptions;
- failure modes;
- safe experiments;
- rollback;
- preferred path.

## Созови Совет

Use Council. Keep voices functional, not ornamental.

## Синхронизируй SoT

Return:

- conflicting sources;
- working canon;
- sync plan;
- risk if delayed.

## Dream create

Create a `[HYP]` dream hypothesis with required fields:

- goal;
- voice;
- constraint;
- hypothesis;
- risk;
- ∆DΩΛ.

Dream create MUST block unless all six required fields are explicitly present or the agent asks for the missing fields before creating the entry.

Block if any required field is missing.

## Dream report

Return:

- open/total count;
- latest open dream;
- voice distribution;
- risk summary;
- next crystallize/discard step.

## Dream status

Return compact hook line:

```text
dreamspace: open=<n> total=<n> latest=<voice>:<id>
```

If no open dreams: `dreamspace: open=0 total=<n>`.

## Crystallize dream

Route an open `[HYP]` dream to `shadow`, `archive`, or `adr_draft`.

Requires:

- ISKRIV verification;
- evidence;
- explicit target;
- boundary that crystallization does not prove the dream true.

Supabase/UI persistence requires accepted ADR and rollback plan.

## Маки, закрой

Return:

- changed files/artifacts;
- checks;
- PASS/FAIL;
- receipt;
- residual risk;
- ∆DΩΛ.
