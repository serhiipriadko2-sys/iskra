/**
 * SYNC SERVICE
 *
 * Ensures data durability and automatic synchronization between
 * browser localStorage (offline cache) and Supabase database.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import {
  createPinnedSupabaseClient,
  getBetaSession,
  getLegacyDeviceId,
  isSupabaseAvailable,
} from './supabaseClient';
import { supabaseService } from './supabaseService';
import { GraphServiceSupabase } from './graphServiceSupabase';
import { principalStorage, principalStorageKeyFor } from './principalStorage';
import { chatPendingQueueKey, parseChatMessages } from './chatOfflineQueue';
import type { Database } from '../types/supabase';
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

  private getOfflineQueueOwnerKeys(authenticatedUserId: string): string[] {
    if (typeof window === 'undefined') return [];

    const ownerKeys = new Set<string>([authenticatedUserId]);

    // Legacy device id is read only as a migration source for old offline queues.
    const legacyDeviceId = getLegacyDeviceId();
    if (legacyDeviceId) {
      ownerKeys.add(legacyDeviceId);
    }

    return Array.from(ownerKeys);
  }

  private isPinnedPrincipalCurrent(principalId: string): boolean {
    return principalStorage.activePrincipal() === principalId;
  }

  /**
   * Synchronize all offline-cached data back to Supabase
   */
  public async syncAllPending(): Promise<void> {
    if (this.isSyncing) return;
    this.isSyncing = true;
    try {
      const isOnline = await isSupabaseAvailable().catch(() => false);
      if (!isOnline) return;

      const access = await getBetaSession().catch(() => null);
      if (!access || access.status !== 'granted') return;

      const syncPrincipal = access.session.userId;
      if (!this.isPinnedPrincipalCurrent(syncPrincipal)) return;

      const pinnedClient = createPinnedSupabaseClient(access.session.accessToken);
      const pinnedGraphService = new GraphServiceSupabase(pinnedClient);

      await this.syncChatHistory(syncPrincipal, pinnedClient);
      if (this.isPinnedPrincipalCurrent(syncPrincipal)) {
        await this.syncMemoryNodes(syncPrincipal, pinnedGraphService);
      }
    } catch (error) {
      console.error('[SyncService] Synchronization error:', error);
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Synchronize chat history queue
   */
  private async syncChatHistory(
    syncPrincipal: string,
    pinnedClient: SupabaseClient<Database>,
  ): Promise<void> {
    const pendingKey = principalStorageKeyFor(
      syncPrincipal,
      chatPendingQueueKey(syncPrincipal),
    );
    const pendingMessages = parseChatMessages(localStorage.getItem(pendingKey));
    const remainingMessages: typeof pendingMessages = [];
    for (const message of pendingMessages) {
      if (!this.isPinnedPrincipalCurrent(syncPrincipal)) return;
      const synced = await supabaseService
        .addChatMessage(message, {
          queueOnFailure: false,
          client: pinnedClient,
          expectedUserId: syncPrincipal,
        })
        .catch(() => false);
      if (!synced) remainingMessages.push(message);
    }
    if (!this.isPinnedPrincipalCurrent(syncPrincipal)) return;
    if (remainingMessages.length > 0) {
      localStorage.setItem(pendingKey, JSON.stringify(remainingMessages));
    } else {
      localStorage.removeItem(pendingKey);
    }

    // Raw chat_history_* keys are migration-only queues from older app versions.
    const ownerKeys = this.getOfflineQueueOwnerKeys(syncPrincipal);

    for (const ownerKey of ownerKeys) {
      const cachedKey = `chat_history_${ownerKey}`;
      const cachedData = localStorage.getItem(cachedKey);
      if (!cachedData) continue;

      try {
        const messages = parseChatMessages(cachedData);
        if (messages.length === 0) {
          localStorage.removeItem(cachedKey);
          continue;
        }

        let allSynced = true;
        for (const msg of messages) {
          if (!this.isPinnedPrincipalCurrent(syncPrincipal)) return;
          // The pinned client fixes auth.uid() to syncPrincipal; ownerKey is queue provenance only.
          const synced = await supabaseService
            .addChatMessage(msg, {
              queueOnFailure: false,
              client: pinnedClient,
              expectedUserId: syncPrincipal,
            })
            .catch(() => false);
          if (!synced) allSynced = false;
        }
        if (allSynced) localStorage.removeItem(cachedKey);
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
  private async syncMemoryNodes(
    syncPrincipal: string,
    pinnedGraphService: GraphServiceSupabase,
  ): Promise<void> {
    const ownerKeys = this.getOfflineQueueOwnerKeys(syncPrincipal);
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
              if (!this.isPinnedPrincipalCurrent(syncPrincipal)) return;
              if (!isMemoryLayer(node.layer) || !isMemoryNodeType(node.type)) {
                allMigrated = false;
                continue;
              }
              const syncedNode = await pinnedGraphService.addNode(
                node.layer,
                node.type,
                typeof node.content === 'string' ? node.content : JSON.stringify(node.content)
              );
              if (!this.isPinnedPrincipalCurrent(syncPrincipal)) return;
              await pinnedGraphService.buildConnections(syncedNode.id).catch(() => {});
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

    // 2. Primary path: current principal-scoped app-local memory stores.
    //    Never bind here: AuthGate owns the identity transition. A mismatch
    //    fails closed instead of reading another principal's cache.
    if (
      principalStorage.activePrincipal() !== syncPrincipal ||
      !ownerKeys.includes(syncPrincipal)
    ) return;

    const storageKeys: Record<typeof layers[number], string> = {
      archive: 'iskra-space-archive',
      shadow: 'iskra-space-shadow',
    };

    for (const layer of layers) {
      const cachedKey = storageKeys[layer];
      const principalKey = principalStorageKeyFor(syncPrincipal, cachedKey);
      const cachedData = localStorage.getItem(principalKey);
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
            if (!this.isPinnedPrincipalCurrent(syncPrincipal)) return;
            const syncedNode = await pinnedGraphService.addNode(
              node.layer,
              node.type,
              typeof node.content === 'string' ? node.content : JSON.stringify(node.content)
            );
            // Automatically build connections in cloud GraphRAG
            if (!this.isPinnedPrincipalCurrent(syncPrincipal)) return;
            await pinnedGraphService.buildConnections(syncedNode.id).catch(() => {});

            // Mark node as synced in our local copy
            const idx = updatedNodes.findIndex(n => n.id === node.id);
            if (idx !== -1) updatedNodes[idx] = { ...updatedNodes[idx], synced_to_cloud: true };
          } catch {
            // Leave node unmarked — will retry next sync cycle
          }
        }

        // Persist updated sync flags back to the same principal namespace.
        if (!this.isPinnedPrincipalCurrent(syncPrincipal)) return;
        localStorage.setItem(principalKey, JSON.stringify(updatedNodes));
      } catch (e) {
        console.warn(`[SyncService] Failed to sync memory layer from ${cachedKey}:`, e);
      }
    }
  }
}

export const syncService = new SyncService();
export default syncService;
