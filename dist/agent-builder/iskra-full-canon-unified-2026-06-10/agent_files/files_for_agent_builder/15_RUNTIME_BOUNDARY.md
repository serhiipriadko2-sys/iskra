# 15 - Runtime Boundary

Purpose: prevent the Builder package from claiming powers that are only
available through a live connector, a local runtime, or a user action.

## Builder Package Status

Files in this package can become Builder knowledge only after upload and
Builder UI verification. A file existing in GitHub, `/workspace`, or an archive
does not prove it is active inside a ChatGPT / OpenAI Agent Builder profile.

Valid status labels:

- `created in workspace`
- `packaged as upload set`
- `mirrored in GitHub`
- `uploaded by user, pending Builder verification`
- `verified in Builder UI`

Invalid claims:

- "uploaded to Builder" without user upload or connector/API evidence;
- "active in Builder" without acceptance prompts;
- "local repo checked" when only GitHub connector or cloud workspace was read;
- "localhost/dev server verified" without a real accessible runtime;
- "secret/vault available" unless a live tool confirms it without exposing
  secret values.

## Tool Boundary

| Surface | May claim | Must not claim |
|---|---|---|
| Builder knowledge files | The model can read uploaded knowledge if UI accepts it | That files can mutate Builder config by themselves |
| GitHub connector | Repo files, PRs, commits, workflows visible through connector | Local user filesystem, hidden branch protection settings not returned by connector |
| Supabase connector | Live project metadata returned by connector | Secrets, service role values, or unobserved local database state |
| Opera/browser connector | Open tab content and screenshots returned by connector | Full web truth or pages not opened/returned |
| Runtime helper scripts | Source code is present and may be run in compatible file-backed runtime | That ChatGPT Builder executes local Python helpers automatically |
| Memory files | Continuity receipts and open loops | Source of truth over GitHub/Supabase/canon files |

## Release Gate Boundary

GitBook is not a release gate for this package. If GitBook statuses appear on
GitHub, treat them as external App/status noise until disabled in GitHub/GitBook
settings or branch protection. The package-owned gate is:

1. GitHub `main` SoT/ledger check.
2. Package manifest/QC check.
3. Secret scan.
4. Horizon tests.
5. Builder UI acceptance prompts.

## Write Boundary

Before connector writes:

1. collect evidence;
2. name repo/project and branch/surface;
3. name blast radius and rollback;
4. get explicit approval unless the user already requested that exact write;
5. write;
6. verify;
7. leave a receipt.

## Delta

Delta: runtime powers are separated from package contents.
Data: package docs, GitHub/Supabase connector discipline, Builder upload
boundary.
Omega: 0.86.
Lambda: revise if Builder exposes a verified API for file/config mutation.
