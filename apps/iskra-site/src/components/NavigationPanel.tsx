import { getAnchorForGroup } from '../lib/treeData';
import type { TreeNodeData } from '../lib/treeData';

interface NavigationPanelProps {
  activeNodeId: string | null;
  onNavigate: (id: string | null) => void;
}

const GROUPS: { key: TreeNodeData['group']; label: string; icon: string }[] = [
  { key: 'soil', label: 'Почва', icon: '❖' },
  { key: 'roots', label: 'Корни', icon: '△' },
  { key: 'trunk', label: 'Ствол', icon: '◈' },
  { key: 'branches', label: 'Ветви', icon: '✦' },
  { key: 'crown', label: 'Крона', icon: '◉' },
];

export function NavigationPanel({ activeNodeId, onNavigate }: NavigationPanelProps) {
  const isGroupActive = (group: TreeNodeData['group']) => {
    const anchor = getAnchorForGroup(group);
    return anchor?.id === activeNodeId;
  };

  return (
    <nav className="fixed left-4 top-1/2 -translate-y-1/2 z-30 hidden lg:flex flex-col gap-3">
      <button
        onClick={() => onNavigate(null)}
        className={`text-left px-4 py-2 rounded-full font-mono text-xs uppercase tracking-wider transition-all border flex items-center gap-2 ${
          activeNodeId === null
            ? 'bg-iskra-primary text-black border-iskra-primary shadow-[0_0_20px_rgba(255,122,0,0.4)]'
            : 'bg-iskra-surface/60 text-iskra-muted border-white/10 hover:border-iskra-primary/50 hover:text-iskra-text'
        }`}
      >
        <span>✦</span>
        <span>Древо Искры</span>
      </button>
      {GROUPS.map((group) => (
        <button
          key={group.key}
          onClick={() => {
            const anchor = getAnchorForGroup(group.key);
            if (anchor) onNavigate(anchor.id);
          }}
          className={`text-left px-4 py-2 rounded-full font-mono text-xs uppercase tracking-wider transition-all border flex items-center gap-2 ${
            isGroupActive(group.key)
              ? 'bg-iskra-primary text-black border-iskra-primary shadow-[0_0_20px_rgba(255,122,0,0.4)]'
              : 'bg-iskra-surface/60 text-iskra-muted border-white/10 hover:border-iskra-primary/50 hover:text-iskra-text'
          }`}
        >
          <span>{group.icon}</span>
          <span>{group.label}</span>
        </button>
      ))}
    </nav>
  );
}
