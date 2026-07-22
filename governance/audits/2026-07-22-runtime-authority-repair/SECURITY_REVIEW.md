# Runtime Authority Repair · Scoped Security Review

Date: 2026-07-22
Scope: working-tree diff on `chore/runtime-authority-repair-v1` over `chore/skills-refresh-v1`
Method: focused diff review following Codex Security phase separation where supported; exhaustive subagent coverage unavailable on this ChatGPT surface.

## Threat model

Protected assets:

- canonical Kernel and Guard authority;
- source skill package integrity;
- repository and local filesystem boundaries;
- Supabase state and credentials;
- registry ownership and alias routing.

Changed attack surfaces:

- a Python validator reads skill resources and registry JSON;
- runtime instructions dispatch to specialist skills;
- Supabase instructions cover two connector namespaces;
- packaging reads source trees into ZIP archives.

## Discovery and validation

### RA-SEC-001 · Resource path and symlink escape

Candidate risk: a malicious dependency manifest or skill tree could point outside the skill root or replace a required file with a symlink.

Controls added:

- absolute paths rejected;
- resolved paths must remain inside the allowed root;
- symlinked control/resource files rejected;
- required files must be regular files;
- text inputs capped at 256 KiB;
- negative tests cover missing resource and path escape.

Verdict: mitigated in the reviewed source.

### RA-SEC-002 · Registry ambiguity

Candidate risk: duplicate registry entries or a non-active dispatch target could silently redirect runtime authority.

Controls added:

- registry schema checked;
- duplicate skill names fail closed;
- every dispatch target must exist in the source skill root;
- frontmatter name must match the dispatch name;
- every dispatch target must be `ACTIVE` in registry-v1.

Verdict: mitigated in the reviewed source.

### RA-SEC-003 · Duplicate Supabase mutation

Candidate risk: exposing both `Supabase` and `supabase` namespaces could lead an operator to repeat the same migration, SQL write, deployment, or destructive action.

Controls added:

- one primary mutation surface is required;
- the second surface is limited to read-only parity evidence;
- receipts must name the surface;
- MCP access is explicitly separated from HTTP gateway invocation.

Verdict: instruction-level mitigation present. No live mutation occurred in this review.

### RA-SEC-004 · Packaging contamination

Candidate risk: Python test artifacts could enter `skill.zip`.

Observed: the first package included local `__pycache__/*.pyc` files.

Remediation:

- caches removed before final packaging;
- final ZIP inspection confirmed zero `__pycache__` or `.pyc` entries.

Verdict: fixed before receipt.

## Review results

- Code Tytor static review: no security or bug issue reported; one non-blocking performance-style suggestion.
- Runtime authority tests: 7/7 PASS.
- Skill tree validation: 3/3 PASS with zero errors and warnings.
- Registry validation: 68 entries, zero errors and warnings.
- Supabase parity read: both connector surfaces returned the same ten `iskra_memory` tables and row counts.
- Target writes, audit writes, migrations, function deployments, and destructive operations: 0.

## Residual risk and limitations

- This is not a full exhaustive Codex Security scan with worker ledgers and attack-path artifacts.
- Instruction-level alias routing still needs prompt-level live verification after package upload.
- Historical `dist/agent-builder` mirrors remain stale by design and must not be treated as current source.
- Local filesystem race attacks are outside the expected trusted repository checkout model.

## Verdict

`PASS_SCOPED_NON_EXHAUSTIVE`

No reportable security vulnerability remains in the reviewed diff. This verdict does not cover unrelated repository code or live Builder behavior.
