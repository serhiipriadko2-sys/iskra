import { CoreEngine, MemoryService, metricsEngine, voiceSystem } from '@iskra/engine';
import { AdaptiveEmbeddingProvider } from './services/embedding';

// Initialize services for the browser environment
const embeddingProvider = new AdaptiveEmbeddingProvider();
const memoryService = new MemoryService(embeddingProvider);

// Create and export the singleton Engine instance
export const engine = new CoreEngine(memoryService, metricsEngine, voiceSystem);
