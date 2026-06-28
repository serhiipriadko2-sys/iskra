import { useState } from 'react';
import { TREE_NODES, findNodeById } from '../lib/treeData';
import type { TreeNodeData } from '../lib/treeData';
import { heroContent } from '../lib/content';

const GROUP_ORDER: { key: TreeNodeData['group']; title: string }[] = [
  { key: 'soil', title: 'Почва' },
  { key: 'roots', title: 'Корни' },
  { key: 'trunk', title: 'Ствол' },
  { key: 'branches', title: 'Ветви' },
  { key: 'crown', title: 'Крона' },
];

export function ReducedMotionFallback() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const activeNode = activeId ? findNodeById(activeId) : null;

  return (
    <div className="min-h-screen bg-iskra-bg text-iskra-text p-6 md:p-12">
      <header className="max-w-6xl mx-auto mb-12">
        <h1 className="font-serif text-4xl md:text-6xl text-iskra-text mb-4">Древо Искры</h1>
        <p className="text-iskra-muted text-lg max-w-2xl">{heroContent.description}</p>
        <p className="mt-4 text-sm text-iskra-accent font-mono">
          Активирован упрощённый режим — без анимации и 3D-камеры.
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
                    className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                      activeId === node.id
                        ? 'bg-iskra-primary/20 border-iskra-primary text-iskra-text'
                        : 'bg-iskra-surface/40 border-white/10 text-iskra-muted hover:text-iskra-text'
                    }`}
                  >
                    {node.label}
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
          className="max-w-6xl mx-auto mt-12 p-6 md:p-8 rounded-2xl border border-white/10 bg-iskra-surface/40"
        >
          <h3 className="font-serif text-2xl md:text-3xl text-iskra-text mb-2">{activeNode.label}</h3>
          <p className="text-iskra-muted leading-relaxed whitespace-pre-line">{activeNode.description}</p>
        </div>
      )}
    </div>
  );
}
