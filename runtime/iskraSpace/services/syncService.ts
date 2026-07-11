/**
 * SYNC SERVICE
 *
 * Ensures data durability and automatic synchronization between
 * browser localStorage (offline cache) and Supabase database.
 */

import { ensureSupabaseSession, getLegacyDeviceId, isSupabaseAvailable } from './supabaseClient';
import { supabaseService } from './supabaseService';
import { graphServiceSupabase } from './graphServiceSupabase';
import {
  isMemoryLayer,
  isMemoryNodeType,
  type MemoryNode,
} from '../types';

export class SyncService {
  private isSyncing = false;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.syncAllPending().catch(err => 
          console.error('[SyncService] Background sync failed:', err)
        );
      });
    }
  }

  private async getOfflineQueueOwnerKeys(): Promise<string[]> {
    if (typeof window === 'undefined') return [];

    const ownerKeys = new Set<string>();
    const authenticatedUserId = await ensureSupabaseSession().catch(() => null);
    if (authenticatedUserId) {
      ownerKeys.add(authenticatedUserId);
    }

    // Legacy device id is read only as a migration source for old offline queues.
    const legacyDeviceId = getLegacyDeviceId();
    if (legacyDeviceId) {
      ownerKeys.add(legacyDeviceId);
    }

    return Array.from(ownerKeys);
  }

  /**
   * Synchronize all offline-cached data back to Supabase
   */
  public async syncAllPending(): Promise<void> {
    if (this.isSyncing) return;
    
    const isOnline = await isSupabaseAvailable().catch(() => false);
    if (!isOnline) return;

    this.isSyncing = true;
    try {
      await this.syncChatHistory();
      await this.syncMemoryNodes();
    } catch (error) {
      console.error('[SyncService] Synchronization error:', error);
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Synchronize chat history queue
   */
  private async syncChatHistory(): Promise<void> {
    const ownerKeys = await this.getOfflineQueueOwnerKeys();

    for (const ownerKey of ownerKeys) {
      const cachedKey = `chat_history_${ownerKey}`;
      const cachedData = localStorage.getItem(cachedKey);
      if (!cachedData) continue;

      try {
        const messages = JSON.parse(cachedData);
        if (!Array.isArray(messages)) continue;

        for (const msg of messages) {
          // Supabase service writes to the current auth.uid(); ownerKey is queue provenance only.
          await supabaseService.addChatMessage(msg).catch(() => {});
        }
      } catch (e) {
        console.warn(`[SyncService] Failed to sync chat history from ${cachedKey}:`, e);
      }
    }
  }

  /**
   * Synchronize memory nodes queue.
   * Nodes with `synced_to_cloud === true` are skipped to prevent duplicates (P2-01).
   *
   * This is the single coordinator for uploading local memory nodes to Supabase GraphRAG.
   * `memoryService` no longer performs eager background uploads; it only persists nodes
   * locally and marks them as `synced_to_cloud: false`.
   */
  private async syncMemoryNodes(): Promise<void> {
    const ownerKeys = await this.getOfflineQueueOwnerKeys();
    const layers = ['archive', 'shadow'] as const;

    // 1. Migration path: legacy per-owner queues written by older app versions.
    //    These queues are processed once and then removed.
    for (const ownerKey of ownerKeys) {
      for (const layer of layers) {
        const cachedKey = `memory_${layer}_${ownerKey}`;
        const cachedData = localStorage.getItem(cachedKey);
        if (!cachedData) continue;

        try {
          const nodes: Array<{ id?: string; layer: string; type: string; content: unknown }> =
            JSON.parse(cachedData);
          if (!Array.isArray(nodes)) {
            localStorage.removeItem(cachedKey);
            continue;
          }

          console.warn(`[SyncService] Migrating ${nodes.length} legacy memory nodes for layer: ${layer}`);

          let allMigrated = true;
          for (const node of nodes) {
            try {
              if (!isMemoryLayer(node.layer) || !isMemoryNodeType(node.type)) {
                allMigrated = false;
                continue;
              }
              const syncedNode = await graphServiceSupabase.addNode(
                node.layer,
                node.type,
                typeof node.content === 'string' ? node.content : JSON.stringify(node.content)
              );
              await graphServiceSupabase.buildConnections(syncedNode.id).catch(() => {});
            } catch {
              // Mark failure but keep processing other nodes in the queue.
              allMigrated = false;
            }
          }

          if (allMigrated) {
            localStorage.removeItem(cachedKey);
          }
        } catch (e) {
          console.warn(`[SyncService] Failed to migrate legacy memory layer from ${cachedKey}:`, e);
        }
      }
    }

    // 2. Primary path: current app-local memory stores.
    const storageKeys: Record<typeof layers[number], string> = {
      archive: 'iskra-space-archive',
      shadow: 'iskra-space-shadow',
    };

    for (const layer of layers) {
      const cachedKey = storageKeys[layer];
      const cachedData = localStorage.getItem(cachedKey);
      if (!cachedData) continue;

      try {
        const nodes: MemoryNode[] = JSON.parse(cachedData);
        if (!Array.isArray(nodes)) continue;

        const unsynced = nodes.filter(n => !n.synced_to_cloud);
        if (unsynced.length === 0) continue;

        console.warn(`[SyncService] Syncing ${unsynced.length} (of ${nodes.length}) memory nodes for layer: ${layer}`);

        const updatedNodes = [...nodes];

        for (const node of unsynced) {
          try {
            const syncedNode = await graphServiceSupabase.addNode(
              node.layer,
              node.type,
              typeof node.content === 'string' ? node.content : JSON.stringify(node.content)
            );
            // Automatically build connections in cloud GraphRAG
            await graphServiceSupabase.buildConnections(syncedNode.id).catch(() => {});

            // Mark node as synced in our local copy
            const idx = updatedNodes.findIndex(n => n.id === node.id);
            if (idx !== -1) updatedNodes[idx] = { ...updatedNodes[idx], synced_to_cloud: true };
          } catch {
            // Leave node unmarked — will retry next sync cycle
          }
        }

        // Persist updated sync flags back to localStorage
        localStorage.setItem(cachedKey, JSON.stringify(updatedNodes));
      } catch (e) {
        console.warn(`[SyncService] Failed to sync memory layer from ${cachedKey}:`, e);
      }
    }
  }
}

export const syncService = new SyncService();
export default syncService;
