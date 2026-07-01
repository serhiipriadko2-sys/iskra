# Runtime Surface Contract vΩ.7.1

Status: accepted for repo branch

## Rule zero

No surface proves more than it can observe.

## Surfaces

| Surface | Proves | Does not prove |
|---|---|---|
| SoT / canon files | canon, meaning, instructions, hierarchy | live runtime or Builder upload |
| GitHub | committed code/docs/package mirrors | local uncommitted state or live Builder |
| Uploaded/local zip | reproducible upload package | active Builder runtime |
| Supabase live | real DB/schema/functions/advisors | migration parity with GitHub |
| Remote Desktop | local files/terminal/machine state | canonical GitHub state |
| Workspace Agent Memory | continuity in agent runs | Builder files, zip contents, or canon |
| Skills | available action names/instructions | byte parity with packaged skills |

## Required drift labels

- `DRIFT: A vs B` for ordinary source disagreement.
- `HIGH-RISK DRIFT: A vs B` for release, auth, security, data integrity, or canon behavior.

## Forbidden collapse

- GitHub != Local.
- Zip != Builder.
- Builder Files != Memory.
- Memory != SoT.
- Supabase live != migrations.
- API accepted != completed.
- Skill name != skill byte parity.

## Completion rule

A task is not complete until its relevant surface has evidence:

- GitHub: branch/commit/PR/diff.
- Supabase: schema/log/advisor/migration evidence.
- Builder: live Builder acceptance prompt result.
- Artifact: path + bytes + sha256 + content check.
- Memory: write/read proof or explicit unavailable status.
