import { rollGem } from "./rolling.js";
import { rollWeightMultiplier } from "./weight.js";

/**
 * Performs one complete game roll.
 *
 * @param {number} luck Player's total Luck multiplier.
 * @param {number} weightLuck Player's total Weight Luck multiplier.
 * @param {number} weightMultiplier Player's final Weight multiplier.
 * @returns {object} Complete rolled specimen.
 */
export function rollResult(
  luck = 1,
  weightLuck = 1,
  weightMultiplier = 1
) {
  const gem = rollGem(luck);

  const rolledWeightMultiplier =
    rollWeightMultiplier(weightLuck);

  const rolledWeight =
    gem.baseWeight * rolledWeightMultiplier;

  const finalWeight =
    rolledWeight * weightMultiplier;

  const value =
    finalWeight * gem.valuePerGram;

  return {
    gem,
    weightMultiplier: rolledWeightMultiplier,
    rolledWeight,
    finalWeight,
    value
  };
}
