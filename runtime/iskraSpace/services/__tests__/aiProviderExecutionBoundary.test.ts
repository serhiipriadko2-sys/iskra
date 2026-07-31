import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createDeadline } from '../../supabase/functions/_shared/aiContentPolicy.ts';
import {
  createStreamByteBudget,
  encodeWithinStreamBudget,
} from '../../supabase/functions/_shared/aiProviderLimits.ts';

const here = dirname(fileURLToPath(import.meta.url));
const handlerSource = readFileSync(
  join(here, '../../supabase/functions/gemini/index.ts'),
  'utf8',
);
const clientSource = readFileSync(join(here, '../geminiService.ts'), 'utf8');

afterEach(() => {
  vi.useRealTimers();
});

describe('server provider execution boundary', () => {
  it('aborts at the server deadline and dispose cancels the timer', async () => {
    vi.useFakeTimers();
    const expired = createDeadline(undefined, 25);
    await vi.advanceTimersByTimeAsync(25);
    expect(expired.signal.aborted).toBe(true);
    expired.dispose();
    const disposed = createDeadline(undefined, 25);
    disposed.dispose();
    await vi.advanceTimersByTimeAsync(25);
    expect(disposed.signal.aborted).toBe(false);
  });

  it('propagates parent cancellation into the provider signal', () => {
    const parent = new AbortController();
    const deadline = createDeadline(parent.signal, 10_000);
    parent.abort();
    expect(deadline.signal.aborted).toBe(true);
    deadline.dispose();
  });

  it('counts encoded bytes exactly and fails closed at the cap', () => {
    const budget = createStreamByteBudget(5);
    expect(encodeWithinStreamBudget('é', budget)?.byteLength).toBe(2);
    expect(encodeWithinStreamBudget('abc', budget)?.byteLength).toBe(3);
    expect(budget.used).toBe(5);
    expect(encodeWithinStreamBudget('x', budget)).toBeNull();
    expect(budget.used).toBe(5);
  });

  it('binds provider attempts and streams to server-owned limits', () => {
    expect(handlerSource).toContain('MAX_AI_PROVIDER_TIMEOUT_MS');
    expect(handlerSource).toContain('MAX_AI_STREAM_DURATION_MS');
    expect(handlerSource).toContain('MAX_AI_STREAM_BYTES');
    expect(handlerSource).toContain('createDeadline(parentSignal, MAX_AI_PROVIDER_TIMEOUT_MS)');
    expect(handlerSource).toContain('createDeadline(parentSignal, MAX_AI_STREAM_DURATION_MS)');
    expect(handlerSource).toContain('createStreamByteBudget(MAX_AI_STREAM_BYTES)');
    expect(handlerSource).toContain('encodeWithinStreamBudget');
    expect(handlerSource).toContain('controller.error');
    expect(handlerSource).toContain('cancel()');
    expect(handlerSource).toContain('await runWithFallback(');
    expect(handlerSource).toContain('requestDeadline.signal');
    expect(handlerSource).toContain('const emittedBytes = budget.used > bytesBeforeAttempt');
  });

  it('does not replay generation after an SSE stream is established', () => {
    expect(clientSource).toContain('let streamEstablished = false');
    expect(clientSource).toContain('streamEstablished = true');
    expect(clientSource).toContain('if (streamEstablished) throw err;');
  });
});
