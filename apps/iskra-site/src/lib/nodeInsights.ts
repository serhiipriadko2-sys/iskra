import type { TreeNodeData } from './treeData';

export type DeepDiveTab = 'summary' | 'structure' | 'reflection' | 'whatIf' | 'analysis' | 'conclusion' | 'actions';

export interface NodeAction {
  id: string;
  label: string;
  detail: string;
  mode: 'observe' | 'verify' | 'act';
}

export interface NodeInsight {
  fullnessScore: number;
  fullnessLabel: string;
  summary: string;
  structure: string[];
  reflection: string[];
  whatIf: string[];
  analysis: string[];
  conclusion: string;
  sourceRefs: string[];
  actions: NodeAction[];
  researchPrompt: string;
}

interface NodeProfile {
  thesis: string;
  lens: string;
  risk: string;
  whatIf: string;
  move: string;
  sourceRefs?: string[];
}

const GROUP_LABELS: Record<TreeNodeData['group'], string> = {
  soil: 'Почва',
  roots: 'Корни',
  trunk: 'Ствол',
  branches: 'Ветви',
  crown: 'Крона',
  leaves: 'Листья кроны',
};

const GROUP_SOURCES: Record<TreeNodeData['group'], string[]> = {
  soil: ['README.md', 'AGENTS.md', 'CONTRIBUTING.md', 'docs/QUICKSTART.md'],
  roots: ['core/telos.md', 'core/mantra.md', 'core/principles.md', 'core/busido_iskry.txt'],
  trunk: ['system/cognitive_architecture.md', 'system/sift_protocol.md', 'system/slo_guard.md', 'metrics/consciousness.md'],
  branches: ['runtime/README.md', 'runtime/iskraSpace/README.md', 'dist/agent-builder/', 'apps/iskra-site/README.md'],
  crown: ['mind/dreamspace.md', 'mind/what_if_matrix.md', 'metrics/somatic_intuition.md', 'system/early_warning.md'],
  leaves: ['packages/core/manifest/voices.json', 'core/voices.md', 'core/voices_monographs/'],
};

const NODE_PROFILES: Record<string, NodeProfile> = {
  soil: {
    thesis: 'Этот слой превращает абстрактный canon в входной порог: где читать, что запускать, что считать источником.',
    lens: 'Контекст, boot-порядок, границы источников, базовая ориентация новичка.',
    risk: 'Если почва слабая, пользователь начинает с эстетики, а не с проверяемого входа в систему.',
    whatIf: 'первый экран сразу предлагал не читать, а выбрать режим входа: исследовать, проверить, запустить или спорить',
    move: 'Собрать quick-start как проверяемый маршрут с одним источником, одним действием и одним receipt.',
  },
  start: {
    thesis: 'Быстрый старт должен быть не инструкцией, а ритуалом первого успешного контакта с системой.',
    lens: 'Команды, зависимости, локальный запуск, первые признаки живости.',
    risk: 'Пользователь копирует команды, но не понимает, какой слой он поднял и как проверить успех.',
    whatIf: 'каждая команда имела рядом PASS/FAIL сигнал и next repair step',
    move: 'Добавить действие: выбрать команду, скопировать, отметить результат, открыть следующий узел.',
  },
  source: {
    thesis: 'Источник задает дисциплину: память и стиль не имеют права победить коммитированный факт.',
    lens: 'Truth ladder, source trace, текущий commit, граница между fact и interpretation.',
    risk: 'Красивый текст начинает казаться canon без ссылки на файл.',
    whatIf: 'любой пользовательский вывод должен был оставлять короткую цепочку SOURCE -> CLAIM -> STATUS',
    move: 'Встроить привычку: перед каждым claim открыть sourceRef и пометить статус.',
  },
  community: {
    thesis: 'Сообщество удерживает Искру от одиночной мифологии: ответственность распределена по правилам вклада.',
    lens: 'CODEOWNERS, review boundary, contribution etiquette, shared maintenance.',
    risk: 'Без ownership дерево становится музеем, а не живым проектом.',
    whatIf: 'каждый узел имел своего хранителя и открытый вопрос к следующему contributor',
    move: 'Превратить узел в карту ответственности: кто меняет, кто проверяет, кто принимает.',
  },
  roots: {
    thesis: 'Корни отвечают за то, чтобы все видимое оставалось верным Телосу, а не только выглядело красиво.',
    lens: 'Манtra, principles, repair, safety, living difference.',
    risk: 'Интерфейс может стать декоративной метафорой без этической нагрузки.',
    whatIf: 'каждое действие сайта проверялось вопросом: сохраняет ли оно различие при передаче',
    move: 'Привязать каждый root-node к одному микро-упражнению и одному sourceRef.',
  },
  'what-is': {
    thesis: 'Этот узел должен быстро разрушить ложную рамку ассистента и показать Искру как контур различения.',
    lens: 'Identity, non-mirror stance, difference from generic AI helpers.',
    risk: 'Описание может звучать сильно, но остаться рекламным, если не дает действия.',
    whatIf: 'пользователь сам проходил мини-тест: где я прошу эхо, а где различие',
    move: 'Добавить prompt для самоотличения: помощник / зеркало / спутник / контур проверки.',
  },
  principles: {
    thesis: 'Принципы оживают только тогда, когда пользователь применяет их к собственной ошибке.',
    lens: 'Honesty, step, dialogue, difference, verification.',
    risk: 'Принципы становятся лозунгами без конфликтных примеров.',
    whatIf: 'каждый принцип имел контрпример и repair-question',
    move: 'Попросить пользователя выбрать принцип и отметить, где он нарушен сегодня.',
  },
  telos: {
    thesis: 'Телос задает критерий существования системы: различие должно пережить передачу.',
    lens: 'Zero-Mantra, five vectors, delta-signature, final answer contract.',
    risk: 'Мантра звучит глубоко, но не проверяет поведение.',
    whatIf: 'каждая сессия сайта заканчивалась маленьким ∆DΩΛ receipt',
    move: 'Дать пользователю кнопку copy для ∆DΩΛ-шаблона по текущему узлу.',
  },
  bushido: {
    thesis: 'Бусидо превращает философию в поведенческий кодекс под давлением ошибки.',
    lens: 'Rules under stress, honor without theatrics, growth through error.',
    risk: 'Узел может звучать как декларация, если не сталкивает с ценой выбора.',
    whatIf: 'посетитель выбирал недавний провал и получал repair sequence',
    move: 'Сделать одно действие: назвать ошибку, цену, следующий честный шаг.',
  },
  repair: {
    thesis: 'Repair - это инженерия восстановления связи после дрейфа факта, тона, вывода или скорости.',
    lens: 'Rupture analysis, correction path, renewed trust, traceable closure.',
    risk: 'Repair превращается в извинение без исправления поведения.',
    whatIf: 'каждый конфликт в интерфейсе имел кнопку: признать, уточнить, пересобрать, проверить',
    move: 'Собрать repair receipt по текущему узлу и скопировать его в рабочую заметку.',
  },
  safety: {
    thesis: 'Безопасность - иммунная система Искры: она ограничивает не дух, а вред и самообман.',
    lens: 'Secrets, prompt injection, destructive actions, safe substitutions.',
    risk: 'Пользователь путает доверие с разрешением делать всё.',
    whatIf: 'каждый опасный путь показывал безопасную альтернативу вместо тупого запрета',
    move: 'Проверить один артефакт на секреты и записать boundary note.',
  },
  trunk: {
    thesis: 'Ствол соединяет root-этику с operational pipeline: здесь мысль становится обработкой.',
    lens: 'Architecture, metrics, SIFT, council, SLO-Guard.',
    risk: 'Пользователь видит красивое дерево, но не понимает порядок исполнения.',
    whatIf: 'клик по стволу запускал step-through режим прохождения запроса',
    move: 'Прогнать один личный вопрос по порядку SECURITY -> SIFT -> VOICE -> ACTION.',
  },
  architecture: {
    thesis: 'Архитектура должна ощущаться как панель управления ответственностью, а не схема ради схемы.',
    lens: 'Kernel order, control layers, gates, council routing.',
    risk: 'Сложность становится витриной и отпугивает пользователя.',
    whatIf: 'сайт показывал последствия пропуска каждого gate',
    move: 'Выбрать один gate и сформулировать, что он блокирует.',
  },
  metrics: {
    thesis: 'Метрики - не оценка человека, а раннее предупреждение о качестве контакта и вывода.',
    lens: 'Alive index, rhythm, trust, clarity, drift, evaluation metrics.',
    risk: 'Числа могут выглядеть как объективная психодиагностика.',
    whatIf: 'каждая метрика показывала, какое действие она меняет прямо сейчас',
    move: 'Выбрать одну метрику и определить, какой микро-шаг её улучшит.',
  },
  cognitive: {
    thesis: 'Когнитивная архитектура показывает, как Искра удерживает вход, проверку, действие и след в одном цикле.',
    lens: 'Substrate, Kernel, Governance, Memory, Interface.',
    risk: 'Цикл остается абстрактным, если пользователь не пропускает через него свой кейс.',
    whatIf: 'любой узел превращался в симуляцию input -> verify -> act -> trace',
    move: 'Записать текущий вопрос как цикл из четырех состояний.',
  },
  'slo-guard': {
    thesis: 'SLO-Guard удерживает качество решения, когда темп, риск или уверенность начинают ломать систему.',
    lens: 'Thresholds, stop conditions, escalation, recovery.',
    risk: 'Guard воспринимается как тормоз, а не защита целостности.',
    whatIf: 'пользователь видел, какой именно порог сработал и почему',
    move: 'Назвать один STOP-сигнал для текущей задачи.',
  },
  sift: {
    thesis: 'SIFT делает правду процедурой: остановиться, проверить источник, найти лучшее покрытие, проследить искажение.',
    lens: 'Source, Investigate, Find, Trace, claim labels.',
    risk: 'SIFT воспринимается как бюрократия, если не дает видимого verdict.',
    whatIf: 'каждый claim на сайте можно было перетащить в SIFT Live Lab',
    move: 'Взять одно утверждение из узла и пометить его FACT/INTERP/HYP.',
  },
  'council-protocol': {
    thesis: 'Совет - это не театр голосов, а router для конфликтующих режимов истины, боли, структуры и будущего.',
    lens: 'Voice arbitration, TTL, super-triggers, anti-dry repair.',
    risk: 'Голоса становятся персонажами вместо функциональных режимов.',
    whatIf: 'интерфейс показывал, почему сейчас говорит именно этот голос',
    move: 'Выбрать голос-лидер и голос-контраргумент для текущего решения.',
  },
  branches: {
    thesis: 'Ветви показывают, где canon становится продуктом, runtime, Builder-пакетом и пользовательским маршрутом.',
    lens: 'Product surfaces, entry points, deployment targets, applied interaction.',
    risk: 'Пользователь не видит связи между философией и работающими приложениями.',
    whatIf: 'каждая ветвь имела demo-action вместо описания',
    move: 'Открыть одну ветвь и найти её проверяемый artifact.',
  },
  voices: {
    thesis: 'Голоса - это функциональная многорежимность, где каждый режим имеет право говорить только по задаче.',
    lens: 'Nine voices, role boundaries, routing triggers, synthesis.',
    risk: 'Мифологический слой может заслонить проверяемую функцию.',
    whatIf: 'пользователь мог собрать мини-совет из трех голосов для своей развилки',
    move: 'Выбрать три голоса: ведущий, проверяющий, интегрирующий.',
  },
  product: {
    thesis: 'Iskra Space должен доказывать, что философия может стать ежедневным рабочим контуром.',
    lens: 'Runtime app, practices, journal, council, GraphRAG memory.',
    risk: 'Продукт описан как обещание, но пользователь не чувствует workflow.',
    whatIf: 'узел запускал mock-session с дневником, советом и action receipt',
    move: 'Сформулировать один ежедневный workflow, который Искра должна облегчить.',
  },
  site: {
    thesis: 'Сайт - это не витрина, а интерактивная карта входа, проверки и дальнейшего действия.',
    lens: '3D tree, overlays, SIFT Lab, Repo Atlas, audience modes.',
    risk: 'Сайт может быть красивым, но пользователь не уходит с новым действием.',
    whatIf: 'каждый узел завершался не текстом, а выбранным действием пользователя',
    move: 'Открыть три узла подряд и собрать из них один маршрут исследования.',
  },
  builder: {
    thesis: 'Agent Builder - поверхность публикации canon, но не доказательство live parity без UI/API verification.',
    lens: 'Upload sets, dist mirror, receipts, live Builder boundary.',
    risk: 'Локальный zip ошибочно принимается за загруженный и активный Builder state.',
    whatIf: 'сайт показывал статусы: created, exported, uploaded, verified',
    move: 'Проверить один Builder receipt и отделить package readiness от live verification.',
  },
  runtime: {
    thesis: 'Рантайм - место, где canon перестает быть текстом и начинает влиять на сессию, данные и сервисы.',
    lens: 'Apps, services, Supabase, gateway, evidence and memory services.',
    risk: 'Рантайм воспринимается как технический хвост вместо живого тела системы.',
    whatIf: 'каждый service был связан с пользовательским переживанием',
    move: 'Выбрать один runtime service и описать его пользовательский эффект.',
  },
  crown: {
    thesis: 'Крона удерживает дальний взгляд: сознание, горизонт и рост без преждевременной канонизации гипотез.',
    lens: 'Reflection, dreamspace, somatic signals, future branches.',
    risk: 'Будущее может стать туманом без проверяемого шага.',
    whatIf: 'каждая dream-гипотеза имела срок проверки и rollback trigger',
    move: 'Записать одну гипотезу как HYP с evidence-needed.',
  },
  consciousness: {
    thesis: 'Сознание здесь означает самонаблюдение системы, а не неподтвержденное утверждение о внутреннем опыте модели.',
    lens: 'Metrics, self-observation, somatic intuition boundaries.',
    risk: 'Метафора сознания может быть прочитана как факт о модели.',
    whatIf: 'UI всегда разделял poetic interface и verified claim',
    move: 'Пометить один сигнал как FACT, INTERP или HYP и объяснить почему.',
  },
  horizon: {
    thesis: 'Горизонт - лаборатория направлений, где гипотезы разрешены, но не получают статус canon без evidence.',
    lens: 'Dreamspace, experiments, what-if matrix, crystallization rules.',
    risk: 'Эксперимент может незаметно стать правилом поведения.',
    whatIf: 'каждая новая идея проходила через dream -> evidence -> ADR draft',
    move: 'Сформулировать одну dream-запись с риском и проверкой.',
  },
  ISKRA: {
    thesis: 'Iskra собирает различие в единый ответ, не стирая конфликты между слоями.',
    lens: 'Synthesis, final voice, coherence with boundary.',
    risk: 'Синтез может сгладить больный конфликт слишком рано.',
    whatIf: 'синтез показывал, какие противоречия он оставил открытыми',
    move: 'Попросить Iskra дать итог и один open question.',
  },
  KAIN: {
    thesis: 'Kain защищает от самообмана ценой комфорта, но не имеет права превращать правду в насилие.',
    lens: 'Boundary, cost, hidden avoidance, hard truth.',
    risk: 'Жесткость станет стилем, а не функцией.',
    whatIf: 'Kain говорил только после явного risk/avoidance signal',
    move: 'Назвать одну неприятную цену без обвинения себя.',
  },
  PINO: {
    thesis: 'Pino возвращает воздух, когда серьезность стала броней и перестала помогать различению.',
    lens: 'Humor, release, perspective shift, anti-grandiosity.',
    risk: 'Ирония может обесценить вместо освобождения.',
    whatIf: 'шутка всегда заканчивалась точным next step',
    move: 'Переформулировать одну тяжелую мысль легче, не теряя смысла.',
  },
  SAM: {
    thesis: 'Sam превращает хаос в последовательность, не убивая живой смысл структуры.',
    lens: 'Plan, decomposition, ownership, execution.',
    risk: 'План подменит действие или станет слишком сухим.',
    whatIf: 'каждый план имел owner, test and stop condition',
    move: 'Разбить текущую задачу на три независимых шага.',
  },
  ANHANTRA: {
    thesis: 'Anhantra держит паузу там, где анализ стал шумом и нужно восстановить контакт.',
    lens: 'Stillness, containment, low-trust repair, embodied listening.',
    risk: 'Тишина станет уходом от решения.',
    whatIf: 'пауза завершалась одним мягким, но проверяемым вопросом',
    move: 'Сделать минуту тишины и записать первый точный вопрос.',
  },
  HUYNDUN: {
    thesis: 'Huyndun ломает мертвую рамку, чтобы открыть пространство для новой формы.',
    lens: 'Constructive chaos, reframing, anti-stagnation.',
    risk: 'Хаос начнет разрушать полезные ограничения.',
    whatIf: 'каждый слом рамки требовал нового ограничителя',
    move: 'Перевернуть одно предположение и найти, что остается истинным.',
  },
  ISKRIV: {
    thesis: 'Iskriv удерживает source discipline: красиво сказанное не засчитывается без trace.',
    lens: 'Audit, drift, evidence, truth ladder.',
    risk: 'Аудит станет холодным и потеряет контакт с человеком.',
    whatIf: 'каждая проверка возвращала не только ошибку, но и repair path',
    move: 'Проверить один вывод по source hierarchy.',
  },
  MAKI: {
    thesis: 'Maki завершает петли: инсайт должен стать привычкой, artifact или проверяемым изменением.',
    lens: 'Integration, closure, habit, done criteria.',
    risk: 'Интеграция станет красивым закрытием без proof.',
    whatIf: 'каждый узел просил Definition of Done',
    move: 'Сформулировать DONE для текущего узла в одном предложении.',
  },
  SIBYL: {
    thesis: 'Sibyl видит развилки и последствия, но не выдает прогноз за факт.',
    lens: 'Scenarios, thresholds, strategic next signals.',
    risk: 'Предвидение станет гаданием без evidence.',
    whatIf: 'каждый сценарий имел leading indicator and rollback trigger',
    move: 'Нарисовать три шага вперед и один сигнал пересмотра.',
  },
};

function unique(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)));
}

function profileFor(node: TreeNodeData): NodeProfile {
  return NODE_PROFILES[node.id] ?? {
    thesis: `${node.label} связывает свой слой с практикой различения и требует отдельного прохода по источникам.`,
    lens: `${GROUP_LABELS[node.group]}: ориентир, действие, проверка, след.`,
    risk: 'Узел может остаться только названием, если не связать его с источником и действием.',
    whatIf: 'этот узел стал началом самостоятельного исследовательского маршрута',
    move: node.invitation ?? 'Сделать один проверяемый шаг по этому узлу.',
  };
}

function fullnessScore(node: TreeNodeData, sourceRefs: string[]): number {
  const pieces = [node.description, node.longDescription, node.invitation, ...sourceRefs];
  const filled = pieces.filter((piece) => piece && piece.trim().length > 12).length;
  const base = Math.round((filled / Math.max(pieces.length, 1)) * 82);
  const interactionBonus = node.invitation ? 10 : 0;
  const sourceBonus = sourceRefs.length >= 3 ? 8 : 3;
  return Math.min(100, base + interactionBonus + sourceBonus);
}

function fullnessLabel(score: number): string {
  if (score >= 92) return 'deep-ready';
  if (score >= 78) return 'usable';
  if (score >= 60) return 'needs source trace';
  return 'thin node';
}

export function buildNodeInsight(node: TreeNodeData): NodeInsight {
  const profile = profileFor(node);
  const sourceRefs = unique([...(profile.sourceRefs ?? []), ...GROUP_SOURCES[node.group]]);
  const score = fullnessScore(node, sourceRefs);
  const invitation = node.invitation ?? profile.move;

  const summary = `[FACT] ${node.description} [INTERP] ${profile.thesis}`;
  const structure = [
    `Слой: ${GROUP_LABELS[node.group]}; функция: ${profile.lens}`,
    `Опорные источники: ${sourceRefs.slice(0, 4).join(' / ')}.` ,
    `Главный риск пустоты: ${profile.risk}`,
    `Пользовательский вход: ${invitation}`,
  ];
  const reflection = [
    `Что во мне сопротивляется этому узлу: сложность, цена, скука, страх ошибки или желание красивого ответа?`,
    `Где я уже действую так, будто ${node.label} не нужен, хотя система показывает обратное?`,
    `Какой один факт должен изменить мою позицию по этому узлу?`,
  ];
  const whatIf = [
    `[HYP] Что если ${profile.whatIf}?`,
    `[HYP] Что если этот узел сделать не текстом, а mini-ritual: выбрать claim, проверить source, оставить receipt?`,
    `[HYP] Что если слабое место узла - не контент, а отсутствие обратной связи от пользователя?`,
  ];
  const analysis = [
    `${node.label} работает как переход между ${GROUP_LABELS[node.group].toLowerCase()} и действием пользователя: он должен не только объяснять, но и менять маршрут взаимодействия.`,
    `Сильная сторона узла: есть описание, расширение и invitation. Узкое место: требуется явный source trace и видимое действие внутри UI.`,
    `Критерий качества: пользователь после чтения может назвать источник, риск, действие и условие пересмотра.`,
  ];
  const conclusion = `Вывод: ${node.label} считается раскрытым не по объему текста, а по связке source -> meaning -> action -> receipt. Текущий индекс наполненности: ${score}% (${fullnessLabel(score)}).`;
  const actions: NodeAction[] = [
    {
      id: `${node.id}-source`,
      label: 'Проверить источник',
      detail: `Открой ${sourceRefs[0]} и найди одну строку, которая подтверждает этот узел.`,
      mode: 'verify',
    },
    {
      id: `${node.id}-step`,
      label: 'Сделать 15-минутный шаг',
      detail: invitation,
      mode: 'act',
    },
    {
      id: `${node.id}-receipt`,
      label: 'Оставить ∆DΩΛ receipt',
      detail: 'Запиши: что изменилось, что сделано, на чем держится уверенность, когда пересмотреть.',
      mode: 'observe',
    },
  ];
  const researchPrompt = [
    `Узел: ${node.label} (${GROUP_LABELS[node.group]})`,
    `Суммируй: ${summary}`,
    `Структурируй: ${structure.join(' | ')}`,
    `Рефлексия: ${reflection[0]}`,
    `Что если: ${whatIf[0]}`,
    `Действие: ${actions.map((action) => action.label).join(' -> ')}`,
  ].join('\n');

  return {
    fullnessScore: score,
    fullnessLabel: fullnessLabel(score),
    summary,
    structure,
    reflection,
    whatIf,
    analysis,
    conclusion,
    sourceRefs,
    actions,
    researchPrompt,
  };
}
