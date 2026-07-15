import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import IskraStateView from '../../components/IskraStateView';
import { DEFAULT_METRICS } from '../../types';
import type { IskraPhase } from '../../types';
import { soundService } from '../../services/soundService';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | null = null;
let container: HTMLDivElement | null = null;

async function renderRitualView(props: {
  onShatter: () => void;
  onPhoenix: () => void;
}) {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);

  await act(async () => {
    root?.render(
      <IskraStateView
        metrics={DEFAULT_METRICS}
        phase={'CLARITY' as IskraPhase}
        {...props}
      />
    );
  });
}

afterEach(async () => {
  await act(async () => {
    root?.unmount();
  });
  container?.remove();
  root = null;
  container = null;
  vi.restoreAllMocks();
});

describe('IskraStateView ritual controls', () => {
  it('routes a Phoenix DOM click only to Phoenix state and sound', async () => {
    const shatter = vi.fn();
    const phoenix = vi.fn();
    const phoenixSound = vi.spyOn(soundService, 'playRitualPhoenix').mockImplementation(() => {});
    const shatterSound = vi.spyOn(soundService, 'playRitualShatter').mockImplementation(() => {});
    vi.spyOn(soundService, 'playClick').mockImplementation(() => {});

    await renderRitualView({
      onShatter: shatter,
      onPhoenix: phoenix,
    });

    const phoenixButton = container?.querySelector<HTMLButtonElement>(
      'button[aria-label="Запустить Phoenix"]'
    );
    expect(phoenixButton).toBeInstanceOf(HTMLButtonElement);

    await act(async () => {
      phoenixButton?.click();
    });

    expect(phoenix).toHaveBeenCalledTimes(1);
    expect(shatter).not.toHaveBeenCalled();
    expect(phoenixSound).toHaveBeenCalledTimes(1);
    expect(shatterSound).not.toHaveBeenCalled();
  });

  it('routes a Shatter DOM click only to Shatter state and sound', async () => {
    const shatter = vi.fn();
    const phoenix = vi.fn();
    const phoenixSound = vi.spyOn(soundService, 'playRitualPhoenix').mockImplementation(() => {});
    const shatterSound = vi.spyOn(soundService, 'playRitualShatter').mockImplementation(() => {});
    vi.spyOn(soundService, 'playClick').mockImplementation(() => {});

    await renderRitualView({
      onShatter: shatter,
      onPhoenix: phoenix,
    });

    const shatterButton = container?.querySelector<HTMLButtonElement>(
      'button[aria-label="Запустить Shatter"]'
    );
    expect(shatterButton).toBeInstanceOf(HTMLButtonElement);

    await act(async () => {
      shatterButton?.click();
    });

    expect(shatter).toHaveBeenCalledTimes(1);
    expect(phoenix).not.toHaveBeenCalled();
    expect(shatterSound).toHaveBeenCalledTimes(1);
    expect(phoenixSound).not.toHaveBeenCalled();
  });
});
