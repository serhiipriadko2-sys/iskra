import { IskraAIService } from './geminiService';

/**
 * Composition root for all browser-side AI interactions.
 *
 * UI and feature services must depend on this shared coordinator instead of
 * constructing IskraAIService directly. Policy, consent, route allowlists,
 * quotas, deadlines, and observability can then be enforced at one ingress.
 */
export interface AiInteractionCoordinator {
  readonly service: IskraAIService;
  abort(): void;
}

const service = new IskraAIService();

export const aiInteractionCoordinator: AiInteractionCoordinator = Object.freeze({
  service,
  abort: () => service.abort(),
});

export default aiInteractionCoordinator;
