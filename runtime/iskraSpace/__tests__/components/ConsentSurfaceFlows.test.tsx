import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_METRICS } from '../../types';
import { symbiosisService } from '../../services/symbiosisService';

const mocks = vi.hoisted(() => ({
  searchHybrid: vi.fn(),
  performDeepResearch: vi.fn(),
  generateFocusArtifact: vi.fn(),
  getArchive: vi.fn(),
  getShadow: vi.fn(),
  addArchiveEntry: vi.fn(),
  addFocusMinutes: vi.fn(),
}));

vi.mock('../../services/aiInteractionCoordinator', () => ({
  aiInteractionCoordinator: {
    performDeepResearch: mocks.performDeepResearch,
    generateFocusArtifact: mocks.generateFocusArtifact,
  },
}));

vi.mock('../../services/searchService', () => ({
  searchService: { searchHybrid: mocks.searchHybrid },
}));
vi.mock('../../services/memoryService', () => ({
  memoryService: {
    getArchive: mocks.getArchive,
    getShadow: mocks.getShadow,
    addArchiveEntry: mocks.addArchiveEntry,
  },
}));

vi.mock('../../services/userMetricsService', () => ({
  userMetricsService: { addFocusMinutes: mocks.addFocusMinutes },
}));

vi.mock('../../services/soundService', () => ({
  soundService: {
    playTone: vi.fn(),
    playRitualConnect: vi.fn(),
  },
}));

vi.mock('../../services/voiceEngine', () => ({
  getActiveVoice: () => ({
    name: 'ISKRA',
    symbol: '◇',
    description: 'test',
    activation: () => 1,
  }),
}));
vi.mock('../../components/MiniMetricsDisplay', () => ({
  default: () => null,
}));

import DeepResearchView from '../../components/DeepResearchView';
import FocusSession from '../../components/FocusSession';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | null = null;
let container: HTMLDivElement | null = null;

const render = async (element: React.ReactNode): Promise<void> => {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => {
    root?.render(element);
  });
};

const buttonByText = (text: string): HTMLButtonElement | undefined =>
  Array.from(container?.querySelectorAll('button') ?? [])
    .find(button => button.textContent?.includes(text));

const setTextarea = async (value: string): Promise<void> => {
  const textarea = container?.querySelector('textarea');
  if (!(textarea instanceof HTMLTextAreaElement)) throw new Error('textarea missing');
  const setter = Object.getOwnPropertyDescriptor(
    HTMLTextAreaElement.prototype,
    'value',
  )?.set;
  await act(async () => {
    setter?.call(textarea, value);
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
  });
};

beforeEach(() => {
  vi.useFakeTimers();
  vi.clearAllMocks();
  localStorage.clear();
  symbiosisService.completeOnboarding('CONSENTED');
  mocks.getArchive.mockReturnValue([
    { id: 'archive-1', title: 'Archive', content: 'context' },
  ]);
  mocks.getShadow.mockReturnValue([]);
  mocks.searchHybrid.mockResolvedValue([
    {
      id: 'journal-1',
      type: 'journal',
      title: 'Journal context',
      snippet: 'context',
      score: 1,
      meta: { ts: '2026-07-29T00:00:00.000Z' },
    },
  ]);
  mocks.performDeepResearch.mockResolvedValue({
    title: 'Report',
    synthesis: 'Synthesis',
    keyPatterns: [],
    tensionPoints: [],
    unseenConnections: [],
    reflectionQuestion: 'Question?',
  });
  mocks.generateFocusArtifact.mockResolvedValue({
    title: 'Artifact',
    description: 'Description',
    action: 'Action',
    rune: 'ᚠ',
  });

  vi.spyOn(window, 'requestAnimationFrame').mockImplementation(() => 1);
  vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => undefined);
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
    fillStyle: '',
    font: '',
    strokeStyle: '',
    fillRect: vi.fn(),
    save: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    fillText: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    restore: vi.fn(),
  } as unknown as CanvasRenderingContext2D);
});
afterEach(async () => {
  await act(async () => {
    root?.unmount();
  });
  container?.remove();
  root = null;
  container = null;
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('DeepResearch consent surface smoke', () => {
  it('does not search or call AI before grant, then records the action', async () => {
    await render(<DeepResearchView metrics={DEFAULT_METRICS} />);
    await setTextarea('Исследовать паттерн');

    const textarea = container?.querySelector('textarea');
    const start = textarea?.parentElement?.querySelector('button');
    await act(async () => {
      start?.click();
    });

    expect(container?.textContent).toContain('Разрешить глубокое AI-исследование?');
    expect(mocks.searchHybrid).not.toHaveBeenCalled();
    expect(mocks.performDeepResearch).not.toHaveBeenCalled();

    await act(async () => {
      buttonByText('Разрешить исследование')?.click();
      await vi.runAllTimersAsync();
    });
    expect(mocks.searchHybrid).toHaveBeenCalledOnce();
    expect(mocks.performDeepResearch).toHaveBeenCalledOnce();
    expect(symbiosisService.getActionReceipts()).toContainEqual(
      expect.objectContaining({
        action: 'ai.research.deep',
        result: 'DONE',
        read_back: 'VERIFIED',
        permission_ref: expect.stringMatching(/^consent_/),
      }),
    );
  });
});

describe('Focus consent surface smoke', () => {
  it('pauses before deep dive and records the granted action', async () => {
    await render(<FocusSession onClose={vi.fn()} />);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(751_000);
    });

    expect(container?.textContent).toContain('Создать AI-артефакт фокуса?');
    expect(mocks.generateFocusArtifact).not.toHaveBeenCalled();

    await act(async () => {
      buttonByText('Разрешить один deep dive')?.click();
      await Promise.resolve();
    });
    expect(mocks.generateFocusArtifact).toHaveBeenCalledOnce();
    expect(symbiosisService.getActionReceipts()).toContainEqual(
      expect.objectContaining({
        action: 'ai.focus.artifact',
        result: 'DONE',
        read_back: 'VERIFIED',
        permission_ref: expect.stringMatching(/^consent_/),
      }),
    );
  });
});
