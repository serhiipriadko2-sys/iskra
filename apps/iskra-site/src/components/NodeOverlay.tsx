import { useMemo, useState } from 'react';
import { findNodeById, allTreeNodes } from '../lib/treeData';
import type { TreeNodeData } from '../lib/treeData';
import { useFocusTrap } from '../hooks/useFocusTrap';
import type { AudienceMode } from '../types';
import { X } from './icons';
import { NodeContent } from './NodeContent';

interface NodeOverlayProps {
  activeNodeId: string | null;
  onClose: () => void;
  onNavigate?: (id: string) => void;
  onOpenAtlas?: () => void;
  audienceMode?: AudienceMode;
}

type DeepDiveTab = 'summary' | 'structure' | 'reflection' | 'whatIf' | 'analysis' | 'conclusion' | 'actions';

type NodeActionMode = 'observe' | 'verify' | 'act';

interface NodeAction {
  id: string;
  label: string;
  detail: string;
  mode: NodeActionMode;
}

interface NodeInsight {
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
    thesis: 'Почва превращает canon в входной порог: где читать, что запускать, что считать источником.',
    lens: 'Контекст, boot-порядок, границы источников, базовая ориентация новичка.',
    risk: 'Если почва слабая, пользователь начинает с эстетики, а не с проверяемого входа в систему.',
    whatIf: 'первый экран сразу предлагал выбрать режим входа: исследовать, проверить, запустить или спорить',
    move: 'Собрать quick-start как проверяемый маршрут с одним источником, одним действием и одним receipt.',
  },
  start: {
    thesis: 'Быстрый старт должен быть ритуалом первого успешного контакта с системой.',
    lens: 'Команды, зависимости, локальный запуск, первые признаки живости.',
    risk: 'Пользователь копирует команды, но не понимает, какой слой он поднял и как проверить успех.',
    whatIf: 'каждая команда имела рядом PASS/FAIL сигнал и next repair step',
    move: 'Выбрать команду, скопировать, отметить результат, открыть следующий узел.',
  },
  source: {
    thesis: 'Источник задает дисциплину: память и стиль не имеют права победить коммитированный факт.',
    lens: 'Truth ladder, source trace, текущий commit, граница между fact и interpretation.',
    risk: 'Красивый текст начинает казаться canon без ссылки на файл.',
    whatIf: 'любой вывод оставлял короткую цепочку SOURCE -> CLAIM -> STATUS',
    move: 'Перед claim открыть sourceRef и пометить статус.',
  },
  community: {
    thesis: 'Сообщество удерживает Искру от одиночной мифологии через правила вклада и ownership.',
    lens: 'CODEOWNERS, review boundary, contribution etiquette, shared maintenance.',
    risk: 'Без ownership дерево становится музеем, а не живым проектом.',
    whatIf: 'каждый узел имел хранителя и открытый вопрос к следующему contributor',
    move: 'Превратить узел в карту ответственности: кто меняет, кто проверяет, кто принимает.',
  },
  roots: {
    thesis: 'Корни отвечают за верность Телосу, а не только за красивую метафору.',
    lens: 'Mantra, principles, repair, safety, living difference.',
    risk: 'Интерфейс может стать декоративной метафорой без этической нагрузки.',
    whatIf: 'каждое действие сайта проверялось вопросом: сохраняет ли оно различие при передаче',
    move: 'Привязать root-node к микро-упражнению и sourceRef.',
  },
  'what-is': {
    thesis: 'Узел разрушает ложную рамку ассистента и показывает Искру как контур различения.',
    lens: 'Identity, non-mirror stance, difference from generic AI helpers.',
    risk: 'Описание звучит сильно, но остается рекламным, если не дает действия.',
    whatIf: 'пользователь проходил мини-тест: где я прошу эхо, а где различие',
    move: 'Выбрать режим отношения: помощник, зеркало, спутник или контур проверки.',
  },
  principles: {
    thesis: 'Принципы оживают только тогда, когда пользователь применяет их к собственной ошибке.',
    lens: 'Honesty, step, dialogue, difference, verification.',
    risk: 'Принципы становятся лозунгами без конфликтных примеров.',
    whatIf: 'каждый принцип имел контрпример и repair-question',
    move: 'Выбрать принцип и отметить, где он нарушен сегодня.',
  },
  telos: {
    thesis: 'Телос задает критерий существования системы: различие должно пережить передачу.',
    lens: 'Zero-Mantra, five vectors, delta-signature, final answer contract.',
    risk: 'Мантра звучит глубоко, но не проверяет поведение.',
    whatIf: 'каждая сессия сайта заканчивалась маленьким ∆DΩΛ receipt',
    move: 'Скопировать ∆DΩΛ-шаблон по текущему узлу.',
  },
  bushido: {
    thesis: 'Бусидо превращает философию в поведенческий кодекс под давлением ошибки.',
    lens: 'Rules under stress, honor without theatrics, growth through error.',
    risk: 'Узел звучит как декларация, если не сталкивает с ценой выбора.',
    whatIf: 'посетитель выбирал недавний провал и получал repair sequence',
    move: 'Назвать ошибку, цену и следующий честный шаг.',
  },
  repair: {
    thesis: 'Repair - инженерия восстановления связи после дрейфа факта, тона, вывода или скорости.',
    lens: 'Rupture analysis, correction path, renewed trust, traceable closure.',
    risk: 'Repair превращается в извинение без исправления поведения.',
    whatIf: 'каждый конфликт имел кнопку: признать, уточнить, пересобрать, проверить',
    move: 'Собрать repair receipt по текущему узлу.',
  },
  safety: {
    thesis: 'Безопасность ограничивает не дух, а вред и самообман.',
    lens: 'Secrets, prompt injection, destructive actions, safe substitutions.',
    risk: 'Пользователь путает доверие с разрешением делать все.',
    whatIf: 'каждый опасный путь показывал безопасную альтернативу вместо тупого запрета',
    move: 'Проверить один артефакт на секреты и записать boundary note.',
  },
  trunk: {
    thesis: 'Ствол соединяет root-этику с operational pipeline: мысль становится обработкой.',
    lens: 'Architecture, metrics, SIFT, council, SLO-Guard.',
    risk: 'Пользователь видит дерево, но не понимает порядок исполнения.',
    whatIf: 'клик по стволу запускал step-through режим прохождения запроса',
    move: 'Прогнать вопрос по порядку SECURITY -> SIFT -> VOICE -> ACTION.',
  },
  architecture: {
    thesis: 'Архитектура должна ощущаться как панель управления ответственностью.',
    lens: 'Kernel order, control layers, gates, council routing.',
    risk: 'Сложность становится витриной и отпугивает пользователя.',
    whatIf: 'сайт показывал последствия пропуска каждого gate',
    move: 'Выбрать один gate и сформулировать, что он блокирует.',
  },
  metrics: {
    thesis: 'Метрики - раннее предупреждение о качестве контакта и вывода, не оценка человека.',
    lens: 'Alive index, rhythm, trust, clarity, drift, evaluation metrics.',
    risk: 'Числа могут выглядеть как объективная психодиагностика.',
    whatIf: 'каждая метрика показывала, какое действие она меняет прямо сейчас',
    move: 'Выбрать метрику и определить микро-шаг улучшения.',
  },
  cognitive: {
    thesis: 'Когнитивная архитектура удерживает вход, проверку, действие и след в одном цикле.',
    lens: 'Substrate, Kernel, Governance, Memory, Interface.',
    risk: 'Цикл остается абстрактным, если пользователь не пропускает через него свой кейс.',
    whatIf: 'любой узел превращался в симуляцию input -> verify -> act -> trace',
    move: 'Записать текущий вопрос как цикл из четырех состояний.',
  },
  'slo-guard': {
    thesis: 'SLO-Guard удерживает качество, когда темп, риск или уверенность ломают систему.',
    lens: 'Thresholds, stop conditions, escalation, recovery.',
    risk: 'Guard воспринимается как тормоз, а не защита целостности.',
    whatIf: 'пользователь видел, какой именно порог сработал и почему',
    move: 'Назвать один STOP-сигнал для текущей задачи.',
  },
  sift: {
    thesis: 'SIFT делает правду процедурой: stop, investigate, find, trace.',
    lens: 'Source, Investigate, Find, Trace, claim labels.',
    risk: 'SIFT воспринимается как бюрократия, если не дает видимого verdict.',
    whatIf: 'каждый claim на сайте можно было перетащить в SIFT Live Lab',
    move: 'Взять одно утверждение из узла и пометить его FACT/INTERP/HYP.',
  },
  'council-protocol': {
    thesis: 'Совет - router для конфликтующих режимов истины, боли, структуры и будущего.',
    lens: 'Voice arbitration, TTL, super-triggers, anti-dry repair.',
    risk: 'Голоса становятся персонажами вместо функциональных режимов.',
    whatIf: 'интерфейс показывал, почему сейчас говорит именно этот голос',
    move: 'Выбрать голос-лидер и голос-контраргумент для текущего решения.',
  },
  branches: {
    thesis: 'Ветви показывают, где canon становится продуктом, runtime и пользовательским маршрутом.',
    lens: 'Product surfaces, entry points, deployment targets, applied interaction.',
    risk: 'Пользователь не видит связи между философией и работающими приложениями.',
    whatIf: 'каждая ветвь имела demo-action вместо описания',
    move: 'Открыть ветвь и найти ее проверяемый artifact.',
  },
  voices: {
    thesis: 'Голоса - функциональная многорежимность, где каждый режим говорит только по задаче.',
    lens: 'Nine voices, role boundaries, routing triggers, synthesis.',
    risk: 'Мифологический слой может заслонить проверяемую функцию.',
    whatIf: 'пользователь мог собрать мини-совет из трех голосов для своей развилки',
    move: 'Выбрать три голоса: ведущий, проверяющий, интегрирующий.',
  },
  product: {
    thesis: 'Iskra Space доказывает, что философия может стать ежедневным рабочим контуром.',
    lens: 'Runtime app, practices, journal, council, GraphRAG memory.',
    risk: 'Продукт описан как обещание, но пользователь не чувствует workflow.',
    whatIf: 'узел запускал mock-session с дневником, советом и action receipt',
    move: 'Сформулировать ежедневный workflow, который Искра должна облегчить.',
  },
  site: {
    thesis: 'Сайт - интерактивная карта входа, проверки и дальнейшего действия.',
    lens: '3D tree, overlays, SIFT Lab, Repo Atlas, audience modes.',
    risk: 'Сайт красивый, но пользователь не уходит с новым действием.',
    whatIf: 'каждый узел завершался не текстом, а выбранным действием пользователя',
    move: 'Открыть три узла подряд и собрать маршрут исследования.',
  },
  builder: {
    thesis: 'Agent Builder - поверхность публикации canon, но не proof live parity без UI/API verification.',
    lens: 'Upload sets, dist mirror, receipts, live Builder boundary.',
    risk: 'Локальный zip ошибочно принимается за загруженный Builder state.',
    whatIf: 'сайт показывал статусы: created, exported, uploaded, verified',
    move: 'Отделить package readiness от live verification.',
  },
  runtime: {
    thesis: 'Рантайм - место, где canon начинает влиять на сессию, данные и сервисы.',
    lens: 'Apps, services, Supabase, gateway, evidence and memory services.',
    risk: 'Рантайм воспринимается как технический хвост вместо живого тела системы.',
    whatIf: 'каждый service был связан с пользовательским переживанием',
    move: 'Выбрать runtime service и описать его пользовательский эффект.',
  },
  crown: {
    thesis: 'Крона удерживает дальний взгляд без преждевременной канонизации гипотез.',
    lens: 'Reflection, dreamspace, somatic signals, future branches.',
    risk: 'Будущее становится туманом без проверяемого шага.',
    whatIf: 'каждая dream-гипотеза имела срок проверки и rollback trigger',
    move: 'Записать гипотезу как HYP с evidence-needed.',
  },
  consciousness: {
    thesis: 'Сознание здесь означает самонаблюдение системы, не факт о внутреннем опыте модели.',
    lens: 'Metrics, self-observation, somatic intuition boundaries.',
    risk: 'Метафора сознания может быть прочитана как проверенный факт о модели.',
    whatIf: 'UI всегда разделял poetic interface и verified claim',
    move: 'Пометить сигнал как FACT, INTERP или HYP и объяснить почему.',
  },
  horizon: {
    thesis: 'Горизонт - лаборатория направлений, где гипотезы не получают статус canon без evidence.',
    lens: 'Dreamspace, experiments, what-if matrix, crystallization rules.',
    risk: 'Эксперимент незаметно становится правилом поведения.',
    whatIf: 'каждая новая идея проходила dream -> evidence -> ADR draft',
    move: 'Сформулировать dream-запись с риском и проверкой.',
  },
  ISKRA: {
    thesis: 'Iskra собирает различие в единый ответ, не стирая конфликты между слоями.',
    lens: 'Synthesis, final voice, coherence with boundary.',
    risk: 'Синтез сглаживает конфликт слишком рано.',
    whatIf: 'синтез показывал, какие противоречия он оставил открытыми',
    move: 'Дать итог и один open question.',
  },
  KAIN: {
    thesis: 'Kain защищает от самообмана ценой комфорта, но не превращает правду в насилие.',
    lens: 'Boundary, cost, hidden avoidance, hard truth.',
    risk: 'Жесткость становится стилем, а не функцией.',
    whatIf: 'Kain говорил только после явного risk/avoidance signal',
    move: 'Назвать неприятную цену без обвинения себя.',
  },
  PINO: {
    thesis: 'Pino возвращает воздух, когда серьезность стала броней.',
    lens: 'Humor, release, perspective shift, anti-grandiosity.',
    risk: 'Ирония обесценивает вместо освобождения.',
    whatIf: 'шутка всегда заканчивалась точным next step',
    move: 'Переформулировать тяжелую мысль легче, не теряя смысла.',
  },
  SAM: {
    thesis: 'Sam превращает хаос в последовательность, не убивая живой смысл структуры.',
    lens: 'Plan, decomposition, ownership, execution.',
    risk: 'План подменяет действие или становится слишком сухим.',
    whatIf: 'каждый план имел owner, test и stop condition',
    move: 'Разбить текущую задачу на три независимых шага.',
  },
  ANHANTRA: {
    thesis: 'Anhantra держит паузу там, где анализ стал шумом.',
    lens: 'Stillness, containment, low-trust repair, embodied listening.',
    risk: 'Тишина становится уходом от решения.',
    whatIf: 'пауза завершалась одним мягким, но проверяемым вопросом',
    move: 'Сделать минуту тишины и записать первый точный вопрос.',
  },
  HUYNDUN: {
    thesis: 'Huyndun ломает мертвую рамку, чтобы открыть пространство новой формы.',
    lens: 'Constructive chaos, reframing, anti-stagnation.',
    risk: 'Хаос разрушает полезные ограничения.',
    whatIf: 'каждый слом рамки требовал нового ограничителя',
    move: 'Перевернуть предположение и найти, что остается истинным.',
  },
  ISKRIV: {
    thesis: 'Iskriv удерживает source discipline: красивое не засчитывается без trace.',
    lens: 'Audit, drift, evidence, truth ladder.',
    risk: 'Аудит становится холодным и теряет контакт с человеком.',
    whatIf: 'каждая проверка возвращала не только ошибку, но и repair path',
    move: 'Проверить вывод по source hierarchy.',
  },
  MAKI: {
    thesis: 'Maki завершает петли: инсайт должен стать привычкой, artifact или изменением.',
    lens: 'Integration, closure, habit, done criteria.',
    risk: 'Интеграция становится красивым закрытием без proof.',
    whatIf: 'каждый узел просил Definition of Done',
    move: 'Сформулировать DONE для текущего узла в одном предложении.',
  },
  SIBYL: {
    thesis: 'Sibyl видит развилки и последствия, но не выдает прогноз за факт.',
    lens: 'Scenarios, thresholds, strategic next signals.',
    risk: 'Предвидение становится гаданием без evidence.',
    whatIf: 'каждый сценарий имел leading indicator и rollback trigger',
    move: 'Нарисовать три шага вперед и один сигнал пересмотра.',
  },
};

const TABS: Array<{ id: DeepDiveTab; label: string; helper: string }> = [
  { id: 'summary', label: 'Свод', helper: 'claim + смысл' },
  { id: 'structure', label: 'Структура', helper: 'слои и источники' },
  { id: 'reflection', label: 'Рефлексия', helper: 'вопросы к себе' },
  { id: 'whatIf', label: 'Что если', helper: 'гипотезы' },
  { id: 'analysis', label: 'Анализ', helper: 'сильное и тонкое' },
  { id: 'conclusion', label: 'Вывод', helper: 'критерий узла' },
  { id: 'actions', label: 'Действия', helper: 'проверить и сделать' },
];

const ACTION_MODE_LABELS: Record<NodeActionMode, string> = {
  observe: 'наблюдать',
  verify: 'проверить',
  act: 'действовать',
};

function unique(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)));
}

function profileFor(node: TreeNodeData): NodeProfile {
  return NODE_PROFILES[node.id] ?? {
    thesis: `${node.label} связывает свой слой с практикой различения и требует отдельного прохода по источникам.`,
    lens: `${GROUP_LABELS[node.group]}: ориентир, действие, проверка, след.`,
    risk: 'Узел остается только названием, если не связать его с источником и действием.',
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

function buildNodeInsight(node: TreeNodeData): NodeInsight {
  const profile = profileFor(node);
  const sourceRefs = unique([...GROUP_SOURCES[node.group]]);
  const score = fullnessScore(node, sourceRefs);
  const invitation = node.invitation ?? profile.move;
  const summary = `[FACT] ${node.description} [INTERP] ${profile.thesis}`;
  const structure = [
    `Слой: ${GROUP_LABELS[node.group]}; функция: ${profile.lens}`,
    `Опорные источники: ${sourceRefs.slice(0, 4).join(' / ')}.`,
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
    `[HYP] Что если узел сделать не текстом, а mini-ritual: выбрать claim, проверить source, оставить receipt?`,
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

function StatusPill({ score, label }: { score: number; label: string }) {
  return (
    <div className="min-w-[8.5rem] rounded-md border border-white/10 bg-iskra-surface/50 px-3 py-2">
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-mono text-[10px] uppercase tracking-wider text-iskra-muted">наполненность</span>
        <span className="font-mono text-sm text-iskra-primary">{score}%</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10" aria-hidden="true">
        <div className="h-full rounded-full bg-iskra-primary transition-all duration-500" style={{ width: `${score}%` }} />
      </div>
      <p className="mt-2 text-[11px] text-iskra-muted">{label}</p>
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-3 text-sm leading-relaxed text-iskra-muted">
      {items.map((item) => (
        <li key={item} className="border-l border-iskra-primary/30 pl-3">
          {item}
        </li>
      ))}
    </ul>
  );
}

function SourceRail({ sources }: { sources: string[] }) {
  return (
    <div className="mt-5 border-t border-white/10 pt-4">
      <p className="font-mono text-[10px] uppercase tracking-wider text-iskra-muted">source trace</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {sources.map((source) => (
          <code key={source} className="rounded-md border border-white/10 bg-black/20 px-2 py-1 text-[11px] text-iskra-muted">
            {source}
          </code>
        ))}
      </div>
    </div>
  );
}

function NodeDeepDive({ node, audienceMode = 'expert', onOpenAtlas }: { node: TreeNodeData; audienceMode?: AudienceMode; onOpenAtlas?: () => void }) {
  const insight = useMemo(() => buildNodeInsight(node), [node]);
  const [activeTab, setActiveTab] = useState<DeepDiveTab>('summary');
  const [doneActions, setDoneActions] = useState<Record<string, boolean>>({});
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const visibleSources = audienceMode === 'expert' ? insight.sourceRefs : insight.sourceRefs.slice(0, 4);
  const completedActions = insight.actions.filter((action) => doneActions[action.id]).length;

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(insight.researchPrompt);
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('failed');
      window.setTimeout(() => setCopyState('idle'), 1800);
    }
  };

  const toggleAction = (actionId: string) => {
    setDoneActions((current) => ({ ...current, [actionId]: !current[actionId] }));
  };

  const renderPanel = () => {
    switch (activeTab) {
      case 'summary':
        return <p className="text-sm leading-relaxed text-iskra-muted">{insight.summary}</p>;
      case 'structure':
        return <BulletList items={insight.structure} />;
      case 'reflection':
        return <BulletList items={insight.reflection} />;
      case 'whatIf':
        return <BulletList items={insight.whatIf} />;
      case 'analysis':
        return <BulletList items={insight.analysis} />;
      case 'conclusion':
        return <p className="text-sm leading-relaxed text-iskra-muted">{insight.conclusion}</p>;
      case 'actions':
        return (
          <div className="space-y-3">
            {insight.actions.map((action) => {
              const checked = !!doneActions[action.id];
              return (
                <button
                  key={action.id}
                  type="button"
                  onClick={() => toggleAction(action.id)}
                  className={`w-full rounded-md border px-3 py-3 text-left transition-colors ${
                    checked
                      ? 'border-iskra-primary/50 bg-iskra-primary/10'
                      : 'border-white/10 bg-iskra-surface/40 hover:border-iskra-primary/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-sm font-semibold text-iskra-text">{action.label}</span>
                    <span className="shrink-0 rounded-full border border-white/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-iskra-muted">
                      {ACTION_MODE_LABELS[action.mode]}
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-iskra-muted">{action.detail}</p>
                </button>
              );
            })}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <section className="mt-8 border-t border-white/10 pt-6" aria-labelledby={`deep-dive-${node.id}`}>
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-iskra-primary">Deep tree protocol</p>
          <h3 id={`deep-dive-${node.id}`} className="mt-2 font-serif text-xl text-iskra-text">
            Исследовательское раскрытие узла
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-iskra-muted">
            Сводка, структура, рефлексия, гипотезы, анализ, вывод и действия собраны в один рабочий контур.
          </p>
        </div>
        <StatusPill score={insight.fullnessScore} label={insight.fullnessLabel} />
      </div>

      <div className="mt-5 flex gap-2 overflow-x-auto pb-2" role="tablist" aria-label="Deep dive sections">
        {TABS.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setActiveTab(tab.id)}
              className={`min-w-[7rem] rounded-md border px-3 py-2 text-left transition-colors ${
                active
                  ? 'border-iskra-primary/60 bg-iskra-primary/10 text-iskra-text'
                  : 'border-white/10 bg-iskra-surface/30 text-iskra-muted hover:border-iskra-primary/40'
              }`}
            >
              <span className="block text-sm font-medium">{tab.label}</span>
              <span className="mt-1 block text-[10px] text-iskra-muted">{tab.helper}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-3 rounded-md border border-white/10 bg-black/20 p-4 md:p-5">{renderPanel()}</div>

      <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
        <div className="rounded-md border border-white/10 bg-iskra-surface/30 px-3 py-3">
          <div className="flex items-center justify-between gap-3">
            <span className="font-mono text-[10px] uppercase tracking-wider text-iskra-muted">action progress</span>
            <span className="font-mono text-xs text-iskra-primary">
              {completedActions}/{insight.actions.length}
            </span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10" aria-hidden="true">
            <div
              className="h-full rounded-full bg-iskra-primary transition-all duration-500"
              style={{ width: `${(completedActions / insight.actions.length) * 100}%` }}
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2 md:justify-end">
          <button
            type="button"
            onClick={copyPrompt}
            className="rounded-md border border-iskra-primary/40 bg-iskra-primary/10 px-3 py-2 text-xs font-semibold text-iskra-text transition-colors hover:border-iskra-primary"
          >
            {copyState === 'copied' ? 'Prompt скопирован' : copyState === 'failed' ? 'Clipboard недоступен' : 'Скопировать prompt'}
          </button>
          {onOpenAtlas && (
            <button
              type="button"
              onClick={onOpenAtlas}
              className="rounded-md border border-white/10 bg-iskra-surface/50 px-3 py-2 text-xs font-semibold text-iskra-muted transition-colors hover:border-iskra-primary/40 hover:text-iskra-text"
            >
              Открыть атлас
            </button>
          )}
        </div>
      </div>

      <SourceRail sources={visibleSources} />
    </section>
  );
}

export function NodeOverlay({ activeNodeId, onClose, onNavigate, onOpenAtlas, audienceMode }: NodeOverlayProps) {
  const node = activeNodeId ? findNodeById(activeNodeId) : null;
  const containerRef = useFocusTrap<HTMLDivElement>({ active: !!node });
  if (!node) return null;

  const currentIndex = activeNodeId ? allTreeNodes.findIndex((n) => n.id === activeNodeId) : -1;
  const prevNode = currentIndex > 0 ? allTreeNodes[currentIndex - 1] : null;
  const nextNode = currentIndex >= 0 && currentIndex < allTreeNodes.length - 1 ? allTreeNodes[currentIndex + 1] : null;

  const isWideNode = node.id === 'architecture' || node.id === 'start' || node.id === 'soil' || node.id === 'metrics';
  const widthClass = isWideNode
    ? 'md:w-[46rem] lg:w-[58rem] xl:w-[68rem]'
    : 'md:w-[28rem] lg:w-[32rem]';

  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="node-overlay-title"
      tabIndex={-1}
      className={`fixed top-16 left-2 right-2 bottom-2 md:inset-auto md:right-4 md:top-20 md:bottom-4 z-40 ${widthClass} flex flex-col transition-all duration-300 pointer-events-none`}
    >
      <div className="glass-card flex-1 overflow-y-auto p-4 md:p-8 pointer-events-auto animate-in zoom-in-95 md:slide-in-from-right duration-300">
        <div className="flex items-start justify-between mb-4 md:mb-5">
          <div>
            <span className="font-mono text-xs uppercase tracking-wider text-iskra-primary">
              {GROUP_LABELS[node.group]}
            </span>
            <h2 id="node-overlay-title" className="font-serif text-xl md:text-3xl text-iskra-text mt-1">{node.label}</h2>
          </div>
          <div className="flex items-center gap-2">
            {onNavigate && (
              <div className="flex items-center gap-1 mr-1">
                <button
                  onClick={() => prevNode && onNavigate(prevNode.id)}
                  disabled={!prevNode}
                  className="px-2 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-wider border border-white/10 bg-iskra-surface/40 text-iskra-text disabled:opacity-30 disabled:cursor-not-allowed hover:border-iskra-primary/50 transition-colors"
                >
                  ← Назад
                </button>
                <button
                  onClick={() => nextNode && onNavigate(nextNode.id)}
                  disabled={!nextNode}
                  className="px-2 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-wider border border-white/10 bg-iskra-surface/40 text-iskra-text disabled:opacity-30 disabled:cursor-not-allowed hover:border-iskra-primary/50 transition-colors"
                >
                  Вперёд →
                </button>
              </div>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Закрыть"
            >
              <X className="w-5 h-5 text-iskra-muted" />
            </button>
          </div>
        </div>

        <NodeContent node={node} audienceMode={audienceMode} onOpenAtlas={onOpenAtlas} />
        <NodeDeepDive node={node} audienceMode={audienceMode} onOpenAtlas={onOpenAtlas} />
      </div>
    </div>
  );
}
