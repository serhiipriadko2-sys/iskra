# Schedule Runner Contract

Connector name: Schedule runner
Owner: Iskra vOmega.7
Status: proposed
Date: 2026-06-06

## Purpose

Create, inspect, update, pause, and delete recurring or delayed agent tasks.

## Scope

Allowed reads:

- Existing automation name, cadence, prompt, status, destination, owner.

Allowed writes:

- Create/update/delete schedules after cadence, task prompt, timezone, and
  destination are explicit.

Explicitly forbidden:

- Creating ambiguous recurring tasks.
- Encoding secrets in prompts.
- Creating destructive unattended tasks without approval.

## Operations

| Operation | Read/Write | Approval required | Evidence returned |
|---|---:|---:|---|
| `list_schedules` | read | no | ids, names, cadence |
| `create_schedule` | write | yes | id, cadence, prompt summary |
| `update_schedule` | write | yes | id, diff |
| `pause_schedule` | write | yes | id, status |
| `delete_schedule` | write | yes | id, deletion receipt |

## Secret Handling

- Schedule prompts may name secret handles only.
- No tokens or credentials in schedule payloads.

## Verification

PASS criteria:

- Cadence, timezone, prompt, and destination are explicit.
- Existing automations are updated instead of duplicated where appropriate.

FAIL criteria:

- Schedule is created from vague "watch this" wording without cadence.

## Rollback

Pause first when unsure. Delete only exact ids.

## Delta

Delta: schedules become explicit runtime contracts.
D: cadence, prompt, timezone, id.
Omega: 0.86 when automation tool is available.
Lambda: revise per automation provider.
