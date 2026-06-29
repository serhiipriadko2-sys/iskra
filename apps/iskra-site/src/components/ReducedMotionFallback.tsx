import { useState, useCallback } from 'react';
import { TREE_NODES, allTreeNodes, findNodeById } from '../lib/treeData';
import type { TreeNodeData } from '../lib/treeData';
import { heroContent } from '../lib/content';
import { Dice, Copy, Box } from './icons';

const GROUP_ORDER: { key: TreeNodeData['group']; title: string }[] = [
  { key: 'soil', title: 'Почва' },
  { key: 'roots', title: 'Корни' },
  { key: 'trunk', title: 'Ствол' },
  { key: 'branches', title: 'Ветви' },
  { key: 'crown', title: 'Крона' },
];

interface ReducedMotionFallbackProps {
  onExit?: () => void;
}

export function ReducedMotionFallback({ onExit }: ReducedMotionFallbackProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const activeNode = activeId ? findNodeById(activeId) : null;

  const handleRandom = useCallback(() => {
    const idx = Math.floor(Math.random() * allTreeNodes.length);
    setActiveId(allTreeNodes[idx].id);
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen bg-iskra-bg text-iskra-text p-6 md:p-12">
      <header className="max-w-6xl mx-auto mb-12">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="font-serif text-4xl md:text-6xl text-iskra-text mb-4">Древо Искры</h1>
            <p className="text-iskra-muted text-lg max-w-2xl">{heroContent.description}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            <button
              onClick={handleRandom}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-iskra-primary/10 border border-iskra-primary/30 text-iskra-primary hover:bg-iskra-primary/20 transition-colors font-mono text-xs uppercase tracking-wider"
            >
              <Dice className="w-4 h-4" />
              Случайный узел
            </button>
            {onExit && (
              <button
                onClick={onExit}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-iskra-surface/60 border border-white/10 text-iskra-text hover:border-iskra-primary/50 transition-colors font-mono text-xs uppercase tracking-wider"
              >
                <Box className="w-4 h-4" />
                <span className="hidden sm:inline">3D вид</span>
                <span className="sm:hidden">3D</span>
              </button>
            )}
          </div>
        </div>
        <p className="mt-4 text-sm text-iskra-accent font-mono">
          Активирован упрощённый режим — без анимации и 3D-камеры. Каждый узел — дверь. Выбери ту, от которой хочется убежать.
        </p>
      </header>

      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {GROUP_ORDER.map((group) => (
          <section key={group.key}>
            <h2 className="text-iskra-primary font-mono uppercase tracking-wider text-sm mb-4">{group.title}</h2>
            <ul className="space-y-2">
              {TREE_NODES.filter((n: TreeNodeData) => n.group === group.key).map((node: TreeNodeData) => (
                <li key={node.id}>
                  <button
                    onClick={() => setActiveId(node.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                      activeId === node.id
                        ? 'bg-iskra-primary/20 border-iskra-primary text-iskra-text shadow-[0_0_20px_rgba(255,122,0,0.15)]'
                        : 'bg-iskra-surface/40 border-white/10 text-iskra-muted hover:text-iskra-text hover:border-white/20'
                    }`}
                  >
                    <span className="font-mono text-[10px] uppercase tracking-wider opacity-60 block">{node.shortLabel}</span>
                    <span className="block">{node.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      {activeNode && (
        <div
          role="region"
          aria-label="Описание узла"
          className="max-w-6xl mx-auto mt-12 p-6 md:p-8 rounded-2xl border border-iskra-primary/20 bg-iskra-surface/40"
        >
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <span className="font-mono text-xs uppercase tracking-wider text-iskra-primary">{activeNode.group}</span>
              <h3 className="font-serif text-2xl md:text-3xl text-iskra-text mt-1">{activeNode.label}</h3>
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(`${activeNode.label}\n\n${activeNode.longDescription ?? activeNode.description}\n\n${activeNode.invitation ?? ''}`)}
              className="p-2 rounded-lg border border-white/10 text-iskra-muted hover:text-iskra-text hover:border-iskra-primary/50 transition-colors"
              aria-label="Копировать описание"
              title="Копировать"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
          <p className="text-iskra-text leading-relaxed whitespace-pre-line">{activeNode.longDescription ?? activeNode.description}</p>
          {activeNode.invitation && (
            <div className="mt-6 p-4 rounded-xl border border-iskra-primary/30 bg-iskra-primary/10">
              <p className="text-xs font-mono uppercase tracking-wider text-iskra-primary mb-2">Приглашение</p>
              <p className="text-iskra-text">{activeNode.invitation}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
