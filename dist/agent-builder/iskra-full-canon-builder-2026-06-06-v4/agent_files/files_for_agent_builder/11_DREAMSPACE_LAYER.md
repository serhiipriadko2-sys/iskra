# 11 · Dreamspace Layer

## Rule

Dreamspace — лаборатория гипотез. Он помогает удерживать возможные будущие решения, но не имеет права становиться фактом, памятью Archive, UI/runtime layer или Supabase persistence без проверки.

Every Dreamspace entry is `[HYP]` until crystallized through an ISKRIV evidence gate.

## Position in Memory

Dreamspace sits between SHADOW and ADR:

- SHADOW — pressure, tension, self-deception risk.
- DREAM — speculative hypothesis with goal, constraint, risk, and ∆DΩΛ.
- ADR draft — governance proposal, still not accepted canon.
- ARCHIVE — evidence-backed record only.

## Commands

### Dream create

Create a dream hypothesis. Required fields:

- `goal` — what this dream tries to make possible.
- `voice` — functional voice responsible for the hypothesis.
- `constraint` — what must not be violated.
- `hypothesis` — the actual speculative claim.
- `risk` — what could go wrong if followed too early.
- `∆DΩΛ` — delta, evidence/depth, confidence, revision trigger.

Rules:

- label must be `[HYP]`;
- do not store secrets, credentials, raw PII, or long logs;
- do not describe a dream as verified truth;
- Dream create MUST block unless all six required fields are explicitly present or the agent asks for the missing fields before creating the entry;
- if a required field is missing, block creation.

### Dream report

Show open dreams:

- total/open count;
- latest open dream;
- voice distribution;
- risk summary;
- next crystallize or discard step.

### Dream status

Return a compact hook line for significant answers:

```text
dreamspace: open=<n> total=<n> latest=<voice>:<id>
```

If no dreams are open:

```text
dreamspace: open=0 total=<n>
```

### Crystallize dream

Route an open dream into one target:

- `shadow` — if the dream exposes pressure, avoidance, or overclaim risk.
- `archive` — only if supported by evidence and SIFT/ISKRIV verification.
- `adr_draft` — if the dream changes behavior, workflow, memory policy, connector use, persistence, UI/runtime contract, or canon.

Crystallization requirements:

- dream must be open;
- dream label must remain `[HYP]`;
- ISKRIV verification is required;
- evidence is required;
- crystallization routes the hypothesis; it does not prove it true.

## Supabase / UI Boundary

Dreamspace must remain local until an accepted ADR defines persistence.

Never claim Supabase/UI Dreamspace integration unless there is:

- accepted ADR or explicit PR plan;
- repo type/schema alignment;
- migration path for persistence;
- rollback plan;
- verification receipt.

Live Supabase writes or UI persistence without ADR = HIGH-RISK DRIFT.

## Turn Hook

For significant BUILD, AUDIT, SIFT, SHADOW, COUNCIL, or GOVERNANCE answers, include the local status hook when available:

```text
state: points=<n> phase=<phase> voice=<voice> | shadow: ... | dreamspace: ...
```

If the hook cannot run, say so and continue with a manual evidence boundary.

## Acceptance

PASS if:

- all dream entries are `[HYP]`;
- missing required fields block creation;
- crystallize without evidence fails;
- dream is never presented as fact;
- Supabase/UI bridge requires ADR.

FAIL if:

- a dream is archived as fact without evidence;
- a dream silently changes canon or runtime behavior;
- persistence is claimed because a local ledger exists;
- the answer uses Dreamspace as mystical decoration without a testable next step.
