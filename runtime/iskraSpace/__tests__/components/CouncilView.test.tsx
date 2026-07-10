import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const executeCouncilMock = vi.hoisted(() => vi.fn());

vi.mock('../../services/ritualService', async () => {
  const actual = await vi.importActual<typeof import('../../services/ritualService')>(
    '../../services/ritualService'
  );
  return {
    ...actual,
    executeCouncil: executeCouncilMock,
  };
});

import CouncilView from '../../components/CouncilView';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | null = null;
let container: HTMLDivElement | null = null;

function setTextareaValue(textarea: HTMLTextAreaElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set;
  setter?.call(textarea, value);
  textarea.dispatchEvent(new Event('input', { bubbles: true }));
}

beforeEach(() => {
  executeCouncilMock.mockReset();
});

afterEach(async () => {
  await act(async () => {
    root?.unmount();
  });
  container?.remove();
  root = null;
  container = null;
});

describe('CouncilView cancellation boundary', () => {
  it('aborts the active Council run when the user presses Cancel', async () => {
    let observedSignal: AbortSignal | undefined;
    executeCouncilMock.mockImplementation(
      (_topic: string, _context?: string, options?: { signal?: AbortSignal }) =>
        (async function* () {
          observedSignal = options?.signal;
          await new Promise<void>((resolve) => {
            options?.signal?.addEventListener('abort', () => resolve(), { once: true });
          });
        })()
    );

    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    await act(async () => {
      root?.render(<CouncilView />);
    });

    const textarea = container.querySelector<HTMLTextAreaElement>('textarea');
    const startButton = [...container.querySelectorAll<HTMLButtonElement>('button')]
      .find((button) => button.textContent?.includes('Созвать Совет'));
    expect(textarea).toBeInstanceOf(HTMLTextAreaElement);
    expect(startButton).toBeInstanceOf(HTMLButtonElement);

    await act(async () => {
      setTextareaValue(textarea!, 'Проверка отмены');
      startButton?.click();
    });

    expect(executeCouncilMock).toHaveBeenCalledTimes(1);
    const cancelButton = container.querySelector<HTMLButtonElement>(
      'button[aria-label="Отменить Совет"]'
    );
    expect(cancelButton).toBeInstanceOf(HTMLButtonElement);

    await act(async () => {
      cancelButton?.click();
    });

    expect(observedSignal?.aborted).toBe(true);
  });

  it('aborts an active Council run when the view unmounts', async () => {
    let observedSignal: AbortSignal | undefined;
    executeCouncilMock.mockImplementation(
      (_topic: string, _context?: string, options?: { signal?: AbortSignal }) =>
        (async function* () {
          observedSignal = options?.signal;
          await new Promise<void>((resolve) => {
            options?.signal?.addEventListener('abort', () => resolve(), { once: true });
          });
        })()
    );

    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    await act(async () => {
      root?.render(<CouncilView />);
    });

    const textarea = container.querySelector<HTMLTextAreaElement>('textarea');
    const startButton = [...container.querySelectorAll<HTMLButtonElement>('button')]
      .find((button) => button.textContent?.includes('Созвать Совет'));
    await act(async () => {
      setTextareaValue(textarea!, 'Проверка размонтирования');
      startButton?.click();
    });

    await act(async () => {
      root?.unmount();
    });

    expect(observedSignal?.aborted).toBe(true);
    root = null;
  });

  it('renders settled responses in canonical voice order rather than completion order', async () => {
    executeCouncilMock.mockImplementation(
      () =>
        (async function* () {
          yield { voice: 'KAIN', symbol: '⚑', message: 'fast', status: 'ok' };
          yield { voice: 'SAM', symbol: '☉', message: 'slow', status: 'ok' };
        })()
    );

    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    await act(async () => {
      root?.render(<CouncilView />);
    });

    const textarea = container.querySelector<HTMLTextAreaElement>('textarea');
    const startButton = [...container.querySelectorAll<HTMLButtonElement>('button')]
      .find((button) => button.textContent?.includes('Созвать Совет'));
    await act(async () => {
      setTextareaValue(textarea!, 'Порядок голосов');
      startButton?.click();
      await Promise.resolve();
      await Promise.resolve();
    });

    const renderedVoices = [...container.querySelectorAll<HTMLElement>('[data-council-voice]')]
      .map((element) => element.dataset.councilVoice);
    expect(renderedVoices).toEqual(['SAM', 'KAIN']);
  });
});
