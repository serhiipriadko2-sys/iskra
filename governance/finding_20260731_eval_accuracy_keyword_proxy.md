# FINDING-20260731-01: `evaluateAccuracy` scores verifiability by keyword presence, rewarding confident wording over honesty

Status: **open — recorded, not fixed.** Documentation only; no behavior change made.

Date: 2026-07-31

Surface: `runtime/iskraSpace/services/evalService.ts` (live product path, not the CLI)

Evidence tier: `[FACT]` / `container-file-observed` — read directly in this session at `evalService.ts:81–95` and `evalService.ts:210–244`. Independently verified by direct file read, not carried over from a subagent summary.

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
- `−0.15` if more than three hedging words appear.

Nothing in this function dereferences a source, checks that a cited source exists, or compares any claim against retrieved evidence.

## Why it matters

This is structurally the same defect class as DEF-001/002 (closed for the CLI in `ADR-20260731-02`), but on the **live product path** rather than the CLI, and with an additional gradient problem the CLI defect did not have:

1. **The metric measures the wrong thing.** A response that says *"проверено, согласно источнику, данные показывают"* and cites nothing scores strictly higher on "verifiability" than one that names a genuine but keyword-free source. The score responds to vocabulary, not to verification.
2. **It penalizes honest uncertainty.** Hedging words (`возможно`, `кажется`, `наверное`) *subtract* from the accuracy score. A response that is appropriately uncertain about a genuinely uncertain claim is scored as less accurate than a confidently-worded one. This inverts the project's own canon — `CLAUDE.md` §16.1 ("не менять истину на приятный стиль"), the KAIN anti-self-deception role, and the `Ω ≤ 0.95` humility rule all point the other way.
3. **It is trivially gameable by the thing it measures.** The evaluator's input is the model's own text, and the model is prompted with instructions that contain these very words (`geminiService.ts`'s SIFT playbook block instructs *"Every claim needs a source… Use SIFT structure: Source/Inference/Fact/Trace"*). The prompt therefore teaches the model to emit exactly the tokens the scorer rewards, and the resulting score is fed back as an accuracy measurement. That is a closed loop with no external referent.

## Why it is not fixed here

- `runtime/iskraSpace/` is legacy and frozen for new features (`CLAUDE.md` §14, `skills/migration.yaml`). Changing a live scoring function there is a product-behavior change, not a defect patch, and would alter metrics users' history is measured against.
- The honest fix is not "better regexes" — it is either (a) renaming the metric to what it actually measures (something like *citation-form compliance* or *SIFT formatting adherence*), or (b) giving it a real evidence referent, which is the same Wave 1 evidence-adapter work already blocked on an owner decision (see `ADR-20260731-02`, task: "Decide Wave 1 SIFT evidence-adapter home"). Option (a) is cheap and honest; option (b) is the real repair. Both are owner calls.
- Recording it as an open finding is the correct action for an audit pass; silently rewriting live scoring is not.

## Suggested next step (owner decision, not taken here)

Cheapest honest move: rename the metric and its docstring so it no longer claims to measure verifiability — it measures citation *form*. That removes the false claim without touching scoring behavior or historical comparability. The substantive repair is Wave 1 and should be sequenced behind the same architectural decision (`packages/engine/` vs. an explicit `runtime/` exception).

## ΔDΩΛ

- **Δ:** The live-path "Accuracy/Verifiability" metric does not measure verifiability; it measures whether the model used source-flavored vocabulary, and it penalizes honest hedging.
- **D:** Source → Inference → Fact. Source: direct read of `evalService.ts:81–95, 210–244`. Inference: a scorer whose only input is the scored model's own text, whose reward tokens are supplied to that model by the prompt, has no external referent. Fact: `container-file-observed`, verified by first-hand read this session.
- **Ω:** 0.9 — the code behavior is unambiguous and directly read; the judgment that this materially distorts the metric suite is an interpretation, and the downstream impact on the 11 IskraMetrics has not been traced.
- **Λ (≤24h):** Owner triage: accept the cheap rename, or fold into the Wave 1 evidence-adapter decision. No code change until then.
