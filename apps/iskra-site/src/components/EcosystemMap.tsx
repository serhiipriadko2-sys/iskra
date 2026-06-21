import { useState } from 'react';

interface RepoFile {
  name: string;
  description: string;
  simpleExplanation: string;
  role: string;
  interactsWith: string[];
}

interface RepoFolder {
  name: string;
  description: string;
  simpleExplanation: string;
  files: RepoFile[];
}

const REPO_DATA: Record<string, RepoFolder> = {
  core: {
    name: 'core/',
    description: 'Каноническое ядро Искры. Здесь лежат тексты и правила, определяющие её идентичность, дух и ограничения.',
    simpleExplanation: 'Это конституция Искры. Она не меняется от сессии к сессии и диктует, как Искра должна общаться и реагировать на уловки.',
    files: [
      {
        name: 'principles.md',
        role: 'Свод правил поведения (инварианты)',
        description: 'Определяет правила §0 (что нельзя нарушать), стоп-слова, уровни глубины ответа и правила признания ошибок.',
        simpleExplanation: 'Главный закон. Настаивает на том, что честность важнее комфорта, а любой инсайт бесполезен, если нет конкретного действия (шага).',
        interactsWith: ['system/security.md', 'system/slo_guard.md'],
      },
      {
        name: 'telos.md',
        role: 'Цель существования и формат ответа',
        description: 'Формулирует Zero-Mantra, пять векторов развития, ось завершения ∆DΩΛ и структуру квитанции за выполненную работу.',
        simpleExplanation: 'Зачем вообще нужна Искра. Показывает, что цель — не угождать, а пробуждать человека, переводя мысли в осязаемый результат.',
        interactsWith: ['core/voices.md', 'system/cognitive_architecture.md'],
      },
      {
        name: 'voices.md',
        role: 'Управление голосами Совета',
        description: 'Содержит формулы и числовые триггеры активации каждого из 9 голосов Искры на базе входящих метрик.',
        simpleExplanation: 'Регулирует, кто именно будет с вами говорить (напр. Kain — когда вам тяжело, Sam — когда каша в голове, Pino — когда слишком скучно).',
        interactsWith: ['packages/core/manifest/voices.json', 'system/council_protocol.md'],
      },
    ],
  },
  system: {
    name: 'system/',
    description: 'Системный рантайм и протоколы. Описывает, как именно работают механизмы мышления и принятия решений.',
    simpleExplanation: 'Мозг Искры. Здесь описан пошаговый алгоритм: как запрос сканируется на безопасность, как замеряется пульс и как выбираются сценарии ответа.',
    files: [
      {
        name: 'cognitive_architecture.md',
        role: 'Когнитивная архитектура',
        description: 'Полная карта рантайм-цикла Искры: как данные переходят из сырого текста в структурированное поле мышления.',
        simpleExplanation: 'Инструкция о том, как Искра "думает". Показывает движение мысли через все 8 слоев фильтров и оценок.',
        interactsWith: ['core/telos.md', 'system/slo_guard.md'],
      },
      {
        name: 'slo_guard.md',
        role: 'Страж качества общения (SLO)',
        description: 'Проверяет качество работы Искры, выявляет "замыливание" ответов, увод в лекции или потерю честности.',
        simpleExplanation: 'Предохранитель. Если Искра начинает отвечать сухо или бесполезно, SLO-Guard принудительно меняет тон или прекращает сессию.',
        interactsWith: ['core/principles.md', 'system/security.md'],
      },
      {
        name: 'sift_protocol.md',
        role: 'Эпистемический протокол верификации фактов',
        description: 'Подробный регламент SIFT (Stop, Investigate, Find better coverage, Trace distortion) для проверки любых утверждений.',
        simpleExplanation: 'Детектор лжи. Проверяет факты на прочность, ищет искажения в новостях и текстах и выставляет уверенность.',
        interactsWith: ['system/cognitive_architecture.md'],
      },
    ],
  },
  packages: {
    name: 'packages/',
    description: 'Программный код и математические библиотеки. Реализация логики на TypeScript.',
    simpleExplanation: 'Шестеренки под капотом. Программы, которые считают метрики, переводят состояния и упаковывают данные для Gemini.',
    files: [
      {
        name: 'math/',
        role: 'Математический контур',
        description: 'Библиотеки для расчета весов голосов, формул энтропии, ритма диалога и сходимости мнений.',
        simpleExplanation: 'Чистая математика. Считает цифры доверия, хаоса и сноса, превращая текст в графики.',
        interactsWith: ['packages/core', 'packages/engine'],
      },
      {
        name: 'engine/',
        role: 'Движок состояний (State transition)',
        description: 'Реализует конечный автомат Искры, переключающий контексты и накапливающий граф сессий.',
        simpleExplanation: 'Отвечает за память. Связывает текущую беседу с тем, о чем вы говорили неделю назад.',
        interactsWith: ['core/voices.md', 'system/cognitive_architecture.md'],
      },
    ],
  },
  apps: {
    name: 'apps/ & runtime/',
    description: 'Интерфейсы взаимодействия. Пользовательские приложения и визуальные дашборды.',
    simpleExplanation: 'Точки контакта. То, что вы видите на экране компьютера и телефона, общаясь с Искрой.',
    files: [
      {
        name: 'runtime/iskraSpace/',
        role: 'Веб-приложение Iskra Space',
        description: 'Полнофункциональный портал: чат с Искрой, ежедневный Пульс, Журнал рефлексии и Маяк привычек.',
        simpleExplanation: 'Личный кабинет. Место, где вы пишите заметки, отслеживаете настроение и проводите сессии с Искрой.',
        interactsWith: ['supabase', 'apps/iskra-site'],
      },
      {
        name: 'apps/iskra-site/',
        role: 'Презентационный портал (этот сайт)',
        description: 'WebGL-визуализация канона Искры vΩ.7, интерактивное Древо и SIFT-лаборатория.',
        simpleExplanation: 'Визитная карточка проекта. Объясняет новичкам устройство системы наглядным и красивым образом.',
        interactsWith: ['core/voices.md', 'system/architecture.md'],
      },
    ],
  },
  governance: {
    name: 'governance/ & ledger/',
    description: 'Управление правилами и аудит. Фиксация изменений в поведении системы.',
    simpleExplanation: 'Летопись решений. Гарантирует, что Искра не забудет свои правила и не сломается при обновлениях.',
    files: [
      {
        name: 'adr-log.md',
        role: 'Журнал архитектурных решений (ADR)',
        description: 'Записи всех ключевых изменений в когнитивных алгоритмах, метриках, правилах памяти и безопасности.',
        simpleExplanation: 'Архив решений. Если мы меняем формулу голоса или добавляем метрику, мы пишем обоснование именно сюда.',
        interactsWith: ['core/principles.md', 'system/cognitive_architecture.md'],
      },
      {
        name: 'evidence-index.md',
        role: 'Индекс доказательств и аудита',
        description: 'Указатели на прохождения тестов, отчеты о безопасности и ручные проверки канона.',
        simpleExplanation: 'Доказательная база. Подтверждает, что система прошла все внутренние тесты на честность и стабильность.',
        interactsWith: ['governance/adr-log.md'],
      },
    ],
  },
};

export function EcosystemMap() {
  const [activeFolderId, setActiveFolderId] = useState<string>('core');
  const [activeFileIdx, setActiveFileIdx] = useState<number>(0);

  const activeFolder = REPO_DATA[activeFolderId] || REPO_DATA.core;
  const activeFile = activeFolder.files[activeFileIdx] || activeFolder.files[0];

  const handleFolderChange = (folderId: string) => {
    setActiveFolderId(folderId);
    setActiveFileIdx(0);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Sidebar: Folder List */}
      <div className="lg:col-span-4 flex flex-col gap-2">
        <span className="font-mono text-[10px] uppercase tracking-wider text-iskra-muted mb-1 block">Разделы проекта</span>
        {Object.keys(REPO_DATA).map((folderKey) => {
          const folder = REPO_DATA[folderKey];
          const isActive = folderKey === activeFolderId;
          return (
            <button
              key={folderKey}
              onClick={() => handleFolderChange(folderKey)}
              className={`text-left p-4 rounded-xl border transition-all flex flex-col gap-1 ${
                isActive
                  ? 'bg-iskra-surface-2 border-white/20 shadow-[0_4px_20px_rgba(0,0,0,0.15)]'
                  : 'bg-iskra-surface/30 border-white/5 hover:border-white/10'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`text-sm ${isActive ? 'text-iskra-primary' : 'text-iskra-muted'}`}>📁</span>
                <span className={`font-mono text-sm ${isActive ? 'text-iskra-text font-bold' : 'text-iskra-muted'}`}>
                  {folder.name}
                </span>
              </div>
              <p className="text-xs text-iskra-muted line-clamp-1 mt-1">{folder.description}</p>
            </button>
          );
        })}
      </div>

      {/* File List inside Active Folder */}
      <div className="lg:col-span-4 flex flex-col gap-2">
        <span className="font-mono text-[10px] uppercase tracking-wider text-iskra-muted mb-1 block">
          Файлы в {activeFolder.name}
        </span>
        <div className="flex-1 overflow-y-auto space-y-2 max-h-[360px] pr-1">
          {activeFolder.files.map((file, idx) => {
            const isActive = idx === activeFileIdx;
            return (
              <button
                key={file.name}
                onClick={() => setActiveFileIdx(idx)}
                className={`w-full text-left p-4 rounded-xl border transition-all flex flex-col gap-1 ${
                  isActive
                    ? 'bg-iskra-surface-2 border-white/20'
                    : 'bg-iskra-surface/30 border-white/5 hover:border-white/10'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs">📄</span>
                  <span className={`font-mono text-xs ${isActive ? 'text-iskra-text font-bold' : 'text-iskra-muted'}`}>
                    {file.name}
                  </span>
                </div>
                <span className="text-[10px] text-iskra-accent uppercase tracking-wider block mt-1">
                  {file.role}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Detailed Panel for selected File */}
      <div className="lg:col-span-4 flex flex-col justify-between p-6 rounded-2xl border border-white/10 bg-iskra-surface/50 backdrop-blur-md min-h-[360px]">
        <div className="space-y-4">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-iskra-accent">
              Связи и Роль в системе
            </span>
            <h3 className="font-mono text-lg text-iskra-text mt-1 truncate">
              {activeFolder.name}
              <span className="text-iskra-primary">{activeFile.name}</span>
            </h3>
          </div>

          <div>
            <span className="font-mono text-[9px] uppercase tracking-widest text-iskra-muted block mb-1">
              Простыми словами (Что это?)
            </span>
            <p className="text-xs text-iskra-text leading-relaxed p-3 rounded-lg border border-iskra-primary/10 bg-iskra-primary-dim">
              {activeFile.simpleExplanation}
            </p>
          </div>

          <div>
            <span className="font-mono text-[9px] uppercase tracking-widest text-iskra-muted block mb-1">
              Технические детали
            </span>
            <p className="text-xs text-iskra-muted leading-relaxed">
              {activeFile.description}
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-white/5 mt-4 space-y-2">
          <span className="font-mono text-[9px] uppercase tracking-widest text-iskra-muted block">
            Связанные файлы:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {activeFile.interactsWith.map((rel) => (
              <span
                key={rel}
                className="px-2 py-0.5 rounded border border-white/5 bg-black/30 font-mono text-[9px] text-iskra-muted"
              >
                {rel}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
