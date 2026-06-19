import { getAnchorForGroup } from '../lib/treeData';
import type { TreeNodeData } from '../lib/treeData';

interface MobileNavProps {
  activeNodeId: string | null;
  onNavigate: (id: string | null) => void;
}

const GROUPS: { key: TreeNodeData['group']; label: string }[] = [
  { key: 'soil', label: 'Почва' },
  { key: 'roots', label: 'Корни' },
  { key: 'trunk', label: 'Ствол' },
  { key: 'branches', label: 'Ветви' },
  { key: 'crown', label: 'Крона' },
];

export function MobileNav({ activeNodeId, onNavigate }: MobileNavProps) {
  const isGroupActive = (group: TreeNodeData['group']) => {
    const anchor = getAnchorForGroup(group);
    return anchor?.id === activeNodeId;
  };

  return (
    <nav className="fixed bottom-4 left-4 right-4 z-40 lg:hidden">
      <div className="glass-card p-2 flex gap-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => onNavigate(null)}
          className={`shrink-0 px-4 py-2 rounded-full font-mono text-[10px] uppercase tracking-wider transition-all border ${
            activeNodeId === null
              ? 'bg-iskra-primary text-black border-iskra-primary'
              : 'bg-iskra-surface/60 text-iskra-muted border-white/10'
          }`}
        >
          Древо
        </button>
        {GROUPS.map((group) => (
          <button
            key={group.key}
            onClick={() => {
              const anchor = getAnchorForGroup(group.key);
              if (anchor) onNavigate(anchor.id);
            }}
            className={`shrink-0 px-4 py-2 rounded-full font-mono text-[10px] uppercase tracking-wider transition-all border ${
              isGroupActive(group.key)
                ? 'bg-iskra-primary text-black border-iskra-primary'
                : 'bg-iskra-surface/60 text-iskra-muted border-white/10'
            }`}
          >
            {group.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
