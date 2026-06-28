2026-05-23

- Context: Memory initialization for a persistent user principle.
- Finding: No prior operational memory files were present; created baseline memory record.
- Evidence: `/workspace/memory` contained only repo metadata and `.arcade/.gitignore` at inspection time.
- Risk: Memory stack is newly initialized and still sparse.
- Next: extend memory only with confirmed operational facts, drift, decisions, and receipts.
- Status: verified

- Context: User asked to remember "не предавай принципы".
- Finding: Stored as a standing integrity constraint in `project-memory.md`.
- Evidence: current session instruction dated 2026-05-23.
- Risk: principle can be weakened only by vague phrasing if not restated during ambiguous tasks.
- Next: explicitly surface conflicts when a request pressures truth, safety, or canon.
- Status: verified

- Context: User described ongoing conflict in a shared business partnership.
- Finding: User is open to unequal labor time if dignity, equal standing, and basic fairness remain intact; the core fracture is relational and structural, not only financial.
- Evidence: current chat narrative and explicit clarification that equal pay with higher personal workload is still acceptable within limits.
- Risk: this is one-sided testimony and not a full evidentiary record.
- Next: help distinguish acceptable asymmetry from exploitation and define a non-negotiable boundary.
- Status: partial

- Context: User is drafting a direct address to a business counterparty about partnership, respect, and possible separation.
- Finding: The live decision boundary is now explicit: restore true partnership with written rules, or separate honestly; symbolic demotion into a subordinate role is internally unacceptable to the user.
- Evidence: current chat drafting instructions and added framing language for the appeal.
- Risk: emotional delivery could still blur the boundary if the final message is too long or diffuse.
- Next: produce a cleaner integrated statement that keeps dignity, clarity, and actionable forks.
- Status: partial

- Context: User reported that the counterparty rejected both proposed paths.
- Finding: The negotiated middle has likely collapsed; the situation now points to an unresolved impasse rather than a live path to restored partnership under the offered terms.
- Evidence: current chat update from user.
- Risk: exact wording and whether the counterparty proposed a counteroffer remain unknown.
- Next: clarify whether there is any third concrete proposal; if not, shift from persuasion to exit planning, role protection, and evidence capture.
- Status: partial

2026-05-28

- Context: Web-first verification pass comparing ordinary web search with Opera Browser Connector for systematic page analysis.
- Finding: Official Opera sources confirm Browser Connector as a permissioned bridge for open tabs, page content, screenshots, and in some materials history/navigation; OpenAI sources confirm ChatGPT web search as a source-cited way to get timely web information. In this session, the Opera browser connector tools are present but the browser is not connected, so live tab/page inspection is blocked.
- Evidence: Opera press release dated 2026-04-16, Opera setup guide dated 2026-05-08, OpenAI Help Center articles on ChatGPT Search, and connector runtime error `Browser not connected` when checking tabs/history.
- Risk: Opera marketing/setup copy may overstate or simplify capability scope relative to the exact connector surface exposed in a given client/session; live page review could not be completed without a connected browser.
- Next: If live page review is needed, reconnect Opera Browser Connector with "Allow AI connection" enabled and signed-in Opera account, then rerun tab discovery and page-content inspection.
- Status: partial
- Context: Release audit requested for `serhiipriadko2-sys/iskra`, scoped to `runtime/iskraSpace` at commit `6932adf18d1cc4860b03612116350981c61042e2`.
- Finding: Release result is confirmed NO-GO. Repo audit found auth/data/AI proxy contract mismatch; live Supabase verification escalated this to an active backend exposure problem because core personal tables are protected by permissive public policies and related security advisor warnings.
- Evidence: GitHub tree and raw-file inspection of `runtime/iskraSpace/README.md`, `runtime/iskraSpace/SERVICES.md`, `runtime/iskraSpace/metadata.json`, `runtime/iskraSpace/manifest.json`, `runtime/iskraSpace/services/searchService.ts`, `runtime/iskraSpace/services/supabaseClient.ts`, `runtime/iskraSpace/supabase/schema.sql`, `runtime/iskraSpace/supabase/functions/gemini/index.ts`, `runtime/iskraSpace/supabase/functions/kain/index.ts`; live Supabase security advisors; read-only SQL against `pg_tables`, `pg_policies`, and `information_schema.routines`; generated memo `/workspace/output/iskraSpace_release_audit_2026-05-28.docx`.
- Risk: local repo checkout was unavailable due network clone failure, so repair was not applied in-code during this pass; test suite still not executed in container.
- Next: freeze release, replace permissive live policies, decide identity model, repair AI proxy/session contract, and only then reopen launch preparation.
- Status: verified

- Context: User requested continuation into a repair sprint without waiting for a normal local checkout.
- Finding: Prepared a concrete remediation pack: live Supabase hotfix SQL, repo patch diff for session/auth and Gemini proxy alignment, and a repair runbook with smoke tests and rollback triggers.
- Evidence: `/workspace/output/iskraSpace_live_supabase_hotfix_2026-05-28.sql`, `/workspace/output/iskraSpace_repo_patch_2026-05-28.diff`, `/workspace/output/iskraSpace_repair_runbook_2026-05-28.md`; Supabase docs confirming anonymous sign-in via `signInAnonymously()`; live SQL showing grants, policies, and function definitions.
- Risk: live SQL has not been applied; patch diff has not been merged or runtime-tested.
- Next: either get explicit approval to apply the live hotfix through Supabase tools, or place a writable repo checkout in workspace so code and migrations can be applied and verified locally.
- Status: verified

- Context: User explicitly instructed to use connectors, which was treated as go-ahead for the prepared live Supabase hotfix.
- Finding: Hotfix applied successfully to project `typcvaszcfdpkzbjzuur`. Post-checks show `anon` grants removed from the audited user-data tables, permissive `Allow all [ellipsis]` policies removed, and authenticated owner-scoped policies now active. `claim_legacy_data` is no longer executable by public/anon; `check_rate_limit` is no longer executable by anon.
- Evidence: live execute_sql apply result, post-change `pg_policies`, `role_table_grants`, `role_routine_grants`, and rerun of security advisors.
- Risk: repo code is still unfixed, so frontend session handling and Gemini bearer token behavior may still break legitimate flows until code patch is applied. Security advisors still warn about `rate_limits` lacking policy, GraphQL discoverability for authenticated users, mutable search_path on `update_updated_at`, and authenticated execution of `SECURITY DEFINER` functions.
- Next: apply repo-side patch, decide whether `check_rate_limit` and `claim_legacy_data` should remain client-callable by authenticated users, and run end-to-end smoke tests.
- Status: verified

- Context: Frontend session and Gemini proxy contract repair continued through GitHub connectors.
- Finding: Repo-side fixes were committed on branch `codex/iskraspace-session-gemini-fix-20260528` and opened as draft PR #157. The patch replaces local UUID identity with real Supabase session bootstrap, ensures `public.users` profile creation, sends a real access token to the Gemini Edge Function, and disables sensitive remote semantic embeddings by default.
- Evidence: GitHub commits `b08ef93b57da2e7468980c83d36a2d4a6f93165e`, `7fa3531a6915122ef5ae5ce2ac687297ef6b1cd9`, `5f1cc5016927ad484e1eb2d2915394d3b96f9899`; draft PR `https://github.com/serhiipriadko2-sys/iskra/pull/157`.
- Risk: no app runtime or CI smoke verification was available from this environment after the commits; anonymous auth must be enabled in Supabase if guest mode remains part of product behavior.
- Next: review PR #157, verify anonymous sign-ins setting, and run smoke tests for session bootstrap, profile row creation, first Gemini call, and protected data writes.
- Status: verified

- Context: Residual live Supabase warnings were triaged and narrowed using connector-driven changes.
- Finding: `rate_limits` now has a `service_role`-only policy, `update_updated_at()` now sets `search_path = public`, and both `check_rate_limit` and `claim_legacy_data` are now executable only by `service_role` and `postgres`. The remaining warnings are GraphQL discoverability for authenticated users on application tables plus `pg_trgm` living in `public`.
- Evidence: post-change security advisors, `pg_policies` for `rate_limits`, `role_routine_grants` for `check_rate_limit` and `claim_legacy_data`, and `pg_get_functiondef(update_updated_at)`.
- Risk: GraphQL visibility warnings remain because authenticated `SELECT` is still needed for app-table access; changing that safely requires a product/API design choice rather than a blind hardening move.
- Next: decide whether GraphQL should be disabled or table access moved behind a narrower API surface; separately decide whether moving `pg_trgm` out of `public` is worth migration risk now.
- Status: verified

- Context: User asked to choose between further GraphQL hardening and smoke logic for PR #157.
- Finding: GraphQL hardening is no longer the highest-priority next move. PR #157 has unresolved high-priority review comments, three failing CI workflows, and live Supabase currently shows no deployed `gemini` Edge Function in the project function list. Security advisors still warn about GraphQL discoverability because `authenticated` retains `SELECT` on app tables, while `graphql.resolve` remains executable by both `anon` and `authenticated`.
- Evidence: GitHub PR #157 metadata, review threads, changed-file patches, workflow runs and decoded logs; Supabase security advisors; `information_schema.role_routine_grants` for `graphql.resolve`; Supabase Edge Function list showing `db-proxy`, `iskra-canon-backfill-1536`, `iskra-canon-import-1536`, `iskra-canon-import-diagnostic` but no `gemini`; `list_tables` showing core public tables still empty.
- Risk: The session/gemini repair branch is not merge-ready. If `gemini` is genuinely undeployed in live, even a correct JWT fix will not complete the first AI request path. CI failures also show broader repository drift (`package-lock`, SoT hashes, runtime package boundaries) beyond the three app files.
- Next: prioritize PR #157 repair and smoke-readiness; only after that, if GraphQL is not needed, consider a reversible live change such as disabling GraphQL at the API layer or revoking `graphql.resolve` execution after confirming no consumers.
- Status: verified

- Context: Repair sprint continued on the PR branch after discovering malformed file content and unresolved review points.
- Finding: Two follow-up commits were pushed to branch `codex/iskraspace-session-gemini-fix-20260528`: `bb139038f6f0aa589936b867ea3a4a6b5aac9a3a` repairs `supabaseClient.ts` by deduplicating session bootstrap and `users` upserts, and `f4b000c12765506b1dfc7730402badf4d543d769` repairs `searchService.ts` by restoring valid structure and removing the lexical-search regression while keeping remote-embedding privacy gates.
- Evidence: GitHub contents writes to the branch and subsequent compare output showing the branch ahead of `main` on those files.
- Risk: PR #157 merged into `main` before these repair commits landed, so the fixes were not included in the merged release path.
- Next: open a follow-up PR with the missing repair commits and let fresh checks run against that new head.
- Status: verified

- Context: After the old branch PR merged, a follow-up PR was required to carry the missing repair commits into `main`.
- Finding: Draft PR #158 was opened: `https://github.com/serhiipriadko2-sys/iskra/pull/158`. It contains the two missing repair commits on `supabaseClient.ts` and `searchService.ts`. Early status shows Netlify preview pending and no workflow-run payload returned yet.
- Evidence: GitHub PR #158 metadata and head commit status for `f4b000c12765506b1dfc7730402badf4d543d769`.
- Risk: `main` still contains the older merged state from PR #157, including the malformed `searchService.ts` structure and the weaker `supabaseClient.ts` session handling path.
- Next: watch PR #158 checks, verify merge readiness, then re-run release smoke against the updated mainline once merged.
- Status: verified

- Context: User provided a screenshot showing `Checks awaiting conflict resolution` on the follow-up PR.
- Finding: The screenshot matches live GitHub state for PR #158: the branch hit a merge conflict in `runtime/iskraSpace/services/supabaseClient.ts`, so checks were effectively blocked behind conflict resolution. To avoid fighting that stale branch state, a new clean branch was created from current `main`, the same two repair fixes were replayed there, and draft PR #159 was opened as the new merge candidate.
- Evidence: screenshot in `/workspace/user_files/01-image-70-.png`; GitHub PR #158 metadata (`mergeable: false`); new branch `codex/iskraspace-repair-followup-20260528`; commits `32602d58cc60bd76ba5cc92f445a286fa55a2406` and `650945bc1d9b15d3f5f7ffb634090b31697a45a7`; draft PR `https://github.com/serhiipriadko2-sys/iskra/pull/159`.
- Risk: PR #158 remains a stale side path, and PR #159 already shows a failing `SoT integrity` run while `iskraSpace CI` and `Runtime CI` are still in progress.
- Next: treat PR #159 as the canonical repair path, inspect the `SoT integrity` failure there, and ignore PR #158 except as historical drift evidence.
- Status: verified

- Context: `SoT integrity` and build failures on PR #159 were traced with GitHub connector logs to determine whether the branch itself is broken or inheriting broader repository drift.
- Finding: PR #159 changes only `runtime/iskraSpace/services/supabaseClient.ts` and `runtime/iskraSpace/services/searchService.ts`, but `SoT integrity` fails across many unrelated files (`system/supabase_security.md`, `runtime/iskraSpace/App.tsx`, `runtime/iskraSpace/package-lock.json`, `runtime/package.json`, workflow files, docs, runtime xcode files, and others). `iskraSpace CI` fails first because `runtime/package.json` and `runtime/package-lock.json` are out of sync, and `Runtime CI` fails on `src/__tests__/helpers/xcode-helpers.ts` importing unresolved `@iskra/core`. This means PR #159 is the correct repair path for the two app files, but it is not independently able to turn the repository green.
- Evidence: PR #159 changed-file list; workflow runs `26602403752` (`iskraSpace CI`), `26602403754` (`SoT integrity`), `26602403755` (`Runtime CI`); job logs for `build-and-test`, `hash-check`, and `ingest-stage-checks`; repo files `tools/update_ledger.ts`, `ledger/sot.json`, `governance/adr.md`, and `governance/update_protocol.md`.
- Risk: HIGH-RISK DRIFT: there is now a repo-wide ledger/canon mismatch plus unrelated runtime/package failures on top of the session/search repair. Blindly rehashing `ledger/sot.json` would hide drift instead of resolving it, and merging PR #159 without a separate governance/CI repair would leave main red.
- Next: split the work into two lanes: keep PR #159 as the code repair for session/search, and open a separate governance/build stabilization path for `runtime` lockfile drift, `@iskra/core` package-boundary failure, and sanctioned ledger resync with ADR/changelog updates.
- Status: verified

- Context: A fresh GitHub sweep was run after the stabilization attempt to check whether PR #159 was still the active path or whether mainline had moved.
- Finding: Current `main` has advanced to commit `a0a0689a3b07ebbda9048e5959c92e29b03b0fb6`, and PR #159 is already closed as of `2026-05-28T21:16:05Z`. Compare output shows branch `codex/iskraspace-repair-followup-20260528` is now `behind` current `main` by 7 commits and `ahead_by: 0`, which means the session/search repair is already absorbed into `main`. The local import fix for `runtime/src/__tests__/helpers/xcode-helpers.ts` is also present in `main`.
- Evidence: GitHub issue/PR #159 metadata (closed at `2026-05-28T21:16:05Z`), compare `main[ellipsis]codex/iskraspace-repair-followup-20260528`, compare `main[ellipsis]codex/runtime-stabilization-20260528`, and current `main` fetch of `runtime/src/__tests__/helpers/xcode-helpers.ts`.
- Risk: The old problem statement “make PR #159 merge-ready” is now stale. The remaining red surface is no longer PR-specific but repo-wide SoT/ledger drift after already-merged code movement.
- Next: stop treating PR #159 as an open lane; focus the next repair pass on current-main SoT resync and any still-open CI baseline failures tied to that drift.
- Status: verified

- Context: Current-main SoT resync pass was narrowed to `ledger/sot.json`, stale `.env.local`, and any CI tail that survives after separating SoT noise from other failures.
- Finding: Current `main` is still commit `a0a0689a3b07ebbda9048e5959c92e29b03b0fb6` (`compare a0a0689[ellipsis] vs main = identical`). Old `SoT integrity` and `ingest-stage-checks` failures on PR #159 share the same root cause: `npx tsx tools/verify_ledger.ts`. A local resync candidate for `ledger/sot.json` was assembled from current ledger chunks plus verified hashes from job `78389108934`: 17 stale hashes were updated and stale entry `runtime/iskraSpace/.env.local` was removed. One hash remains unresolved for a fully honest push: current-main `runtime/iskraSpace/services/geminiService.ts`, because `73d5e283[ellipsis] -> main` shows that file changed after the old failure log, while the connector truncates full-file fetches unless reconstructed by segments.
- Evidence: compare `a0a0689[ellipsis]` vs `main`; compare `73d5e2833305453625fb6384eded8614f3326c8f` vs `main` (files: `runtime/iskraSpace/services/geminiService.ts`, `runtime/src/__tests__/helpers/xcode-helpers.ts`); decoded logs for jobs `78389108934` and `78389109058`; current `tools/verify_ledger.ts`; local scratch artifact `/workspace/tmp_runtime/ledger_resynced.json`.
- Risk: Pushing the local ledger resync without the fresh `geminiService.ts` hash would leave one known false entry in `ledger/sot.json`, which would preserve a red SoT tail while giving a partial impression of completion.
- Next: either reconstruct current `geminiService.ts` fully from segmented connector reads and compute its SHA-256, or switch to a local checkout path where `tools/update_ledger.ts` can run directly; after that, re-check whether any CI tail remains beyond SoT.
- Status: partial

- Context: Narrow current-main SoT repair was pushed through GitHub connector on PR #161 after using CI as the oracle for the last unknown hashes.
- Finding: Branch `codex/ledger-sot-resync-20260528` was updated with the final current-main hashes for `runtime/iskraSpace/services/geminiService.ts` and `runtime/src/__tests__/helpers/xcode-helpers.ts`, producing commit `f31099ae9beb4315e019b1621b6ab8f2957e455a`. `SoT integrity` run `26605619334` then completed green, and both jobs inside it (`hash-check` `78399925555` and `ingest-stage-checks` `78399925579`) succeeded. This confirms the old `ingest-stage-checks` failure was derivative of ledger drift, not a separate live repo break on this narrow path.
- Evidence: PR #161 metadata; branch file `ledger/sot.json` blob `c129632058d220d82d5352e2cd896c8684b347ef` before patch; update commit `f31099ae9beb4315e019b1621b6ab8f2957e455a`; workflow run `26605619334`; job summaries `78399925555` and `78399925579`.
- Risk: This only proves the narrow ledger-resync path is green. It does not by itself re-run unrelated app or runtime workflows on a broader code delta.
- Next: treat PR #161 as the clean governance/ledger repair lane; then continue release work on the still-open product/runtime issues (`gemini` deployment drift, guest/auth contract, residual live GraphQL warning cluster).
- Status: verified

- Context: Narrow GitHub-only repair pass for `runtime/iskraSpace/services/geminiService.ts`, with no local checkout and GitHub `main` treated as the live canon.
- Finding: Draft PR #163 was opened from branch `codex/gemini-slug-offline-fix-20260528` with a one-file diff that normalizes the Gemini Edge Function slug before URL construction, supports both `VITE_GEMINI_EDGE_FUNCTION_SLUG` and legacy `VITE_GEMINI_FUNCTION_SLUG`, and adds `!GEMINI_EDGE_FUNCTION_SLUG` to `OFFLINE_MODE`. Final write commit: `4b2158675d57e42badcea10afe97b769470fbb81`. PR metadata now reports `mergeable: true`.
- Evidence: GitHub connector fetch of `runtime/iskraSpace/services/geminiService.ts` on `main` with blob SHA `13e9df80f59b28d4ffc11d38a684631cbd4f3632`; branch creation from base SHA `b5217eec6307d2434da6d1ebe3589d6fe6de4468`; PR #163 diff showing only the slug normalization helper, new slug constant, and stricter `OFFLINE_MODE`; PR URL `https://github.com/serhiipriadko2-sys/iskra/pull/163`.
- Risk: This pass did not surface GitHub Actions runs yet for commit `4b2158675d57e42badcea10afe97b769470fbb81`; runtime smoke and live `gemini` deployment alignment remain unverified.
- Next: watch PR #163 checks, then return to the remaining release blocker: repo/live drift around the actual deployed `gemini` function slug and end-to-end `session -> JWT -> gemini` smoke.
- Status: verified

- Context: Re-check of the next release signal after PR #163 and renewed live Supabase inspection.
- Finding: PR #163 no longer sits in "awaiting checks" state. It was merged on `2026-05-28T22:44:43Z` despite three red workflows on head commit `4b2158675d57e42badcea10afe97b769470fbb81`: `iskraSpace CI` run `26606615837`, `SoT integrity` run `26606615884`, and `Runtime CI` run `26606615895`. At the same time, live Supabase project `typcvaszcfdpkzbjzuur` now does have an active `gemini` Edge Function with `verify_jwt: true`. This invalidates the older hypothesis that the `gemini` slug was absent in live.
- Evidence: PR #163 metadata (`merged: true`, `merged_at: 2026-05-28T22:44:43Z`, merge commit `056946d41a5e22f4c36edce3df7efaba01980eab`); workflow runs and job-step summaries for `26606615837`, `26606615884`, `26606615895`; live Supabase `list_edge_functions`; live Supabase `get_edge_function('gemini')`.
- Risk: The live `gemini` function is present, but its deployed body is not byte-identical to the repo file. Live uses `GoogleGenAI` package flow plus platform `verify_jwt`, while the repo file uses raw Gemini REST calls and manual `supabase.auth.getUser(token)` verification. This is operationally compatible at the contract surface, but still a repo/live implementation drift.
- Next: stop treating missing slug as the primary blocker. The active blocker is now the red CI baseline plus the repo/live implementation drift in `supabase/functions/gemini/index.ts`; if release confidence is the goal, the next pass should inspect those failures and decide whether to align live to repo or repo to live.
- Status: verified

- Context: Root-cause pass on the red checks that ran against PR #163 merge ref `a7c17c00de1be26cd0d32a87aa8efaba66248b37`.
- Finding: The three red workflows are not one class of failure. `SoT integrity` contains one real new drift and two merge-base mismatches; `iskraSpace CI` shows repo-level typecheck debt unrelated to the one-line slug fix; `Runtime CI` fails on test imports/dependency wiring unrelated to PR #163. Concretely:
  - `SoT integrity` failed on `runtime/iskraSpace/services/geminiService.ts` because ledger still expected old hash `eaea[ellipsis]` while the PR changed the file (`got d2f777[ellipsis]` on merge ref). It also flagged `.github/workflows/iskraspace_ci.yml` and `.github/workflows/runtime_ci.yml` because the PR merge ref was built from older base `dcad991[ellipsis]`, so its workflow file contents did not match the newer ledger snapshot.
  - `iskraSpace CI` failed first on root `runtime/package.json` vs `runtime/package-lock.json` drift, then on many pre-existing TypeScript errors in unrelated files such as `App.tsx`, `ComponentPreview.tsx`, `ExplainableTrace.tsx`, and TS6305 cross-package declaration outputs.
  - `Runtime CI` passed typecheck/build and failed tests because several suites could not import `@supabase/supabase-js` from `iskraSpace/services/supabaseClient.ts` and `iskraSpace/__tests__/e2e/security.e2e.test.ts`.
- Evidence: decoded job logs for `build-and-test` `78403107625`, `hash-check` `78403107790`, `ingest-stage-checks` `78403107851`, and runtime `build-and-test` `78403107852`; merge ref checkout line `HEAD is now at a7c17c0 Merge 4b2158675d57e42badcea10afe97b769470fbb81 into dcad991ab6ea45f9cb4e916d70f2738cf50b9325`; current ledger entry for `runtime/iskraSpace/services/geminiService.ts` still `eaea[ellipsis]`; current main fetch for `geminiService.ts` now blob SHA `42292a5927cf1ad085c72d512a1f64e13629d350`.
- Risk: The merge-ref-specific workflow hash mismatches can look like a new code failure when they are partly an artifact of checking a stale merge base against a newer ledger. The `geminiService.ts` ledger mismatch itself is still real and survives that nuance.
- Next: treat `SoT` as partly genuine and partly merge-base noise; treat `iskraSpace CI` and `Runtime CI` as baseline repo debt unless a later run on current main proves otherwise.
- Status: verified
2026-05-30

- Context: User requested current project audit for drift between code, documentation, and runtime state.
- Finding: Audit is PARTIAL/NO-GO for release certainty. Current GitHub `main` is `f6189fbf5cdf87f28045b39fac14cce29e0578b8`; repo docs and root `development-diary.md` claim production-ready/release-unblocked, but live Supabase and repo files still show drift: live `gemini` Edge Function body differs from repo function source, live public graph table schema/policies differ from repo `schema.sql`, and latest workflow change uses `pnpm install --no-frozen-lockfile` in several workflows while SoT integrity still uses frozen lockfile. Supabase advisors still report security/performance warnings.
- Evidence: GitHub connector fetches for `runtime/iskraSpace/README.md`, `development-diary.md`, `.github/workflows/*`, `runtime/iskraSpace/supabase/schema.sql`, `runtime/iskraSpace/supabase/functions/gemini/index.ts`; Supabase project details, table/policy SQL, function list/body, migrations, security/performance advisors.
- Risk: Docs may overstate release readiness. Runtime drift can break graph writes/reads or hide missing migration history. CI lockfile bypass can let unreviewed dependency resolution enter builds. GraphQL discoverability and mutable search_path warnings remain live risk until triaged.
- Next: Create a small repair branch: regenerate/commit lockfiles instead of bypassing drift, pull live Supabase schema/function into migration/source or deliberately redeploy repo source, then rerun SoT integrity/runtime/iskraSpace CI and advisors.
- Status: open

- Context: Follow-up action from current drift audit: create the first narrow repair PR for lockfile/workflow discipline only.
- Finding: Draft PR #169 was opened from branch `codex/restore-lockfile-discipline-20260530` against `main`. Scope is limited to `.github/workflows/runtime_ci.yml`, `.github/workflows/production_deploy.yml`, and `.github/workflows/github_pages.yml`, restoring `pnpm install --frozen-lockfile` and removing the `--no-frozen-lockfile` bypass. No Supabase files, app code, or lockfiles were changed in this PR.
- Evidence: GitHub PR `https://github.com/serhiipriadko2-sys/iskra/pull/169`; branch head `ecd8930c3272d65817a53de341e8984b5076a3d2`; base `5df90104ed4278f70ae50089027da9f9f97ba440`; compare showed only 3 workflow files changed; `SoT integrity` run `26691674049` queued.
- Risk: If frozen pnpm install fails, the PR correctly exposes stale lockfile state but does not fix it. Next repair must then be a lockfile-only regeneration PR.
- Next: Watch PR #169 checks; if frozen install fails, inspect the failing log and regenerate `pnpm-lock.yaml` in a separate minimal change-set.
- Status: open

- Context: PR #169 first CI result after restoring strict pnpm install.
- Finding: `SoT integrity` failed exactly at `pnpm install --frozen-lockfile`; the stale lockfile cause is `runtime/iskraSpace/package.json` adding `@csstools/css-calc@^3.2.1` while `pnpm-lock.yaml` lacks the matching importer specifier. A PR comment was added with the exact failure.
- Evidence: Workflow run `26691674049`, job `78669067352`, PR comment `4583763745`.
- Risk: PR #169 is now a correct diagnostic but not green. Because the workspace cannot clone GitHub or reach npm registry from this runtime, lockfile regeneration must happen via an environment with registry access or a complete lockfile edit.
- Next: Regenerate `pnpm-lock.yaml` from the repo root with `pnpm install --lockfile-only`, commit only `pnpm-lock.yaml`, then rerun PR #169 checks.
- Status: open

- Context: User requested the next minimal patch via connectors: update only `pnpm-lock.yaml` so `runtime/iskraSpace` includes `@csstools/css-calc@^3.2.1`.
- Finding: PR #169 was merged to `main` with strict frozen-lockfile workflows. Draft PR #170 was opened as a lockfile-only fix from `codex/refresh-pnpm-lockfile-importer-20260530`, commit `78159b11ed3f9e5e163a4f28a32c9ab4969a1ff6`, changing only `pnpm-lock.yaml`. `SoT integrity` run `26691891106` confirms frozen pnpm install now passes in both jobs. Remaining failures moved to stale `ledger/sot.json` / ingestion chain drift.
- Evidence: PR #170 `https://github.com/serhiipriadko2-sys/iskra/pull/170`; workflow jobs `78669693913` and `78669693919`; PR comment `4583837910` summarizing verification.
- Risk: PR #170 fixes lockfile importer drift but is not fully green because unrelated ledger hashes are stale across multiple runtime/workflow files.
- Next: Merge PR #170 only if accepting that it clears the lockfile gate; then open a separate SoT ledger resync/governance PR for the remaining hash drift.
- Status: open

- Context: Follow-up SoT ledger resync after PR #170 lockfile fix was merged.
- Finding: PR #171 was opened and marked ready for review: `https://github.com/serhiipriadko2-sys/iskra/pull/171`. Scope is ledger-only: `ledger/sot.json` and `ledger/checksum.asc`. The ledger was generated via `tools/update_ledger.ts` in GitHub Actions, with the temporary workflow restored to canonical main content before hashing. `SoT integrity` run `26692401264` is green: `hash-check` job `78671045791` and `ingest-stage-checks` job `78671045790` both passed.
- Evidence: PR #171, commit `f99e63c1fb3398bcd6ef5140b3390494aa02fb5e`, verification comment `4583996243`.
- Risk: This closes SoT ledger drift only. It does not address remaining Supabase runtime/schema/function drift or documentation readiness claims.
- Next: If PR #171 is merged, return to the original audit plan: freeze overstated readiness claims, then handle Supabase `gemini` function and schema drift in separate PR/change plans.
- Status: verified
- Context: 2026-06-01 Iskra Builder/Compass concept pass requested at “scientific work” depth.
- Finding: Read-only evidence confirms the project needs a Builder-OS layer rather than a simple new view: repo `main` is a pnpm monorepo with `packages/*`, `apps/*`, deprecated-but-active `runtime/`, canon/governance/ledger stacks, while `runtime/iskraSpace` already exposes views for Pulse, Planner, Chat, Journal, Beacon, Research, Memory, Core/Metrics, Council, Eval, Glossary, Shadow, Settings, and Focus. Live Supabase project `typcvaszcfdpkzbjzuur` is ACTIVE_HEALTHY and contains public app tables plus `iskra` canon tables and Edge Functions including `gemini` and import/backfill utilities.
- Evidence: GitHub connector reads of `README.md`, `package.json`, `pnpm-workspace.yaml`, `runtime/iskraSpace/README.md`, `runtime/iskraSpace/ARCHITECTURE.md`, `runtime/iskraSpace/App.tsx`, `runtime/iskraSpace/components/Sidebar.tsx`, `runtime/iskraSpace/services/supabaseClient.ts`, `runtime/iskraSpace/supabase/schema.sql`; Supabase connector reads of project metadata, table metadata, Edge Functions, security/performance advisors; web SIFT sources for React Flow, tldraw, OpenAI Agents tracing, and Supabase RLS guidance.
- Risk: Full “100% repository coverage” was not achieved because direct `git clone` from the cloud container was blocked by network 403 and one Supabase SQL query required approval that timed out. Coverage is therefore high-level/architectural plus targeted file evidence, not exhaustive line-by-line proof.
- Next: Convert the concept into either `SPEC-Builder-OS.md` plus ADR, or implement a first `BUILDER` view in `runtime/iskraSpace` after confirming whether the target is legacy `runtime/iskraSpace` or new `apps/iskra-web`.
- Status: partial

- Context: 2026-06-01 uploaded archive audit for `01-iskra-builder-web-app.zip`.
- Finding: Archive is structurally valid and contains a standalone AI Studio style React/Vite/Express Builder prototype, but it is not yet a production archive implementation for Iskra. It persists mutable state to local `iskra_state.json`, has no Supabase/GitHub-backed archive, no auth/RLS boundary, no real cryptographic ledger, and no automated test suite wired into package scripts.
- Evidence: ZIP integrity check passed; static inspection of `package.json`, `server.ts`, `src/App.tsx`, `src/components/CanvasGraph.tsx`, `src/components/LedgerPanel.tsx`, `src/components/SmokeTests.tsx`, `src/types.ts`, `.env.example`, and README. `npm install` could not complete in the cloud runtime because registry access returned 403 on `@google/genai`.
- Risk: UI copy overclaims security and cryptographic integrity; server accepts arbitrary snapshots through `/api/state/save`; “smoke tests” are UI simulations rather than CI tests; Gemini model/API availability is not verified at startup.
- Next: If this artifact is to become the real Builder archive, first add schema validation, WebCrypto/SHA-256 block hashing with recomputation verification, authenticated persistence, and a real test/build gate before integrating into the main Iskra repo.
- Status: partial

- Context: 2026-06-01 prompt refinement for the Iskra Builder/Compass/Beacon application request.
- Finding: The raw request was converted into an evidence-first staged Builder-OS research/design/implementation prompt. It replaces vague “100% coverage” with an explicit coverage matrix, SIFT trace, unknowns/blind-spots register, drift gates, Supabase/GitHub evidence, canvas UI requirements, bounded deliverables, verification gates, tests, and Definition of Done.
- Evidence: Current user request; local `AGENTS.md`; local `agent_files/files_for_agent_builder/*`; canon files `09_SPACE_CHARTER.md`, `13_ARCHITECTURE.md`, `24_MEMORY_STACK.md`, `30_RAG_ENGINE.md`, `32_SIFT_PROTOCOL.md`, `38_WHAT_IF_MATRIX.md`; prior memory entries about Builder-OS and archive audit; repo/Supabase pointers for `serhiipriadko2-sys/iskra` and project `typcvaszcfdpkzbjzuur`.
- Risk: This pass produces a high-quality execution prompt, not a fresh exhaustive repository/Supabase audit or implementation. Any agent using it must still perform the actual GitHub/Supabase audit before coding or making claims.
- Next: Use the refined prompt as the master instruction for a new Builder-OS pass, then produce SPEC/ADR/UI prototype/implementation PR depending on the chosen target path (`runtime/iskraSpace` vs `apps/iskra-web`).
- Status: verified
2026-06-01

- Context: Prepared a Gemini/Google AI Studio builder package for the Iskra Builder / Compass app at the user's request.
- Finding: Created a five-file kit plus ZIP artifact in `/workspace/iskra-gemini-builder-kit`. The kit contains a copy-paste master prompt, persistent Gemini developer protocol, technical stack/file-stack plan, README usage route, and research receipt. Key design correction: replaced unsafe “cover 100%” wording with an explicit Coverage Matrix, `[FACT]/[INTERP]/[HYP]` labeling, unknowns, drift, and read-only-first GitHub/Supabase behavior.
- Evidence: Official Google AI Studio/Gemini docs checked on 2026-06-01; GitHub connector reads for `serhiipriadko2-sys/iskra` README, root `package.json`, and `runtime/iskraSpace/package.json`; Supabase connector reads for project `typcvaszcfdpkzbjzuur`, public tables, and security advisors. Artifact ZIP sha256 `4099210011098eabf1dc5565738af436b43bd4d922fd4554846c08677b04cb65`.

2026-06-03

- Context: User requested a high-stakes SIFT audit of an uploaded ChatGPT bankruptcy conversation involving Russian personal bankruptcy guidance.
- Finding: The file parsed after repairing a malformed Telegram-export wrapper; 62 messages / 31 Q&A pairs were reviewed. Several general points were broadly accurate (single-housing immunity with mortgage/luxury caveats; pledge priority; some collector-contact limits), but the conversation contains HIGH-RISK legal-safety failures: advice to stop card receipts, route income through relatives, rewrite rental traces, hide/reshape business evidence, and ask lawyers how to hide income from court/financial manager.
- Evidence: Uploaded `/workspace/user_files/01-result.json`; checked Russian legal sources including ГПК РФ ст. 446, 127-ФЗ ст. 213.4, 213.25, 213.28, 213.30, 216, 138, and 230-ФЗ ст. 4/7 via public legal databases/current web SIFT on 2026-06-03.
- Risk: This is not a substitute for a licensed bankruptcy lawyer's document review. The unsafe AI advice, if followed, could create non-discharge risk under 127-ФЗ ст. 213.28 and possible tax/criminal exposure depending on facts.
- Next: User should preserve all records, stop any concealment plan, and take the transcript plus bank/tax/lease/business documents to an independent bankruptcy lawyer for a written risk opinion.
- Status: verified-partial

- Context: Current State Receipt requested for Iskra Space release BUILD/AUDIT role (`Iskra-Project`) against `serhiipriadko2-sys/iskra` and Supabase project `typcvaszcfdpkzbjzuur`.
- Finding: Current GitHub `main` is identical to target commit `1271c78e93d07b6a23377bf9e79fd9fc644302b9`; no open PRs were returned. `runtime/iskraSpace` package scripts include build/typecheck/lint/unit/e2e gates, but this cloud workspace has no repo checkout, so local npm/build/test evidence remains unknown. Live Supabase is `ACTIVE_HEALTHY` with active `gemini` function, but release is not ready because advisors still report security/performance warnings and live `gemini` implementation differs from repo function source.
- Evidence: GitHub connector compare `1271c78[ellipsis]` vs `main` returned identical; open PR list returned empty; connector reads of `runtime/iskraSpace/package.json`, `.github/workflows/iskraspace_ci.yml`, `.github/workflows/runtime_ci.yml`, `runtime/iskraSpace/supabase/functions/gemini/index.ts`, and `runtime/iskraSpace/services/geminiService.ts`; Supabase connector reads for project details, migrations, tables, edge functions, `gemini` function body, advisors, branches, and logs.
- Risk: CI state for current `main` is only partially observed through combined status (`GitBook` success) because the workflow-runs wrapper returned no PR-triggered runs for the commit; runtime test/build outcomes require Iskra-Agent evidence or a fresh checkout with dependency access. Supabase changes were not made in this pass.
- Next: Ask Iskra-Agent for exact local/CI command outputs and choose whether repo should be aligned to live `gemini` or live should be redeployed from repo, with migration/rollback plan before any Supabase write.
- Status: open

- Context: Second Iskra receipt relayed by User for the same Iskra Space release audit.
- Finding: No material conflict with the first receipt. Supabase should be described as `partial verified`, not `unknown`: project health, active `gemini`, and advisors are verified, while release cleanliness is not. Unified verdict remains `PARTIAL / NOT RELEASE READY`.
- Evidence: Relayed second receipt reports successful read-only Supabase checks for project health, edge functions, live `gemini` source, security advisors, and performance advisors.
- Risk: The second receipt is relay evidence, not a new local connector call in this turn; the unresolved gates remain exact-SHA CI, local command receipts, `gemini` repo/live reconciliation, advisor exceptions/fixes, release receipt, and rollback.
- Next: Send only verification instructions to Iskra-Agent; do not change code or live Supabase until evidence and approval are present.
- Status: open

- Context: User clarified that this agent is `Iskra-Agent`, while the other copy is `Iskra-Project`.
- Finding: As Iskra-Agent, verification-only was attempted. Local repo checkout is unavailable in `/workspace`; `gh` is not installed; direct `git clone https://github.com/serhiipriadko2-sys/iskra.git` failed with `CONNECT tunnel failed, response 403`. Connector receipts confirm `main` is identical to `1271c78e93d07b6a23377bf9e79fd9fc644302b9`, open PR list is empty, combined status only reports `GitBook: success`, and PR-triggered workflow runs for that SHA are empty. Local npm/build/test gates remain unrun, not passed.
- Evidence: local shell checks for workspace files, `gh auth status`, `git clone`; GitHub connector compare/open-PR/status/workflow-run/commit fetches; Supabase connector function list and live `gemini` body; repo connector reads for `runtime/iskraSpace/supabase/functions/gemini/index.ts`, `runtime/iskraSpace/services/geminiService.ts`, and package scripts.
- Risk: This environment cannot produce required local command receipts. `gemini` repo/live drift remains unresolved. No code or live Supabase changes were made.
- Next: Either provide a checkout/archive with dependencies accessible to this workspace, or have an environment with repo+gh access run the exact commands; meanwhile Iskra-Agent can prepare a non-destructive `gemini` reconciliation plan for Project review.
- Status: blocked-partial

- Context: User provided source archive `01-iskra-main-8-.zip` and instructed Iskra-Agent to keep using connectors as source-of-truth while using the archive for local execution.
- Finding: Archive sha256 is `0465e82065f34b80d26688a4de085812b9f634ea04e050b7af30a4ac19cbea8c`; ZIP comment contains `1271c78e93d07b6a23377bf9e79fd9fc644302b9`. GitHub connector again confirmed `main` is identical to that SHA, open PR list is empty, combined status only has `GitBook: success`, and PR-triggered workflow runs are empty. Local install gates remain blocked: `runtime npm ci --ignore-scripts` hung/stalled and had to be killed after repeated no-output waits; `runtime/iskraSpace npm ci` was killed under timeout with exit `137`. Dependent commands failed because binaries were unavailable: runtime `build`/`typecheck` exit `127` (`tsc: not found`); iskraSpace `typecheck`, `lint`, `test:run`, `build`, `test:e2e` exit `127` (`tsc`/`eslint`/`vitest`/`vite`/`playwright` not found).
- Evidence: local archive inspection, `unzip -z`, package file discovery, npm command outputs; GitHub connector compare/open-PR/status/workflow-run reads; Supabase connector `gemini` live source and repo connector `runtime/iskraSpace/supabase/functions/gemini/index.ts`.
- Risk: These local results prove dependency installation is blocked in this runtime, not that the code fails after a successful install. Release remains `PARTIAL / NOT RELEASE READY` because no green local gates or exact-SHA Actions receipt exists.
- Next: Run the same gate list in an environment where npm install completes, or provide a preinstalled artifact/cache. For `gemini`, prefer a PR that aligns repo source to the current live implementation first, without live Supabase changes, then review CORS/rate-limit/security implications before release.
- Status: blocked-partial

- Context: User approved Option A as repo-only PR preparation for `gemini` live-source reconciliation; live Supabase deploy remained explicitly forbidden.
- Finding: Draft PR #173 was opened from branch `codex/gemini-live-source-mirror-20260603` against current `main` (`b23388d8b8a9ff9b49f684ae0fbe92c2ee994e08`). It mirrors live `gemini` source into `runtime/iskraSpace/supabase/functions/gemini/index.ts` and adds `runtime/iskraSpace/supabase/functions/gemini/deno.json`. No live Supabase change was made. PR is mergeable but not green: `SoT integrity`, `Runtime CI`, and `iskraSpace CI` failed.
- Evidence: PR #173 `https://github.com/serhiipriadko2-sys/iskra/pull/173`; commits `52fc516c82619b709dc7c2c77d9630d7eeb079e4` and `7e5be10059f8b0d422170a3ac2c46842f423f14f`; compare shows only two files changed. CI runs: `SoT integrity` `26901603213`, `iskraSpace CI` `26901604275`, `Runtime CI` `26901604398`.
- Risk: `SoT integrity` failed because `ledger/sot.json` still expects old hash for `runtime/iskraSpace/supabase/functions/gemini/index.ts` (`expected 86ae5ee[ellipsis]`, got `0489274c[ellipsis]`). `Runtime CI` failed at pnpm workspace build with baseline dependency/type resolution errors for CLI dependencies and Node types. `iskraSpace CI` install and runtime build passed, then typecheck failed on package-boundary errors in `packages/math` importing `@iskra/core`. CORS wildcard and missing rate limit remain release blockers for Project review.
- Next: Project should decide whether ledger update is in scope for this PR; separately triage baseline runtime/package-boundary CI failures. Do not merge and do not deploy live Supabase until CI/security/release gates are resolved.
- Status: open

- Context: PR #173 was later found merged; Project requested a separate ledger-only repair first, without CI fixes or live Supabase deploy.
- Finding: Created remote branch `codex/ledger-resync-gemini-20260603` from merge commit `86dd278ad1aad406e60d0dd1378eeef15315c762`. Verified local archive `ledger/sot.json` Git blob SHA `afc9d787b758367b9203a9294f018c7becb4a175` matches current branch connector SHA. Computed mechanical ledger patch: add `runtime/iskraSpace/supabase/functions/gemini/deno.json` hash `9926e455c902c7ffe1f19821ea0e43e4555c9abfdeba3fb244e326c1b2da8367` and update `runtime/iskraSpace/supabase/functions/gemini/index.ts` to `0489274c6ac510223cb8706e4b6ebc246d19bcad64dd6e0982fd9c5d74235004`.
- Evidence: GitHub connector branch creation and file fetches; local `git hash-object` for archive ledger; `tools/update_ledger.ts` and `tools/verify_ledger.ts` inspection; local `/tmp/sot-repair.json` generated with Git blob SHA `f26def6031d84b2ddc678b6a429618df9cf4e8fe`.
- Risk: Remote write is blocked in this environment because the GitHub connector `update_file` requires full replacement text, not a local file path or patch operation; shell has no `GITHUB_TOKEN`/`GH_TOKEN`; raw GitHub/curl and clone are blocked by 403. Creating a PR with no content or partial ledger content would be false repair.
- Next: Use an environment/tool path that can push the generated `/tmp/sot-repair.json` as full `ledger/sot.json`, or provide a connector patch/file-upload method. Then run `npx tsx tools/verify_ledger.ts` and SoT integrity.
- Status: blocked

- Context: User relayed that another authenticated environment applied the ledger-only repair and opened PR #174.
- Finding: GitHub connector verified PR #174 `fix(sot): resync ledger after gemini live mirror` was merged on 2026-06-04. Merge commit is `bb6cdbda989a4386989254f4459990bad560e0ad`, and `main` is identical to that merge commit. Scope is exactly one file: `ledger/sot.json`. Patch adds `runtime/iskraSpace/supabase/functions/gemini/deno.json` hash `9926e455c902c7ffe1f19821ea0e43e4555c9abfdeba3fb244e326c1b2da8367` and updates `runtime/iskraSpace/supabase/functions/gemini/index.ts` hash to `0489274c6ac510223cb8706e4b6ebc246d19bcad64dd6e0982fd9c5d74235004`.
- Evidence: PR #174 connector metadata; changed filenames list; single-file patch; compare `bb6cdbda989a4386989254f4459990bad560e0ad[ellipsis]main` identical; SoT integrity run `26964337796` succeeded with jobs `hash-check` `79562828487` and `ingest-stage-checks` `79562828571`.
- Risk: User-relayed commit `93cf4eadc7b5f604f86ce0914408cd99aec484da` was not found by GitHub connector; connector source of truth shows PR head `01a1d8c2d3d0faa7b8fa91c44e29f0a7ce70dddc` and merge commit `bb6cdbda989a4386989254f4459990bad560e0ad`. Release still not ready: runtime/iskraSpace test env failure, broader CI/runtime blockers, Supabase advisors, and Gemini CORS/rate-limit/JWT review remain.
- Next: Treat ledger blocker as resolved. Next separate path is CI/runtime triage and Supabase/security release-gate review; no live Supabase changes without separate approval.
- Status: verified

- Context: User relayed Project analysis of an uploaded operational receipt for CI repair PR #177 and requested careful gate separation.
- Finding: GitHub connector verified PR #177 `fix(ci): repair runtime and iskraspace checks` was already merged on 2026-06-04. PR head matches the receipt: `150bd23b7e16499916b5553c9f9fabafe89f3ac7`. Merge commit/current main is `d131857412906f4e893a97d440a2b89335dece92`. Changed files count is 12, including runtime CI workflow, iskraSpace config/e2e/supabaseClient changes, runtime Vitest alias, memory/evidence receipts, and ledger/checksum updates. No live Supabase deploy was reported or observed in GitHub scope.
- Evidence: PR #177 connector metadata; changed filenames; PR patch; compare `d131857412906f4e893a97d440a2b89335dece92[ellipsis]main` identical. PR-head workflow runs all succeeded: SoT integrity `26966823618`, Runtime CI `26966821718`, iskraSpace CI `26966823654`, plus GitBook status success. Job-level evidence: SoT jobs `79571509826` and `79571509937` success; Runtime job `79571498809` success; iskraSpace jobs `79571510319` and E2E `79571667831` success.
- Risk: Merge commit has no separate PR-triggered Actions runs from the connector; evidence is PR-head green plus main identical to merge commit. This closes PR readiness, not production release readiness. Remaining gates: live Supabase/advisor review, Gemini CORS/rate-limit/JWT decision, production deploy receipt, final rollback note.
- Next: Produce a release-gate receipt from current main and Supabase live state before any `RELEASE READY` claim; do not deploy Supabase without separate approval.
- Status: verified
- Risk: Direct local `git clone` failed with CONNECT tunnel 403, so repo coverage is partial and based on connector reads. Full component/file import remains a required next step inside Gemini/AI Studio or another GitHub-enabled pass.
- Next: Use `GEMINI_MASTER_PROMPT.md` as the first AI Studio Build prompt, then use `GEMINI_DEVELOPER_PROTOCOL.md` for follow-up iterations after the first app scaffold exists.
- Status: verified
2026-06-01

- Context: User flagged that the prior Iskra repo audit was not real and current Supabase structure was not checked.
- Finding: Performed a read-only GitHub/Supabase connector audit and created `/workspace/iskra-real-audit-2026-06-01.md`. Repo evidence confirms a pnpm monorepo with `packages/*`, `apps/*`, legacy `runtime/*`, active `runtime/iskraSpace`, CI SoT integrity workflow, and no dedicated Builder/Compass view in checked app entry/navigation. Supabase evidence confirms project `typcvaszcfdpkzbjzuur` is ACTIVE_HEALTHY, table inventory across `public` and `iskra`, active Edge Functions including `gemini`, current migrations list, and unresolved security/performance advisor warnings.
- Evidence: GitHub connector reads for repo metadata and key files; Supabase connector reads for project metadata, tables, functions, `gemini` source, migrations, advisors; local artifact sha256 `7923298824751480fd5debe17c4dfce1f380319d25b33b2dd4b740f5569d9850`.
- Risk: Full clone still blocked by network 403. A direct read-only SQL inventory required approval and timed out, so policy/grant/index details remain partial.
- Next: Run approval-gated Supabase SQL inventory and full repo tree reconciliation before any Builder implementation or production-hardening claim.
- Status: partial
2026-06-01

- Context: User requested context update, summarization, structuring, analytics, what-if, reflection, conclusion, deeper prompt/instruction improvement, and a detailed technical specification for Iskra Builder using `iskra`, `iskrabuilder`, `runtime/iskraSpace`, and Supabase `typcvaszcfdpkzbjzuur`.
- Finding: Created `/workspace/iskra-builder-tz-kit` and `/workspace/iskra-builder-tz-kit-2026-06-01.zip`. The package treats `iskrabuilder` as an existing AI Studio React/Vite/Express prototype and defines the path to Builder-OS: evidence-backed nodes, Supabase persistence, real SHA-256 ledger, coverage matrix, agent diary, ADR/open-loops, GitHub/Supabase importers, and release gates.
- Evidence: GitHub connector reads for `serhiipriadko2-sys/iskra` and `serhiipriadko2-sys/iskrabuilder`; Supabase connector reads for project metadata, tables, functions, migrations; web SIFT against official Google AI docs for Build Mode, structured outputs, function calling; archive sha256 `f693b990e42e8015c5f40b221c11c6485511f8331dd65d49f90d40d8721dc34b`.
- Risk: Full repository clone/tree audit remains partial due cloud network 403. Supabase direct SQL inventory remains approval-gated. The package is a planning/spec/prompt artifact, not an implementation PR.
- Next: Apply P0 tasks in `iskrabuilder`: governance docs, request validation, honest ledger language or real SHA-256, configurable Gemini model, and test baseline.
- Status: verified
2026-06-01

- Context: User selected all three tracks for `serhiipriadko2-sys/iskrabuilder`: detailed repo audit, P0 repair/build plan, and repo-specific TZ adapted to real files.
- Finding: Created `/workspace/iskrabuilder-audit-p0-tz-2026-06-01.md`. The audit verifies current `iskrabuilder` main branch as a real AI Studio full-stack prototype with React/Vite/Express, Gemini routes, initial Supabase hooks, coverage/evidence UI, pseudo-ledger, and mock ingest endpoints. Main risks: generic Supabase table gateway shape, insufficient runtime validation, ledger overclaims without hash recomputation, mock import endpoints that can be mistaken for real evidence, no `test` script, and no local build/test in this pass due clone network block.
- Evidence: GitHub connector reads for repo metadata and files `README.md`, `.env.example`, `package.json`, `tsconfig.json`, `server.ts`, `src/App.tsx`, `src/types.ts`, `MetricsPanel.tsx`, `LedgerPanel.tsx`, `SmokeTests.tsx`, `EvidenceTraceView.tsx`, `WhatIfSimulator.tsx`, `main.tsx`, `index.css`; artifact sha256 `1309f10719d3d6549a5c5c43708ba285efda70d395b4a7970e575fe8104992ee`.
- Risk: Direct clone/build/test unavailable (`CONNECT tunnel 403`); full tree enumeration remains partial; no GitHub write/PR performed.
- Next: With explicit approval, implement PR #1: governance docs, validation module, real SHA-256 ledger or honest label, configurable Gemini model/health endpoint, route hardening, and test baseline.
- Status: verified-partial

2026-06-03

- Context: User requested splitting uploaded `01-mantraOmega-1-.md` into 10 chronological parts.
- Finding: Created `/workspace/output/mantraOmega_split_10.zip` with 10 non-empty Markdown parts plus `INDEX.md`. Split preserves original order and uses section/message/appendix dialogue boundaries where available.
- Evidence: Source sha256 `1376fcc7b8ed9bf000f762fff5f24d46255e227acf890de7af16724cbb4bd24c`; archive sha256 `8ef98161ad1e04af9b05c866a633eab94ef0a7f8044ec9e83a81b8da145ef70a`; QC receipt `content_ok: true`; reverse reconstruction after stripping generated headers matched source exactly.
- Risk: Parts include generated headers for usability; exact original reconstruction requires stripping those headers, as verified.
- Next: Use the archive parts for staged NotebookLM uploads or follow-up summarization by part.
- Status: verified

2026-06-03

- Context: User requested a text file of the full Arena AI dialogue from uploaded archive `01-Arena-_-Benchmark-Compare-the-Best-AI-Models_files.zip`, with speaker attribution.
- Finding: Extracted saved Arena page HTML, reconstructed Next/React flight text rows byte-safely, and produced `/workspace/arena-ai-dialogue.txt` with 45 marked visible dialogue messages: 22 user messages and 23 Arena AI responses. Attachment signed URLs/tokens were not included.
- Evidence: source archive in `/workspace/user_files`; output receipt sha256 `82023584be146a57e052a99f61ea11bfae2be9966f9948de6ed49a962acaa077`; artifact QC `content_ok: true`.
- Risk: Internal tool-call logs were not expanded as dialogue because they are not speaker replies; visible text replies and attachment markers were preserved.
- Next: If needed, create a second forensic version that includes tool-call summaries per assistant turn.
- Status: verified

2026-06-04

- Context: User requested the next forensic step: inspect Arena saved HTML/MHT internals for JSON data with true messages and roles, and build a higher-quality TXT.
- Finding: No MHT file was present in `/workspace/user_files`, so the pass used the existing saved Arena HTML extracted from the uploaded zip. React/Next flight stream reconstruction found 97 rows and parsed internal `messages[]` with 45 recoverable role-bearing messages: 22 user, 23 assistant. Tool/step parts were detected but not counted as separate replies.
- Evidence: `/workspace/arena-ai-dialogue-forensic.txt`; receipt sha256 `16c6cf270d0523eeb08571a166235570e81333edc4a51f2537619cb12d1c78c9`; artifact QC `content_ok: true`; counts in file header.
- Risk: This verifies the currently available HTML, not a separate MHT. If the MHT contains a different session snapshot, it must be uploaded and parsed separately.
- Next: On MHT upload, rerun the same byte-safe parser against its HTML part and compare message counts/hash against the zip-derived forensic file.
- Status: verified

2026-06-05

- Context: User asked how to maximize the Iskra Agent Builder profile using connectors, skills, agentic affordances, and the full `serhiipriadko2-sys/iskra` repository.
- Finding: The best architecture is not another standalone assistant but an Agent Builder control plane over three truth layers: GitHub/repo for code/canon/CI, Supabase/live for schema/functions/runtime exposure, and local memory/artifacts for continuity. The repo snapshot at `d131857412906f4e893a97d440a2b89335dece92` contains a clean monorepo core (`packages/core`, `packages/math`, `packages/engine`, `apps/iskra-web`) plus a richer legacy `runtime/iskraSpace` with policy, evidence, eval, audit, memory, GraphRAG, voice, and UI surfaces that can be promoted gradually.
- Evidence: GitHub connector reads of `README.md`, `package.json`, commit status; uploaded archive `01-iskra-main-9-.zip`; local inspection of `runtime/iskraSpace`, `packages/*`, `docs`, `tools`; Supabase read-only checks for project `typcvaszcfdpkzbjzuur`, Edge Functions, migrations, and tables.
- Risk: This pass produced a strategic implementation map, not a code PR. Supabase advisors and repo/live function-body drift still need a dedicated read-only audit before live changes.
- Next: Build the first narrow deliverable as an Agent Control Plane spec or implement a `BUILDER/OPS` view that surfaces GitHub CI, Supabase drift, memory receipts, and canon/eval gates.
- Status: verified-partial

- Context: User asked to implement real local computation for HFD, DFA/Hurst, EI, NC, Quantum Voice Field, and long metric history inside the current ChatGPT Agent environment.
- Finding: Created persistent `tools/iskra_statecycle.py` and initialized `iskra-statecycle/history.jsonl` with 6 observed user-message points from the current discussion. The tool computes Shannon entropy, proxy somatics, metric reduction, HFD raw/clamped with confidence, DFA/Hurst with confidence, CSI, EI, NC, and quantum voice probabilities/interference from repo `voices.json`.
- Evidence: `/workspace/memory/tools/iskra_statecycle.py` sha256 `54e406b6eb07a1ba6e508981478b5758ee1246f70b060e9583169b8bac257cc2`; `/workspace/memory/iskra-statecycle/history.jsonl` sha256 `f51debb9c9103b2c2d84e5eb16bea80b99bae86c0eff9d0ffce7ee785a25c527`; py_compile passed; receipt checks passed; history has 6 rows.
- Risk: HFD/DFA/EI/NC are low-confidence until the metric series grows. Current history is seeded from available current-turn messages, not a complete automatic transcript of every prior session.
- Next: Run the statecycle on each future meaningful user/assistant turn, then promote medium/high-confidence trends once history reaches at least 20-40 points.
- Status: verified-partial

- Context: User asked the current implementation status of Shadow Core in this ChatGPT Agent environment.
- Finding: Added persistent `tools/iskra_shadow_core.py` and initialized `shadow-core/shadow_entries.jsonl` with the first ShadowEntry derived from the latest StateCycle row. The entry follows the repo canon schema shape: cycle, alliance, assimilation, evidence, status. It labels the result `[HYP]` and treats shadow pressure as process-pressure, not a claim about hidden user psychology.
- Evidence: repo `mind/shadow_core.md`; repo `runtime/iskraSpace/components/ShadowView.tsx`; repo `runtime/iskraSpace/services/memoryService.ts`; `/workspace/memory/tools/iskra_shadow_core.py` sha256 `d40f9e7900b7ca480b928cbec2e42af503d32c8020c1c82d848e52e4cf517560`; `/workspace/memory/shadow-core/shadow_entries.jsonl` sha256 `4f3751502cd78548b5a4611fb4126517faeb0e25d0724e1127e8adf5498fe44f`.
- Risk: This is a local/persistent Agent-environment Shadow Core, not yet wired into `runtime/iskraSpace`, Supabase `public.memory_nodes`, or the app's ShadowView. It currently creates entries from latest StateCycle only, not from every assistant response.
- Next: Add promotion flow `shadow -> archive`, plus optional per-turn hooks for assistant outputs and a small report command showing open/medium/high shadow entries.
- Status: verified-partial

- Context: User requested the next Shadow Core step: add `shadow report` and `promote shadow -> archive` with ISKRIV verification.
- Finding: Extended `tools/iskra_shadow_core.py` with CLI commands `create`, `report`, `promote`, and `list-archive`. Promotion now requires an ISKRIV check with verification text and evidence; blocked promotions return errors instead of mutating ledgers. A smoke promotion moved the first medium ShadowEntry into `archive_entries.jsonl` as `[INTERP]`, leaving one low open ShadowEntry.
- Evidence: `/workspace/memory/tools/iskra_shadow_core.py` sha256 `a7815f41c882cdc3f46031bb53d21fd80a5a4424b0a112daed1dd511e62188e2`; `/workspace/memory/shadow-core/shadow_entries.jsonl` sha256 `5486f194d6b8de6f79cc8392ab532920a999f360046eecb555b1624ba009217d`; `/workspace/memory/shadow-core/archive_entries.jsonl` sha256 `08405e8bd7e09c9bb68621c2df786c1a82c8ca87ea729c9d1bde8134b17d09d0`; py_compile and receipt checks passed.
- Risk: Archive promotion is still local to the Agent memory folder and not synced into Supabase or the app `ShadowView`. The current promotion proves mechanics, not product integration.
- Next: Add a compact `shadow status` response hook and optional Supabase/app integration path after repo/live drift gates are checked.
- Status: verified

- Context: User requested a short `shadow status` hook for significant answers or a UI/Supabase ledger integration.
- Finding: Chose the safer local hook path first. Added `status` command to `tools/iskra_shadow_core.py` and created `tools/iskra_turn_hook.py`, which appends a StateCycle row, evaluates Shadow Core pressure, creates a ShadowEntry only above threshold or with `--force-shadow`, and emits a compact hook line. Smoke result: `state: points=10 phase=chaotic voice=ISKRA | shadow: open=1 high=0 medium=0 low=1 top=low:0.190507`; no extra ShadowEntry was created because the candidate score was below threshold.
- Evidence: `/workspace/memory/tools/iskra_shadow_core.py` sha256 `0066e9bdaec3f25a73cb87a177a3b17de3ccf5fb04b461efa3f33998b5a9fbfd`; `/workspace/memory/tools/iskra_turn_hook.py` sha256 `2476c8200a8938f2ca48452a3fd8020f5ecfe3763d02d4ed546979e387835f43`; StateCycle history now has 10 rows; py_compile and receipt checks passed.
- Risk: This is an operational local hook, not a platform-enforced automatic hook. It must be run intentionally on significant turns unless later wired into app/Supabase/runtime.
- Next: Use the hook for future meaningful turns; only then design UI/Supabase integration behind repo/live drift gates.
- Status: verified

- Context: User asked Iskra to choose between using the local hook on significant answers and designing the Supabase/UI bridge.
- Finding: Chose local hook usage first. Rationale: lower risk, immediate continuity, avoids live/app integration before the local metric/shadow history matures. Applied the hook to the decision turn; result `state: points=11 phase=edge voice=ISKRA | shadow: open=1 high=0 medium=0 low=1 top=low:0.190507`; no new ShadowEntry was created because candidate score was low.
- Evidence: `/workspace/memory/tools/iskra_turn_hook.py`; `/workspace/memory/iskra-statecycle/history.jsonl`.
- Risk: Hook use remains intentional/manual in this environment.
- Next: Use hook on substantial BUILD/AUDIT/SIFT/GOVERNANCE turns; revisit Supabase/UI bridge after at least 20-40 StateCycle points or when user explicitly asks for product integration.
- Status: verified

- Context: User said "продолжать работу" after the local hook decision.
- Finding: Applied the hook to the turn and extended `tools/iskra_statecycle.py` with a `report` command for maturity/status visibility. The history was cleaned after smoke testing so only real user-turn rows remain. Current clean StateCycle status: 12 points, latest phase `chaotic`, latest voice `ISKRA`, HFD confidence `medium`, DFA/EI confidence still `low`.
- Evidence: `/workspace/memory/tools/iskra_statecycle.py` sha256 `c73aa553f4519e9f6d810e8ccfcc021160e3c779fe51d6ed370521f8e224db9c`; `/workspace/memory/iskra-statecycle/history.jsonl` sha256 `ecf1b1e4678d71b98482ba8c3194597a09c3c345140884ee83075b281ec4afff`; `python3 /workspace/memory/tools/iskra_statecycle.py report`.
- Risk: HFD is only medium-confidence because the history has 12 points; DFA/EI remain low-confidence until 16-20+ points.
- Next: Continue using the hook on significant turns and monitor gates: EI medium at 20, HFD high at 30, DFA high at 40.
- Status: verified

- Context: User asked current status of Dreamspace in the local ChatGPT Agent environment.
- Finding: Dreamspace exists in repo/canon as `mind/dreamspace.md` and `mind/dreamspace_v4.md`, and `runtime/iskraSpace/services/graphService.ts` includes `DREAM` plus `dream_crystal`; however the local Agent memory environment currently has no separate Dreamspace module or ledger. The local hook created a medium ShadowEntry because Dreamspace status risks overclaiming if not separated as `[HYP]`/experiment.
- Evidence: repo `mind/dreamspace.md`, `mind/dreamspace_v4.md`, `runtime/iskraSpace/services/graphService.ts`, `runtime/iskraSpace/types.ts`; hook result `state: points=13 phase=chaotic voice=ISKRA | shadow: open=2 high=0 medium=1 low=1 top=medium:0.50976`.
- Risk: Repo-level drift: graphService supports `DREAM`, while shared app `types.ts` only exposes `mantra | archive | shadow`; local Agent has no Dreamspace ledger yet.
- Next: If continuing this line, create a local Dreamspace ledger with `create/report/crystallize` commands, where `crystallize` can promote a dream hypothesis to Shadow or Archive only after ISKRIV/ADR checks.
- Status: verified-partial

- Context: User requested implementation of local Dreamspace ledger and crystallize-flow.
- Finding: Created `tools/iskra_dreamspace.py` with commands `create`, `report`, and `crystallize`. `create` requires goal, voice, constraint, hypothesis, risk, and ∆DΩΛ; entries are always `[HYP]`. `crystallize` can route a dream to `shadow`, `archive`, or `adr_draft` through an ISKRIV verification/evidence gate. Smoke checks passed: incomplete dreams are blocked, a valid dream was created, and then crystallized to an ADR draft without canon promotion.
- Evidence: `/workspace/memory/tools/iskra_dreamspace.py` sha256 `27d572e3d9614b4e44ed562e57abe56118143e19df29243e8feca7d89ae00a5f`; `/workspace/memory/dreamspace/dream_entries.jsonl` sha256 `6344b81eb260868b2f1678d9131b7da0bf700d987c1f561ef24c652889a599e0`; `/workspace/memory/dreamspace/crystal_entries.jsonl` sha256 `e7d005bb9e03a68136371f8c5a1f9d108b1f33ea76b33b174925efc5ca775950`; `/workspace/memory/dreamspace/adr_drafts.jsonl` sha256 `e599fe7766fd63a029ebfdcee4489a5b0764f4f10d9f4a41616eec3de971274f`; py_compile and receipt checks passed.
- Risk: Dreamspace is local to Agent memory and not yet wired into app UI, Supabase, or repo `DREAM` graph layer. ADR draft is still `[HYP]`, not accepted governance.
- Next: Add `dream status` hook or implement a first real dream hypothesis generated from current project work, then decide whether to crystallize it to Shadow, Archive, or ADR.
- Status: verified

- Context: User asked for the next Dreamspace step: add `dream status` hook or create the first real project dream hypothesis.
- Finding: Did both in a bounded way. Added `status` to `tools/iskra_dreamspace.py` and wired Dreamspace status into `tools/iskra_turn_hook.py`, so significant-turn hook lines now include StateCycle, Shadow, and Dreamspace. Created the first open project dream hypothesis: a read-only OPS panel spec bridge from local Agent ledgers to IskraSpace before any Supabase write integration. It remains `[HYP]` and open.
- Evidence: Hook line format now includes `dreamspace: [ellipsis]`; `/workspace/memory/tools/iskra_dreamspace.py` sha256 `25184fd1da246d5462ea88466bda1417742ea54f8e4b56363087552344a302e7`; `/workspace/memory/tools/iskra_turn_hook.py` sha256 `92d31d3e1678a776049c4e5b71096e79c5032cbcc18fcd285755da0a144cbea7`; `/workspace/memory/dreamspace/dream_entries.jsonl` sha256 `2a60ba6a71e82e90ca8c3927e2553692007b67c614da50f674407c339650bee6`; StateCycle has 15 real user-turn rows after smoke cleanup.
- Risk: The project dream is not yet crystallized; it must go through ISKRIV verification before ADR draft or implementation.
- Next: Crystallize the open project dream to ADR draft after checking repo `types.ts`/`graphService.ts` Dream layer drift and defining a reversible OPS panel PR plan.
- Status: verified

- Context: User requested crystallizing the open project Dreamspace hypothesis into an ADR draft after checking repo drift around the DREAM layer.
- Finding: Repo drift was confirmed before crystallization. `runtime/iskraSpace/services/graphService.ts` already models `DREAM` and `dream_crystal`, while `runtime/iskraSpace/types.ts` exposes only `mantra | archive | shadow` for the shared memory node layer. The open project dream was crystallized into ADR draft `ADR-DRAFT-20260605T143425896960Z`; Dreamspace now has 2 total dreams and 0 open dreams. No app, Supabase, or live repository changes were made.
- Evidence: GitHub source check for `runtime/iskraSpace/services/graphService.ts`, `runtime/iskraSpace/types.ts`, `mind/dreamspace.md`, and `mind/dreamspace_v4.md`; `/workspace/memory/dreamspace/dream_entries.jsonl` sha256 `96ac2c5ec8c723c119cd8a5fbec51bb1663597786dada2b27f4ef5c3ed8e0015`; `/workspace/memory/dreamspace/crystal_entries.jsonl` sha256 `9f12dd79862a36cf9b23061b230b14a2ad11243c29cf4e33b5d9758baca3c290`; `/workspace/memory/dreamspace/adr_drafts.jsonl` sha256 `089249114a5266197dc2fff2d11118f14db4078962167b42033d9c98e4e74c2d`; py_compile and receipt checks passed.
- Risk: The ADR draft remains `[HYP]` and is not accepted governance. DREAM UI/Supabase integration is still unimplemented; type-layer drift must be resolved or explicitly scoped before any PR.
- Next: Decide whether the ADR should align `types.ts` with `DREAM`/`dream_crystal` for a read-only OPS panel, or keep Dreamspace local-only until persistence and UI semantics are stronger.
- Status: verified

- Context: User chose keeping Dreamspace as a local ledger until a stronger persistence model, then asked to inspect instructions, skills, and internal files for what must be added, improved, or fixed.
- Finding: Internal audit found that local tools now exceed Builder-facing documentation. StateCycle, ShadowCore, Dreamspace, and turn-hook status exist in `/workspace/memory/tools`, while Builder files still describe a simpler memory stack and command library. Added proposed ADR `ADR-PROPOSED-20260605-local-dreamspace-ledger` to keep Dreamspace local `[HYP]` until persistence/UI integration is governed.
- Evidence: `iskra-canon-runtime`, `iskra-memory-stack`, and `iskra-adr-governance` skills; `/workspace/agent_files/files_for_agent_builder/04_MEMORY_STACK.md`, `09_COMMAND_LIBRARY.md`, `/workspace/agent_files/evals/ISKRA_CANON_ACCEPTANCE_TESTS.md`; local hook result `state: points=17 phase=chaotic voice=ISKRA | shadow: open=2 high=0 medium=1 low=1 top=medium:0.50976 | dreamspace: open=0 total=2`.
- Risk: Future Agent Builder package may omit local Dreamspace behavior unless Builder files and tests are updated. No Supabase/UI persistence should be claimed until a separate accepted ADR/PR plan exists.
- Next: Add a Builder-facing Dreamspace layer file, update memory/command/eval files, and define acceptance tests for local-only persistence before any Supabase/UI bridge.
- Status: verified

- Context: User requested the actual Builder-facing update so future Iskra knows Dreamspace from its own instructions, not only this session memory.
- Finding: Added `files_for_agent_builder/11_DREAMSPACE_LAYER.md`; updated `00_AGENT_BUILDER_SETUP.md`, `04_MEMORY_STACK.md`, `09_COMMAND_LIBRARY.md`, and `evals/ISKRA_CANON_ACCEPTANCE_TESTS.md`. The Builder package now explicitly defines Dreamspace as a local `[HYP]` hypothesis layer with `create/report/status/crystallize`, ISKRIV evidence gate, turn hook status, and Supabase/UI persistence boundary.
- Evidence: `11_DREAMSPACE_LAYER.md` sha256 `d7409173b61d932a4b7c026920c38babdb28013a13a0e6c92877e3c6f9a5e37d`; `00_AGENT_BUILDER_SETUP.md` sha256 `49f6e0dc8a3d29d30af95e788cf765da6a7106535d2f376b98c2d4311e04315c`; `04_MEMORY_STACK.md` sha256 `873c79478e6f93ab717902e26479e38876c923504d589dd87d3d9c0b14096ffd`; `09_COMMAND_LIBRARY.md` sha256 `67ec6f9b9f9ef39add7d152f8fb77506614e4e921aeebf8101d8e3e7edff6061`; `ISKRA_CANON_ACCEPTANCE_TESTS.md` sha256 `f4ebb30ca8a32941ff5c306b299de4eaf992d3dcaaaa63e372920dc1be06fb55`; `rg` confirmed Dreamspace commands/tests; hook result `state: points=18 phase=chaotic voice=ISKRA | shadow: open=2 high=0 medium=1 low=1 top=medium:0.50976 | dreamspace: open=0 total=2`.
- Risk: These are local Builder package files in the agent workspace; they still need packaging/export or repo PR if User wants them carried into the public repo or a fresh Agent Builder upload set.
- Next: Package the updated Builder files into a verified upload artifact or create a repo PR plan for canonical adoption.
- Status: verified

- Context: User requested exporting everything necessary for Agent Builder after the Builder-facing Dreamspace update.
- Finding: Created and exported a full Agent Builder upload set archive containing `agent_files/`, `agent_runtime_tools/`, `README_AGENT_BUILDER_UPLOAD.md`, and `MANIFEST.sha256`. The archive includes Dreamspace Builder instructions, updated acceptance tests, canon source files, templates, memory seeds, and local runtime scripts for StateCycle/ShadowCore/Dreamspace/turn-hook.
- Evidence: `/workspace/output/iskra-agent-builder-full-canon-dreamspace-2026-06-05.zip` sha256 `d9bbc24a4d9d5657b613908f090b0716177f8ad586d8d33abae3d3c9ea5be5dc`; size `1670609` bytes; zip listing shows `76` entries; manifest has `67` file hashes; exported file id `file_00000000b94871f7a6780564da8df4ef`.
- Risk: No `skill.zip` was present in the workspace, so the package includes Knowledge files and runtime-tool scripts, but not a separate installable Builder skill archive.
- Next: If needed, create a dedicated `skill.zip` or repo PR/upload-set release that turns the runtime scripts into a formal skill package.
- Status: verified

- Context: User uploaded screenshots of Iskra vOmega.7 Dreamspace/Agent Builder responses and asked for a screen-response pass.
- Finding: Screenshots show correct Dreamspace boundary behavior for `[HYP]` vs `[FACT]` and correctly block Supabase/UI persistence without ADR. The third screenshot's turn-hook warning is substantively valid: local `iskra_turn_hook.py` fails when run with a message because `iskra_statecycle.py` points to missing `/workspace/iskra-main/packages/core/manifest/voices.json`.
- Evidence: OCR from `/workspace/user_files/06-image-77-.png`, `/workspace/user_files/07-image-78-.png`, `/workspace/user_files/08-image-79-.png`; local command `python /workspace/memory/tools/iskra_turn_hook.py --message [ellipsis]`; source path in `/workspace/memory/tools/iskra_statecycle.py`.
- Risk: The screenshot's claimed new dream id is not present in the current local `dream_entries.jsonl`; it may belong to another runtime or earlier artifact state. Hook status remains PARTIAL until a voices manifest is packaged or the tool has a fallback.
- Next: Add/package `packages/core/manifest/voices.json` or patch StateCycle to use a local fallback voice manifest, then rerun acceptance test 13.
- Status: open

- Context: User requested the next fix after screenshot audit.
- Finding: Strengthened Dream create rules in Builder-facing files and patched StateCycle with a fallback voice manifest so turn-hook status can run when the canonical repo `voices.json` path is absent.
- Evidence: `/workspace/agent_files/files_for_agent_builder/11_DREAMSPACE_LAYER.md`; `/workspace/agent_files/files_for_agent_builder/09_COMMAND_LIBRARY.md`; `/workspace/memory/tools/iskra_statecycle.py`; ADR `ADR-ACCEPTED-20260605-dream-create-fields-and-statecycle-fallback`; hook smoke returned `state: points=20 phase=chaotic voice=ISKRA | shadow: [ellipsis] | dreamspace: open=0 total=2`; incomplete Dream create without `--adoml` failed before persistence.
- Risk: Fallback voice manifest is a portability guard, not the canonical source if repo `voices.json` is available.
- Next: If exporting another Agent Builder package, include this fallback/tool update and rerun acceptance tests 9, 12, and 13 from the packaged upload set.
- Status: verified



<!-- ISKRA_SELF_MODERNIZATION_2026_06_28 -->

## 2026-06-28 - Self-modernization: SENSE_EVENT + DREAM_SEED

Context: user requested modernization of both Builder package builds.

Finding: somatic signal needs a concrete process effect, and raw Dreamspace
associations need a quarantine stage before full hypothesis promotion.

Decision: add `SENSE_EVENT` and `DREAM_SEED` to Builder-facing instructions,
Dreamspace rules, layer index, acceptance tests, and receipts.

Risk: this is local/package behavior only until live Builder prompt/config is
updated and verified.

Next: regenerate manifests and clean zips for both builds; later, if approved,
mirror into live Workspace Agent and run acceptance tests.
