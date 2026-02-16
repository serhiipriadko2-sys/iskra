import { describe, it, expect } from 'vitest';
import { complex, add, multiply, modulus } from '../../quantum.js';

describe('Quantum Math', () => {
  describe('Complex Numbers', () => {
    it('should add complex numbers correctly', () => {
      const c1 = complex(1, 2);
      const c2 = complex(3, 4);
      const sum = add(c1, c2);
      expect(sum).toEqual({ re: 4, im: 6 });
    });

    it('should calculate modulus correctly', () => {
      const c = complex(3, 4);
      const mod = modulus(c);
      expect(mod).toBe(5); // 3-4-5 triangle
    });
  });
});
