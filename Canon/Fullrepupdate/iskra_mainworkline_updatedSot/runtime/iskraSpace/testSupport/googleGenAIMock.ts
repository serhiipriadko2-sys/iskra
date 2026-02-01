// Minimal stub for @google/genai used in tests/offline mode.
// Provides the enums and types referenced by services without requiring the real SDK.

export enum Type {
  OBJECT = 'object',
  STRING = 'string',
  ARRAY = 'array',
  INTEGER = 'integer',
}

export interface Content {
  role?: string;
  parts: Array<{ text?: string }>;
}

export class Blob {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(public data?: any) {}
}

export class LiveServerMessage {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(public data?: any) {}
}

export enum Modality {
  TEXT = 'text',
  AUDIO = 'audio',
  BLOB = 'blob',
}

export default {};
