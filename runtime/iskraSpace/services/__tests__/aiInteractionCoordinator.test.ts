import { describe, expect, it } from 'vitest';
import { aiInteractionCoordinator } from '../aiInteractionCoordinator';

describe('aiInteractionCoordinator composition root', () => {
  it('exposes one shared AI service instance', () => {
    expect(aiInteractionCoordinator.service).toBeDefined();
    expect(typeof aiInteractionCoordinator.abort).toBe('function');
  });

  it('delegates lifecycle abort to the shared service', () => {
    expect(() => aiInteractionCoordinator.abort()).not.toThrow();
  });
});
