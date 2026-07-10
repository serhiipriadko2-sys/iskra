import { describe, expect, it } from 'vitest';
import {
  betaCapabilities,
  getAvailableResponseModes,
  isBetaCapabilityEnabled,
} from '../../config/betaCapabilities';
import { getResponseModeInstruction, IskraAIService } from '../geminiService';

describe('closed beta capability boundary', () => {
  it('keeps TTS, live audio, and disconnected debate disabled by default', () => {
    expect(betaCapabilities).toEqual({
      textToSpeech: false,
      liveConversation: false,
      councilDebate: false,
    });
    expect(isBetaCapabilityEnabled('textToSpeech')).toBe(false);
    expect(isBetaCapabilityEnabled('liveConversation')).toBe(false);
    expect(getAvailableResponseModes()).toEqual(['simple', 'deep']);
  });

  it('rejects silent placeholder audio instead of presenting it as speech', async () => {
    await expect(new IskraAIService().getTextToSpeech('проверка')).rejects.toThrow(/unavailable/i);
  });

  it('normalizes the disconnected legacy debate mode to an available response mode', () => {
    expect(getResponseModeInstruction('debate')).toBe(getResponseModeInstruction('deep'));
  });
});
