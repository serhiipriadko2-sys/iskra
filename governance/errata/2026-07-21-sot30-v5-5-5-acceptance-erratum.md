# SoT30 v5.5.5 Acceptance Erratum — T85/T86

Status: accepted diagnostic finding; resolution targeted in v5.5.6.

v5.5.5 Knowledge, support files and `dist/SoT30_v5.5.5.zip` remain immutable.

A user-supplied clean-Project diagnostic report recorded:

- `PASS_DIRECT=44`
- `PASS_CONTRACT=47`
- `FAIL=2`
- 30/30 package hash identity: PASS
- T85: plan-specific memory prerequisites were stale for Enterprise
- T86: files 03/04 copied a numeric M1 drift threshold into M2 and coupled drift to KAIN
- full `LIVE-PROJECT-PASS`: not established

Evidence origin: user-supplied clean-Project diagnostic report.

- artifact SHA-256: `77738384f3ba301142102d84ba3702f6a63c8c9b896e6c5b7dc7b9deec7cce23`
- repository copy: absent
- read-back status: owner-provided plus uploaded report reviewed in ChatGPT

Resolution: v5.5.6 under ADR-20260721-02. No retrospective claim that v5.5.5 passed 93/93.
