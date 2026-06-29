import { useMemo, useState } from 'react';
import { buildNodeInsight, type DeepDiveTab, type NodeAction } from '../lib/nodeInsights';
import type { TreeNodeData } from '../lib/treeData';
import type { AudienceMode } from '../types';

interface NodeDeepDiveProps {
  node: TreeNodeData;
  audienceMode?: AudienceMode;
  onOpenAtlas?: () => void;
}

const TABS: Array<{ id: DeepDiveTab; label: string; helper: string }> = [
  { id: 'summary', label: 'Свод', helper: 'claim + смысл' },
  { id: 'structure', label: 'Структура', helper: 'слои и источники' },
  { id: 'reflection', label: 'Рефлексия', helper: 'вопросы к себе' },
  { id: 'whatIf', label: 'Что если', helper: 'гипотезы' },
  { id: 'analysis', label: 'Анализ', helper: 'сильное и тонкое' },
  { id: 'conclusion', label: 'Вывод', helper: 'критерий узла' },
  { id: 'actions', label: 'Действия', helper: 'проверить и сделать' },
];

const ACTION_MODE_LABELS: Record<NodeAction['mode'], string> = {
  observe: 'наблюдать',
  verify: 'проверить',
  act: 'действовать',
};

function StatusPill({ score, label }: { score: number; label: string }) {
  return (
    <div className="min-w-[8.5rem] rounded-md border border-white/10 bg-iskra-surface/50 px-3 py-2">
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-mono text-[10px] uppercase tracking-wider text-iskra-muted">наполненность</span>
        <span className="font-mono text-sm text-iskra-primary">{score}%</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10" aria-hidden="true">
        <div
          className="h-full rounded-full bg-iskra-primary transition-all duration-500"
          style={{ width: `${score}%` }}
        />
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
          <code
            key={source}
            className="rounded-md border border-white/10 bg-black/20 px-2 py-1 text-[11px] text-iskra-muted"
          >
            {source}
          </code>
        ))}
      </div>
    </div>
  );
}

export function NodeDeepDive({ node, audienceMode = 'expert', onOpenAtlas }: NodeDeepDiveProps) {
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
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-iskra-primary">
            Deep tree protocol
          </p>
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
