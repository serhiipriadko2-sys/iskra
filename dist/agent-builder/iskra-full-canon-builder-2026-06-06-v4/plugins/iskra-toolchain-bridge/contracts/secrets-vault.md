# Secrets Vault Contract

Connector name: Secrets vault
Owner: Iskra vOmega.7
Status: proposed
Date: 2026-06-06

## Purpose

Provide named secret handles to runtime tools without exposing raw values.

## Scope

Allowed reads:

- Secret presence, metadata, scope, expiration, last-rotated timestamp when
  provider exposes it.

Allowed writes:

- Create, rotate, revoke, or bind secrets only after approval.

Explicitly forbidden:

- Printing secret values.
- Writing secrets into repo files, manifests, memory, logs, screenshots, or URLs.
- Passing tokens as command-line arguments.

## Operations

| Operation | Read/Write | Approval required | Evidence returned |
|---|---:|---:|---|
| `assert_secret_present` | read | no | handle, present true/false |
| `get_secret_metadata` | read | no | scope, age, provider |
| `bind_secret_to_tool` | write | yes | tool id, handle |
| `rotate_secret` | write | yes | handle, rotation receipt |

## Secret Handling

- Raw secret values never leave the vault boundary.
- Receipts may include handle names only.

## Verification

PASS criteria:

- Missing secret is reported as missing, not guessed.
- Tool receives secret through env/vault handle only.

FAIL criteria:

- Secret value appears in logs or receipts.

## Rollback

Revoke binding, rotate secret, remove leaked files from current tree, and assume
provider-side compromise if a value was exposed.

## Delta

Delta: secret access is handle-based.
D: provider metadata and redaction checks.
Omega: 0.84 until provider is observed.
Lambda: revise per vault implementation.
