/**
 * Generates a random weight multiplier.
 *
 * Base distribution at 1.00x Weight Luck:
 * 0.50x–0.85x = 15%
 * 0.85x–1.10x = 60%
 * 1.10x–1.50x = 15%
 * 1.50x–2.00x = 3.75%
 * 2.00x+       = 6.25%
 *
 * Weight Luck makes results above 1.10x N times more likely.
 */

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

export function rollWeightMultiplier(weightLuck = 1) {
  const safeWeightLuck = Math.max(0, weightLuck);

  // Base chance of rolling above 1.10x is 25%.
  const baseHighChance = 0.25;

  // Increase high-weight chance according to Weight Luck.
  // Clamp at 100% so probabilities stay valid.
  const highChance = Math.min(
    baseHighChance * safeWeightLuck,
    1
  );

  const lowChance = 1 - highChance;

  const roll = Math.random();

  // -------------------------
  // LOW-WEIGHT REGION
  // -------------------------
  if (roll < lowChance) {
    // Within the low region, preserve the original
    // 15:60 ratio = 20% : 80%.

    const lowRoll = Math.random();

    if (lowRoll < 0.2) {
      return randomBetween(0.5, 0.85);
    }

    return randomBetween(0.85, 1.1);
  }

  // -------------------------
  // HIGH-WEIGHT REGION
  // -------------------------
  // Preserve the original high-region ratio:
  //
  // 1.10–1.50 = 15 / 25 = 60%
  // 1.50–2.00 = 3.75 / 25 = 15%
  // 2.00+      = 6.25 / 25 = 25%

  const highRoll = Math.random();

  if (highRoll < 0.6) {
    return randomBetween(1.1, 1.5);
  }

  if (highRoll < 0.75) {
    return randomBetween(1.5, 2);
  }

  // Remaining 25% of the high region
  // enters the exponential tail.

  let wholeMultiplier = 2;

  while (Math.random() < 0.5) {
    wholeMultiplier++;
  }

  return randomBetween(
    wholeMultiplier,
    wholeMultiplier + 1
  );
}
