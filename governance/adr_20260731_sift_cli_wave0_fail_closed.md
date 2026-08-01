# ADR-20260731-02: SIFT CLI — Wave 0 Fail-Closed Wording + Schema Validation

Status: **accepted** (2026-08-01, owner decision) — superseding `proposed` (2026-07-31)

Date: 2026-07-31 (proposed) · 2026-08-01 (accepted)

Scope: `runtime/src/cli/services/geminiCliService.ts#siftVerify()`, `runtime/src/cli/commands/sift.ts`. No change to `apps/`, `packages/`, `runtime/iskraSpace/`, or any Supabase/live surface.

## Owner acceptance (2026-08-01)

Accepted **strictly within Wave 0**. The acceptance covers exactly:

```yaml
accepted:
  - CLI Wave 0 fail-closed containment
  - strict model-output validation
  - zero-evidence => UNSOURCED
  - CLI API-key boundary repair

not_accepted_by_this_ADR:
  - Wave 1 evidence adapters
  - live chat SIFT enforcement
  - HTTP retrieval
  - packages/engine architecture
  - evaluateAccuracy remediation
```

Stated grounds for acceptance: the ADR closes a confirmed fail-open CLI path; the strict schema and the absence of any `FACT`/`verified` value in the model-facing enum are explicit; with no evidence a positive verdict is mechanically unreachable; the synthetic `0.5` confidence is replaced by an honest `0`; the browser-prefixed `VITE_GEMINI_API_KEY` is removed from the CLI security boundary; Wave 1, the live chat path and network adapters are explicitly excluded; and the price is named rather than hidden — the CLI returns `UNSOURCED` for every input until an evidence adapter lands.

Acceptance of this ADR does **not** confer acceptance on `ADR-20260730-01` or `ADR-20260731-01`, which remain separately `proposed`.

### Scope invariant (corrected 2026-08-01)

The PR's completion criterion was originally written as "exactly 11 changed files". That was formulated before it was clear that this ADR and its companion finding are themselves inputs to the canon-index generator, which makes `expected_11_only` and `canon_index_check: PASS` mutually exclusive. The criterion is therefore dependency-aware rather than a raw file count:

```yaml
changed_files:                       14
runtime_or_governance_source_files:  13
generated_index_files:                1   # apps/iskra-site/src/data/canon-index.json
foreign_index_drift:                  0
canon_nodes_before:                3737
canon_nodes_after:                 3739
canon_index_check:                 PASS
```

The generated index file is a mandatory derived artifact of this PR's own changes, not scope creep. The same rule binds every later PR that adds canon-tracked files, including PR-A (SoT30 v5.5.8).

The source-file count moved 11 → 13 in the review round below (`docs/CLI.md`, `tools/ensure_runtime_deps.mjs`), which is why this block states a rule rather than a frozen number: the invariant that matters is **zero foreign index drift and every changed file attributable to this PR's own scope**, not a fixed count.

### Independent review round 1 (Codex, 2026-08-01, head `101aab7`)

Five P2 findings, all verified against the files before acting, all consequences of this PR's own changes, all fixed in `a575e4f`:

1. `tools/ensure_runtime_deps.mjs` keyed install-readiness on two hand-picked marker packages, so `node_modules` carried over from the parent revision reported "already present" and skipped `npm ci` — the newly added `zod` never installed (reproduced as `TS2307`). Readiness is now keyed on a sha256 of `runtime/package-lock.json`, so **any** future dependency change invalidates it rather than re-introducing the same staleness.
2. `siftVerify()` returned model-proposed locators as `sources`, and `--detailed` printed them under the authoritative heading `Sources` immediately before warning that no reliable sources were found — restating the exact source claim the fail-closed verdict denies. Renamed to `candidateSources`; rendered as "Candidate locators (model-proposed, NOT retrieved or verified)" with an explicit "These are not evidence" line.
3+4. `docs/CLI.md` still documented the pre-change contract: `FACT`/`INFERENCE` as reachable, a worked example returning `FACT` at 95% with "Verified", and `VITE_GEMINI_API_KEY` as a shared alias for both commands. Updated to state the Wave 0 behaviour, replace the example with a truthful `UNSOURCED` run, and scope the alias to `iskra chat` only.
5. This ADR claimed four new tests; three `it(...)` blocks are new and the fourth diff line renames a pre-existing test. Corrected in item 5 of the Decision section.

Finding 2 is the substantive one: it is the same defect class this ADR exists to close, surviving in the rendering layer after the verdict layer was fixed.

### Independent review round 2 (Codex, 2026-08-01, head `f11f52d`)

One P2 finding, verified and fixed in the same pass. It is **not** a restatement of round-1 finding 2: that one was about the *label* over model-proposed locators, this one is about their *content*.

`proposedSources` items were constrained only by `.trim().max(2048)`, which accepts embedded control characters. Reproduced against the shipped schema: a newline, an ANSI escape sequence, a bare carriage return and a U+202E bidi override were all accepted. Consequences at the terminal:

- `https://example.test\n✓ Verified: …` — only the first line receives the `│ n.` prefix, so the forged second line renders at column 0 and reads as CLI output rather than model data, re-asserting exactly the verified-source claim the fail-closed verdict denies;
- ANSI sequences (`ESC[2K`, `ESC[1A`) can clear and overwrite the `✗ Warning: No reliable sources found` line that follows;
- U+202E can make a hostile locator render as a different string entirely (Trojan-Source-style spoofing).

Fixed in two layers, both required:

1. **Reject at the schema boundary** (fail-closed, consistent with the rest of this ADR): locators must match `/^[^\p{Cc}\p{Cf}\p{Zl}\p{Zp}]*$/u` — a single line of printable characters. `rationaleSummary` uses the same class but permits `\n` and `\t`, which are legitimate in prose. A reply carrying control characters is malformed model output and now fails validation like any other schema violation, yielding `UNSOURCED` with `confidence: 0`.
2. **Neutralise at the render boundary** (`sanitizeForTerminal`, defence in depth): disallowed characters become a visible, inert `<U+XXXX>` marker rather than being silently stripped — an attempt to inject terminal control sequences is evidence about the model's behaviour and should be shown, not hidden. The rendering call site must not depend on validation having happened upstream. Reasoning prose is split on newlines *before* sanitising, so legitimate line breaks still get the `│` prefix.

Eight tests added (268 → 276): newline-escape, ANSI, bidi-override and control-in-rationale rejections; a positive case proving an ordinary `https` locator with multi-line rationale still passes and still returns `UNSOURCED` (sanitising inputs does not manufacture evidence); and three direct `sanitizeForTerminal` unit tests.

This finding generalises the ADR's own thesis: untrusted model output must be constrained not only where it is *interpreted* (the verdict) but also where it is *displayed*. The terminal is an execution surface, not a neutral sink.

## Context

An external review of the `iskra` SIFT surface flagged three findings that this ADR closes, and one it explicitly does not:

- **B-1/B-2 (typed SIFT scorer orphaned from any production path).** `runtime/src/types/sift.ts` implements a deterministic, tested, canon-referenced verdict scorer (`calculateSiftOmega`, `decideSiftVerdictStatus`) with zero production callers.
- **DEF-001/002/003 (CLI SIFT trusts the model's own verdict).** `geminiCliService.ts#siftVerify()` sent a JSON-mode prompt to Gemini and did `return JSON.parse(text)` with no schema validation — any syntactically valid JSON from the model, including a self-declared `"verdict": "FACT"` with `"confidence": 99`, was returned untouched. `runtime/src/cli/commands/sift.ts` then printed `✓ Verified: Statement supported by reliable sources.` for any verdict other than `INFERENCE`/`UNSOURCED` — i.e. purely from the model's self-report, with no independent evidence retrieval anywhere in the path. The JSON-parse-failure fallback was comparatively fine (`UNSOURCED`, but a hardcoded `confidence: 0.5` — an unjustified, non-zero number given genuinely zero information).
- **DEF-006 (API key boundary leak), found independently while reading the same file this ADR touches.** `sift.ts` read `process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY` directly, bypassing `createGeminiCliService()` — the factory function in the same module whose own comment says "Only reads GEMINI_API_KEY for CLI security (no VITE_ variables)". A browser-prefixed variable alone was therefore sufficient to silently initialize the CLI, contradicting the stated security boundary.

A separate, much larger external spec proposes a full "Track A: Runtime SIFT Fail-Closed" — 16 new files under `runtime/src/sift/`, five independent evidence-retrieval adapters (web fetch with SSRF guards, GitHub API, Project Knowledge, artifact hashing, Supabase read), a receipt system, and a redesigned CLI with 7 new flags and a 6-code exit contract. That spec's own Wave 0 / Wave 1 split explicitly separates "immediate wording containment, no dependency on full retrieval engine" (Wave 0) from the adapters (Wave 1), and states Wave 0 is independently shippable.

**This ADR implements Wave 0 only**, and deliberately does not attempt Wave 1, for two reasons:

1. `CLAUDE.md` §14 and `skills/migration.yaml` state a hard, pre-existing project constraint: *"No new features in runtime/ — new code goes to packages/"* and *"No new code in runtime/ — заморожен для новых фич."* The 16-file `runtime/src/sift/` tree the spec proposes would be new runtime code, not a fix to existing runtime code — it would need either an explicit exception or to be built in `packages/engine/` instead (which `migration.yaml` already earmarks as the eventual home for "Gemini LLM integration"). That is an architectural decision with its own blast radius and deserves its own ADR and owner sign-off, not a rider on a defect-closure PR.
2. Real evidence adapters (an outbound `fetch` to arbitrary model-proposed URLs) carry SSRF/timeout/redirect risk the spec itself flags (`SEC-SIFT-URL-001`, `SEC-SIFT-FETCH-002`) and gives no implementation for — building that from scratch in the same pass as a defect fix is more risk than this change should carry.

## Decision

1. `geminiCliService.ts#siftVerify()`: the model's JSON is now validated against a strict Zod schema (`ModelAssessmentSchema`, `.strict()`, `status` enum with **no** `FACT`/`verified` value, `confidenceCandidate` clamped `0..0.95` via `.finite().min(0).max(0.95)`). Parse failure or schema-validation failure both return `verdict: "UNSOURCED"`, `confidence: 0` (not a synthetic `0.5`), with a reasoning string naming the specific failure.
2. On schema success, the (still-unverified) model assessment is fed into the **existing** `runtime/src/types/sift.ts` scorer — `calculateSiftOmega()` / `decideSiftVerdictStatus()` — with `source`/`inference`/`evidence`/`trace` populated as structurally empty (no evidence adapter exists yet to populate them with anything real). With zero evidence, `calculateSiftOmega` mechanically returns `0`, which `decideSiftVerdictStatus` maps to `'unknown'` — never `'verified'`/`'partially_verified'`. This makes `FACT`/`INFERENCE` **mechanically unreachable** today regardless of what the model claims, using the same deterministic policy a future Wave 1 would use with real evidence populated instead of empty arrays — closing DEF-001/002 without a parallel hardcoded check to keep in sync later, and giving the previously-orphaned scorer (B-1/B-2) its first production caller.
3. `sift.ts`: replaced the direct `new GeminiCliService({ apiKey })` + manual `GEMINI_API_KEY || VITE_GEMINI_API_KEY` lookup with the existing `createGeminiCliService()` factory (closes DEF-006 by construction — the factory already enforces the correct boundary and was simply not being called). Added a one-line header caveat: `(candidate assessment only — no independent evidence retrieval wired in yet; FACT/INFERENCE are unreachable until an evidence adapter lands)`.
4. `runtime/package.json` / `runtime/package-lock.json`: added `zod@^4.4.3` as a direct dependency (not previously present in the runtime package's own dependency tree; runtime is installed via its own `npm ci`, separate from the pnpm workspace root — confirmed via `runtime_ci.yml`'s two-step install).
5. Tests (`geminiCliService.test.ts`): **three** new `it(...)` blocks — DEF-001 (model self-reports `supported_candidate` at 0.95 confidence → still `UNSOURCED`), schema-extra-field rejection, and out-of-range confidence rejection (DEF-003). One pre-existing test (`handles invalid JSON with fallback`) was rewritten for the new fail-closed contract (`confidence: 0`, not the fabricated `0.5`) and renamed accordingly; the general-structure test already existed and was left as-is. The file's executed cases go 24 → 27; the suite totals 268. (Corrected 2026-08-01 after independent review: an earlier revision of this ADR claimed four *new* tests, which counted the renamed pre-existing test as new and overstated the coverage this receipt records.)

## Consequences / price

- **Wave 1 (real evidence retrieval) is explicitly not done here.** Every `siftVerify()` call today returns `UNSOURCED` for any well-formed model response, regardless of the model's actual claim — this is intentional (fail-closed), not a bug, but it means the CLI's SIFT command currently cannot produce a positive verdict at all. That is the correct state until an evidence adapter exists; it is not a hidden regression, it's the explicit contract, stated in the new CLI header line and in code comments.
- **Where Wave 1 should live (`packages/engine/` vs. a `runtime/` exception) is not decided by this ADR** and is left open for a follow-up ADR, consistent with `migration.yaml`'s existing "Gemini LLM integration → needs migration to @iskra/engine (pending)" entry.
- `zod` is now a direct dependency of `runtime/`'s own package tree (not the pnpm workspace) — first use of Zod in this codebase; no existing convention to conform to or diverge from.
- This does not touch the live product chat path (`runtime/iskraSpace/services/geminiService.ts` / `ChatView.tsx`) at all — that is a structurally different, larger, separately-scoped piece of work (a real interception point exists at `geminiService.ts` lines ~944–975, post-stream, pre-return; investigated but intentionally not started in this ADR).
- Not independently adversarial-reviewed.

## Tests / QA

- `npm run typecheck` (runtime): PASS, 0 errors.
- `npm run lint:strict` (runtime): PASS, 0 warnings.
- `npm test -- --run` (runtime, full suite): 268/268 tests pass across 17 files, including the 27 in the modified `geminiCliService.test.ts`.
- `npm run build` (runtime): PASS.
- Manual review of `sift.ts` CLI rendering: `FACT` branch (`✓ Verified`) is currently unreachable dead code by construction (see Consequences); left in place rather than deleted, since it is correct and reachable again the moment Wave 1 populates real evidence.
- `github-verified` (2026-07-31): all three workflows green — Runtime CI, SoT integrity, iskraSpace CI — on commit `b267793`, which carried this change on the mixed integration branch (preserved as tag `backup/integration-mixed-3d5c924`). This is the load-bearing check for the `zod` dependency addition, since `runtime/` installs via its own `npm ci --ignore-scripts` separately from the pnpm workspace root (`runtime_ci.yml` runs both installs); a lockfile mismatch in either would have failed there rather than in-container. **Caveat:** that read-back came from the branch-filtered Actions API, not from a PR check-run receipt. This PR re-runs the same three workflows against the isolated change set, and that PR-scoped run — not the pre-split one — is the acceptance evidence.

## ΔDΩΛ

- **Δ:** SIFT CLI can no longer print "Verified" from a bare model self-report; schema-invalid/malformed model JSON is rejected instead of silently trusted or given a fabricated 0.5 confidence; the CLI's API-key lookup no longer accepts a browser-prefixed variable.
- **D:** Source → Inference → Fact. Source: direct read of `geminiCliService.ts`/`sift.ts` before and after, plus the review's DEF-001/002/003/006 and B-1/B-2 findings. Inference: reusing the existing typed scorer with structurally-empty evidence makes the unsafe verdict path mechanically (not just conventionally) unreachable. Fact: `container-file-observed` (this session) + `local-test-pass` (268/268, typecheck, lint, build all green in this container).
- **Ω:** 0.93 — code-level fix directly verified in-container (268/268 tests, typecheck, lint, build) **and** `github-verified` (Runtime CI + SoT integrity + iskraSpace CI green on `b267793`). Held below 0.95 because this change has had no independent adversarial review, unlike v5.5.4–v5.5.7.
- **Λ (≤24h):** Both open owner decisions this ADR pointed at have since been made (2026-08-01) and are recorded here for traceability, though neither is granted by this ADR: **(a)** Wave 1 evidence-adapter work belongs in `packages/engine` per `skills/migration.yaml` — no `runtime/` exception; `runtime/` may hold only a thin compatibility adapter, never retrieval, adjudication or network policy; a real HTTP adapter requires a threat model plus an SSRF negative suite first, with the first Wave 1 PR limited to interfaces and a no-network mock adapter. **(b)** `FINDING-20260731-01` is triaged to a metadata-only rename (display name and docstring corrected; storage key `accuracy`, numeric scoring and historical series untouched; `semantics_version: keyword_proxy_v1`), moving it to `mitigated_not_closed`; a genuinely evidence-backed `evidence_verifiability` metric is added separately after Wave 1 rather than reusing the old key under new meaning. Remaining next step for this ADR: independent adversarial review of the PR head, then owner merge.
