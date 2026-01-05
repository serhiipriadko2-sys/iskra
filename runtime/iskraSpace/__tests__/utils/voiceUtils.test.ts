import { describe, it, expect } from 'vitest';
import {
  toVoiceID,
  fromVoiceID,
  isValidVoiceName,
  isValidVoiceID,
  normalizeToVoiceName,
  normalizeToVoiceID,
} from '../../utils/voiceUtils';

describe('voiceUtils', () => {
  describe('toVoiceID', () => {
    it('converts VoiceName to VoiceID', () => {
      expect(toVoiceID('ISKRA')).toBe('VOICE.ISKRA');
      expect(toVoiceID('KAIN')).toBe('VOICE.KAIN');
      expect(toVoiceID('SIBYL')).toBe('VOICE.SIBYL');
    });

    it('throws error for invalid VoiceName', () => {
      // Using type assertion to test runtime validation
      expect(() => toVoiceID('INVALID' as never)).toThrow('Invalid VoiceName');
      expect(() => toVoiceID('' as never)).toThrow('Invalid VoiceName');
    });
  });

  describe('fromVoiceID', () => {
    it('converts VoiceID to VoiceName', () => {
      expect(fromVoiceID('VOICE.ISKRA')).toBe('ISKRA');
      expect(fromVoiceID('VOICE.KAIN')).toBe('KAIN');
      expect(fromVoiceID('VOICE.SIBYL')).toBe('SIBYL');
    });

    it('throws error for invalid VoiceID', () => {
      // Using type assertion to test runtime validation
      expect(() => fromVoiceID('INVALID' as never)).toThrow('Invalid VoiceID');
      expect(() => fromVoiceID('VOICE.UNKNOWN' as never)).toThrow('Invalid VoiceID');
    });
  });

  describe('isValidVoiceName', () => {
    it('returns true for valid VoiceNames', () => {
      expect(isValidVoiceName('ISKRA')).toBe(true);
      expect(isValidVoiceName('KAIN')).toBe(true);
      expect(isValidVoiceName('PINO')).toBe(true);
      expect(isValidVoiceName('SAM')).toBe(true);
      expect(isValidVoiceName('ANHANTRA')).toBe(true);
      expect(isValidVoiceName('HUNDUN')).toBe(true);
      expect(isValidVoiceName('ISKRIV')).toBe(true);
      expect(isValidVoiceName('MAKI')).toBe(true);
      expect(isValidVoiceName('SIBYL')).toBe(true);
    });

    it('returns false for invalid names', () => {
      expect(isValidVoiceName('VOICE.ISKRA')).toBe(false);
      expect(isValidVoiceName('iskra')).toBe(false);
      expect(isValidVoiceName('UNKNOWN')).toBe(false);
      expect(isValidVoiceName('')).toBe(false);
    });
  });

  describe('isValidVoiceID', () => {
    it('returns true for valid VoiceIDs', () => {
      expect(isValidVoiceID('VOICE.ISKRA')).toBe(true);
      expect(isValidVoiceID('VOICE.KAIN')).toBe(true);
      expect(isValidVoiceID('VOICE.SIBYL')).toBe(true);
    });

    it('returns false for invalid IDs', () => {
      expect(isValidVoiceID('ISKRA')).toBe(false);
      expect(isValidVoiceID('VOICE.UNKNOWN')).toBe(false);
      expect(isValidVoiceID('voice.iskra')).toBe(false);
      expect(isValidVoiceID('')).toBe(false);
    });
  });

  describe('normalizeToVoiceName', () => {
    it('normalizes VoiceName format', () => {
      expect(normalizeToVoiceName('ISKRA')).toBe('ISKRA');
      expect(normalizeToVoiceName('KAIN')).toBe('KAIN');
    });

    it('normalizes VoiceID format to VoiceName', () => {
      expect(normalizeToVoiceName('VOICE.ISKRA')).toBe('ISKRA');
      expect(normalizeToVoiceName('VOICE.SIBYL')).toBe('SIBYL');
    });

    it('returns null for invalid identifiers', () => {
      expect(normalizeToVoiceName('UNKNOWN')).toBeNull();
      expect(normalizeToVoiceName('VOICE.UNKNOWN')).toBeNull();
      expect(normalizeToVoiceName('')).toBeNull();
    });
  });

  describe('normalizeToVoiceID', () => {
    it('normalizes VoiceID format', () => {
      expect(normalizeToVoiceID('VOICE.ISKRA')).toBe('VOICE.ISKRA');
      expect(normalizeToVoiceID('VOICE.KAIN')).toBe('VOICE.KAIN');
    });

    it('normalizes VoiceName format to VoiceID', () => {
      expect(normalizeToVoiceID('ISKRA')).toBe('VOICE.ISKRA');
      expect(normalizeToVoiceID('SIBYL')).toBe('VOICE.SIBYL');
    });

    it('returns null for invalid identifiers', () => {
      expect(normalizeToVoiceID('UNKNOWN')).toBeNull();
      expect(normalizeToVoiceID('VOICE.UNKNOWN')).toBeNull();
      expect(normalizeToVoiceID('')).toBeNull();
    });
  });

  describe('round-trip conversion', () => {
    const voices = ['ISKRA', 'KAIN', 'PINO', 'SAM', 'ANHANTRA', 'HUNDUN', 'ISKRIV', 'MAKI', 'SIBYL'] as const;

    it('VoiceName → VoiceID → VoiceName preserves value', () => {
      for (const name of voices) {
        const id = toVoiceID(name);
        const backToName = fromVoiceID(id);
        expect(backToName).toBe(name);
      }
    });
  });
});
