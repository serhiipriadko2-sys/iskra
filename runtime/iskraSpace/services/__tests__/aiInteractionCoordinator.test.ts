import { describe, expect, it } from 'vitest';
import {
  AI_INTERACTION_ROUTE_POLICIES,
  aiInteractionCoordinator,
} from '../aiInteractionCoordinator';

describe('aiInteractionCoordinator enforcement boundary', () => {
  it('exposes typed gateway methods without a service compatibility facade', () => {
    expect('service' in aiInteractionCoordinator).toBe(false);
    expect(typeof aiInteractionCoordinator.getDailyAdvice).toBe('function');
    expect(typeof aiInteractionCoordinator.getChatResponseStreamWithPolicy).toBe('function');
    expect(typeof aiInteractionCoordinator.getEmbedding).toBe('function');
    expect(typeof aiInteractionCoordinator.abort).toBe('function');
  });

  it('exposes exactly the configured route allowlist', () => {
    expect(aiInteractionCoordinator.getAllowedRoutes()).toEqual(
      Object.keys(AI_INTERACTION_ROUTE_POLICIES),
    );
  });

  it('delegates lifecycle abort to the private service port', () => {
    expect(() => aiInteractionCoordinator.abort()).not.toThrow();
  });
});
