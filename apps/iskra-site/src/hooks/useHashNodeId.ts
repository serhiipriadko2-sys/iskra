import { useEffect, useRef } from 'react';
import { findNodeById } from '../lib/treeData';

export function useHashNodeId(activeNodeId: string | null, onNavigate: (id: string | null) => void) {
  const isUpdatingHash = useRef(false);

  // Sync hash -> active node on mount and hash changes.
  useEffect(() => {
    const handleHashChange = () => {
      if (isUpdatingHash.current) return;
      const hash = window.location.hash.replace(/^#/, '');
      if (!hash) {
        onNavigate(null);
        return;
      }
      const node = findNodeById(hash);
      if (node) {
        onNavigate(node.id);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [onNavigate]);

  // Sync active node -> hash.
  useEffect(() => {
    const currentHash = window.location.hash.replace(/^#/, '');
    if (activeNodeId === currentHash) return;
    isUpdatingHash.current = true;
    if (activeNodeId) {
      window.location.hash = activeNodeId;
    } else {
      // Remove hash without scrolling.
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    // Release lock after the event has propagated.
    const timer = setTimeout(() => {
      isUpdatingHash.current = false;
    }, 0);
    return () => clearTimeout(timer);
  }, [activeNodeId]);
}
