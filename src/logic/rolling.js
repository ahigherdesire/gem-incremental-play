import gems from "../data/gems.js";

/**
 * Rolls a gem using the player's current Luck.
 *
 * Gems are checked from rarest to most common.
 * For a gem with rarity 1/r:
 *
 * chance = luck / r
 *
 * Quartz is the fallback if no other gem succeeds.
 *
 * @param {number} luck Player's total Luck multiplier.
 * @returns {object} The gem that was rolled.
 */
export function rollGem(luck = 1) {
  // Luck should never be negative.
  const safeLuck = Math.max(0, luck);

  // Quartz is our fallback gem.
  const fallbackGem = gems.find((gem) => gem.name === "Quartz");

  // Check everything except Quartz, rarest first.
  const rollableGems = gems
    .filter((gem) => gem.name !== "Quartz")
    .sort((a, b) => b.rarity - a.rarity);

  for (const gem of rollableGems) {
    // Prevent probability from ever exceeding 100%.
    const chance = Math.min(safeLuck / gem.rarity, 1);

    if (Math.random() < chance) {
      return gem;
    }
  }

  return fallbackGem;
}
