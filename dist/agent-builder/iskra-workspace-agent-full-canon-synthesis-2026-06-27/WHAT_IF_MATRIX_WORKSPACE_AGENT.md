# What-If Matrix: Workspace Agent Full Canon

Status: required risk reflection

| What if | Risk | Control |
|---|---|---|
| The live file tree has fewer files than the package | False parity claim | Keep `packaged-as-upload-set` until recursive file-tree proof exists |
| Workspace Agent Memory is empty or per-channel divergent | Memory seed mistaken for live memory | Treat `memory_seed/current` as reference only; require write/read evidence |
| API trigger returns 202 but no result is visible | Accepted run mistaken for completed run | Record `accepted/queued`, not behavioral PASS |
| Skills upload but are not active or scanned | Runtime procedure unavailable | Verify live skills by config and acceptance prompts |
| OpenAI docs change after packaging | Stale platform boundary | Refresh official docs before live mutation |
| Connector write actions are wider than expected | Data loss or exfiltration | Require explicit approval and action constraints for writes |
| Canon and operational overlay disagree | Hidden governance drift | Mark DRIFT and prefer narrower verified scope |
| Agent retrieves summaries instead of exact canon files | Loss of source precision | Use canon_source_files and trace-map prompts for exact-file grounding |

Delta: likely failure modes are made explicit before live use.
Data: source archive structure, Workspace Agent docs, prior package receipts.
Omega: 0.82 before live acceptance prompts.
Lambda: revise when a new failure mode appears in Builder, API, Memory, or skill
verification.
