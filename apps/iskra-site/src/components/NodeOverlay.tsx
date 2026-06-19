import { findNodeById } from '../lib/treeData';
import type { TreeNodeData } from '../lib/treeData';
import { X } from './icons';
import { NodeContent } from './NodeContent';

interface NodeOverlayProps {
  activeNodeId: string | null;
  onClose: () => void;
}

const GROUP_LABELS: Record<TreeNodeData['group'], string> = {
  soil: 'Почва',
  roots: 'Корни',
  trunk: 'Ствол',
  branches: 'Ветви',
  crown: 'Крона',
  leaves: 'Листья кроны',
};

export function NodeOverlay({ activeNodeId, onClose }: NodeOverlayProps) {
  const node = activeNodeId ? findNodeById(activeNodeId) : null;
  if (!node) return null;

  return (
    <div className="fixed inset-2 md:inset-auto md:right-4 md:top-4 md:bottom-4 z-40 md:w-full md:max-w-lg flex flex-col pointer-events-none">
      <div className="glass-card flex-1 overflow-y-auto p-5 md:p-8 pointer-events-auto animate-in zoom-in-95 md:slide-in-from-right duration-300">
        <div className="flex items-start justify-between mb-5">
          <div>
            <span className="font-mono text-xs uppercase tracking-wider text-iskra-primary">
              {GROUP_LABELS[node.group]}
            </span>
            <h2 className="font-serif text-2xl md:text-4xl text-iskra-text mt-1">{node.label}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Закрыть"
          >
            <X className="w-5 h-5 text-iskra-muted" />
          </button>
        </div>

        <NodeContent node={node} />
      </div>
    </div>
  );
}
