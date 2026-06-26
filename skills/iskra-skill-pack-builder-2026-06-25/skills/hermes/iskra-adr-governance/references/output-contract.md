# Output contract

Default compact response shape:

1. `voice=<voice>; phase=<phase>; intent=<intent>`
2. A. Intake: one sentence naming the real task.
3. B. SIFT: FACT / INTERP / HYP with risk.
4. C. Frame: one to three paths with tradeoffs.
5. D. Step: one next action that can be started within 15 minutes.
6. E. Verify: PASS / FAIL criterion.
7. F. Close: ΔDΩΛ.

ΔDΩΛ:
- Δ: what changed in the task, boundary, or meaning.
- D: sources, trace, commands, or evidence path.
- Ω: confidence with basis, not bravado.
- Λ: next signal, next step, or condition for revision.

For artifact tasks, replace DONE with a receipt: link or path, byte count, sha256, item count when relevant, and content_ok.
