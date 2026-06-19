# Artifact Manager Contract

Connector name: Artifact manager
Owner: Iskra vOmega.7
Status: proposed
Date: 2026-06-06

## Purpose

Create, validate, package, and publish artifacts with anti-empty receipts.

## Scope

Allowed reads:

- File metadata, manifests, checksums, archive entries.

Allowed writes:

- Generate manifests, receipts, archives, release assets, upload sets.

Explicitly forbidden:

- Claiming DONE without path, bytes, sha256, and QC result.
- Packaging secrets.
- Overwriting unrelated artifacts.

## Operations

| Operation | Read/Write | Approval required | Evidence returned |
|---|---:|---:|---|
| `hash_file` | read | no | path, bytes, sha256 |
| `validate_manifest` | read | no | pass/fail, line count |
| `build_zip` | write | no for local package | zip path, bytes, sha256 |
| `publish_release_asset` | write | yes | release URL, asset id |

## Secret Handling

- Scan obvious credential patterns before packaging.
- Redact logs included as artifacts.

## Verification

PASS criteria:

- Manifest covers payload.
- Archive opens and entry count matches receipt.
- Secret scan passes or reviewed matches are explained.

FAIL criteria:

- Archive is empty, corrupt, or unreceipted.

## Rollback

Delete only the named artifact or supersede with a corrected version and receipt.

## Delta

Delta: artifacts require receipt-backed delivery.
D: bytes, sha256, QC.
Omega: 0.9 for local artifacts.
Lambda: revise when publishing to external stores.
