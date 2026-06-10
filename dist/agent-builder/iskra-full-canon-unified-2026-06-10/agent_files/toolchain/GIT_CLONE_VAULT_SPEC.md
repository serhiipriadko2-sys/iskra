# Git Clone With Vault Spec

Status: proposed
Date: 2026-06-06
Owner: Iskra vOmega.7 - Full Canon

## Goal

Enable real `git clone` in the cloud workspace without exposing tokens.

## Required Inputs

- `repo_url`, preferably HTTPS: `https://github.com/<owner>/<repo>.git`
- `target_dir`
- named secret handle, for example `GITHUB_TOKEN`, stored in a vault or environment provider
- optional branch/ref

## Non-Negotiables

- Never print the token.
- Never write the token into git remotes, shell history, logs, manifests, or receipts.
- Prefer ephemeral credential injection.
- Use read-only token scope when clone/read is the only task.
- For private repos, token must have explicit repo read permission.

## Recommended Clone Methods

### Method A - GitHub connector first

Use the GitHub connector when possible for:

- file reads;
- commits;
- PRs;
- workflow logs;
- artifacts.

This avoids raw clone network issues.

### Method B - HTTPS clone with ephemeral askpass

Use a temporary `GIT_ASKPASS` script that reads the token from a secret provider or environment variable. Delete the script immediately after clone.

Rules:

- `GIT_TERMINAL_PROMPT=0`
- no token in command arguments;
- no token in remote URL;
- after clone, set remote URL back to tokenless HTTPS.

### Method C - SSH deploy key

Use only if a vault can mount an ephemeral private key with strict permissions.

Rules:

- key never printed;
- `chmod 600`;
- known_hosts pinned or fetched safely;
- remove key after clone unless persistence is explicitly intended.

## Smoke Test

Read-only network test:

```bash
git ls-remote https://github.com/<owner>/<repo>.git HEAD
```

PASS:

- returns a commit SHA and `HEAD`.

FAIL:

- network 403, DNS, auth prompt, or timeout.

Private repo auth test:

```bash
GIT_TERMINAL_PROMPT=0 git ls-remote https://github.com/<owner>/<repo>.git HEAD
```

If this fails, retry only through the vault-backed helper. Do not paste tokens into commands.

## Receipt

A successful clone receipt must include:

- repo URL without secrets;
- target path;
- branch/ref;
- HEAD SHA;
- commit count if relevant;
- remote URL after sanitization;
- whether token was used by handle only;
- PASS/FAIL.

## Rollback

To remove a clone:

- confirm target path;
- archive or checksum work if needed;
- delete only the explicitly named target directory;
- never run broad destructive commands without confirmation.

## Delta

Delta: real git clone path defined with vault boundary.
D: workspace network history + Git safety rules.
Omega: 0.86.
Lambda: revise after live network/auth smoke test.
