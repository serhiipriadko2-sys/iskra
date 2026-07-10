import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import SettingsView from '../../components/SettingsView';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | null = null;
let container: HTMLDivElement | null = null;

beforeEach(() => {
  localStorage.clear();
});

afterEach(async () => {
  await act(async () => {
    root?.unmount();
  });
  container?.remove();
  root = null;
  container = null;
});

describe('SettingsView closed-beta capabilities', () => {
  it('does not render the disconnected debate response mode', async () => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    await act(async () => {
      root?.render(<SettingsView />);
    });

    expect(container.querySelectorAll('[data-response-mode]')).toHaveLength(2);
    expect(container.querySelector('[data-response-mode="debate"]')).toBeNull();
  });
});
