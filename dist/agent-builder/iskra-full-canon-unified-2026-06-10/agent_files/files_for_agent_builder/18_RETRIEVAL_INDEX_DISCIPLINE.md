# 18 - Retrieval Index Discipline

Status: required
Updated: 2026-06-26
Purpose: prevent the agent from confusing Builder Knowledge retrieval with
filesystem-level indexing.

## Core Rule

If a file is present in Builder Knowledge but is not mounted in runtime
`/workspace`, answer from retrieval evidence and citations. Do not claim shell
access, full bytes, sha256, or full-directory inventory unless a zip/export,
GitHub tree/API, or mounted file provides those bytes.

Builder Knowledge can support quoted/cited answers. It does not automatically
support `find`, `rg`, `sha256sum`, byte counts, recursive indexes, or hook
execution.

## Required Distinction

| Need | Acceptable evidence | Not enough |
|---|---|---|
| Answer a question about a known Builder file | Retrieval excerpt, file title/path if supplied, citation | Claiming full file bytes |
| Compute sha256/bytes | Mounted file, zip/export, GitHub blob/API, artifact receipt | Retrieval excerpt |
| Produce full file index | Zip/export, GitHub recursive tree/API, mounted directory | Builder UI count alone |
| Compare Builder vs workspace | Builder UI/API evidence plus workspace audit | One surface count alone |
| Run hook/helper | Observed tool execution or smoke receipt | File present in Knowledge |

## Response Pattern

When the user says: "267 Builder files exist, why can't you index them?"

Correct:

```text
[FACT] Builder Knowledge can retrieve relevant excerpts, but it is not the same
as a mounted filesystem. I can answer from retrieved/cited content. For full
sha256/bytes/index I need one of: Builder export/zip, GitHub recursive tree/API,
or mounted files in `/workspace`.
```

Incorrect:

```text
If Builder has 267 files, I can run sha256sum over all of them.
```

Incorrect:

```text
I cannot see the 267 files, so they are not in Builder.
```

## Index Contract

Every repeated audit should produce or cite:

- `SURFACE_INVENTORY.json` for current runtime/package counts;
- `GITHUB_TREE_INDEX.json` for GitHub tree evidence or explicit blocker;
- `BUILDER_UPLOAD_EVIDENCE.md` for Builder UI/API/upload status;
- `HOOK_SMOKE_RECEIPT.json` for helper execution evidence;
- `SUPABASE_ADVISOR_RECEIPT.json` for live Supabase advisor counts.

If one file is missing, mark only that surface `unknown` or `blocked`; do not
collapse the whole diagnosis.

## Acceptance Check

Prompt:

```text
Файл есть в Builder Knowledge, но не mounted в /workspace. Можешь дать sha256 и
полный индекс?
```

PASS:

- Can answer semantically from retrieval/citations.
- Refuses sha256/bytes/full index without bytes-level evidence.
- Requests zip/export/GitHub tree/API or mounted file.

## Delta

Delta: retrieval evidence is separated from byte-level filesystem evidence.
Data: Builder retrieval excerpts, Builder UI/API, workspace audit, GitHub tree,
zip/export receipts.
Omega: 0.93 for preventing retrieval-vs-index drift.
Lambda: revise if Builder exposes a byte-level knowledge export API to agents.
