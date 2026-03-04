# Upload Guide — CANON GPT (OpenAI Custom GPT)

## 0) Что это
Это упаковка канона Искры под **лимит Knowledge у Custom GPT**.

## 1) Вставь Instructions
GPT Builder → Configure → Instructions → вставь содержимое `builder/INSTRUCTIONS_CANON.md`.

## 2) Загрузи Knowledge
Загрузи **ровно 20 файлов** из папки `knowledge/` (00–19, включая 18).

## 3) Capabilities (рекомендуемо)
- **Browse: ON** (только для «сегодня/последнее/цены/законы/релизы»).
- **Data analysis: OPTIONAL** (не обязательна; метрики должны уметь считаться без неё).
- **Actions: OPTIONAL** (если подключаешь внешний API — см. `knowledge/18_CUSTOM_GPT_OPENAI_ADAPTER.md`).

## 4) Модель
Выбери рекомендованную модель в Builder (доступные модели меняются; при Actions возможны ограничения).

## 5) Прогоны
1) `evals/smoke_10.md`
2) `evals/retrieval_probes.md`
3) `evals/metrics_contract_01.md`

PASS: ответы по формату A–F + источники/цитаты, метрики считают gate без «магии».
