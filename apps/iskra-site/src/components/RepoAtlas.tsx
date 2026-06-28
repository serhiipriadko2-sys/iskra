import { useMemo, useState, useCallback } from 'react';
import type { AudienceMode, CanonIndex, RepoIndexNode } from '../types';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { ChevronRight, ChevronDown, Search, FileText, Folder, X, MapPin } from './icons';

import canonIndexData from '../data/canon-index.json';
const canonIndex = canonIndexData as CanonIndex;

interface RepoAtlasProps {
  audienceMode?: AudienceMode;
}

const LAYER_LABELS: Record<string, string> = {
  canon: 'Канон',
  system: 'Система',
  'engine-core': 'Движок — ядро',
  engine: 'Движок',
  math: 'Математика',
  site: 'Этот сайт',
  web: 'Веб-приложение',
  runtime: 'Рантайм',
  governance: 'Управление',
  ledger: 'Реестр',
  metrics: 'Метрики',
  mind: 'Эксперименты',
  docs: 'Документация',
  tools: 'Инструменты',
  backend: 'Бэкенд',
  builder: 'Builder',
  reference: 'Справочник',
  ingest: 'Ингест',
  appendix: 'Приложения',
  research: 'Исследования',
  skills: 'Навыки',
  ci: 'CI/CD',
  devcontainer: 'Devcontainer',
  agents: 'Агенты',
  root: 'Корень',
};

const ROLE_LABELS: Record<string, string> = {
  documentation: 'Документ',
  code: 'Код',
  config: 'Конфиг',
  style: 'Стили',
  script: 'Скрипт',
  text: 'Текст',
  markup: 'Разметка',
  asset: 'Ассет',
  data: 'Данные',
  container: 'Папка',
};

function layerColorClass(layer: string): string {
  switch (layer) {
    case 'canon':
      return 'text-iskra-primary bg-iskra-primary/10 border-iskra-primary/20';
    case 'system':
      return 'text-iskra-accent bg-iskra-accent/10 border-iskra-accent/20';
    case 'engine-core':
    case 'engine':
      return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
    case 'math':
      return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
    case 'site':
      return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
    case 'runtime':
      return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
    case 'backend':
      return 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20';
    case 'governance':
    case 'ledger':
      return 'text-stone-400 bg-stone-400/10 border-stone-400/20';
    default:
      return 'text-iskra-muted bg-white/5 border-white/10';
  }
}

function NodeIcon({ kind }: { kind: RepoIndexNode['kind'] }) {
  if (kind === 'directory') return <Folder className="w-3.5 h-3.5 text-iskra-accent shrink-0" />;
  return <FileText className="w-3.5 h-3.5 text-iskra-muted shrink-0" />;
}

export function RepoAtlas({ audienceMode = 'novice' }: RepoAtlasProps) {
  const isMobile = useMediaQuery('(max-width: 767px)');
  const [search, setSearch] = useState('');
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'simple' | 'technical' | 'source' | 'relations'>('simple');

  const { nodeMap, rootNodes, layerEntries } = useMemo(() => {
    const map = new Map<string, RepoIndexNode>();
    for (const node of canonIndex.nodes) map.set(node.path, node);
    const roots = canonIndex.nodes.filter((n) => !n.parent).sort((a, b) => a.path.localeCompare(b.path));
    const layers = Object.entries(canonIndex.layers).sort((a, b) => b[1] - a[1]);
    return { nodeMap: map, rootNodes: roots, layerEntries: layers };
  }, []);

  const selectedNode = selectedPath ? nodeMap.get(selectedPath) ?? null : null;

  const filterActive = search.trim().length > 0 || selectedLayer !== null;

  const { visiblePaths, matchedPaths } = useMemo(() => {
    const term = search.trim().toLowerCase();
    const matched = new Set<string>();

    for (const node of canonIndex.nodes) {
      const matchesLayer = selectedLayer ? node.layer === selectedLayer : true;
      if (!matchesLayer) continue;
      const matchesSearch =
        term.length === 0 ||
        node.path.toLowerCase().includes(term) ||
        node.role.toLowerCase().includes(term) ||
        LAYER_LABELS[node.layer]?.toLowerCase().includes(term) ||
        (node.simpleExplanation && node.simpleExplanation.toLowerCase().includes(term)) ||
        (node.technicalExplanation && node.technicalExplanation.toLowerCase().includes(term));
      if (matchesSearch) matched.add(node.path);
    }

    const visible = new Set<string>();
    const nodesByDepth = [...canonIndex.nodes].sort((a, b) => b.path.split('/').length - a.path.split('/').length);
    for (const node of nodesByDepth) {
      const children = node.children ?? [];
      const childVisible = children.some((c) => visible.has(c));
      if (matched.has(node.path) || childVisible) {
        visible.add(node.path);
      }
    }
    return { visiblePaths: visible, matchedPaths: matched };
  }, [search, selectedLayer]);

  const isExpanded = useCallback(
    (path: string) => {
      if (filterActive) return visiblePaths.has(path);
      return expanded.has(path);
    },
    [expanded, filterActive, visiblePaths]
  );

  const toggleExpanded = useCallback(
    (path: string) => {
      if (filterActive) return;
      setExpanded((prev) => {
        const next = new Set(prev);
        if (next.has(path)) next.delete(path);
        else next.add(path);
        return next;
      });
    },
    [filterActive]
  );

  const handleSelect = useCallback(
    (path: string) => {
      setSelectedPath(path);
      const node = nodeMap.get(path);
      if (node?.kind === 'directory') {
        toggleExpanded(path);
      }
    },
    [nodeMap, toggleExpanded]
  );

  const breadcrumbs = useMemo(() => {
    if (!selectedNode) return [];
    const parts = selectedNode.path.split('/');
    const crumbs: { label: string; path: string }[] = [];
    let acc = '';
    for (let i = 0; i < parts.length; i++) {
      acc = acc ? `${acc}/${parts[i]}` : parts[i];
      crumbs.push({ label: parts[i], path: acc });
    }
    return crumbs;
  }, [selectedNode]);

  function renderTree(nodes: RepoIndexNode[], depth = 0) {
    return nodes.map((node) => {
      if (!visiblePaths.has(node.path)) return null;
      const isSelected = selectedPath === node.path;
      const hasChildren = (node.children?.length ?? 0) > 0;
      const expandedState = isExpanded(node.path);
      const matched = matchedPaths.has(node.path);

      return (
        <div key={node.path}>
          <button
            role="treeitem"
            aria-expanded={hasChildren ? expandedState : undefined}
            aria-level={depth + 1}
            aria-selected={isSelected}
            onClick={() => handleSelect(node.path)}
            className={`w-full flex items-center gap-2 text-left px-2 py-1.5 rounded-lg transition-colors ${
              isSelected ? 'bg-iskra-primary/15 text-iskra-text' : 'hover:bg-white/5 text-iskra-muted'
            } ${matched ? 'ring-1 ring-iskra-primary/30' : ''}`}
            style={{ paddingLeft: `${12 + depth * 14}px` }}
          >
            {hasChildren ? (
              <span onClick={(e) => { e.stopPropagation(); toggleExpanded(node.path); }} className="shrink-0">
                {expandedState ? (
                  <ChevronDown className="w-3 h-3 text-iskra-muted" />
                ) : (
                  <ChevronRight className="w-3 h-3 text-iskra-muted" />
                )}
              </span>
            ) : (
              <span className="w-3 h-3 shrink-0" />
            )}
            <NodeIcon kind={node.kind} />
            <span className={`text-xs truncate ${isSelected ? 'font-medium text-iskra-text' : ''}`}>{node.name}</span>
            <span className={`ml-auto text-[9px] px-1.5 py-0.5 rounded border ${layerColorClass(node.layer)} hidden sm:inline-block`}>
              {LAYER_LABELS[node.layer] ?? node.layer}
            </span>
          </button>
          {hasChildren && expandedState && (
            <div role="group">{renderTree(node.children!.map((p) => nodeMap.get(p)!).filter(Boolean), depth + 1)}</div>
          )}
        </div>
      );
    });
  }

  function renderInspector() {
    if (!selectedNode) {
      return (
        <div className="h-full flex flex-col items-center justify-center text-center p-6 text-iskra-muted">
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-3">
            <MapPin className="w-5 h-5 text-iskra-primary" />
          </div>
          <p className="text-sm">Выберите файл или папку в дереве репозитория.</p>
          <p className="text-xs mt-2 opacity-70">
            {audienceMode === 'novice'
              ? 'Слева — полный индекс tracked files. Ключевые узлы разобраны простыми словами.'
              : 'Индекс построен из git ls-files. Curated-узлы содержат ручные объяснения и source traces.'}
          </p>
        </div>
      );
    }

    const tabs: { id: typeof activeTab; label: string }[] = [
      { id: 'simple', label: 'Простыми словами' },
      { id: 'technical', label: 'Технически' },
      { id: 'source', label: 'Источник' },
      { id: 'relations', label: 'Связи' },
    ];

    return (
      <div className="h-full flex flex-col">
        <div className="border-b border-white/10 pb-3 mb-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-iskra-accent">
                {ROLE_LABELS[selectedNode.role] ?? selectedNode.role}
              </span>
              <h3 className="font-mono text-sm text-iskra-text mt-0.5 break-all leading-tight">{selectedNode.path}</h3>
            </div>
            <span className={`text-[9px] px-2 py-1 rounded border whitespace-nowrap ${layerColorClass(selectedNode.layer)}`}>
              {LAYER_LABELS[selectedNode.layer] ?? selectedNode.layer}
            </span>
          </div>
          {breadcrumbs.length > 1 && (
            <div className="flex flex-wrap items-center gap-1 mt-2 text-[10px] text-iskra-muted">
              {breadcrumbs.map((crumb, idx) => (
                <span key={crumb.path} className="flex items-center gap-1">
                  {idx > 0 && <ChevronRight className="w-2.5 h-2.5" />}
                  <button
                    onClick={() => handleSelect(crumb.path)}
                    className="hover:text-iskra-primary transition-colors"
                  >
                    {crumb.label}
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-1 mb-3 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-2.5 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-wider whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-iskra-primary/15 text-iskra-primary border border-iskra-primary/30'
                  : 'text-iskra-muted hover:bg-white/5 border border-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto pr-1">
          {activeTab === 'simple' && (
            <div className="space-y-3">
              {selectedNode.simpleExplanation ? (
                <p className="text-sm text-iskra-text leading-relaxed p-3 rounded-lg border border-iskra-primary/20 bg-iskra-primary/10">
                  {selectedNode.simpleExplanation}
                </p>
              ) : (
                <p className="text-sm text-iskra-muted leading-relaxed">
                  {audienceMode === 'novice'
                    ? `Это ${ROLE_LABELS[selectedNode.role] ?? selectedNode.role} в слое «${LAYER_LABELS[selectedNode.layer] ?? selectedNode.layer}». Он входит в общий индекс репозитория, но пока не получил отдельного простого объяснения.`
                    : `No curated simple explanation for ${selectedNode.path}. Coverage status: ${selectedNode.coverage}.`}
                </p>
              )}
              {selectedNode.coverage !== 'curated' && (
                <div className="flex items-center gap-2 text-[10px] text-iskra-muted">
                  <span className="w-1.5 h-1.5 rounded-full bg-iskra-muted" />
                  {audienceMode === 'novice'
                    ? 'Узел в индексе, но без ручной статьи. Интерпретация — автоматическая.'
                    : '[INTERP] Automatic layer/role inference; not manually curated.'}
                </div>
              )}
            </div>
          )}

          {activeTab === 'technical' && (
            <div className="space-y-3">
              {selectedNode.technicalExplanation ? (
                <p className="text-sm text-iskra-text leading-relaxed">{selectedNode.technicalExplanation}</p>
              ) : (
                <p className="text-sm text-iskra-muted leading-relaxed">
                  {audienceMode === 'novice'
                    ? `Файл относится к слою «${LAYER_LABELS[selectedNode.layer] ?? selectedNode.layer}» и выполняет роль «${ROLE_LABELS[selectedNode.role] ?? selectedNode.role}». Для углублённого разбора нужна ручная техническая заметка.`
                    : `No curated technical explanation. Layer: ${selectedNode.layer}, role: ${selectedNode.role}, kind: ${selectedNode.kind}.`}
                </p>
              )}
            </div>
          )}

          {activeTab === 'source' && (
            <div className="space-y-3 text-sm">
              <div className="p-3 rounded-lg border border-white/10 bg-iskra-surface/40">
                <span className="font-mono text-[10px] uppercase tracking-wider text-iskra-muted block mb-1">Source reference</span>
                <code className="text-xs text-iskra-text break-all">{selectedNode.sourceRef}</code>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-lg border border-white/10 bg-iskra-surface/40">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-iskra-muted block mb-1">Статус покрытия</span>
                  <span className={`text-xs px-2 py-0.5 rounded border ${selectedNode.coverage === 'curated' ? 'text-iskra-primary border-iskra-primary/30 bg-iskra-primary/10' : 'text-iskra-muted border-white/10'}`}>
                    {selectedNode.coverage === 'curated' ? 'Curated' : 'Indexed'}
                  </span>
                </div>
                <div className="p-3 rounded-lg border border-white/10 bg-iskra-surface/40">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-iskra-muted block mb-1">Уверенность</span>
                  <span className="text-xs text-iskra-text">{selectedNode.coverage === 'curated' ? '[FACT]' : '[INTERP]'}</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'relations' && (
            <div className="space-y-3">
              {selectedNode.related.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {selectedNode.related.map((rel) => (
                    <button
                      key={rel}
                      onClick={() => {
                        if (nodeMap.has(rel)) handleSelect(rel);
                      }}
                      className={`px-2 py-1 rounded border text-[10px] font-mono transition-colors ${
                        nodeMap.has(rel)
                          ? 'border-iskra-primary/30 bg-iskra-primary/10 text-iskra-primary hover:bg-iskra-primary/20'
                          : 'border-white/10 bg-black/30 text-iskra-muted'
                      }`}
                    >
                      {rel}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-iskra-muted">Связи не заданы.</p>
              )}
              {selectedNode.children && selectedNode.children.length > 0 && (
                <div className="pt-2 border-t border-white/10">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-iskra-muted block mb-2">Содержимое</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedNode.children.slice(0, 24).map((child) => {
                      const childNode = nodeMap.get(child);
                      if (!childNode) return null;
                      return (
                        <button
                          key={child}
                          onClick={() => handleSelect(child)}
                          className="px-2 py-1 rounded border border-white/10 bg-white/5 text-[10px] text-iskra-muted hover:text-iskra-text hover:border-white/20 transition-colors"
                        >
                          {childNode.name}
                        </button>
                      );
                    })}
                    {selectedNode.children.length > 24 && (
                      <span className="text-[10px] text-iskra-muted px-2 py-1">+{selectedNode.children.length - 24}</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col sm:flex-row gap-3 mb-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-iskra-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по индексу…"
            aria-label="Поиск по индексу"
            className="w-full bg-iskra-surface/50 border border-white/10 rounded-lg pl-9 pr-8 py-2 text-xs text-iskra-text placeholder:text-iskra-muted focus:outline-none focus:border-iskra-primary/50"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              aria-label="Очистить поиск"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-iskra-muted hover:text-iskra-text"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setSelectedLayer(null)}
            className={`px-2.5 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-wider whitespace-nowrap border transition-colors ${
              selectedLayer === null
                ? 'bg-iskra-primary/15 text-iskra-primary border-iskra-primary/30'
                : 'text-iskra-muted border-white/10 hover:border-white/20'
            }`}
          >
            Все ({canonIndex.total})
          </button>
          {layerEntries.map(([layer, count]) => (
            <button
              key={layer}
              onClick={() => setSelectedLayer((prev) => (prev === layer ? null : layer))}
              className={`px-2.5 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-wider whitespace-nowrap border transition-colors ${
                selectedLayer === layer
                  ? 'bg-iskra-primary/15 text-iskra-primary border-iskra-primary/30'
                  : 'text-iskra-muted border-white/10 hover:border-white/20'
              }`}
            >
              {LAYER_LABELS[layer] ?? layer} ({count})
            </button>
          ))}
        </div>
      </div>

      <div className={`flex-1 min-h-0 grid gap-3 ${isMobile ? 'grid-cols-1' : 'grid-cols-12'}`}>
        <div className={`${isMobile ? 'h-[45vh]' : 'col-span-5'} flex flex-col border border-white/10 rounded-xl bg-iskra-surface/30 overflow-hidden`}>
          <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-wider text-iskra-muted">Репозиторий</span>
            <span className="text-[10px] text-iskra-muted">
              {canonIndex.total} узлов · {canonIndex.curated} curated
            </span>
          </div>
          <div role="tree" aria-label="Репозиторий" className="flex-1 overflow-y-auto p-2 scrollbar-thin">{renderTree(rootNodes)}</div>
        </div>

        {!isMobile && (
          <div className="col-span-7 border border-white/10 rounded-xl bg-iskra-surface/30 p-4 overflow-hidden">
            {renderInspector()}
          </div>
        )}
      </div>

      {isMobile && selectedNode && (
        <div className="fixed inset-0 z-40 bg-iskra-bg/95 backdrop-blur-md p-4 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-[10px] uppercase tracking-wider text-iskra-muted">Детали узла</span>
            <button onClick={() => setSelectedPath(null)} aria-label="Закрыть" className="p-1 rounded-lg hover:bg-white/10">
              <X className="w-5 h-5 text-iskra-muted" />
            </button>
          </div>
          <div className="flex-1 overflow-hidden">{renderInspector()}</div>
        </div>
      )}
    </div>
  );
}
