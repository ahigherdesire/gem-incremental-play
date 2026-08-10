/**
 * Generates a random weight multiplier.
 *
 * Base distribution:
 * 0.50x–0.85x = 15%
 * 0.85x–1.10x = 60%
 * 1.10x–1.50x = 15%
 * 1.50x–2.00x = 3.75%
 * 2.00x+       = 6.25%
 *
 * Once the roll reaches 2x+, every additional whole
 * multiplier is twice as rare as the previous one.
 */

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

export function rollWeightMultiplier() {
  const roll = Math.random();

  // 15%
  if (roll < 0.15) {
    return randomBetween(0.5, 0.85);
  }

  // 60%
  if (roll < 0.75) {
    return randomBetween(0.85, 1.1);
  }

  // 15%
  if (roll < 0.9) {
    return randomBetween(1.1, 1.5);
  }

  // 3.75%
  if (roll < 0.9375) {
    return randomBetween(1.5, 2);
  }

  // Remaining 6.25% enters the exponential tail.
  let wholeMultiplier = 2;

  // Each additional 1x is twice as rare.
  while (Math.random() < 0.5) {
    wholeMultiplier++;
  }

  // Produce a continuous value within this multiplier band.
  return randomBetween(
    wholeMultiplier,
    wholeMultiplier + 1
  );
}
