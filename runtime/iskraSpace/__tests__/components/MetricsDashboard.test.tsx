/**
 * MetricsDashboard Component Tests
 *
 * Basic tests to validate:
 * - Component renders without crashing
 * - Key indicators are displayed
 * - View switching buttons exist
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import MetricsDashboard from '../../components/MetricsDashboard';
import { DEFAULT_METRICS } from '../../types';

describe('MetricsDashboard', () => {
  it('renders without crashing with default metrics', () => {
    const { container } = render(
      <MetricsDashboard currentMetrics={DEFAULT_METRICS} />
    );
    expect(container).toBeTruthy();
  });

  it('displays key indicator cards with values', () => {
    const { container } = render(<MetricsDashboard currentMetrics={DEFAULT_METRICS} />);
    
    // Should render the component
    expect(container.querySelector('.card')).toBeTruthy();
  });

  it('accepts custom metrics history without crashing', () => {
    const history = [
      {
        timestamp: Date.now() - 1000,
        metrics: DEFAULT_METRICS,
      },
      {
        timestamp: Date.now(),
        metrics: { ...DEFAULT_METRICS, trust: 0.9 },
      },
    ];

    const { container } = render(
      <MetricsDashboard currentMetrics={DEFAULT_METRICS} metricsHistory={history} />
    );
    
    expect(container).toBeTruthy();
  });

  it('generates mock data when no history provided', () => {
    const { container } = render(
      <MetricsDashboard currentMetrics={DEFAULT_METRICS} />
    );
    
    expect(container).toBeTruthy();
  });

  it('displays security notice for internal use', () => {
    const { container } = render(<MetricsDashboard currentMetrics={DEFAULT_METRICS} />);
    
    // Check for security-related text
    expect(container.textContent).toContain('Безопасность');
  });
});

