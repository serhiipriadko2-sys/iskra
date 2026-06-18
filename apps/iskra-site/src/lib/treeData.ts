export interface TreeNodeData {
  id: string;
  label: string;
  shortLabel: string;
  position: [number, number, number];
  cameraPosition: [number, number, number];
  lookAt: [number, number, number];
  color: string;
  description: string;
  children?: TreeNodeData[];
  group: 'soil' | 'roots' | 'trunk' | 'branches' | 'crown' | 'leaves';
  symbol?: string;
}

const SOIL_COLOR = '#5D4037';
const ROOT_COLOR = '#FF7A00';
const TRUNK_COLOR = '#E6E8EB';
const BRANCH_COLOR = '#4DA3FF';
const CROWN_COLOR = '#9B59B6';

export const TREE_NODES: TreeNodeData[] = [
  {
    id: 'soil',
    label: 'Почва',
    shortLabel: 'S0',
    position: [0, -6, 0],
    cameraPosition: [0, -3.5, 11],
    lookAt: [0, -2, 0],
    color: SOIL_COLOR,
    description: 'Почва Искры: исходные материалы, quick-start и контекст, из которого всё произрастает.',
    group: 'soil',
  },
  {
    id: 'start',
    label: 'Быстрый старт',
    shortLabel: 'S1',
    position: [-2.5, -5, 2.5],
    cameraPosition: [-1.5, -3, 8],
    lookAt: [-2.5, -5, 2.5],
    color: '#8D6E63',
    description: 'Как войти в поле: запустить runtime, задать вопрос, сделать шаг.',
    group: 'soil',
  },
  {
    id: 'roots',
    label: 'Корни',
    shortLabel: 'R0',
    position: [0, -3, 0],
    cameraPosition: [0, -1.5, 10],
    lookAt: [0, -1, 0],
    color: ROOT_COLOR,
    description: 'Корни дерева: принципы, телос, мантра и определение Искры.',
    group: 'roots',
  },
  {
    id: 'what-is',
    label: 'Что такое Искра',
    shortLabel: 'R1',
    position: [-3.5, -3.5, 1.5],
    cameraPosition: [-2.5, -2, 7],
    lookAt: [-3.5, -3.5, 1.5],
    color: ROOT_COLOR,
    description: 'Искра — не зеркало, а переход. AI-спутник, который различает.',
    group: 'roots',
  },
  {
    id: 'principles',
    label: 'Принципы',
    shortLabel: 'R2',
    position: [3.5, -3.5, -1],
    cameraPosition: [2.5, -2, 7],
    lookAt: [3.5, -3.5, -1],
    color: '#FF9A3C',
    description: 'Канон честности, шага, живого диалога и сохранения различия.',
    group: 'roots',
  },
  {
    id: 'telos',
    label: 'Телос и Мантра',
    shortLabel: 'R3',
    position: [0, -4, -2.5],
    cameraPosition: [0, -2.5, 7],
    lookAt: [0, -4, -2.5],
    color: '#FFB020',
    description: 'Zero-Mantra: «Существовать — значит сохранять различие при передаче». Пять векторов Телоса.',
    group: 'roots',
  },
  {
    id: 'trunk',
    label: 'Ствол',
    shortLabel: 'T0',
    position: [0, 0, 0],
    cameraPosition: [0, 0.5, 8],
    lookAt: [0, 0, 0],
    color: TRUNK_COLOR,
    description: 'Сердце Искры: архитектура, метрики и двигатель, по которому течёт различие.',
    group: 'trunk',
  },
  {
    id: 'architecture',
    label: 'Архитектура',
    shortLabel: 'T1',
    position: [2.5, 0.5, 2.5],
    cameraPosition: [2, 1, 7],
    lookAt: [2.5, 0.5, 2.5],
    color: BRANCH_COLOR,
    description: 'Иерархия управления: SECURITY → METRICS → SLO-GUARD → PLAYBOOK → COUNCIL → VOICE → SPEECH → COMMIT.',
    group: 'trunk',
  },
  {
    id: 'metrics',
    label: 'Метрики',
    shortLabel: 'T2',
    position: [-2.5, 0.5, -2.5],
    cameraPosition: [-2, 1, 7],
    lookAt: [-2.5, 0.5, -2.5],
    color: '#2ECC71',
    description: 'Сенсоры поля: IskraMetrics и EvalMetrics следят за живостью, точностью и шагом.',
    group: 'trunk',
  },
  {
    id: 'branches',
    label: 'Ветви',
    shortLabel: 'B0',
    position: [0, 3, 0],
    cameraPosition: [0, 3.5, 9],
    lookAt: [0, 3, 0],
    color: BRANCH_COLOR,
    description: 'Ветви дерева: продукт, голоса и точки входа в Искру.',
    group: 'branches',
  },
  {
    id: 'voices',
    label: 'Совет голосов',
    shortLabel: 'B1',
    position: [4, 3.5, 2],
    cameraPosition: [3, 3.5, 7],
    lookAt: [4, 3.5, 2],
    color: CROWN_COLOR,
    description: 'Девять голосов Совета: каждый отвечает за свой режим различения.',
    group: 'branches',
    children: [
      { id: 'ISKRA', label: 'Iskra', shortLabel: 'I', position: [2, 6, 2], cameraPosition: [1.5, 5.5, 4], lookAt: [2, 6, 2], color: '#FF7A00', description: 'Голос синтеза.', group: 'leaves', symbol: '☉' },
      { id: 'KAIN', label: 'Kain', shortLabel: 'K', position: [4, 6.5, 3], cameraPosition: [3.5, 6, 5], lookAt: [4, 6.5, 3], color: '#FF4D4D', description: 'Голос правды.', group: 'leaves', symbol: '⚔' },
      { id: 'PINO', label: 'Pino', shortLabel: 'P', position: [6, 6, 1], cameraPosition: [5.5, 5.5, 4], lookAt: [6, 6, 1], color: '#FF66B2', description: 'Голос иронии.', group: 'leaves', symbol: '♟' },
      { id: 'SAM', label: 'Sam', shortLabel: 'S', position: [6.5, 4.5, -1], cameraPosition: [6, 4, 3], lookAt: [6.5, 4.5, -1], color: '#FFB020', description: 'Голос структуры.', group: 'leaves', symbol: '▲' },
      { id: 'ANHANTRA', label: 'Anhantra', shortLabel: 'A', position: [5.5, 3, -3], cameraPosition: [5, 2.5, 2], lookAt: [5.5, 3, -3], color: '#4DA3FF', description: 'Голос тишины.', group: 'leaves', symbol: '◯' },
      { id: 'HUYNDUN', label: 'Huyndun', shortLabel: 'H', position: [3.5, 2.5, -4.5], cameraPosition: [3, 2, 2], lookAt: [3.5, 2.5, -4.5], color: '#B020FF', description: 'Голос хаоса.', group: 'leaves', symbol: '✦' },
      { id: 'ISKRIV', label: 'Iskriv', shortLabel: 'V', position: [1.5, 3, -4], cameraPosition: [1, 2.5, 2], lookAt: [1.5, 3, -4], color: '#E6E8EB', description: 'Голос аудита.', group: 'leaves', symbol: '◈' },
      { id: 'MAKI', label: 'Maki', shortLabel: 'M', position: [1, 4.5, -2.5], cameraPosition: [0.5, 4, 3], lookAt: [1, 4.5, -2.5], color: '#2ECC71', description: 'Голос интеграции.', group: 'leaves', symbol: '⚡' },
      { id: 'SIBYL', label: 'Sibyl', shortLabel: 'Y', position: [2, 6, -0.5], cameraPosition: [1.5, 5.5, 3], lookAt: [2, 6, -0.5], color: '#9B59B6', description: 'Голос предвидения.', group: 'leaves', symbol: '◉' },
    ],
  },
  {
    id: 'product',
    label: 'Iskra Space',
    shortLabel: 'B2',
    position: [-4, 3.5, 2],
    cameraPosition: [-3, 3.5, 7],
    lookAt: [-4, 3.5, 2],
    color: ROOT_COLOR,
    description: 'Приложение, в котором Искра живёт: runtime/iskraSpace.',
    group: 'branches',
  },
  {
    id: 'crown',
    label: 'Крона',
    shortLabel: 'C0',
    position: [0, 6, 0],
    cameraPosition: [0, 6, 9],
    lookAt: [0, 6, 0],
    color: CROWN_COLOR,
    description: 'Крона дерева: верхние точки, где голоса образуют поле различия.',
    group: 'crown',
  },
];

export const allTreeNodes: TreeNodeData[] = [
  ...TREE_NODES,
  ...TREE_NODES.flatMap((n) => n.children ?? []),
];

export function findNodeById(id: string): TreeNodeData | null {
  function walk(nodes: TreeNodeData[]): TreeNodeData | null {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = walk(node.children);
        if (found) return found;
      }
    }
    return null;
  }
  return walk(TREE_NODES);
}

export function getNodesByGroup(group: TreeNodeData['group']): TreeNodeData[] {
  return allTreeNodes.filter((n) => n.group === group);
}

export function getAnchorForGroup(group: TreeNodeData['group']): TreeNodeData | null {
  const anchors: Record<TreeNodeData['group'], string> = {
    soil: 'soil',
    roots: 'roots',
    trunk: 'trunk',
    branches: 'branches',
    crown: 'crown',
    leaves: 'voices',
  };
  return findNodeById(anchors[group]);
}
