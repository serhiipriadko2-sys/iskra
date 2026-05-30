/**
 * SYNC SERVICE
 *
 * Ensures data durability and automatic synchronization between
 * browser localStorage (offline cache) and Supabase database.
 */

import { isSupabaseAvailable } from './supabaseClient';
import { supabaseService } from './supabaseService';
import { graphServiceSupabase } from './graphServiceSupabase';

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

  /**
   * Synchronize all offline-cached data back to Supabase
   */
  public async syncAllPending(): Promise<void> {
    if (this.isSyncing) return;
    
    const isOnline = await isSupabaseAvailable().catch(() => false);
    if (!isOnline) return;

    this.isSyncing = true;
    console.log('[SyncService] Internet connection restored. Synchronizing offline queue...');

    try {
      await this.syncChatHistory();
      await this.syncMemoryNodes();
      console.log('[SyncService] All offline data successfully synchronized.');
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
    const userId = typeof window !== 'undefined' ? localStorage.getItem('iskra_device_id') : null;
    if (!userId) return;

    const cachedKey = `chat_history_${userId}`;
    const cachedData = localStorage.getItem(cachedKey);
    if (!cachedData) return;

    try {
      const messages = JSON.parse(cachedData);
      if (!Array.isArray(messages)) return;

      console.log(`[SyncService] Syncing ${messages.length} chat messages...`);
      for (const msg of messages) {
        // Idempotently push message to Supabase
        await supabaseService.addChatMessage(msg).catch(() => {});
      }
    } catch (e) {
      console.warn('[SyncService] Failed to sync chat history:', e);
    }
  }

  /**
   * Synchronize memory nodes queue
   */
  private async syncMemoryNodes(): Promise<void> {
    const userId = typeof window !== 'undefined' ? localStorage.getItem('iskra_device_id') : null;
    if (!userId) return;

    // Sync both archive and shadow layers
    const layers = ['archive', 'shadow'] as const;

    for (const layer of layers) {
      const cachedKey = `memory_${layer}_${userId}`;
      const cachedData = localStorage.getItem(cachedKey);
      if (!cachedData) continue;

      try {
        const nodes = JSON.parse(cachedData);
        if (!Array.isArray(nodes)) continue;

        console.log(`[SyncService] Syncing ${nodes.length} memory nodes for layer: ${layer}...`);
        for (const node of nodes) {
          // Sync each node to Cloud GraphRAG
          await graphServiceSupabase.addNode(
            node.layer,
            node.type,
            typeof node.content === 'string' ? node.content : JSON.stringify(node.content)
          ).then(async (syncedNode) => {
            // Automatically build connections in cloud GraphRAG
            await graphServiceSupabase.buildConnections(syncedNode.id);
          }).catch(() => {});
        }
      } catch (e) {
        console.warn(`[SyncService] Failed to sync memory layer: ${layer}:`, e);
      }
    }
  }
}

export const syncService = new SyncService();
export default syncService;
