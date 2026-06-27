import { useEffect, useCallback } from 'react';
import { allTreeNodes, findNodeById, TREE_NODES } from '../lib/treeData';

interface UseKeyboardNavigationProps {
  activeNodeId: string | null;
  showAtlas: boolean;
  onNavigate: (id: string | null) => void;
  onCloseAtlas: () => void;
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName.toLowerCase();
  return (
    tag === 'input' ||
    tag === 'textarea' ||
    tag === 'select' ||
    target.isContentEditable
  );
}

function findParent(nodeId: string): string | null {
  function walk(nodes: typeof TREE_NODES, parentId: string | null): string | null {
    for (const node of nodes) {
      if (node.id === nodeId) return parentId;
      if (node.children) {
        const found = walk(node.children, node.id);
        if (found !== null) return found;
      }
    }
    return null;
  }
  return walk(TREE_NODES, null);
}

const ORDER = allTreeNodes.map((n) => n.id);

export function useKeyboardNavigation({
  activeNodeId,
  showAtlas,
  onNavigate,
  onCloseAtlas,
}: UseKeyboardNavigationProps) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (showAtlas) {
        if (event.key === 'Escape') {
          event.preventDefault();
          onCloseAtlas();
        }
        return;
      }

      if (event.key === 'Escape') {
        if (activeNodeId) {
          event.preventDefault();
          onNavigate(null);
        }
        return;
      }

      if (event.key === 'Home') {
        event.preventDefault();
        onNavigate(null);
        return;
      }

      if (isTypingTarget(event.target)) return;

      const currentIndex = activeNodeId ? ORDER.indexOf(activeNodeId) : -1;

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        const nextIndex = currentIndex + 1 >= ORDER.length ? 0 : currentIndex + 1;
        onNavigate(ORDER[nextIndex]);
        return;
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        const prevIndex = currentIndex <= 0 ? ORDER.length - 1 : currentIndex - 1;
        onNavigate(ORDER[prevIndex]);
        return;
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault();
        if (activeNodeId) {
          const parentId = findParent(activeNodeId);
          if (parentId) onNavigate(parentId);
        }
        return;
      }

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        const node = activeNodeId ? findNodeById(activeNodeId) : null;
        if (node?.children?.length) {
          onNavigate(node.children[0].id);
        } else if (!activeNodeId) {
          onNavigate(ORDER[0]);
        }
        return;
      }
    },
    [activeNodeId, showAtlas, onNavigate, onCloseAtlas]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
