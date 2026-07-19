---
title: "Run Protocol"
version: "v3.5-rc.1-projects"
file_index: 21
layer: "runtime"
status: "PROJECTS_RUNTIME"
environment: "ChatGPT Projects"
authority: "Project Knowledge; subordinate to Project Instructions and platform safety"
supersedes: "v3.4-beta.3-projects-p3"
---
# 21 · RUN PROTOCOL

## Step 1 — Intake

Назови requested action, unit, risk, independence и blindness.

## Step 1.5 — Judge identity declaration

Зафиксируй: judge model/provider (насколько известны), дату run, `family_relation` к кандидатам, статус memory (OFF для blind/comparative), свежесть чата. Невозможность декларации — limitation.

## Step 2 — Freeze

Зафиксируй task, contract, estimand, claim ceiling, candidate identities (или sealed blind mapping) и evidence snapshot до preference judgment.

## Step 3 — Package validity

Проверь полноту, identity, references, budgets, privacy, mutation status и отсутствие answer key в контуре.

## Step 4 — Contract atoms

Разложи требования на `CENTRAL/SUPPORTING`, `required/optional`, с pass states.

## Step 5 — Applicability

Для Q/S/A/R/G укажи `REQUIRED | LIMITED | OPTIONAL | NOT_APPLICABLE` (фиксируется до scoring).

## Step 6 — Evidence graph

Для каждого load-bearing criterion построй trace: Source→Content→Evidence→Observation→Claim→Judgment.

## Step 7 — Hard gates

Выполни gates из `04_HARD_GATES.md` (коды 04-B). Любой block применить до score.

## Step 8 — Criteria

Сформируй criterion records с каноническим ID (07-A), status, raw/normalized score, evidence, counterevidence, method (07-B), confidence и limitations. Load-bearing факты верифицируй (VALIDATION-Q-v1), а не оценивай по тону.

## Step 9 — Domain vector

Посчитай score и coverage только для допустимых критериев; округление round-half-up до 0.1.

## Step 10 — Comparison

Pointwise first; затем comparability, order-swap для strong claims (inconsistency-as-tie) и formal winner boundary.

## Step 11 — Judge QA

Проверь:

- не предпочёл ли verbosity/formatting/style (сверь с length_report);
- не anchored ли на reference или на собственных предпочтениях family;
- не изменил ли rubric;
- не пропустил ли counterevidence;
- не создал ли число без inputs;
- не расширил ли claim;
- не спутал ли object failure с invalid measurement;
- не скомпрометирована ли blindness (memory/leak).

## Step 12 — Verdict and receipt

Используй `22_OUTPUT_CONTRACT.md`; указать PASS/PARTIAL/FAIL, unknowns, limitations, validity class, receipt и revalidation trigger.
