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

  it('keeps telemetry off until each explicit consent is selected', async () => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    await act(async () => {
      root?.render(<SettingsView />);
    });

    const analytics = container.querySelector<HTMLInputElement>('[data-telemetry-consent="analytics"]');
    const errors = container.querySelector<HTMLInputElement>('[data-telemetry-consent="errors"]');
    expect(analytics?.checked).toBe(false);
    expect(errors?.checked).toBe(false);

    await act(async () => {
      analytics?.click();
      errors?.click();
    });

    expect(analytics?.checked).toBe(true);
    expect(errors?.checked).toBe(true);
    expect(localStorage.getItem('iskra_analytics_opted_in')).toBe('true');
    expect(localStorage.getItem('iskra_error_tracking_opted_in')).toBe('true');
  });
});
