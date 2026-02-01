/**
 * Voice Utilities
 *
 * Conversion utilities between VoiceName (runtime) and VoiceID (validators) formats.
 *
 * @example
 * ```typescript
 * import { toVoiceID, fromVoiceID, isValidVoiceName } from './voiceUtils';
 *
 * toVoiceID('ISKRA'); // 'VOICE.ISKRA'
 * fromVoiceID('VOICE.KAIN'); // 'KAIN'
 * ```
 */

import type { VoiceName } from '@iskra/runtime';

/**
 * VoiceID with VOICE. prefix (used in validatorsService)
 */
export type VoiceIDPrefixed =
  | 'VOICE.ISKRA'
  | 'VOICE.KAIN'
  | 'VOICE.PINO'
  | 'VOICE.SAM'
  | 'VOICE.ANHANTRA'
  | 'VOICE.HUYNDUN'
  | 'VOICE.ISKRIV'
  | 'VOICE.MAKI'
  | 'VOICE.SIBYL';

/**
 * All valid VoiceName values
 */
const VALID_VOICE_NAMES: VoiceName[] = [
  'ISKRA',
  'KAIN',
  'PINO',
  'SAM',
  'ANHANTRA',
  'HUYNDUN',
  'ISKRIV',
  'MAKI',
  'SIBYL',
];

/**
 * Convert VoiceName to VoiceID (prefixed format)
 *
 * @param name - Voice name from @iskra/runtime
 * @returns VoiceID with VOICE. prefix
 * @throws Error if name is not a valid VoiceName
 *
 * @example
 * toVoiceID('ISKRA') // 'VOICE.ISKRA'
 */
export function toVoiceID(name: VoiceName): VoiceIDPrefixed {
  if (!isValidVoiceName(name)) {
    throw new Error(`Invalid VoiceName: ${name}. Valid names: ${VALID_VOICE_NAMES.join(', ')}`);
  }
  return `VOICE.${name}` as VoiceIDPrefixed;
}

/**
 * Convert VoiceID (prefixed) to VoiceName
 *
 * @param id - Voice ID with VOICE. prefix
 * @returns VoiceName for @iskra/runtime
 * @throws Error if id is not a valid VoiceIDPrefixed
 *
 * @example
 * fromVoiceID('VOICE.KAIN') // 'KAIN'
 */
export function fromVoiceID(id: VoiceIDPrefixed): VoiceName {
  if (!isValidVoiceID(id)) {
    throw new Error(`Invalid VoiceID: ${id}. Expected format: VOICE.<NAME>`);
  }
  return id.replace('VOICE.', '') as VoiceName;
}

/**
 * Check if string is a valid VoiceName
 *
 * @param name - String to check
 * @returns true if valid VoiceName
 */
export function isValidVoiceName(name: string): name is VoiceName {
  return VALID_VOICE_NAMES.includes(name as VoiceName);
}

/**
 * Check if string is a valid VoiceID (prefixed format)
 *
 * @param id - String to check
 * @returns true if valid VoiceIDPrefixed
 */
export function isValidVoiceID(id: string): id is VoiceIDPrefixed {
  if (!id.startsWith('VOICE.')) return false;
  const name = id.replace('VOICE.', '');
  return isValidVoiceName(name);
}

/**
 * Normalize voice identifier to VoiceName format
 * Accepts both 'ISKRA' and 'VOICE.ISKRA' formats
 *
 * @param identifier - Voice identifier in any format
 * @returns VoiceName or null if invalid
 */
export function normalizeToVoiceName(identifier: string): VoiceName | null {
  // Already VoiceName format
  if (isValidVoiceName(identifier)) {
    return identifier;
  }

  // VoiceID format
  if (isValidVoiceID(identifier)) {
    return fromVoiceID(identifier);
  }

  return null;
}

/**
 * Normalize voice identifier to VoiceID format
 * Accepts both 'ISKRA' and 'VOICE.ISKRA' formats
 *
 * @param identifier - Voice identifier in any format
 * @returns VoiceIDPrefixed or null if invalid
 */
export function normalizeToVoiceID(identifier: string): VoiceIDPrefixed | null {
  // Already VoiceID format
  if (isValidVoiceID(identifier)) {
    return identifier;
  }

  // VoiceName format
  if (isValidVoiceName(identifier)) {
    return toVoiceID(identifier);
  }

  return null;
}
