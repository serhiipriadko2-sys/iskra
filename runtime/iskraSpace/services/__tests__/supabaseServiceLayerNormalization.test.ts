import { describe, expect, it } from 'vitest';
import { normalizeMemoryLayer } from '../supabaseService';

describe('normalizeMemoryLayer (legacy uppercase layer regression guard)', () => {
  it('lowercases legacy-cased layer values instead of falling back to archive', () => {
    // Regression: isMemoryLayer() does a case-sensitive comparison, so a
    // legacy-cased 'SHADOW' row used to fall through to 'archive' — silently
    // turning a hypothesis-tier node into a fact-tier one.
    expect(normalizeMemoryLayer('SHADOW')).toBe('shadow');
    expect(normalizeMemoryLayer('Shadow')).toBe('shadow');
    expect(normalizeMemoryLayer('ARCHIVE')).toBe('archive');
    expect(normalizeMemoryLayer('MANTRA')).toBe('mantra');
  });

  it('passes through already-correct lowercase layer values unchanged', () => {
    expect(normalizeMemoryLayer('shadow')).toBe('shadow');
    expect(normalizeMemoryLayer('archive')).toBe('archive');
    expect(normalizeMemoryLayer('mantra')).toBe('mantra');
  });

  it('falls back to archive only for genuinely unrecognized values, not case variants', () => {
    expect(normalizeMemoryLayer('not-a-real-layer')).toBe('archive');
    expect(normalizeMemoryLayer(null)).toBe('archive');
    expect(normalizeMemoryLayer(undefined)).toBe('archive');
    expect(normalizeMemoryLayer(42)).toBe('archive');
  });
});
