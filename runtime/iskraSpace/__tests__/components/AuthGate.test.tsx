import { act, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

type AuthCallback = (event: string) => void;

const mocks = vi.hoisted(() => ({
  authCallback: null as AuthCallback | null,
  bindPrincipal: vi.fn(),
  getBetaSession: vi.fn(),
  releasePrincipal: vi.fn(),
  unsubscribe: vi.fn(),
}));

vi.mock('../../config/e2eAuth', () => ({
  isE2eAuthBypassEnabled: () => false,
}));

vi.mock('../../services/storageService', () => ({
  storageService: {
    bindPrincipal: mocks.bindPrincipal,
    releasePrincipal: mocks.releasePrincipal,
  },
}));

vi.mock('../../services/supabaseClient', () => ({
  getBetaSession: mocks.getBetaSession,
  requestMagicLink: vi.fn(),
  signOutBetaSession: vi.fn(),
  supabase: {
    auth: {
      onAuthStateChange: (callback: AuthCallback) => {
        mocks.authCallback = callback;
        return { data: { subscription: { unsubscribe: mocks.unsubscribe } } };
      },
    },
  },
}));

import AuthGate from '../../components/AuthGate';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement | null = null;
let root: Root | null = null;
let mounts = 0;

function granted(userId: string) {
  return {
    status: 'granted' as const,
    session: {
      userId,
      email: `${userId}@example.invalid`,
      accessToken: 'redacted-test-token',
    },
  };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise;
  });
  return { promise, resolve };
}

function StatefulChild() {
  const [mountId] = useState(() => {
    mounts += 1;
    return mounts;
  });
  return <p data-testid="mount-id">{mountId}</p>;
}

async function renderGate(): Promise<void> {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => {
    root?.render(<AuthGate><StatefulChild /></AuthGate>);
    await Promise.resolve();
    await Promise.resolve();
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.authCallback = null;
  mounts = 0;
  mocks.bindPrincipal.mockReset();
  mocks.getBetaSession.mockReset().mockResolvedValue(granted('principal-a'));
  mocks.releasePrincipal.mockReset();
  mocks.unsubscribe.mockReset();
});

afterEach(async () => {
  await act(async () => {
    root?.unmount();
  });
  container?.remove();
  container = null;
  root = null;
});

describe('AuthGate principal boundary', () => {
  it('remounts all application state when the authenticated principal changes', async () => {
    await renderGate();
    expect(container?.querySelector('[data-testid="mount-id"]')?.textContent).toBe('1');

    mocks.getBetaSession.mockResolvedValue(granted('principal-b'));
    await act(async () => {
      mocks.authCallback?.('SIGNED_IN');
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(mocks.bindPrincipal).toHaveBeenLastCalledWith('principal-b');
    expect(container?.querySelector('[data-testid="mount-id"]')?.textContent).toBe('2');
  });

  it('leaves loading for an explicit safe error when principal migration fails', async () => {
    mocks.bindPrincipal.mockImplementation(() => {
      throw new DOMException('blocked', 'SecurityError');
    });

    await renderGate();

    expect(container?.querySelector('[role="alert"]')).not.toBeNull();
    expect(container?.textContent).not.toContain('Проверяем доступ');
    expect(mocks.releasePrincipal).toHaveBeenCalled();
  });

  it('ignores an older access result after a newer auth check has completed', async () => {
    const older = deferred<ReturnType<typeof granted>>();
    const newer = deferred<ReturnType<typeof granted>>();
    mocks.getBetaSession
      .mockImplementationOnce(() => older.promise)
      .mockImplementationOnce(() => newer.promise);

    await renderGate();

    await act(async () => {
      mocks.authCallback?.('SIGNED_IN');
      newer.resolve(granted('principal-b'));
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(mocks.bindPrincipal).toHaveBeenLastCalledWith('principal-b');
    expect(container?.querySelector('[data-testid="mount-id"]')).not.toBeNull();

    await act(async () => {
      older.resolve(granted('principal-a'));
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(mocks.bindPrincipal).not.toHaveBeenCalledWith('principal-a');
    expect(mocks.bindPrincipal).toHaveBeenLastCalledWith('principal-b');
  });

  it('closes the granted subtree even when signed-out storage eviction fails', async () => {
    await renderGate();
    expect(container?.querySelector('[data-testid="mount-id"]')).not.toBeNull();

    mocks.getBetaSession.mockResolvedValue({ status: 'denied', reason: 'no-session' });
    mocks.releasePrincipal.mockImplementation((options?: { clear?: boolean }) => {
      if (options?.clear) throw new DOMException('blocked', 'SecurityError');
    });

    await act(async () => {
      mocks.authCallback?.('SIGNED_OUT');
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(container?.querySelector('[data-testid="mount-id"]')).toBeNull();
    expect(mocks.getBetaSession).toHaveBeenCalledTimes(1);
    expect(mocks.releasePrincipal).toHaveBeenCalledWith({ clear: true });
  });
});
