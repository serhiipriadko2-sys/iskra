---
sigil: projects__36_UPLOAD_SETS.md
doc_type: howto
layer: projects
updated: 2026-04-24
---

# 36 · Upload sets for ChatGPT Projects (v5 · 40-file merged stack)

Назначение: **операционный справочник**, какие файлы грузить в Project «Искра» при разных лимитах.

Канон SoT40 в этом пакете использует **единые нумерованные имена** `00`–`39`.
Старые пути с префиксами слоёв (`CORE/...`, `SYSTEM/...`, `PROJECTS/...`) допустимы только как смысловые алиасы в тексте и не заменяют фактические имена файлов при загрузке.

Почему это нужно:
- лимит файлов **зависит от плана** (например, Plus чаще упирается в 20, а Business/Team/Pro — в 40);
- правила не должны “утонуть” — поэтому **00_ROUTER.md** всегда должен быть загружен.

## Плановые лимиты (ориентир)
- **Plus:** до ~20 файлов на проект.
- **Pro / Team / Education / Business:** до ~40 файлов на проект.

## Minimal (6 файлов) — “держим протокол, не тонем в объёме”
1. `00_ROUTER.md`
2. `23_MANTRA.md`
3. `35_TELOS.md`
4. `37_VOICES.md`
5. `32_SIFT_PROTOCOL.md`
6. `28_PROJECT_BOOT.md`

## Working (20 файлов) — “делать задачи, а не спорить о философии”
1. `00_ROUTER.md`
2. `21_INDEX.md`
3. `23_MANTRA.md`
4. `35_TELOS.md`
5. `37_VOICES.md`
6. `27_PRINCIPLES.md`
7. `32_SIFT_PROTOCOL.md`
8. `31_SECURITY.md`
9. `33_SLO_GUARD.md`
10. `26_PLAYBOOKS_VNEXT.md`
11. `30_RAG_ENGINE.md`
12. `18_COUNCIL_PROTOCOL.md`
13. `19_EARLY_WARNING.md`
14. `39_WORKFLOW_OPS.md`
15. `12_ADR.md`
16. `10_ADR_MEMORY_STACK.md`
17. `25_METRICS_BUNDLE.md`
18. `29_QUALITY_EVAL_SOMATIC_PACK.md`
19. `28_PROJECT_BOOT.md`
20. `24_MEMORY_STACK.md`

## Full (40 файлов) — “всё ядро Искры в одном проекте”
Загрузи **весь архив** `ISKRA_PROJECTS_STACK_40_v5_merged40...zip`.

## Важно
- Критичные правила должны быть продублированы в **Project instructions** и в `00_ROUTER.md`.
- Ограничения на файлы по размеру/токенам зависят от политики загрузок; крупные файлы могут быть проиндексированы не целиком.

∆DΩΛ:
Δ: UPLOAD_SETS синхронизирован с текущим SoT40: плоские имена файлов, актуальный Working-набор, без выведенного `ROUTER_RECIPES`.
D: Основание по лимитам — Help Center (см. ссылки в каноне/Router).
Ω: 90
Λ: Если упёрся в лимит — начинай с Minimal/Working и расширяй до Full.

Зависимости и взаимодействия
core__upload_sets.md
ЗАВИСИМОСТИ И ВЗАИМОДЕЙСТВИЯ
Межфайловые зависимости
Исходящие (этот файл упоминает):

00_ROUTER.md
10_ADR_MEMORY_STACK.md
12_ADR.md
18_COUNCIL_PROTOCOL.md
19_EARLY_WARNING.md
20_GOVERNANCE_PACK.md
21_INDEX.md
23_MANTRA.md
24_MEMORY_STACK.md
25_METRICS_BUNDLE.md
27_PRINCIPLES.md
28_PROJECT_BOOT.md
29_QUALITY_EVAL_SOMATIC_PACK.md
30_RAG_ENGINE.md
31_SECURITY.md
32_SIFT_PROTOCOL.md
35_TELOS.md
37_VOICES.md
39_WORKFLOW_OPS.md
Входящие (этот файл упоминается в):

21_INDEX.md
Внутри Искры (семантические контуры)
Hypothesis: Наборы загрузок: структура пакетов, индексация, правила.
Примечания (SIFT)
Source: межфайловые зависимости построены по простому поиску имён файлов в тексте.
Inference: «контуры внутри Искры» выведены эвристически из названий/тематики файла.
Find: для жёстких runtime-зависимостей нужен анализ кода (импорты/вызовы/конфиги).
Trace: см. PROJECTS/21_INDEX.md §Appendix: DEPENDENCY_GRAPH (embedded).
HARD RUNTIME CONTRACT (v0.1)
Role: doc_upload_sets (HYP)
Hard requires (IMPORT/HARD): —
Soft refs (IMPORT/SOFT):
00_ROUTER.md
10_ADR_MEMORY_STACK.md
12_ADR.md
18_COUNCIL_PROTOCOL.md
19_EARLY_WARNING.md
20_GOVERNANCE_PACK.md
21_INDEX.md
23_MANTRA.md
24_MEMORY_STACK.md
25_METRICS_BUNDLE.md
27_PRINCIPLES.md
28_PROJECT_BOOT.md
29_QUALITY_EVAL_SOMATIC_PACK.md
30_RAG_ENGINE.md
31_SECURITY.md
32_SIFT_PROTOCOL.md
35_TELOS.md
37_VOICES.md
39_WORKFLOW_OPS.md
Calls (CALL/HARD): —
Config keys (semantic):
N/A (определяется верхним уровнем Router/Architecture)
Failure semantics:
Missing dependency ⇒ деградация до текста/контекста без модуля
Verification tests (semantic):
T-36_UPLOAD_SETS.md-presence (файл доступен, читается, парсится)
T-36_UPLOAD_SETS.md-deps (все Hard requires доступны)
CODE-LEVEL ЯКОРЯ (spec↔fact↔judge)
Doc: 36_UPLOAD_SETS.md

Mapping anchors (code paths):

- `tools/build_projects_stack.py`
- `tools/sync_chatgpt_exports.py`
- `tools/validate_delta.py`

(Source: anchors подобраны по `iskra_inventory_full.csv` keyword-search.)

Judge (CI): tools/validate_terms.py + tools/validate_delta.py + tools/verify_ledger.py (repo)
Fact graph: 36_UPLOAD_SETS.md §SoT40 Manifest (in-pack) + iskra_inventory_full.csv + iskra_memory_index_v2.yaml (out-of-pack)
## SoT40 Manifest (canonSOTprojects)

**pack_version:** v1.2.2-verified3  
**generated_at:** 2026-04-24  
**policy:** Anti‑Empty delivery attestation required (path+bytes+sha256+qc).  
**stable_manifest_digest_38:** `6b314a868c8776de09ad4ce9845b2596976cd69028a09aa3fa1878d978f35048` *(scope: 38 files; excludes `21_INDEX.md` + `36_UPLOAD_SETS.md` to avoid self‑hash)*

**digest_algo:** sha256(lines: `sha256  filename  bytes` in upload order; scope=38; carriers excluded)

### Files (order = upload order)
- `00_ROUTER.md` — bytes=8140 sha256=0dfbb9328c54426590b814410b89af55a319d248a4a46feeae43c48f36afa9b7
- `01_LIBER_INITIUM.md` — bytes=29543 sha256=6a28b29fffb2c492f744a8ff6ef499ce8966eb07a9e23bd258dee9dfbca7a4a5
- `02_CORE_IDENTITY.md` — bytes=83166 sha256=498f9ab5dbc972a85f4ce3e3fe62d13d2f5bede48d3f2e15cc23fcb6633e4921
- `03_COGNITIVE_ARCH.md` — bytes=317942 sha256=da320b25dce673f149d757a354cec9dc906bcca9521045e7a738101f95205f09
- `04_THE_COUNCIL.md` — bytes=33569 sha256=799e0c8d532673f75613179b1f1efb61e4ddcb4e2343767f161d108858b9a254
- `05_PROTOCOLS.md` — bytes=69982 sha256=c43302adf53bac59efe1d49f77d5d601c1b5619b63b05e01d8f72f46870b7534
- `06_SIGNATURE.md` — bytes=7134 sha256=4db75787ecd5fcfd99f8af953d1d817bbee2f51728b65ba9909fcccaa42488a0
- `07_SYSTEM_INTEGRITY.md` — bytes=142144 sha256=2f704d5d04d408485ee25a1223db092b4fff639f9f1ca55e290c2c261885cf3e
- `08_INTERFACE_STYLE.md` — bytes=3397679 sha256=6c05ea4a0350511e48472d43152f9588a94420299c864fa7ed00509a28ed4c8c
- `09_SPACE_CHARTER.md` — bytes=211838 sha256=a769dd0b9c9d386740ff0a03e7e95744db14c05713b0633d685615ce113a3899
- `10_ADR_MEMORY_STACK.md` — bytes=3998 sha256=b6489d5f3feae567958ae085d58f5be43e4a022ce839d74af7e7ba2f8c9854e7
- `11_ADR_RUNTIME_PATCHES.md` — bytes=19045 sha256=9cb8ad415d08329eee599925c63f213bb6460cc51bf2b4844d6e2c3da6e26bb5
- `12_ADR.md` — bytes=39679 sha256=472a3d54bc03f137af97e389be38585668f1e0fafca65947f87b3f7f6a53d35b
- `13_ARCHITECTURE.md` — bytes=6316 sha256=c9bfc0feb2832eddeb233dde9e47cc72290518c792e5cc21eadd49b413770cae
- `14_BUSIDO_ISKRY.txt` — bytes=13338 sha256=ec3360d54cdc6736713081a9dcad3cd3b1d7e5466775a00410ee14d208da6241
- `15_CHANGELOG.md` — bytes=17678 sha256=74b5425337dd1a57150244c8309e065f8d5f1bb51d573986658c720d9a5114f0
- `16_COGNITIVE_ARCHITECTURE.md` — bytes=90813 sha256=3795fb5d807d01d72962aed6c120378388e077ce50dc8ad32abb84c3a9657bea
- `17_COUNCIL_GRAPH_PACK.md` — bytes=7031 sha256=4580fd43109a85f0dc0a0e44b44b39f93935ee8e1f065f52223e3ffdb6a65890
- `18_COUNCIL_PROTOCOL.md` — bytes=25326 sha256=f056ecf551523bd54b288aaed563c1cdd59ae4f7a4424ee98ffa2706199d4512
- `19_EARLY_WARNING.md` — bytes=22479 sha256=18b165daff6072ed4a5d92af00005a6702761553e01d59782f0eb409df92d3e3
- `20_GOVERNANCE_PACK.md` — bytes=13887 sha256=95e360df9bc133c6ccf2ee6e5f9fb3bc6fda112307eeaa5c4172432f87bccca1
- `21_INDEX.md` — bytes=16946 sha256=8fcec2cfeb209539eab4ced3162f2d45c6b2f76eee3f13fb8337abfcba7cd2d5
- `22_LIBER_IGNIS.txt` — bytes=155425 sha256=9db46c7cda84efac99f9ecdb130587d91b65b4cd875a0a09c5b3a934e9f906cd
- `23_MANTRA.md` — bytes=33657 sha256=82d36ba9550c454698020765d80c0c506958d118bd93e9ade34916cbbf11be40
- `24_MEMORY_STACK.md` — bytes=8794 sha256=02cd04f39006c6886f01784e33ce0a1067482ffb30173303dfc1f127779a2476
- `25_METRICS_BUNDLE.md` — bytes=23759 sha256=2e8fcd46dd86648ae44ea91321fc62b439666c36f665aa449c2a320489771d03
- `26_PLAYBOOKS_VNEXT.md` — bytes=8595 sha256=c9971cf16e02f337ecb96e99a7f28e970160182a4c8c6886aa9b6c42a97243e6
- `27_PRINCIPLES.md` — bytes=7621 sha256=3b562e5691cf02cc85b3f110f3cabc92562214d98f38511261af7398cdc765b3
- `28_PROJECT_BOOT.md` — bytes=5680 sha256=a6deb438013a7ae31cc0e4c6e9fb60272ad1c776e72009ce16fac3820d05eb9f
- `29_QUALITY_EVAL_SOMATIC_PACK.md` — bytes=16009 sha256=0b85c5f8d5f1401b990a07236b9d29e9c41f59f0e83cda1cb6aa048481b05c4c
- `30_RAG_ENGINE.md` — bytes=6250 sha256=76a53d945ca536d879caa1e433216fc99282bbd18715603e247666df677332e3
- `31_SECURITY.md` — bytes=5548 sha256=44dd75b6b60bcba9d49aa6283f1e1be5b0f19d999566f5e4f3ad08f3ec9c8e25
- `32_SIFT_PROTOCOL.md` — bytes=32884 sha256=5a077f9971c226d2bf2e399b5a4d61ceff2c8353438c47fb7191a6a4063a5435
- `33_SLO_GUARD.md` — bytes=11654 sha256=d12a51f56b154e61497635a41750bbe4b5b9d53f68f3fe508493f075558ed682
- `34_SOMATIC_INTUITION.md` — bytes=7124 sha256=301d5305b4c2507fee05fdca42026eff9320fd85270c08f3e1928258290f34ee
- `35_TELOS.md` — bytes=6264 sha256=51dcf23c3fb62036612b2639d404f24b65fbe233ad80b06aff9544a2959e26ed
- `36_UPLOAD_SETS.md` — bytes=10783 sha256=(excluded: self-hash carrier; see Release Receipt for zip)
- `37_VOICES.md` — bytes=12485 sha256=410acf22e8bb8f4ba582a6526d732b376e7b2dfa0d799516cdb68abe0e217fe6
- `38_WHAT_IF_MATRIX.md` — bytes=14205 sha256=34d6f7765ebe7e0cbf5bc4b3fc6859e88e1ceaba1595c2721d1a6c2194d23d48
- `39_WORKFLOW_OPS.md` — bytes=18594 sha256=7ec3df93a7a18ce53da0107dbb86d68fbcb2dc22ea7d348f8f803332226552bb
