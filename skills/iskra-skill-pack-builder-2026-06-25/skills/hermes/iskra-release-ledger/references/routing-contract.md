# Routing contract

## Positive triggers

Route to `iskra-release-ledger` when the user asks to:

- package, checkpoint, export, or verify a Skill or project artifact;
- generate or validate a release manifest, checksum set, receipt, changelog, or upload set;
- verify ZIP integrity, archive membership, bytes, sha256, or file counts;
- update or verify the repository ledger after a governed source change;
- decide whether a promised artifact is actually complete.

Legacy names `checkpoint-builder`, `iskra-workflow-ops`, and `iskra-ledger-integrity` route here as modes, not as independent owners.

## Negative boundaries

Do not route here merely because a task:

- edits source code without packaging or release verification;
- performs a security scan without producing a release artifact;
- queries Supabase or other live systems without an artifact/receipt step;
- asks whether an installed Skill was invoked live; static package evidence cannot answer that;
- requests deployment itself when no package verification or release receipt is needed.

## Live-evidence boundary

The Skill may prove `created`, `packaged`, or `committed` from local/repository evidence. It must not claim `merged`, `deployed`, `invoked`, or `verified-live` without direct evidence for that specific state.

## Acceptance probes

Positive:

1. "Собери skill.zip и дай sha256, bytes и file count."
2. "Проверь этот ZIP на traversal, symlink и лишние файлы."
3. "Создай checkpoint с manifest и read-back receipt."
4. "Обнови и проверь ledger после изменения SoT."

Negative:

1. "Проведи read-only аудит Supabase."
2. "Исправь SQL-функцию."
3. "Сделай security review PR без упаковки артефакта."
4. "Докажи auto-invocation установленного Skill только по ZIP-хэшу."
