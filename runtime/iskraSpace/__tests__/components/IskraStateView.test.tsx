import { describe, it, expect, vi } from 'vitest';
import { createElement } from 'react';
import IskraStateView from '../../components/IskraStateView';
import { DEFAULT_METRICS } from '../../types';
import type { IskraPhase } from '../../types';

describe('IskraStateView prop contract', () => {
  it('accepts both onShatter and onPhoenix handlers', () => {
    const shatter = vi.fn();
    const phoenix = vi.fn();

    const element = createElement(IskraStateView, {
      metrics: DEFAULT_METRICS,
      phase: 'CLARITY' as IskraPhase,
      onShatter: shatter,
      onPhoenix: phoenix,
    });

    expect(element).toBeDefined();
    expect(element.props.onShatter).toBe(shatter);
    expect(element.props.onPhoenix).toBe(phoenix);
  });
});
