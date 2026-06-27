import { findNodeById } from '../lib/treeData';

interface TooltipOverlayProps {
  activeNodeId: string | null;
}

export function TooltipOverlay({ activeNodeId }: TooltipOverlayProps) {
  const node = activeNodeId ? findNodeById(activeNodeId) : null;
  if (!node) {
    return (
      <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none hidden md:block">
        <div className="glass-card px-6 py-3 text-center">
          <p className="font-mono text-xs text-iskra-muted uppercase tracking-wider">
            Наведите или кликните узел • ← → ↑ ↓ • Home • Esc
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none hidden md:block">
      <div className="glass-card px-6 py-4 text-center max-w-lg">
        <p className="font-mono text-xs uppercase tracking-wider text-iskra-primary mb-1">{node.group}</p>
        <h3 className="font-serif text-xl text-iskra-text">{node.label}</h3>
        <p className="text-sm text-iskra-muted mt-1 line-clamp-2">{node.description}</p>
      </div>
    </div>
  );
}
