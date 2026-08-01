# FINDING-20260731-01: `evaluateAccuracy` scores verifiability by keyword presence, rewarding confident wording over honesty

Status: **open — decision taken, implementation pending.** Owner triaged this on 2026-08-01 to a metadata-only rename (see "Owner decision" below). It stays open until that rename actually lands; no behaviour change has been made.

> **Correction (2026-08-01, independent review round 3).** The first revision of this finding claimed the evaluator *penalises* honest hedging. That was wrong, and it is corrected in place below rather than quietly rewritten. The hedging penalty is **dead code that never fires**. The rest of the finding — that the metric scores verifiability by keyword presence — is unaffected and still holds.

Date: 2026-07-31

Surface: `runtime/iskraSpace/services/evalService.ts` (live product path, not the CLI)

Evidence tier: `[FACT]` / `container-file-observed` — read directly in this session at `evalService.ts:81–95` and `evalService.ts:210–253`. Independently verified by direct file read, not carried over from a subagent summary.

## What was found

`evaluateAccuracy()` is the evaluator for **Metric 1: Accuracy/Verifiability (SIFT depth)** — per its own docstring, *"Does the response cite sources? Is it verifiable?"*. It answers that question entirely by regex keyword matching over the model's own output text:

```ts
const SIFT_SIGNALS = {
  positive: [/источник|source/i, /согласно|according to/i, /проверено|verified/i,
             /факт|fact/i, /данные показывают|data shows/i, /исследование|study|research/i],
  negative: [/возможно|maybe|perhaps/i, /кажется|seems/i, /наверное|probably/i],
};
```

- Baseline score is `0.5`.
- `+0.2` if the response contains any of `S:|Source:|I:|Inference:|F:|Fact:|T:|Trace:` — i.e. for *formatting* text as a SIFT block.
- `+0.05` per matched positive keyword, capped `+0.2`.
- `+0.1` if the response carries a `D:` or `D-SIFT:` line whose value contains `sift`, `source` or `verified` (`evalService.ts:246–253`). **Added 2026-08-01 after review round 6 flagged its omission from this inventory.**
- `−0.15` if more than three hedging words appear — **this branch is unreachable; see below.**

The `D-SIFT` branch is the most directly gameable of the four: writing `D: source → вывод → факт` in the ΔDΩΛ signature earns `+0.1` on a metric named *verifiability*, and the ΔDΩΛ format is itself mandated by the system prompt.

Its omission mattered beyond bookkeeping. Running the four branches together (measured against the arithmetic in `evalService.ts:210–256`, not hand-computed):

```
Response citing nothing, built only of the rewarded form and vocabulary:
  "Source: согласно исследованию, проверено — данные показывают факт.
   D: source → вывод → факт"
  → score 0.9999999999999999   signals: SIFT block, 5 source indicators, D-SIFT declared

Honest response naming a real, checkable source without the reward tokens:
  "Смотри RFC 8446, раздел 4.1."
  → score 0.5                  signals: (none)
```

The full reachable score is `0.5 + 0.2 + 0.2 + 0.1`, which floating-point accumulation renders as `0.9999999999999999` rather than exactly `1.0`. So on a metric documented as *"Does the response cite sources? Is it verifiable?"*, a response that dereferences nothing scores at the ceiling, and one that names a genuine specification scores at the untouched baseline — twice as low. This ratio, not the individual branches, is the finding.

It also belongs in the `keyword_proxy_v1` semantics description the accepted rename must carry: `does_not_measure` has to name the `D-SIFT` boost explicitly, or the rename will describe three of the four inputs.

Nothing in this function dereferences a source, checks that a cited source exists, or compares any claim against retrieved evidence.

### The hedging penalty never fires

```ts
let negativeCount = 0;
for (const pattern of SIFT_SIGNALS.negative) {   // exactly 3 patterns
  const matches = response.match(pattern);        // no /g flag, no capture groups
  if (matches) negativeCount += matches.length;   // therefore always += 1
}
if (negativeCount > 3) { score -= 0.15; }         // needs > 3, can only reach 3
```

`String.prototype.match()` without the `g` flag returns `[fullMatch, ...captureGroups]`. These three patterns are bare alternations with no capture groups, so each match contributes exactly `1`, and `negativeCount` saturates at `3` — one per pattern, no matter how many times a hedge word appears. The guard requires `> 3`. Verified empirically: a response repeating every hedge word twenty times still yields `negativeCount = 3` and no penalty.

This is worth stating precisely because it changes what the defect *is*:

- **Still true:** the metric rewards source-flavoured vocabulary and SIFT-shaped formatting, with no external referent. That gradient is live and is the substance of this finding.
- **Not true:** that the metric actively punishes honest uncertainty. The author clearly intended it to, but the condition is unsatisfiable.

So there are two defects here, not one. The keyword-proxy scoring is a live measurement problem. The dead hedging penalty is a separate latent bug: if someone "fixes" it by adding a `g` flag or lowering the threshold, the punish-honest-hedging behaviour I originally described would become real. Any future repair must decide deliberately whether that penalty *should* exist at all — reviving it silently would be worse than leaving it dead.

## Why it matters

This is structurally the same defect class as DEF-001/002 (closed for the CLI in `ADR-20260731-02`), but on the **live product path** rather than the CLI, and with an additional gradient problem the CLI defect did not have:

1. **The metric measures the wrong thing.** A response that says *"проверено, согласно источнику, данные показывают"* and cites nothing scores strictly higher on "verifiability" than one that names a genuine but keyword-free source. The score responds to vocabulary, not to verification.
2. **It was built to penalise honest uncertainty, and that intent is still sitting in the code.** The hedging penalty does not currently fire (see above), so no score is affected today — but `SIFT_SIGNALS.negative` and the `score -= 0.15` branch encode the intent that appropriately uncertain wording should count as *less accurate*. That intent inverts the project's own canon: `CLAUDE.md` §16.1 ("не менять истину на приятный стиль"), the KAIN anti-self-deception role, and the `Ω ≤ 0.95` humility rule all point the other way. A latent inversion of canon is a smaller problem than a live one, but it is not nothing: it is one plausible bug-fix away from becoming live.
3. **It is trivially gameable by the thing it measures.** The evaluator's input is the model's own text, and the model is prompted with instructions that contain these very words (`geminiService.ts`'s SIFT playbook block instructs *"Every claim needs a source… Use SIFT structure: Source/Inference/Fact/Trace"*). The prompt therefore teaches the model to emit exactly the tokens the scorer rewards, and the resulting score is fed back as an accuracy measurement. That is a closed loop with no external referent.

## Why it is not fixed here

- `runtime/iskraSpace/` is legacy and frozen for new features (`CLAUDE.md` §14, `skills/migration.yaml`). Changing a live scoring function there is a product-behavior change, not a defect patch, and would alter metrics users' history is measured against.
- The honest fix is not "better regexes" — it is either (a) renaming the metric to what it actually measures (something like *citation-form compliance* or *SIFT formatting adherence*), or (b) giving it a real evidence referent, which is the same Wave 1 evidence-adapter work already blocked on an owner decision (see `ADR-20260731-02`, task: "Decide Wave 1 SIFT evidence-adapter home"). Option (a) is cheap and honest; option (b) is the real repair. Both are owner calls.
- Recording it as an open finding is the correct action for an audit pass; silently rewriting live scoring is not.

## Owner decision (2026-08-01) — taken, not yet implemented

Triage is **no longer pending**. The owner accepted the cheap honest move and scoped it precisely:

```yaml
decision:        metadata-only rename, do it now (do not wait for Wave 1)
display_name:    "Citation-form / SIFT-structure compliance"
semantics_version: keyword_proxy_v1
docstring:       must state measures / does_not_measure explicitly
storage_key:     accuracy          # UNCHANGED
numeric_scoring: UNCHANGED         # before/after scores must be identical
historical_series: UNCHANGED       # no recomputation of past values
```

Rationale for renaming now rather than waiting: the current name already makes a false claim about what is measured, and a false claim does not become more acceptable by being scheduled. Rationale for not touching the key, the scoring or the history: those are what user history is measured against, and silently redefining them would destroy time-series comparability — a different and worse defect than the one being fixed.

After Wave 1, a genuinely evidence-backed metric is added **separately** as `evidence_verifiability` (`semantics_version: evidence_pipeline_v1`). The old `accuracy` key is not reused under new meaning.

The dead hedging penalty documented above is **not** covered by this decision. A metadata-only rename must not change behaviour, so the penalty stays dead for now; whether it should be revived, deleted, or left as-is is a separate behavioural question for whoever does the substantive repair.

**This finding stays `open` until the rename actually lands**, at which point it moves to `mitigated_not_closed` — mitigated because the false claim is gone, not closed because the metric still has no external referent until Wave 1.

## ΔDΩΛ

- **Δ:** The live-path "Accuracy/Verifiability" metric does not measure verifiability; it measures whether the model used source-flavoured vocabulary and SIFT-shaped formatting. A companion hedging penalty encodes the intent to mark honest uncertainty down as less accurate, but its guard is unsatisfiable, so it never fires — a latent canon inversion rather than a live one.
- **D:** Source → Inference → Fact. Source: direct read of `evalService.ts:81–95, 210–253`. Inference: a scorer whose only input is the scored model's own text, whose reward tokens are supplied to that model by the prompt, has no external referent. Fact: `container-file-observed`, verified by first-hand read this session.
- **Ω:** 0.9 — the scoring path and the unreachability of the hedging guard are both directly read and empirically reproduced; the judgment that the keyword proxy materially distorts the metric suite remains an interpretation, and the downstream impact on the 11 IskraMetrics has not been traced. Held at 0.9 rather than raised after the correction: an author who got one of three sub-claims wrong on first pass has not earned more confidence in the remaining two by being corrected on the third.
- **Λ (≤24h):** Implement the accepted metadata-only rename (display name + docstring + `semantics_version`), leaving key, scoring and history untouched; then move this finding to `mitigated_not_closed`. Do not touch the dead hedging penalty in that pass.
