// Pure, reproducible 32-bit PRNG (Mulberry32). Does not depend on the browser.
export function createSeededRng(seed = 1) {
  if (!Number.isFinite(seed)) throw new TypeError('Seed must be a finite number');
  let state = Number(seed) >>> 0;
  return {
    next() {
      state = (state + 0x6D2B79F5) >>> 0;
      let t = state;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    },
    getState() { return state; },
    setState(value) {
      if (!Number.isInteger(value) || value < 0 || value > 0xFFFFFFFF) throw new RangeError('Invalid RNG state');
      state = value >>> 0;
    },
  };
}
