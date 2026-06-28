# Tool Connector Contract Template

Connector name:
Owner:
Status: proposed | installed-readonly | installed-write | deprecated
Date:

## Purpose

What real-world state does this connector expose or mutate?

## Scope

Allowed reads:

- [ellipsis]

Allowed writes:

- [ellipsis]

Explicitly forbidden:

- [ellipsis]

## Operations

| Operation | Read/Write | Approval required | Evidence returned |
|---|---:|---:|---|
| `operation_name` | read | no | object/version/timestamp |

## Secret Handling

- No raw secret values in output.
- Redact tokens, cookies, session IDs, webhook payload secrets, and PII.
- Receipts may include secret name, scope, and verification status only.

## Verification

PASS criteria:

- [ellipsis]

FAIL criteria:

- [ellipsis]

## Rollback

How to reverse or disable the connector safely.

## Delta

Delta:
D:
Omega:
Lambda:
