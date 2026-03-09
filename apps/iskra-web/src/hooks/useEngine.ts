import { useState, useCallback } from 'react';
import { engine } from '../engineInstance';
import type { IskraMetrics, VoiceID, MantraNode } from '@iskra/core';

export interface EngineState {
  metrics: IskraMetrics;
  voice: VoiceID;
  superposition: { id: VoiceID; prob: number }[];
  context: MantraNode[];
  isProcessing: boolean;
  retrievalTrace?: any;
}

export const useEngine = () => {
  const [state, setState] = useState<EngineState>({
    metrics: engine.getMetrics(),
    voice: 'ISKRA',
    superposition: [],
    context: [],
    isProcessing: false,
    retrievalTrace: undefined
  });

  const processInput = useCallback(async (text: string) => {
    setState(prev => ({ ...prev, isProcessing: true }));
    try {
      const response = await engine.processInput(text);
      setState({
        metrics: response.metrics,
        voice: response.voice,
        superposition: response.superposition,
        context: response.context,
        retrievalTrace: response.retrieval_trace,
        isProcessing: false
      });
      return response;
    } catch (error) {
      console.error('Engine Error:', error);
      setState(prev => ({ ...prev, isProcessing: false }));
      throw error;
    }
  }, []);

  return {
    ...state,
    processInput
  };
};
