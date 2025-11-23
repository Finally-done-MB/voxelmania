import { describe, it, expect, beforeEach } from 'vitest';
import { setSeed, getCurrentSeed, randomRange, randomChoice, randomBoolean, generateSeed, getSeedString } from './seededRNG';

describe('seededRNG', () => {
  beforeEach(() => {
    // Reset seed before each test for consistency
    setSeed(12345);
  });

  describe('setSeed', () => {
    it('should set numeric seed correctly', () => {
      setSeed(42);
      expect(getCurrentSeed()).toBe(42);
    });

    it('should convert string seed to numeric seed', () => {
      setSeed('test-seed');
      const seed = getCurrentSeed();
      expect(typeof seed).toBe('number');
      expect(seed).toBeGreaterThan(0);
    });

    it('should produce same numeric seed for same string', () => {
      setSeed('hello');
      const seed1 = getCurrentSeed();
      setSeed('hello');
      const seed2 = getCurrentSeed();
      expect(seed1).toBe(seed2);
    });

    it('should produce different seeds for different strings', () => {
      setSeed('hello');
      const seed1 = getCurrentSeed();
      setSeed('world');
      const seed2 = getCurrentSeed();
      expect(seed1).not.toBe(seed2);
    });
  });

  describe('randomRange', () => {
    it('should generate numbers within range', () => {
      setSeed(12345);
      for (let i = 0; i < 100; i++) {
        const value = randomRange(1, 10);
        expect(value).toBeGreaterThanOrEqual(1);
        expect(value).toBeLessThanOrEqual(10);
      }
    });

    it('should be reproducible with same seed', () => {
      setSeed(12345);
      const values1 = Array.from({ length: 10 }, () => randomRange(1, 100));
      
      setSeed(12345);
      const values2 = Array.from({ length: 10 }, () => randomRange(1, 100));
      
      expect(values1).toEqual(values2);
    });

    it('should produce different values with different seeds', () => {
      setSeed(12345);
      const value1 = randomRange(1, 1000);
      
      setSeed(54321);
      const value2 = randomRange(1, 1000);
      
      expect(value1).not.toBe(value2);
    });

    it('should handle single value range', () => {
      setSeed(12345);
      const value = randomRange(5, 5);
      expect(value).toBe(5);
    });
  });

  describe('randomChoice', () => {
    it('should return an item from the array', () => {
      setSeed(12345);
      const items = ['a', 'b', 'c', 'd'];
      const choice = randomChoice(items);
      expect(items).toContain(choice);
    });

    it('should be reproducible with same seed', () => {
      setSeed(12345);
      const items = ['a', 'b', 'c', 'd', 'e'];
      const choices1 = Array.from({ length: 10 }, () => randomChoice(items));
      
      setSeed(12345);
      const choices2 = Array.from({ length: 10 }, () => randomChoice(items));
      
      expect(choices1).toEqual(choices2);
    });

    it('should handle single item array', () => {
      setSeed(12345);
      const items = ['only'];
      expect(randomChoice(items)).toBe('only');
    });
  });

  describe('randomBoolean', () => {
    it('should return boolean values', () => {
      setSeed(12345);
      for (let i = 0; i < 100; i++) {
        const value = randomBoolean();
        expect(typeof value).toBe('boolean');
      }
    });

    it('should be reproducible with same seed', () => {
      setSeed(12345);
      const values1 = Array.from({ length: 20 }, () => randomBoolean());
      
      setSeed(12345);
      const values2 = Array.from({ length: 20 }, () => randomBoolean());
      
      expect(values1).toEqual(values2);
    });

    it('should respect probability parameter', () => {
      setSeed(12345);
      // With probability 0, should always be false
      setSeed(12345);
      const falses = Array.from({ length: 100 }, () => randomBoolean(0));
      expect(falses.every(v => v === false)).toBe(true);

      // With probability 1, should always be true
      setSeed(12345);
      const trues = Array.from({ length: 100 }, () => randomBoolean(1));
      expect(trues.every(v => v === true)).toBe(true);
    });
  });

  describe('generateSeed', () => {
    it('should generate a numeric seed', () => {
      const seed = generateSeed();
      expect(typeof seed).toBe('number');
      expect(seed).toBeGreaterThan(0);
    });

    it('should set the seed when generating', () => {
      const seed = generateSeed();
      expect(getCurrentSeed()).toBe(seed);
    });
  });

  describe('getSeedString', () => {
    it('should return current seed as string', () => {
      setSeed(12345);
      expect(getSeedString()).toBe('12345');
    });

    it('should update when seed changes', () => {
      setSeed(12345);
      expect(getSeedString()).toBe('12345');
      
      setSeed(67890);
      expect(getSeedString()).toBe('67890');
    });
  });
});
