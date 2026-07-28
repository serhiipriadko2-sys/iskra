import type { Message } from '../types';

export const AI_EDGE_MAX_CONTENTS = 8;
export const AI_EDGE_MAX_TEXT_CHARACTERS = 12_000;

export type AiEdgeContent = {
  role: Message['role'];
  parts: Array<{ text: string }>;
};

/**
 * Select the newest complete chat turns that fit the server-owned Edge budget.
 * The current user message is never silently truncated; an oversized latest
 * message fails locally before an authenticated provider request is attempted.
 */
export function selectRecentAiContents(
  history: readonly Message[],
  systemInstruction: string,
): AiEdgeContent[] {
  const availableCharacters = AI_EDGE_MAX_TEXT_CHARACTERS - systemInstruction.length;
  if (availableCharacters <= 0) {
    throw new Error('ai_system_instruction_too_large');
  }

  const selected: AiEdgeContent[] = [];
  let selectedCharacters = 0;

  for (let index = history.length - 1; index >= 0; index -= 1) {
    const message = history[index];
    if (!message) continue;

    if (selected.length === 0 && message.text.length > availableCharacters) {
      throw new Error('ai_latest_message_too_large');
    }
    if (
      selected.length >= AI_EDGE_MAX_CONTENTS ||
      selectedCharacters + message.text.length > availableCharacters
    ) {
      break;
    }

    selected.unshift({
      role: message.role,
      parts: [{ text: message.text }],
    });
    selectedCharacters += message.text.length;
  }

  // Avoid starting a request with an orphaned model response after trimming.
  if (selected.length > 1 && selected[0]?.role === 'model') {
    selected.shift();
  }

  return selected;
}
