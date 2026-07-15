import { beforeEach, describe, expect, it, vi } from 'vitest';

const generateTextMock = vi.hoisted(() => vi.fn());

vi.mock('../geminiService', () => ({
  generateText: generateTextMock,
}));

import { COUNCIL_ORDER, executeCouncil, type CouncilResponse } from '../ritualService';

async function collectCouncil(
  topic = 'release boundary',
  options?: { signal?: AbortSignal; voiceTimeoutMs?: number }
) {
  const responses: CouncilResponse[] = [];
  for await (const response of executeCouncil(topic, undefined, options)) {
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
    expect(responses[3].status).toBe('error');
    expect(responses[3].message).not.toContain('edge-response');
    expect(responses.filter(response => response.message.startsWith('edge-response-'))).toHaveLength(COUNCIL_ORDER.length - 1);
  });

  it('passes a dedicated abort signal to every voice gateway request', async () => {
    let releaseSlowVoice: ((value: string) => void) | undefined;
    generateTextMock.mockImplementation(() => {
      if (generateTextMock.mock.calls.length === 1) {
        return new Promise<string>((resolve) => {
          releaseSlowVoice = resolve;
        });
      }
      return Promise.resolve('edge-response');
    });

    const iterator = executeCouncil('cancellable council');
    const firstResponse = iterator.next();
    await Promise.resolve();

    try {
      expect(generateTextMock).toHaveBeenCalledTimes(COUNCIL_ORDER.length);
      for (const [, options] of generateTextMock.mock.calls) {
        expect(options?.signal).toBeInstanceOf(AbortSignal);
      }
    } finally {
      releaseSlowVoice?.('late edge response');
      await firstResponse;
      await iterator.return(undefined);
    }
  });

  it('aborts a timed out voice while yielding the eight completed voice results', async () => {
    vi.useFakeTimers();
    const parent = new AbortController();
    let timedOutSignal: AbortSignal | undefined;

    generateTextMock.mockImplementation((_prompt: string, options?: { signal?: AbortSignal }) => {
      if (generateTextMock.mock.calls.length === 1) {
        timedOutSignal = options?.signal;
        return new Promise<string>((_resolve, reject) => {
          options?.signal?.addEventListener('abort', () => {
            reject(new DOMException('timed out', 'AbortError'));
          }, { once: true });
        });
      }
      return Promise.resolve(`edge-response-${generateTextMock.mock.calls.length}`);
    });

    const resultPromise = collectCouncil('bounded council', {
      signal: parent.signal,
      voiceTimeoutMs: 25,
    });

    try {
      await vi.advanceTimersByTimeAsync(25);
      let settled = false;
      void resultPromise.then(() => {
        settled = true;
      });
      await Promise.resolve();

      expect(settled).toBe(true);
      const responses = await resultPromise;
      expect(timedOutSignal?.aborted).toBe(true);
      expect(responses).toHaveLength(COUNCIL_ORDER.length);
      expect(responses.filter(response => response.status === 'ok')).toHaveLength(COUNCIL_ORDER.length - 1);
      expect(responses.find(response => response.voice === COUNCIL_ORDER[0])?.status).toBe('timeout');
    } finally {
      parent.abort();
      await resultPromise.catch(() => undefined);
      vi.useRealTimers();
    }
  });

  it('turns parent cancellation into explicit partial results for every pending voice', async () => {
    const parent = new AbortController();
    const signals: AbortSignal[] = [];

    generateTextMock.mockImplementation((_prompt: string, options?: { signal?: AbortSignal }) => {
      if (options?.signal) signals.push(options.signal);
      return new Promise<string>((_resolve, reject) => {
        options?.signal?.addEventListener('abort', () => {
          reject(new DOMException('cancelled', 'AbortError'));
        }, { once: true });
      });
    });

    const resultPromise = collectCouncil('cancelled council', { signal: parent.signal });
    await Promise.resolve();
    parent.abort();

    const responses = await resultPromise;

    expect(signals).toHaveLength(COUNCIL_ORDER.length);
    expect(signals.every((signal) => signal.aborted)).toBe(true);
    expect(responses).toHaveLength(COUNCIL_ORDER.length);
    expect(responses.every((response) => response.status === 'cancelled')).toBe(true);
  });
});
