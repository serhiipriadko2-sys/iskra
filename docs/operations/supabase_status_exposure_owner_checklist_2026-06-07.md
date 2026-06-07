# Supabase Status Exposure Owner Checklist

Status: OWNER ACTION REQUIRED
Date: 2026-06-07
Scope: tracked `supabase_status.txt` current-tree leak closure

## Boundary

The raw tracked status dump has been removed from the current tree and replaced
with a redacted template. This checklist intentionally does not quote any
removed value.

Current-tree remediation is not the same as credential safety. If any removed
value was not local-dev-only, assume exposure, rotate it at the provider, and
audit usage.

## Owner Checklist

1. Classify every removed value as one of:
   - local-dev-only
   - non-local credential
   - unknown
2. For every non-local or unknown value:
   - rotate it at the provider
   - revoke old value if supported
   - audit recent usage
   - record the provider-side timestamp and scope in a private operational log
3. Check whether any value appears in:
   - GitHub repository history
   - issue/PR comments
   - release artifacts
   - Agent Builder upload sets
   - local memory or diagnostics
4. Decide whether Git history rewrite is required.
5. Do not rewrite history without explicit approval and a coordination plan for
   every clone/remote that has already seen the old object.

## Repo-Side Controls Added

- `/supabase_status.txt` and `/supabase_status*.txt` are ignored.
- `docs/operations/supabase-status-redacted-example.txt` is the safe template.
- `tools/check_no_sensitive_status_dumps.py` blocks committed local status
  dumps and obvious credential patterns.
- Root `verify` and the SoT integrity workflow call the new sensitive-status
  check.

## PASS Criteria

PASS only when:

- every removed value is confirmed local-dev-only, or every non-local/unknown
  value has been rotated and audited
- current repository checks pass with no raw status dump
- any required history rewrite decision is explicitly approved or explicitly
  rejected with risk acceptance

## Delta Receipt

Delta: current-tree exposure is closed, but credential classification is an owner task.  
D: removed tracked dump, redacted template, sensitive-status checker, this owner checklist.  
Omega: 0.91 for current-tree closure; 0.55 for credential safety until owner classification/rotation evidence exists.  
Lambda: revise after provider-side rotation/audit evidence or explicit history-rewrite approval.
