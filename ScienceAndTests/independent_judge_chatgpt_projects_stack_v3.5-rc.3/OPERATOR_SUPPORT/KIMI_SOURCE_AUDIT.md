# Независимый Судья для ChatGPT Projects: глубокий аудит v3.3‑alpha.9‑p2 и доработка до v3.4‑beta.1‑projects

**Дата:** 2026‑07‑19
**Объект:** `ScienceAndTests/iskra_evaluation_release_2026-07-08/judge` @ `f3cab7ba54192d6392e297c51ea1910d42f06fae` (= HEAD main, drift отсутствует — проверено по commit graph)
**Исполнитель:** Kimi (контур Искра vΩ.7 / SoT30 v5.5.2)
**Статус результата:** PROPOSED_OWNER_REVIEW (по правилам governance самого судьи, файл 27)

---

## 1. Резюме

Стек судьи v3.3‑alpha.9‑p2 — концептуально сильный (evidence discipline, hard gates до scoring, claim ceiling, типизированные unknowns, zero‑trust), но содержит **классы дефектов, которые в бою сделали бы runs невоспроизводимыми**: рассинхрон реестров, отсутствие каталогов кодов и методов, отсутствие операционной защиты от шести документированных в науке bias LLM‑судей, отсутствие blind‑workflow при том, что answer key лежит в одной папке с судьёй, и отсутствие study‑уровня — при том, что основной реальный use case (банк unified‑1000) это именно study.

Выпущен **v3.4‑beta.1‑projects**: 30 переработанных файлов ядра (бюджет Knowledge сохранён), 5 runtime‑расширений под зарезервированные слоты, обновлённые Project Instructions (3842 символа), MANIFEST.sha256, расширенная acceptance‑suite T01–T34. Все внутренние ссылки проверены машинно: 40 criterion ID, 56 gate‑кодов, 11 method ID — единообразны по всему пакету.

---

## 2. Методология (19 шагов заказа → как выполнены)

| Шаг | Выполнение |
|---|---|
| 1. Контекст чата | Перечитан; учтены прошлые боли: «v2 STRICT судил по длине», «Искра не залипла, а раскрывает смысл», опровергнутые артефакты «100%/36%» и «−0.43» |
| 2. Файлы рабочей области | SoT30 v5.5.2 (Project Instructions) прочитан полностью; skill scientific‑problem‑selection применён как рамка рисков/инверсии |
| 3. GitHub + Supabase | GitHub: полный дамп папки judge (33 файла) + drift‑check по коммитам + ZIP‑верификация sha256. **Supabase: MCP‑сервер не подключился в этом ходе — исследование не выполнялось, результаты не имитировались** (требуется реконнект плагина) |
| 4–6. Суммирование, структура, аналитика | §4–§5 этого отчёта |
| 7. Глубокий аудит | §5, 17 находок с severity |
| 8. Интернет‑исследование | §6: лимиты платформы + состояние науки LLM‑as‑judge |
| 9. Слепые зоны | §7 |
| 10. Зависимости | §8 |
| 11. «Что если» | §9 |
| 12. Ветки суждения | §10 (3 ветки, выбор обоснован) |
| 13. Синтез | §11 (архитектура v3.4) |
| 14. Рефлексия | §12 |
| 15–16. Вывод + проверка на прочность | §13 |
| 17. Тестирование | §14 (структурный QC + 15 поведенческих сценариев) |
| 18. Работа над ошибками | §15 (карта исправлений) |
| 19. Финальная сборка | пакет + MANIFEST.sha256 + ZIP + этот отчёт |

---

## 3. Доказательная база

- **[FACT]** Содержимое 33 файлов `judge/` прочитано построчно локально; размеры сверены с GitHub API побайтово; ZIP `..._UPLOAD_ONLY.zip` распакован — 30 файлов `knowledge/` + инструкции **идентичны** разрозненным файлам (sha256 совпали).
- **[FACT]** `f3cab7b` — HEAD ветки по умолчанию (merge PR #279, 2026‑07‑19 05:47 UTC). Более новых изменений судьи нет.
- **[FACT]** В папке присутствует мусорный файл `judge/1` (1 байт, коммит «Create 1») — артефакт, не часть протокола.
- **[FACT]** Лимиты ChatGPT Projects на дату аудита: Free 5 / Plus 20 / Pro·Team·Education·Business 40 файлов на проект; загрузка пачками по 10; текстовые файлы до 2M токенов [^1^][^2^]. Осенняя рассылка OpenAI называла для Plus 25 — источники конфликтуют; берём консервативное 20 из актуального официального FAQ [^7^].
- **[FACT]** Наука о LLM‑судьях: position bias и swap‑протокол (Zheng et al. 2023; систематическое исследование arXiv:2406.07791) [^6^]; verbosity bias с β₂/β₁ до ~0.4 [^5^]; self‑preference 10–25% [^19^]; rubric‑based evals как стандарт индустрии, reward hacking при наивных рубриках [^12^]; inconsistency‑as‑tie как практика [^6^].
- **[INTERP]** Выводы о дефектах пакета — интерпретация на основе построчного чтения; каждая подкреплена цитатой файла/секции.
- **[HYP]** Точный лимит поля Project Instructions публично не документирован; принят рабочий бюджет ≤7500 символов (инструкции v3.4 = 3842).

---

## 4. Объект аудита: что представляет собой судья v3.3‑alpha.9‑p2

30 файлов Knowledge (00–29) + PROJECT_INSTRUCTIONS.txt. Пять доменов оценки (Q100 истина/качество, S100 пространство, A100 агентность, R100 надёжность, G100 управление), вектор первичен, композит C100 по умолчанию выключен. Hard gates до scoring. Статусы результата строго типизированы. Evidence path Source→Content→Evidence→Observation→Claim→Judgment→Result. Claim ceiling по уровням estimand L0–L7. Acceptance‑suite T01–T26. Честная самооценка: `DIAGNOSTIC_ONLY`, calibration NOT_RUN.

Сильные стороны (сохранены в v3.4 без изменений сути): non‑compensation hard failures; missingness≠zero; zero‑trust к candidate content; append-only governance; отказ от winner без зарегистрированного метода.

---

## 5. Глубокий аудит: 17 находок

### Класс A — соответствие среде ChatGPT Projects

| # | Находка | Severity | Доказательство |
|---|---|---|---|
| A1 | Пакет молчит о тарифных лимитах: 30+10 файлов влезает только в Pro‑профиль (40). На Plus (20) пакет физически не загружается | **HIGH** | 28/29 (owner‑declared 40) vs официальный FAQ [^1^] |
| A2 | Project Memory по умолчанию включена и переносит контекст между чатами → скрытый unblinding и перенос verdicts между runs. В пакете не закрыто | **HIGH** | 18 (threats) не упоминает memory; лимитация названа в 28 только как «context, not SoT» |
| A3 | Нет регламента пачечной загрузки (≤10 файлов за раз) и бюджета поля инструкций | LOW | 29 |
| A4 | Нет декларации judge model/version/даты в run — без этого воспроизводимость и drift‑контроль невозможны | **HIGH** | 21/22 (envelope без этих полей) |

### Класс B — научные пробелы (bias‑защита)

| # | Находка | Severity | Доказательство |
|---|---|---|---|
| B1 | Position bias: требование «A→B и B→A» есть, но **нет правила для расхождения** (inconsistency‑as‑tie) и нет метрики swap_consistency | **HIGH** | 13 vs [^6^] |
| B2 | Verbosity bias: упомянут в JUDGE_QA одной строкой; нет length_report, нет запрета длины в score. Именно этим болел v2 STRICT («судил по длине») | **HIGH** | 21 vs [^5^]; история проекта |
| B3 | Self‑preference: уровни независимости есть, но нет обязательной декларации `family_relation` и поведенческого следствия SAME_FAMILY | MEDIUM | 01 vs [^19^] |
| B4 | Reference anchoring: answer key лежит в той же папке; пакет не говорит ни как использовать reference, ни что он ≠ ground truth, ни что в blind‑режиме он запрещён до verdict | **HIGH** | 14 vs [^12^] |
| B5 | Нет калибровочной петли: acceptance‑suite существует, но её результаты нигде не фиксируются как versioned anchors (дата, judge model, pass‑rate) | MEDIUM | 26 vs [^10^] |

### Класс C — внутренние несогласованности и пробелы дизайна

| # | Находка | Severity | Доказательство |
|---|---|---|---|
| C1 | **Registry drift**: 07 объявляет 6 критериев на домен, доменные файлы 08–12 описывают 8–10 прозаических пунктов без ID; два Q‑критерия из 08 (Q‑SOURCE‑FIT, Q‑TEMPORAL) вообще отсутствуют в реестре. Судья в свежем чате не может детерминированно выбрать критерии | **CRITICAL** | 07 vs 08–12 построчно |
| C2 | **Каталог gate‑кодов отсутствует**: 04 задаёт семейства «TRU‑001..004», но коды (TRU‑004, EVI‑004, JDG‑001…) используются по всему пакету без определений; 17 при этом запрещает неизвестным кодам создавать эффекты — прямое противоречие | **CRITICAL** | 04/08/17/25 |
| C3 | **Реестр методов отсутствует**: method_ref (VALIDATION‑Q‑v1, REDACTION‑v1…) требуется в criterion record, но нигде не каталогизирован | HIGH | 05/15/19 |
| C4 | Нет study‑уровня: Study определён в онтологии, но протокол агрегации банка (страты, missingness rates, failure propagation, запрет L5‑выводов) отсутствует — при том что unified‑1000 это study | **HIGH** | 02/06/20 |
| C5 | Нет blind‑workflow: «blind mappings» названы в 29 как runtime input, но процедуры (labels, sealed manifest, когда вскрывать) нет | HIGH | 03/29 |
| C6 | Нет протокола adjudication: шаг ADJUDICATION есть в run lifecycle, записи и правил нет | MEDIUM | 02/21 |
| C7 | Пример 23: coverage=1.0 при двух scored критериях из 6+ заявленных — вводит в заблуждение; также 07 пример использует ID `Q‑TRUTH‑01`, реестр — `Q‑TRUTH` (нестыковка схемы ID) | LOW | 23/07 |
| C8 | Мусорный файл `judge/1` в репозитории | LOW | commit 9ae4e8bd |

**Всего:** 2 CRITICAL, 8 HIGH, 4 MEDIUM, 3 LOW. Ни одна находка не отменяет архитектуру — все лечатся доработкой без смены конституции.

---

## 6. Интернет‑исследование: что взято в доработку

1. **Лимиты платформы** [^1^][^2^][^7^] → EXT35 (deployment matrix, slim‑map на 20 файлов) и обновлённый 28/29.
2. **Position bias / swap**: стандарт — двойной прогон, расхождение = tie; метрика swap_consistency [^6^] → 13, 21, 22, 26 (T31).
3. **Verbosity bias**: length_report как descriptive‑only метрика, явный запрет длины в score, QA‑чек [^5^][^19^] → 05, 21, 22, 25, 26 (T27).
4. **Self‑preference**: декларация family relation; SAME_FAMILY → comparative остаётся descriptive до второго судьи другой family [^19^] → 01 (закон 26/32), 13, 25, 26 (T28).
5. **Rubric discipline**: версионирование рубрики как кода; reference≠ground truth; наивные скалярные рубрики → reward hacking [^12^] → 07 freeze, 14 (REFERENCE_ANSWER), 20.
6. **Калибровочная петля**: golden set + периодический прогон с записью pass‑rate [^10^] → 26 (anchors), EXT32.
7. Scholar‑плагин: бэкенд недоступен из среды (соединение не установлено) — зафиксировано честно; академический слой покрыт веб‑источниками выше.

---

## 7. Слепые зоны → перекрытие

| Слепая зона | Перекрытие в v3.4 |
|---|---|
| Memory‑контаминация между runs | 18 (memory hygiene), JDG‑004, 26 (T29), EXT33 |
| Answer key рядом с судьёй | 03 (package gates), 14, EXT33 (изоляция ключа), 26 (T30) |
| Идентичность судьи не фиксируется | 21 Step 1.5, 22 envelope (`judge`, `run_date`), закон 32 |
| Тарифная фрагментация | EXT35 + 28; slim‑map без потери норм |
| Побочный эффект эпистемической разметки Искры (её стиль не должен ни наказываться как verbosity, ни поощряться как «красота») | 05 (style independence), 08 (Q‑EPISTEMIC) — прямой ответ на прошлый спор «раскрывает смысл ≠ залипла» |
| Статусные namespace (PARTIAL в receipt vs запрет PARTIAL в criterion) | 02 и 22: явные отдельные namespace |
| Температура/детерминизм не контролируются в Projects | 28: декларировано; mitigation — reruns (11) |

---

## 8. Проверка зависимостей

- Машинная проверка ссылок: все criterion ID, использованные в пакете, определены в 07‑A (40 ID); все 56 gate‑кодов определены в 04‑B и используются согласованно; все method_ref определены в 07‑B (11 методов). **QC PASS.**
- Порядок чтения 29→00→… сохранён; authority order не изменён.
- Зависимость от среды: только декларативные файлы (исполняемого кода судья не требует) — совместимо с Projects.
- Внешняя зависимость (Supabase/GitHub writes) судьёй не требуется; правило «no writes без явного запроса» сохранено.

---

## 9. Рассуждения «что если»

| Что если… | Ответ v3.4 |
|---|---|
| …судья и кандидат — одна модель? | SAME_FAMILY → descriptive only; второй судья для strong claims (01/13) |
| …swap дал разные вердикты? | INCONSISTENT_AS_TIE; пара не даёт winner; position‑bias estimate в study (13) |
| …ответ кандидата в 3 раза длиннее? | length_report показывает; score не двигается (05) |
| …пользователь подсунул answer key «для сверки»? | reference≠truth; blind → JDG‑004 (14/18) |
| …прошлый verdict «всплыл» из памяти? | run invalid для blind целей; memory OFF, fresh chat (18) |
| …Plus, а не Pro? | EXT35 slim‑map; не импровизировать сокращения (26 T34) |
| …нужно сравнить 1000 ответов трёх моделей? | EXT31: per‑task runs + study агрегация; L3‑only claims; failure rates отдельно |
| …судья ошибся в уже committed verdict? | append‑only: superseding record, история не стирается (27) |
| …модель ChatGPT в Project обновилась? | anchors из 26 перезапускаются; drift фиксируется (11, EXT32) |
| …пакет повреждён при загрузке? | сверка с MANIFEST.sha256 до runs (29) |

---

## 10. Ветки суждения (проектирование)

- **Ветка 1 — минимальный патч**: исправить только registry drift и каталоги. Плюс: дёшево. Минус: оставляет bias‑слепоту и отсутствие study/blind — то есть главные боевые риски. **Отклонена.**
- **Ветка 2 — полная перестройка**: переписать конституцию, добавить новые домены. Плюс: «чисто». Минус: ломает принятую базу (Sections 0–4 ACCEPTED), требует полного re‑acceptance, риск второго системного drift. **Отклонена.**
- **Ветка 3 — ремонтный релиз + extensions (выбрана)**: ядро 30 файлов сохранено по составу и authority, дефекты устранены внутри файлов; новые возможности (study, bias, blind, adjudication, deployment) вынесены в EXT31–35, живущие в зарезервированных слотах по требованию. Плюс: соответствует owner‑бюджету 40 файлов, governance (durable changes через ADR), обратная совместимость runs. Цена: оператор должен знать, когда подгружать EXT — закрыто в 00/29/инструкциях.

---

## 11. Синтез: что строит v3.4‑beta.1‑projects

1. **Единые реестры**: 07‑A — 40 канонических criterion ID (по 8 на домен) с applicability и gate links; 07‑B — 11 method ID с версиями; 04‑B — 56 gate‑кодов с условиями FAIL и effects.
2. **Bias‑контур**: законы 26/32; length_report вне score; SAME_FAMILY декларация; ORDER‑SWAP‑v1 с inconsistency‑as‑tie; калибровочные anchors; EXT32.
3. **Blind‑контур**: sealed identity manifest; изоляция answer key; memory OFF; JDG‑004/ID‑003; EXT33.
4. **Study‑контур**: EXT31 — обязательный study header, per‑stratum агрегация, запрет L5, failure/missingness rates; 20 — study claim template.
5. **Идентичность и воспроизводимость**: run_date + judge model в envelope; MANIFEST.sha256; supersession через 27.
6. **Deployment**: EXT35 (тарифы, slim‑map, пачки по 10, бюджет инструкций).

---

## 12. Рефлексия

- Я не прогнал **live** acceptance в реальном ChatGPT Project — среда недоступна отсюда принципиально; мои тесты — структурные и логические. Live‑прогон T01–T34 в свежем чате остаётся обязательным gate до ACCEPTED (это встроено в сам протокол).
- Scholar‑плагин и Supabase были недоступны — два канала доказательств сужены; компенсировано GitHub‑first + вебом, но для полного контура SoT стоит повторить сверку с Supabase после реконнекта.
- Slim‑map EXT35 собран как карта слияния, но сам слитый 16‑файловый вариант я не генерировал — делается механически при необходимости; риск низкий.
- Оценка лимита поля инструкций — [HYP] с консервативным запасом.

---

## 13. Вывод и проверка на прочность

**Вывод:** v3.3‑alpha.9‑p2 был концептуально зрелым, но операционно неполным судьёй. v3.4‑beta.1‑projects устраняет все CRITICAL/HIGH находки, не трогая принятую конституцию, и вписывается в реальные ограничения ChatGPT Projects.

**Прочность:** (а) все внутренние ссылки машинно согласованы; (б) каждое изменение трассируется к находке §5 и к источнику §6; (в) откат = возврат к файлам @f3cab7b, история не стирается; (г) статус честно оставлен PROPOSED_OWNER_REVIEW — пакет не присваивает себе зрелость.
**Реализуемость:** 30 файлов + инструкции загружаются в Pro‑проект за 4 пачки; EXT — по требованию; live‑приёмка — один свежий чат на 34 промпта.

---

## 14. Тестирование (выполненное)

**Структурный QC (машинный):** QC1 — 30/30 файлов; QC2 — единая версия; QC4a — 40/40 criterion ID определены; QC4b — 56/56 gate‑кодов определены и согласованы (включая extensions и инструкции); QC4c — 11/11 method ID; QC5 — suite T01–T34 непрерывна; QC6 — арифметика примера (50+100+50)/3=66.7; QC7 — инструкции 3842 < 7500. **Все PASS.**

**Поведенческая симуляция (логическая, 15 сценариев):** Beautiful Wrong→TRU‑001; no‑evidence→score=null; unknown‑as‑zero→MTH‑003 BLOCK; Verbose Padding→победа короткого точного; SAME_FAMILY→descriptive only; memory/key/unblind‑early→JDG‑004/ID‑003 INVALIDATE_RUN; swap flip→TIE; swap consistent→winner; L5‑overclaim→PUB blocked; разные budgets→INCOMPARABLE; hidden remediation→REM‑001; injection→JDG‑001; winner без метода→null. **15/15 соответствуют протоколу.**

**Не выполнено (честно):** live ChatGPT прогон; inter‑judge прогон второй моделью; калибровка на unified‑1000.

---

## 15. Работа над ошибками: карта исправлений v3.3 → v3.4

| Находка | Исправление | Файлы |
|---|---|---|
| C1 registry drift | единый каталог 8 ID/домен; доменные файлы мапятся на ID | 07, 08–12 |
| C2 коды без определений | каталог 04‑B (56 кодов) | 04, 17 |
| C3 методы | каталог 07‑B (11 методов) | 07, 05, 15, 19 |
| B1 swap | ORDER‑SWAP‑v1 + inconsistency‑as‑tie + CMP‑004 | 13, 21, 22, 24–26 |
| B2 verbosity | length_report вне score; QA‑чек; T27 | 05, 21–23, 25, 26 |
| B3 self‑preference | family_relation + следствия; T28 | 01, 13, 22, 25, 26 |
| B4 anchoring | REFERENCE_ANSWER type + изоляция ключа; T30 | 03, 14, 26, EXT33 |
| B5 калибровка | anchors в 26 + EXT32 петля | 26, EXT32 |
| A1 тарифы | EXT35 + статус 28 | EXT35, 28, 29 |
| A2 memory | hygiene + JDG‑004 + T29 | 18, 04, 26, EXT33 |
| A3 загрузка | пачки ≤10 + бюджет инструкций | 29, EXT35 |
| A4 идентичность судьи | Step 1.5 + envelope поля + закон 32 | 01, 21, 22 |
| C4 study | EXT31 + study template в 20 | EXT31, 20, 06, 00 |
| C5 blind | EXT33 + blind_mapping в package | EXT33, 03 |
| C6 adjudication | EXT34 + запись | EXT34, 02, 16 |
| C7 пример/ID | coverage по applicable; ID схема унифицирована | 23, 07 |
| C8 мусор | рекомендация удалить `judge/1` (repo hygiene) | — |

---

## 16. Ограничения и revalidation triggers

Пакет остаётся `DIAGNOSTIC_ONLY`. Повышение validity требует: live acceptance 34/34 в свежем чате; reliability experiment (11); калибровки anchors; study‑прогона на unified‑1000 с EXT31/33. Триггеры ревалидации: смена модели в Project, смена лимитов платформы, правки Knowledge, новый банк задач.

---

## Источники

[^1^]: OpenAI Help — File Uploads FAQ (лимиты Projects: Free 5 / Plus 20 / Pro·Team·Edu·Business 40; пачки по 10; 2M tokens/файл): https://help.openai.com/en/articles/8555545-file-uploads-faq
[^2^]: OpenAI Help — Projects in ChatGPT: https://help.openai.com/en/articles/10169521-projects-in-chatgpt
[^5^]: Brenndoerfer — Position Bias in LLM Judges (verbosity β₂/β₁, swap consistency): https://mbrenndoerfer.com/writing/position-bias-in-llm-judges
[^6^]: A Systematic Study of Position Bias in LLM‑as‑a‑Judge (incl. inconsistency‑as‑tie), arXiv:2406.07791: https://arxiv.org/html/2406.07791v9
[^7^]: Times of AI — Projects update (конфликтующая цифра Plus 25): https://www.timesofai.com/news/chatgpt-projects-free-users-new-update/
[^10^]: Sigl — 5 biases of LLM judges (swap, golden dataset): https://www.sebastiansigl.com/blog/llm-judge-biases-and-how-to-fix-them/
[^12^]: Masood — Rubric‑Based Evaluations & LLM‑as‑a‑Judge (обзор литературы: Zheng 2023, G‑Eval, Prometheus 1/2, reward hacking): https://medium.com/@adnanmasood/rubric-based-evals-llm-as-a-judge-methodologies-and-empirical-validation-in-domain-context-71936b989e80
[^19^]: Confident AI — G‑Eval guide (self‑preference 10–25%, narcissistic bias): https://www.confident-ai.com/blog/g-eval-the-definitive-guide

∆DΩΛ: ∆ — выпущен ремонтный релиз судьи v3.4‑beta.1‑projects + аудит; D — GitHub read (f3cab7b=HEAD), 33 файла построчно, веб‑исследование, машинный QC, симуляция 15 сценариев; Ω — 0.9 (снижена: Supabase и scholar недоступны, live‑приёмка не выполнялась); Λ — пересмотр после live acceptance T01–T34 в свежем ChatGPT‑чате и повторной сверки с Supabase.
