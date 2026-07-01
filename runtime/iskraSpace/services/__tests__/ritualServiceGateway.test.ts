import { describe, expect, it, vi, beforeEach } from 'vitest';

const generateTextMock = vi.hoisted(() => vi.fn());

vi.mock('../geminiService', () => ({
  generateText: generateTextMock,
}));

import { COUNCIL_ORDER, executeCouncil, type CouncilResponse } from '../ritualService';

async function collectCouncil(topic = 'release boundary') {
  const responses: CouncilResponse[] = [];
  for await (const response of executeCouncil(topic)) {
    responses.push(response);
  }
  return responses;
}

describe('ritualService AI gateway boundary', () => {
  beforeEach(() => {
    generateTextMock.mockReset();
  });

  it('routes all council voices through the Edge gateway text wrapper', async () => {
    generateTextMock.mockImplementation(async () => `edge-response-${generateTextMock.mock.calls.length}`);

    const responses = await collectCouncil();

    expect(generateTextMock).toHaveBeenCalledTimes(COUNCIL_ORDER.length);
    expect(responses).toHaveLength(COUNCIL_ORDER.length);
    expect(responses.map(response => response.voice)).toEqual(COUNCIL_ORDER);
    expect(responses.every(response => response.message.startsWith('edge-response-'))).toBe(true);
  });

  it('keeps canonical voice order and isolates a partial gateway failure', async () => {
    generateTextMock.mockImplementation(async () => {
      if (generateTextMock.mock.calls.length === 4) {
        throw new Error('edge timeout');
      }
      return `edge-response-${generateTextMock.mock.calls.length}`;
    });

    const responses = await collectCouncil();

    expect(responses.map(response => response.voice)).toEqual(COUNCIL_ORDER);
    expect(responses[3].voice).toBe(COUNCIL_ORDER[3]);
    expect(responses[3].message).not.toContain('edge-response');
    expect(responses.filter(response => response.message.startsWith('edge-response-'))).toHaveLength(COUNCIL_ORDER.length - 1);
  });
});
