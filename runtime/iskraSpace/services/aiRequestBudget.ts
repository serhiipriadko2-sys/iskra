import type { Message } from '../types';

export const AI_EDGE_MAX_CONTENTS = 8;
export const AI_EDGE_MAX_TEXT_CHARACTERS = 12_000;
const AI_EDGE_TRUNCATION_MARKER = '\n...[truncated to AI Edge budget]...\n';

export type AiEdgeContent = {
  role: Message['role'];
  parts: Array<{ text: string }>;
};

export type BudgetableAiContent = {
  role?: Message['role'];
  parts?: ReadonlyArray<{ text?: string }>;
};

export function truncateAiText(text: string, maxCharacters: number): string {
  if (text.length <= maxCharacters) return text;
  if (maxCharacters <= 0) return '';
  if (maxCharacters <= AI_EDGE_TRUNCATION_MARKER.length) {
    return text.slice(0, maxCharacters);
  }

  const available = maxCharacters - AI_EDGE_TRUNCATION_MARKER.length;
  const head = Math.ceil(available / 2);
  const tail = Math.floor(available / 2);
  const suffix = tail > 0 ? text.slice(-tail) : '';
  return `${text.slice(0, head)}${AI_EDGE_TRUNCATION_MARKER}${suffix}`;
}

/**
 * Final client-side boundary shared by every Gemini request path.
 * It retains the newest content and preserves both ends of an oversized prompt,
 * so generated framing and the most recent context remain visible.
 */
export function budgetAiEdgeContents(
  contents: readonly BudgetableAiContent[],
  systemInstruction = '',
): AiEdgeContent[] {
  let remainingCharacters = AI_EDGE_MAX_TEXT_CHARACTERS - systemInstruction.length;
  if (remainingCharacters <= 0) {
    throw new Error('ai_system_instruction_too_large');
  }

  const selected: AiEdgeContent[] = [];
  const candidates = contents.slice(-AI_EDGE_MAX_CONTENTS);

  for (let contentIndex = candidates.length - 1; contentIndex >= 0; contentIndex -= 1) {
    const content = candidates[contentIndex];
    if (!content) continue;

    const selectedParts: Array<{ text: string }> = [];
    const parts = content.parts ?? [];
    for (let partIndex = parts.length - 1; partIndex >= 0; partIndex -= 1) {
      const text = parts[partIndex]?.text;
      if (typeof text !== 'string' || text.length === 0 || remainingCharacters <= 0) continue;
      const budgeted = truncateAiText(text, remainingCharacters);
      if (budgeted) {
        selectedParts.unshift({ text: budgeted });
        remainingCharacters -= budgeted.length;
      }
    }

    if (selectedParts.length > 0) {
      selected.unshift({
        role: content.role ?? 'user',
        parts: selectedParts,
      });
    }
    if (remainingCharacters <= 0) break;
  }

  if (selected.length === 0) throw new Error('ai_request_has_no_text');
  return selected;
}

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
