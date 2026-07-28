import { describe, expect, it } from 'vitest';
import {
  AI_EDGE_MAX_CONTENTS,
  AI_EDGE_MAX_TEXT_CHARACTERS,
  selectRecentAiContents,
} from '../aiRequestBudget';
import type { Message } from '../../types';

function conversation(turns: number): Message[] {
  const result: Message[] = [{ role: 'model', text: 'welcome' }];
  for (let index = 1; index <= turns; index += 1) {
    result.push({ role: 'user', text: `user-${index}` });
    result.push({ role: 'model', text: `model-${index}` });
  }
  return result;
}

describe('AI request budget', () => {
  it('keeps the newest complete chat window within the server content count', () => {
    const selected = selectRecentAiContents(conversation(6), 'system');

    expect(selected.length).toBeLessThanOrEqual(AI_EDGE_MAX_CONTENTS);
    expect(selected[0]?.role).toBe('user');
    expect(selected.at(-1)?.parts[0]?.text).toBe('model-6');
    expect(selected.some(content => content.parts[0]?.text === 'welcome')).toBe(false);
  });

  it('trims old turns to leave room for the system instruction text budget', () => {
    const history: Message[] = [
      { role: 'user', text: 'old'.repeat(1_000) },
      { role: 'model', text: 'older'.repeat(1_000) },
      { role: 'user', text: 'latest-user' },
    ];
    const systemInstruction = 's'.repeat(AI_EDGE_MAX_TEXT_CHARACTERS - 100);
    const selected = selectRecentAiContents(history, systemInstruction);
    const selectedCharacters = selected.reduce(
      (total, content) => total + (content.parts[0]?.text.length ?? 0),
      0,
    );

    expect(systemInstruction.length + selectedCharacters).toBeLessThanOrEqual(
      AI_EDGE_MAX_TEXT_CHARACTERS,
    );
    expect(selected).toHaveLength(1);
    expect(selected[0]?.parts[0]?.text).toBe('latest-user');
  });

  it('rejects an oversized current message instead of silently truncating it', () => {
    expect(() => selectRecentAiContents(
      [{ role: 'user', text: 'x'.repeat(AI_EDGE_MAX_TEXT_CHARACTERS) }],
      'system',
    )).toThrow('ai_latest_message_too_large');
  });
});
