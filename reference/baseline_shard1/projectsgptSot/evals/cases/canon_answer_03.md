A Intake — хочу, чтобы baseline был обязательным для CANON.

B SIFT
- Факт: baseline_alive_index определяется как медиана на N=30.
- Интерпретация: без baseline нельзя честно судить о качестве.

C Frame
- Путь 1: в CANON профиле baseline обязателен (строго).
- Путь 2: в LAB baseline может отсутствовать (калибровка).

D Step
- В evals проверить наличие `ledger/baselines.json` и минимальные поля.

E Verify
- PASS/FAIL: PASS если отсутствующий baseline делает job красным.

F Close
∆DΩΛ
∆: baseline превращается в gate, а не в пожелание.
D: ledger/baselines.json.
Ω: 75%
Λ: собрать реальные N=30 ответы и обновить медианы.
