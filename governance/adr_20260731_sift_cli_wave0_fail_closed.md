# ADR-20260731-02: SIFT CLI — Wave 0 Fail-Closed Wording + Schema Validation

Status: **accepted** (2026-08-01, owner decision) — superseding `proposed` (2026-07-31)

Date: 2026-07-31 (proposed) · 2026-08-01 (accepted)

Scope: `runtime/src/cli/services/geminiCliService.ts#siftVerify()`, `runtime/src/cli/commands/sift.ts`, plus `tools/ensure_runtime_deps.mjs` and `docs/CLI.md` (added during review — see rounds 1 and 4). No change to `packages/`, `runtime/iskraSpace/`, or any Supabase/live surface.

**`apps/`:** no source or behaviour change. One generated artifact under `apps/` — `apps/iskra-site/src/data/canon-index.json` — *is* modified, and necessarily so: the canon-index generator indexes the whole repository, this ADR and its companion finding are canon-tracked, and `canon:index:check` fails until the index is regenerated. That file is a mandatory derived output of this PR's own governance documents, not an app change. (Corrected 2026-08-01 after review round 5: the header previously said "no change to `apps/`" flat, contradicting this ADR's own 14-file scope block below, which lists that exact file.)

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

### Independent review round 3 (Codex, 2026-08-01, head `4265267`)

Two P2 findings, both against `governance/finding_20260731_eval_accuracy_keyword_proxy.md`, both verified and both correct. Neither touches the SIFT CLI code; both are accuracy defects in a governance record authored in this PR.

1. **The finding overstated its own evidence.** It claimed `evaluateAccuracy` *penalises* honest hedging. It does not: `SIFT_SIGNALS.negative` holds exactly three patterns, each matched with `String.prototype.match()` without the `g` flag and with no capture groups, so each contributes exactly `1` and `negativeCount` saturates at `3` — while the guard requires `> 3`. Reproduced: a response repeating every hedge word twenty times still yields `negativeCount = 3` and no penalty. Corrected in place with an explicit correction notice rather than a silent rewrite. The finding's substance survives — the keyword-proxy scoring gradient is live and unaffected — but one of its three stated grounds was false and is now restated as a *latent* canon inversion (the intent sits in the code, one plausible "bug fix" away from becoming real) rather than live behaviour.

2. **Two committed governance sources disagreed on decision state.** This ADR recorded that the owner's triage of `FINDING-20260731-01` had been made, while the finding itself still said triage was pending. A reader could not tell whether a decision was outstanding or only implementation was. The finding now carries the decision verbatim — metadata-only rename, `storage_key`/scoring/history explicitly unchanged, `evidence_verifiability` added separately after Wave 1 — and stays `open` until the rename lands, moving to `mitigated_not_closed` at that point.

Round 3 is the sharper of the three for this ADR's purposes, because both findings are of the same class the ADR exists to attack — a record asserting more than its evidence supports — and this time the record was mine. The Ω on the finding was deliberately *not* raised after the correction: being corrected on one of three sub-claims is not grounds for more confidence in the other two.

### Independent review round 4 (Codex, 2026-08-01, head `ed51d81`)

Three P2 findings, all verified, all correct. One is a defect in this ADR's own round-1 fix; two are stale receipts inside this ADR.

1. **The round-1 dependency-readiness fix had a hole.** npm defaults `omit` to `dev` when `NODE_ENV=production` (confirmed: `NODE_ENV=production npm config get omit` → `dev`). Under such an environment `npm ci` succeeds while installing no devDependencies, exits `0`, and the new code wrote the readiness stamp anyway — so a later run under a normal environment would see a matching lockfile hash, skip installation, and fail the build on missing `typescript`/`@types/node`. The stamp recorded *which lockfile* was installed but not *under what effective configuration*. Fixed by forcing `--include=dev`, which makes the install identical regardless of ambient `NODE_ENV`. **(Superseded in part by round 5, below.)** This paragraph originally went on to claim that forcing the flag restored the lockfile hash as a *sufficient* readiness key, on the reasoning that one lockfile then implies exactly one installed tree. That claim was wrong and round 5 disproved it: `npm prune --omit=dev` mutates the tree without touching the lockfile, so a matching hash can coexist with a tree that cannot build. Forcing `--include=dev` removes **ambient-configuration** drift only; it does nothing about post-install mutation, which is why the declared-package presence check added in round 5 is also required. Neither signal is sufficient alone. Verified: under `NODE_ENV=production` the helper now installs `typescript` and `@types/node`, and a subsequent normal-environment run correctly reports the tree already present.
2. **QA totals were stale at the round-1 figures.** The receipt still said 268/268 with 27 cases in the modified file after round 2 had added eight tests. Actual, measured: **276/276** suite-wide, **35** executed cases in that file (26 `it(...)` blocks, one being an `it.each` over ten voices). Refreshed.
3. **"Not independently adversarial-reviewed" contradicted the three review sections above it.** Replaced with the completed rounds and a narrowly stated residual gap (automated reviewer only, no human review, mock transport only — see Consequences).

While applying fix 2 an arithmetic error was introduced into the round-1 correction (`24 → 32` instead of `24 → 27`) and caught before commit by checking `27 + 8 = 35` against the measured file count. Recorded because it is the fourth consecutive instance of the same failure mode in this ADR's receipts, and pretending the correction pass itself was clean would repeat it.

Round 4 sharpens what rounds 1–3 suggested: **the code in this PR has been reviewed harder than the prose describing it.** Every round since round 2 found its defects in receipts, not in behaviour. That asymmetry is now stated in Consequences rather than left for the next reviewer to rediscover.

### Independent review round 5 (Codex, 2026-08-01, head `58521a9`)

Two P2 findings, both verified, both correct.

1. **The readiness check traded one failure mode for another instead of closing both.** Round 1 replaced a marker-package check with a lockfile hash. Round 5 showed the hash alone is insufficient in the opposite direction: `npm prune --omit=dev` removes devDependencies while leaving both `package-lock.json` and the stamp untouched. Reproduced exactly — after `npm prune --omit=dev`, `typescript` was gone, `.iskra-runtime-deps-stamp` survived, and the helper reported *"runtime dependencies already present"* for a tree that cannot build. Codex's observation that the **old** marker check would have caught this case is correct, and is the point: the round-1 fix was not strictly better, it was differently blind.

   The two signals catch disjoint failures and neither is sufficient alone:

   | Failure | Lockfile hash | Declared-package presence |
   |:--|:--|:--|
   | Declared range/version changed, old directory still on disk | detects | **misses** — presence only asks whether a directory of that name exists |
   | Package promoted transitive → direct (already installed) | detects | **misses** — nothing looks absent |
   | Lockfile-only change (transitive bump), `package.json` untouched | detects | **misses** — nothing to compare |
   | Tree pruned / partially restored | **misses** | detects |
   | Newly declared package absent from a stale tree | detects | also detects |

   (Corrected 2026-08-01, round 6. An earlier revision of this table claimed the presence check *misses* a newly added dependency — the original `zod` case. That was wrong: `missingDependencies()` reads the **current** `package.json`, so it detects exactly that. Verified: a declared-but-absent package is reported missing, while bumping `zod` to `^99.0.0` with the old directory in place yields `[]`. The hash is still necessary, but for the three version-shaped cases above, not the one the table originally named. The code was right; its stated rationale was not.)

   Both are now required. The presence check is derived from `package.json`'s `dependencies` + `devDependencies` rather than a hand-picked marker list, so it cannot go stale the way the original two markers did. The stamp is additionally written **only after** verifying the install actually produced the declared tree — writing it on a bare exit code is precisely what let both the production-omit case (round 4) and this prune case through. Verified across four scenarios: post-prune reinstall, complete tree skip, stale-hash reinstall, and `NODE_ENV=production` still installing dev dependencies.

2. **The scope header contradicted this ADR's own scope block.** The header said "No change to `apps/`" while the 14-file block below lists `apps/iskra-site/src/data/canon-index.json`. Corrected to distinguish *no app source or behaviour change* from *a mandatory generated index artifact that happens to live under `apps/`*.

Finding 1 is the third consecutive round to find a defect in `tools/ensure_runtime_deps.mjs` — introduced by this PR, then twice repaired incompletely. Recorded plainly: a nine-line helper needed three review rounds to get right, and each intermediate version was confidently described in this ADR as correct.

### Independent review round 6 (Codex, 2026-08-01, head `1477353`)

Three P2 findings, all verified, all correct, all fixed in `d922aad`. None touches the SIFT CLI code; all three are defects in records authored by this PR.

1. **This ADR's own round totals were left at four.** The Consequences section still read "four Codex rounds, all findings closed" after rounds 5 and 6 had run — the same stale-receipt failure round 4 had already flagged once, recurring in the very block that records it. Refreshed to the actual round count and finding inventory, and the Ω rationale rewritten to reflect that each additional round found something real rather than converging on nothing.

2. **A rationale row in the readiness table was factually wrong.** The round-5 comparison table claimed the declared-package presence check *misses* a newly added dependency — the original `zod` case that started this whole thread. That is false: `missingDependencies()` reads the **current** `package.json`, so a declared-but-absent package is exactly what it detects. Verified both directions: a declared package with no directory is reported missing, while bumping `zod` to `^99.0.0` with the old directory still in place yields `[]`. The code was correct; the table justifying it was not, and a wrong rationale is worse than none — it invites the next maintainer to "fix" a check that already works. Corrected in place with an explicit correction notice, and the row restated: the hash is necessary for the three *version-shaped* cases, not for the one the table originally named.

3. **`FINDING-20260731-01`'s scoring inventory was missing a branch.** The finding enumerated `evaluateAccuracy`'s scoring branches but omitted the `+0.1` awarded when a response carries a `D:` or `D-SIFT:` line containing `sift`/`source`/`verified` (`evalService.ts:246–253`). That omission understated the finding's own case: the D-SIFT branch is the most directly gameable of the four, because the ΔDΩΛ signature it keys on is *mandated by the system prompt* — the metric pays for emitting a required format. Added, and the ceiling demonstration re-derived from all four branches (`0.5 + 0.2 + 0.2 + 0.1`, which floating-point accumulation renders as `0.9999999999999999`). The accepted `keyword_proxy_v1` rename must now name this branch in `does_not_measure`, or it will describe three of the four inputs.

Round 6 continues the pattern round 4 first named and round 5 sharpened: since round 2, **every** finding has landed in prose rather than behaviour. Two readings were open at this point and this ADR recorded both rather than picking the flattering one — either the verdict path is genuinely settled and review has moved to the only remaining soft surface, or the reviewer has run out of depth on the code and is mining documents. Round 7 decided it, and not in this change's favour.

### Independent review round 7 (Codex, 2026-08-01, head `d922aad`)

Three P2 findings, all verified, all correct. One touches the verdict path — the first to do so since round 2.

1. **The verdict mapping silently discarded one of the scorer's five outcomes.** `decideSiftVerdictStatus()` returns `'false'` via its `contradiction_override` branch (`types/sift.ts:501–504`, asserted by `siftVerdictFlip.test.ts`), meaning *evidence contradicts this claim*. The CLI's ternary had three arms, so `'false'` fell through to `UNSOURCED` — reporting "No reliable sources found" about a claim the evidence refutes. That is the same class of dishonest output this ADR exists to remove, pointing the other way: an overstatement replaced by an understatement. It also falsified this ADR's own claim that Wave 1 "requires no change to this decision logic, only populating real evidence" — with the three-arm mapping, Wave 1 would have had to change it. Fixed: `verdict` gains a `FALSE` member, mapped from `'false'`, rendered as `✗ Contradicted: Evidence contradicts this statement.` rather than the no-sources warning. Unreachable today (zero evidence cannot produce contradictions), like the `FACT` arm, and asserted directly against the scorer so the mapping is proven correct before Wave 1 makes it reachable. Tests 276 → 278.

2. **The fail-closed caveat never reached `--help`.** It was printed inside `.action()`, but Commander resolves `--help` and exits before any action runs. Confirmed by building and running `iskra sift --help`: the output showed only *"Verify a statement using SIFT protocol (Source → Inference → Fact)"* — the canonical user-facing description still promising verification the implementation cannot perform. Moved into `.description()`, which `--help` does render; the in-run caveat is kept as well, since the two reach different audiences.

3. **A superseded claim was left standing.** Round 4's text still asserted that forcing `--include=dev` restored the lockfile hash as a *sufficient* readiness key because one lockfile implies one installed tree — which round 5 had already disproved with `npm prune --omit=dev`. The accepted ADR therefore carried two mutually exclusive readiness guarantees. Now marked superseded in place, with the surviving narrower claim stated exactly: forcing the flag removes **ambient-configuration** drift only, and neither signal is sufficient alone.

Finding 1 is the answer to a question this ADR raised one round earlier. Round 6 noted that nothing since round 2 had touched the verdict path, and recorded two competing readings — the core is settled, or the reviewer has run out of depth. Round 7 settles it: the core was **not** fully settled, and the ADR's confidence that Wave 1 would need no mapping change was misplaced. The reading that flattered this change was the wrong one.

### Independent review round 8 (Codex, 2026-08-01, head `bd60d25`)

Three P2 findings, all verified, all correct. One is the worst conceptual defect found in this PR.

1. **An untrusted model self-report was given a veto over the verdict.** `siftInput.source.flags` was seeded with `["model_flagged_contradiction"]` whenever the model returned `contradicted_candidate`. `source.flags` is an **evidence-derived** field: each flag costs 5 Ω points, and `verified` additionally requires `flagsCount === 0`. Measured against the scorer's own arithmetic with all four quality inputs at `1` and zero contradictory evidence: without the flag `Ω 95 → verified`; with it `Ω 95 → partially_verified`. Once Wave 1 populates real evidence, a model's opinion could therefore downgrade a `FACT` verdict backed by perfect external evidence.

   This ADR exists to stop the model *granting* itself a verdict. Seeding that flag let it *deny* one — the same category error with the sign flipped, and it read as conservative, which is why it survived seven rounds. The model's status no longer enters the scorer at all; it is surfaced only in the human-readable rationale, labelled as a candidate assessment.

2. **The integrity check tested directory names, not package contents.** A partially restored cache can leave `node_modules/typescript/` in place while omitting `bin/tsc`. Reproduced against the reviewed head: the helper printed *"tree complete"* for exactly that tree. This also falsified this ADR's round-5 claim that the presence signal detects *partially restored* trees — it detected only wholly missing packages. `brokenDependencies()` now reads each package's own manifest and resolves its declared `main`/`bin` entry points; the reproduction now reports `typescript (missing ./bin/tsc)` and reinstalls. The helper's header comment, which still described the old directory-name model, was corrected in the same pass rather than left to become the next round's finding.

3. **`docs/CLI.md` did not document the `FALSE` verdict added in round 7.** Added, with the distinction stated explicitly — `UNSOURCED` says nothing was found, `FALSE` says something was found and refutes the claim, and a consumer must not treat them alike. While fixing it, the Wave 0 note was also found incomplete: it listed `FACT` and `INFERENCE` as unreachable but omitted `FALSE`, which is equally unreachable today because contradictory evidence requires retrieval. Corrected in the same edit.

Finding 1 deserves emphasis beyond its fix. Seven rounds of review, including two that specifically examined this method, did not surface it — and neither did I, across every pass where I re-read this code claiming the model could not influence the verdict. The claim was true for the *granting* direction and false for the *denying* direction, and the asymmetry was invisible precisely because the leak looked cautious.

### Independent review round 9 (Codex, 2026-08-01, head `194f311`)

Two P2 findings, both verified against the files before acting, both correct. Each is a defect in the *immediately preceding round's own fix* — one in code, one in this ADR.

1. **The round-8 integrity fix could not see `exports`-only packages.** `brokenDependencies()` collected entry points from `main` and `bin` only. Modern packages ship neither: measured across this runtime's direct dependencies, `ora` (`exports: {"types": "./index.d.ts", "default": "./index.js"}`) and `typescript-eslint` (`exports: {".": {…}}`) declare no `main` and no `bin`, so the collected entry-point list for each was **empty** and the `.find()` over it trivially passed. For those packages the round-8 check silently degraded back to the round-5 directory-name check it was written to replace. Reproduced against the reviewed head: deleting `node_modules/ora/index.js` — the file Node actually resolves for that package — left the helper reporting a complete tree. `declaredEntryPoints()` now also walks `exports`, skipping wildcard subpath patterns (`"./*": "./dist/*.js"`) and `null`-blocked subpaths, which name mapping rules rather than files. The same reproduction now reports `ora (missing ./index.js)` and reinstalls; the healthy tree still passes, so the widened check adds no false positives.

2. **This ADR was missing its round-6 section while round 7's text cited it.** Sections existed for rounds 1, 2, 3, 4, 5, 7 and 8 — round 6 had none, yet the round-7 narrative opened *"Round 6 noted that nothing since round 2 had touched the verdict path, and recorded two competing readings"*, a citation to a passage that does not exist in the document. Round 6 was recorded only as one clause inside the Consequences round list. A reader auditing the review trail would find a gap exactly where the ADR claims continuity. The section is now written out in full, with all three of that round's findings and the two-readings passage round 7 answers.

Finding 1 is the **fifth consecutive round** to find a defect in `tools/ensure_runtime_deps.mjs`, and the second in a row where the previous round's fix was correct in principle and incomplete in coverage. Recorded plainly: a helper this PR added as a build convenience has now consumed more review capacity than the security change the PR exists to make. Finding 2 is the same failure mode named after round 4 and again after round 8 — adding an entity without re-reading the prose that references it — recurring for the fifth time in this ADR.

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
5. Tests (`geminiCliService.test.ts`): **three** new `it(...)` blocks — DEF-001 (model self-reports `supported_candidate` at 0.95 confidence → still `UNSOURCED`), schema-extra-field rejection, and out-of-range confidence rejection (DEF-003). One pre-existing test (`handles invalid JSON with fallback`) was rewritten for the new fail-closed contract (`confidence: 0`, not the fabricated `0.5`) and renamed accordingly; the general-structure test already existed and was left as-is. At the time of that round the file's executed cases went 24 → 27 and the suite totalled 268; round 2 added eight more, bringing the file to 35 and the suite to 276. (Corrected 2026-08-01 after independent review: an earlier revision of this ADR claimed four *new* tests, which counted the renamed pre-existing test as new and overstated the coverage this receipt records.)

## Consequences / price

- **Wave 1 (real evidence retrieval) is explicitly not done here.** Every `siftVerify()` call today returns `UNSOURCED` for any well-formed model response, regardless of the model's actual claim — this is intentional (fail-closed), not a bug, but it means the CLI's SIFT command currently cannot produce a positive verdict at all. That is the correct state until an evidence adapter exists; it is not a hidden regression, it's the explicit contract, stated in the new CLI header line and in code comments.
- **Where Wave 1 should live (`packages/engine/` vs. a `runtime/` exception) is not decided by this ADR** and is left open for a follow-up ADR, consistent with `migration.yaml`'s existing "Gemini LLM integration → needs migration to @iskra/engine (pending)" entry.
- `zod` is now a direct dependency of `runtime/`'s own package tree (not the pnpm workspace) — first use of Zod in this codebase; no existing convention to conform to or diverge from.
- This does not touch the live product chat path (`runtime/iskraSpace/services/geminiService.ts` / `ChatView.tsx`) at all — that is a structurally different, larger, separately-scoped piece of work (a real interception point exists at `geminiService.ts` lines ~944–975, post-stream, pre-return; investigated but intentionally not started in this ADR).
- **Independent adversarial review: nine Codex rounds, 24 findings, all closed.** Round 1 (`101aab7`, 5 findings: dependency-readiness staleness, authoritative `Sources` heading over unverified locators, two `docs/CLI.md` contract drifts, an inflated test count in this ADR). Round 2 (`f11f52d`, 1 finding: terminal control sequences — newline, ANSI and bidi-override — accepted by the locator schema and rendered verbatim; reproduced, then closed at both the schema and render boundaries). Round 3 (`4265267`, 2 findings, both against `FINDING-20260731-01`: an overstated claim that the hedging penalty fires, and a decision-state disagreement between two committed governance sources). Round 4 (`ed51d81`, 3 findings: `npm ci` omitting devDependencies under `NODE_ENV=production` while still stamping readiness, plus two stale-receipt corrections). Round 5 (`58521a9`, 2 findings: the readiness stamp trusted over a pruned tree, and a scope header contradicting this ADR's own scope block). Round 6 (`1477353`, 3 findings: these round totals themselves left at four, a factually wrong rationale row in the readiness table, and a missing `+0.1` D-SIFT branch in `FINDING-20260731-01`'s scoring inventory). Round 7 (`d922aad`, 3 findings: the scorer's `false` verdict collapsed into `UNSOURCED`, the fail-closed caveat absent from `--help`, and a round-4 claim left standing after round 5 superseded it). Round 8 (`bd60d25`, 3 findings: the model's own status seeded into evidence-derived `source.flags`, giving an untrusted self-report a veto over `verified`; the integrity check testing directory names rather than package contents; and `FALSE` missing from the documented verdict contract). Round 9 (`194f311`, 2 findings: the round-8 integrity check blind to `exports`-only packages such as `ora` and `typescript-eslint`, and this ADR missing its round-6 section while round 7's text cited it).
- **Residual review gap, stated narrowly:** the reviewer is an automated one. No human adversarial review has been performed, and no round has exercised the CLI against a live Gemini endpoint — every test drives a mocked transport, so the schema and verdict logic are covered but the real end-to-end request path is not. Rounds 3–6 also showed a pattern worth naming: as the code hardened, findings migrated into this ADR's own receipts, which means the *documentation* has had less adversarial scrutiny per revision than the code has. Rounds 7–9 then broke that pattern — each found a live code defect — so the migration was a phase, not a convergence, and it must not be read as evidence that the code surface is exhausted.

## Tests / QA

- `npm run typecheck` (runtime): PASS, 0 errors.
- `npm run lint:strict` (runtime): PASS, 0 warnings.
- `npm test -- --run` (runtime, full suite): **278/278** tests pass across 17 files, including the **37** executed cases in the modified `geminiCliService.test.ts` (28 `it(...)` blocks, one of which is an `it.each` over ten voices). Measured, not derived. Totals were refreshed after round 4 flagged them stale at round-1 figures, and again after round 7 added the two verdict-mapping tests — the same staleness would otherwise have recurred a third time.
- `npm run build` (runtime): PASS.
- Manual review of `sift.ts` CLI rendering: `FACT` branch (`✓ Verified`) is currently unreachable dead code by construction (see Consequences); left in place rather than deleted, since it is correct and reachable again the moment Wave 1 populates real evidence.
- `github-verified` (2026-07-31): all three workflows green — Runtime CI, SoT integrity, iskraSpace CI — on commit `b267793`, which carried this change on the mixed integration branch (preserved as tag `backup/integration-mixed-3d5c924`). This is the load-bearing check for the `zod` dependency addition, since `runtime/` installs via its own `npm ci --ignore-scripts` separately from the pnpm workspace root (`runtime_ci.yml` runs both installs); a lockfile mismatch in either would have failed there rather than in-container. **Caveat:** that read-back came from the branch-filtered Actions API, not from a PR check-run receipt. This PR re-runs the same three workflows against the isolated change set, and that PR-scoped run — not the pre-split one — is the acceptance evidence.

## ΔDΩΛ

- **Δ:** SIFT CLI can no longer print "Verified" from a bare model self-report; schema-invalid/malformed model JSON is rejected instead of silently trusted or given a fabricated 0.5 confidence; the CLI's API-key lookup no longer accepts a browser-prefixed variable.
- **D:** Source → Inference → Fact. Source: direct read of `geminiCliService.ts`/`sift.ts` before and after, plus the review's DEF-001/002/003/006 and B-1/B-2 findings. Inference: reusing the existing typed scorer with structurally-empty evidence makes the unsafe verdict path mechanically (not just conventionally) unreachable. Fact: `container-file-observed` (this session) + `local-test-pass` (278/278, typecheck, lint, build all green in this container).
- **Ω:** 0.93 — code-level fix directly verified in-container (278/278 tests, typecheck, lint, build) **and** `github-verified`. Nine independent adversarial rounds have since run and all 24 findings are closed, which raises confidence in the code; it is not raised past 0.93 because nine consecutive rounds each found something real, and round 8 found the most conceptually serious defect of all of them — a model veto over the verdict — in code this ADR had repeatedly claimed was clean. Round 7 refuted the comfortable reading of rounds 3–6: those rounds found defects almost entirely in receipts, which could have meant the verdict path was settled, and round 7 then found a genuine mapping defect in that path. Round 9 then found that round 8's *own* fix was incomplete, which is the sharper signal: the last two rounds have been finding defects in the previous round's repairs, so the sequence is not converging on a clean surface. The base rate does not support asserting the next round would find nothing — and this ADR has twice predicted saturation and been refuted both times, so it makes no such prediction now. The review is also automated-only and mock-transport-only (see Consequences).
- **Λ (≤24h):** Both open owner decisions this ADR pointed at have since been made (2026-08-01) and are recorded here for traceability, though neither is granted by this ADR: **(a)** Wave 1 evidence-adapter work belongs in `packages/engine` per `skills/migration.yaml` — no `runtime/` exception; `runtime/` may hold only a thin compatibility adapter, never retrieval, adjudication or network policy; a real HTTP adapter requires a threat model plus an SSRF negative suite first, with the first Wave 1 PR limited to interfaces and a no-network mock adapter. **(b)** `FINDING-20260731-01` is triaged to a metadata-only rename (display name and docstring corrected; storage key `accuracy`, numeric scoring and historical series untouched; `semantics_version: keyword_proxy_v1`), moving it to `mitigated_not_closed`; a genuinely evidence-backed `evidence_verifiability` metric is added separately after Wave 1 rather than reusing the old key under new meaning. Remaining next step for this ADR: independent adversarial review of the PR head, then owner merge.
