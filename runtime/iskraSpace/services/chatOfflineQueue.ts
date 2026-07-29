export interface OfflineChatMessage {
  role: 'user' | 'model';
  text: string;
}

export function chatHistoryCacheKey(principalId: string): string {
  return `chat_history_${principalId}`;
}

export function chatPendingQueueKey(principalId: string): string {
  return `chat_pending_${principalId}`;
}

export function parseChatMessages<T extends OfflineChatMessage = OfflineChatMessage>(
  raw: string | null,
): T[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((value): value is T => (
      typeof value === 'object' &&
      value !== null &&
      ((value as { role?: unknown }).role === 'user' || (value as { role?: unknown }).role === 'model') &&
      typeof (value as { text?: unknown }).text === 'string'
    ));
  } catch {
    return [];
  }
}
