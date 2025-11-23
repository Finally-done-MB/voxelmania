// Seeded PRNG implementation (Mulberry32 algorithm)
// This ensures reproducible random number generation from a seed

class SeededRNG {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  // Generate next random number (0 to 1)
  next(): number {
    let t = (this.seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  // Generate random integer in range [min, max]
  range(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  // Choose random item from array
  choice<T>(items: T[]): T {
    return items[Math.floor(this.next() * items.length)];
  }

  // Random boolean with probability
  boolean(probability: number = 0.5): boolean {
    return this.next() < probability;
  }
}

// Global seeded RNG instance
let globalRNG: SeededRNG | null = null;

// Initialize or set seed
export function setSeed(seed: number | string) {
  // Convert string seed to number
  let numericSeed: number;
  if (typeof seed === 'string') {
    // Simple hash function for string seeds
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      const char = seed.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    numericSeed = Math.abs(hash);
  } else {
    numericSeed = seed;
  }
  
  currentSeedValue = numericSeed;
  globalRNG = new SeededRNG(numericSeed);
}

// Get current seed (for saving)
export function getCurrentSeed(): number {
  // If no seed set, generate one from current time
  if (!globalRNG) {
    const seed = Date.now();
    setSeed(seed);
    return seed;
  }
  // We can't get the seed back from the RNG, so we'll track it separately
  return currentSeedValue;
}

let currentSeedValue: number = Date.now();

// Initialize with current time seed
setSeed(currentSeedValue);

// Export functions that match the old API
export function randomRange(min: number, max: number): number {
  if (!globalRNG) setSeed(Date.now());
  return globalRNG!.range(min, max);
}

export function randomChoice<T>(items: T[]): T {
  if (!globalRNG) setSeed(Date.now());
  return globalRNG!.choice(items);
}

export function randomBoolean(probability: number = 0.5): boolean {
  if (!globalRNG) setSeed(Date.now());
  return globalRNG!.boolean(probability);
}

// Generate a new random seed
export function generateSeed(): number {
  // Use high-resolution time + counter for uniqueness
  const seed = Date.now() * 1000 + performance.now();
  currentSeedValue = Math.floor(seed);
  setSeed(currentSeedValue);
  return currentSeedValue;
}

// Get seed as string for display/sharing
export function getSeedString(): string {
  return currentSeedValue.toString();
}

