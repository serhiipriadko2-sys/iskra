import { findNodeById, allTreeNodes } from '../lib/treeData';
import type { TreeNodeData } from '../lib/treeData';
import { X } from './icons';
import { NodeContent } from './NodeContent';

interface NodeOverlayProps {
  activeNodeId: string | null;
  onClose: () => void;
  onNavigate?: (id: string) => void;
  audienceMode?: import('../types').AudienceMode;
}

const GROUP_LABELS: Record<TreeNodeData['group'], string> = {
  soil: 'Почва',
  roots: 'Корни',
  trunk: 'Ствол',
  branches: 'Ветви',
  crown: 'Крона',
  leaves: 'Листья кроны',
};

export function NodeOverlay({ activeNodeId, onClose, onNavigate, audienceMode }: NodeOverlayProps) {
  const node = activeNodeId ? findNodeById(activeNodeId) : null;
  if (!node) return null;

  const currentIndex = activeNodeId ? allTreeNodes.findIndex((n) => n.id === activeNodeId) : -1;
  const prevNode = currentIndex > 0 ? allTreeNodes[currentIndex - 1] : null;
  const nextNode = currentIndex >= 0 && currentIndex < allTreeNodes.length - 1 ? allTreeNodes[currentIndex + 1] : null;

  const isWideNode = node.id === 'architecture' || node.id === 'start' || node.id === 'soil' || node.id === 'metrics';
  const widthClass = isWideNode
    ? 'md:w-[46rem] lg:w-[58rem] xl:w-[68rem]'
    : 'md:w-[28rem] lg:w-[32rem]';

  return (
    <div className={`fixed top-16 left-2 right-2 bottom-2 md:inset-auto md:right-4 md:top-20 md:bottom-4 z-40 ${widthClass} flex flex-col transition-all duration-300 pointer-events-none`}>
      <div className="glass-card flex-1 overflow-y-auto p-4 md:p-8 pointer-events-auto animate-in zoom-in-95 md:slide-in-from-right duration-300">
        <div className="flex items-start justify-between mb-4 md:mb-5">
          <div>
            <span className="font-mono text-xs uppercase tracking-wider text-iskra-primary">
              {GROUP_LABELS[node.group]}
            </span>
            <h2 className="font-serif text-xl md:text-3xl text-iskra-text mt-1">{node.label}</h2>
          </div>
          <div className="flex items-center gap-2">
            {onNavigate && (
              <div className="hidden sm:flex items-center gap-1 mr-1">
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

        <NodeContent node={node} audienceMode={audienceMode} />
      </div>
    </div>
  );
}
