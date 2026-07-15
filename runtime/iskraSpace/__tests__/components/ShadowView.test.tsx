import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { MemoryNode } from '../../types';

const shadowNode: MemoryNode = {
  id: 'shadow-1',
  title: 'Reviewed Shadow hypothesis',
  type: 'insight',
  layer: 'shadow',
  timestamp: '2026-07-15T12:00:00.000Z',
  content: 'Пользователь явно предпочитает прямые формулировки.',
  evidence: [{
    source: 'turn:42',
    inference: 'Explicitly stated preference',
    fact: 'true',
    trace: 'message:7',
  }],
  sift: {
    source: 'turn:42',
    inference: 'Explicitly stated preference',
    fact: 'true',
    trace: 'message:7',
  },
};

const consent = {
  id: 'consent-1',
  scope: 'memory.promote.shadow' as const,
  decision: 'GRANTED' as const,
  plain_language_summary: 'Promote one reviewed Shadow record',
  granted_at: '2026-07-15T12:00:00.000Z',
  expires_at: '2026-07-15T12:15:00.000Z',
  profile_version: 1,
};

const mocks = vi.hoisted(() => ({
  deleteShadowNode: vi.fn(),
  getShadow: vi.fn(),
  promoteRaw: vi.fn(),
  grantConsent: vi.fn(),
  promoteThroughBoundary: vi.fn(),
}));

vi.mock('../../services/memoryService', () => ({
  memoryService: {
    deleteShadowNode: mocks.deleteShadowNode,
    getShadow: mocks.getShadow,
    promoteToArchive: mocks.promoteRaw,
  },
}));

vi.mock('../../services/symbiosisService', () => ({
  symbiosisService: { grantConsent: mocks.grantConsent },
}));

vi.mock('../../services/shadowPromotionService', () => ({
  shadowPromotionService: { promote: mocks.promoteThroughBoundary },
}));

import ShadowView from '../../components/ShadowView';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement | null = null;
let root: Root | null = null;

const findButton = (text: string): HTMLButtonElement | undefined =>
  [...(container?.querySelectorAll<HTMLButtonElement>('button') ?? [])]
    .find(button => button.textContent?.includes(text));

async function renderShadowView(): Promise<void> {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => {
    root?.render(<ShadowView />);
  });
}

async function openPromotionDialog(): Promise<void> {
  const nodeCard = container?.querySelector<HTMLElement>(`[data-testid="shadow-node-${shadowNode.id}"]`);
  expect(nodeCard).toBeDefined();
  await act(async () => nodeCard?.click());
  await act(async () => findButton('Перенести в Archive')?.click());
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getShadow.mockReturnValue([shadowNode]);
  mocks.grantConsent.mockReturnValue(consent);
  mocks.promoteThroughBoundary.mockReturnValue({
    ok: true,
    reasons: [],
    promotedNode: { ...shadowNode, id: 'archive-1', layer: 'archive' },
    receipt: {
      action: 'memory.promote.shadow',
      requested_by: 'USER',
      permission_ref: consent.id,
      result: 'DONE',
      read_back: 'VERIFIED',
      evidence_refs: ['turn:42', 'message:7'],
    },
  });
});

afterEach(async () => {
  await act(async () => root?.unmount());
  container?.remove();
  container = null;
  root = null;
});

describe('ShadowView promotion boundary', () => {
  it('routes explicit confirmation through consent and the policy service, never raw mutation', async () => {
    await renderShadowView();
    await openPromotionDialog();

    await act(async () => findButton('Подтвердить')?.click());

    expect(mocks.grantConsent).toHaveBeenCalledWith(
      'memory.promote.shadow',
      expect.stringContaining('Shadow'),
    );
    expect(mocks.promoteThroughBoundary).toHaveBeenCalledWith(expect.objectContaining({
      node: shadowNode,
      userConfirmed: true,
      consent,
    }));
    expect(mocks.promoteRaw).not.toHaveBeenCalled();
  });

  it('keeps the dialog open and exposes a policy denial without raw mutation', async () => {
    mocks.promoteThroughBoundary.mockReturnValue({
      ok: false,
      reasons: ['sift_not_pass'],
      promotedNode: null,
      receipt: null,
    });
    await renderShadowView();
    await openPromotionDialog();

    await act(async () => findButton('Подтвердить')?.click());

    const decision = container
      ?.querySelector('[data-testid="shadow-promotion-decision"]')
      ?.textContent;
    expect(decision).toContain('SIFT-проверка не пройдена');
    expect(decision).not.toContain('sift_not_pass');
    expect(findButton('Подтвердить')).toBeDefined();
    expect(mocks.promoteRaw).not.toHaveBeenCalled();
  });
});
