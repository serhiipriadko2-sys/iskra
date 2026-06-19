import { findNodeById } from '../lib/treeData';
import type { TreeNodeData } from '../lib/treeData';
import { X, ChevronRight } from './icons';

interface NodeOverlayProps {
  activeNodeId: string | null;
  onClose: () => void;
  onNavigate: (id: string) => void;
}

const GROUP_LABELS: Record<TreeNodeData['group'], string> = {
  soil: 'Почва',
  roots: 'Корни',
  trunk: 'Ствол',
  branches: 'Ветви',
  crown: 'Крона',
  leaves: 'Листья кроны',
};

function VoiceCard({ node, onClick }: { node: TreeNodeData; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group text-left p-4 rounded-xl border border-white/10 bg-iskra-surface/40 hover:border-iskra-primary/50 transition-all"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xl">{node.symbol || '◉'}</span>
        <ChevronRight className="w-4 h-4 text-iskra-muted group-hover:text-iskra-primary transition-colors" />
      </div>
      <h4 className="font-serif text-lg text-iskra-text mb-1">{node.label}</h4>
      <p className="text-xs text-iskra-muted line-clamp-2">{node.description}</p>
    </button>
  );
}

export function NodeOverlay({ activeNodeId, onClose, onNavigate }: NodeOverlayProps) {
  const node = activeNodeId ? findNodeById(activeNodeId) : null;
  if (!node) return null;

  const isVoiceGroup = node.children?.every((c) => c.group === 'leaves');

  return (
    <div className="fixed right-4 top-4 bottom-4 z-40 w-full max-w-md flex flex-col pointer-events-none">
      <div className="glass-card flex-1 overflow-y-auto p-6 md:p-8 pointer-events-auto animate-in slide-in-from-right duration-500">
        <div className="flex items-start justify-between mb-6">
          <div>
            <span className="font-mono text-xs uppercase tracking-wider text-iskra-primary">
              {GROUP_LABELS[node.group]}
            </span>
            <h2 className="font-serif text-3xl md:text-4xl text-iskra-text mt-1">{node.label}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Закрыть"
          >
            <X className="w-5 h-5 text-iskra-muted" />
          </button>
        </div>

        <p className="text-iskra-muted leading-relaxed whitespace-pre-line mb-8">{node.description}</p>

        {isVoiceGroup && node.children && (
          <div>
            <h3 className="font-mono text-sm uppercase tracking-wider text-iskra-accent mb-4">Голоса совета</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {node.children.map((child) => (
                <VoiceCard key={child.id} node={child} onClick={() => onNavigate(child.id)} />
              ))}
            </div>
          </div>
        )}

        {node.children && !isVoiceGroup && node.children.some((c) => c.group !== 'leaves') && (
          <div>
            <h3 className="font-mono text-sm uppercase tracking-wider text-iskra-accent mb-4">Связанные узлы</h3>
            <div className="flex flex-wrap gap-2">
              {node.children.map((child) => (
                <button
                  key={child.id}
                  onClick={() => onNavigate(child.id)}
                  className="px-3 py-1.5 rounded-full text-sm border border-white/10 bg-iskra-surface/40 hover:border-iskra-primary/50 text-iskra-text transition-colors"
                >
                  {child.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
