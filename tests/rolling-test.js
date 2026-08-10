import gems from "../src/data/gems.js";
import { rollGem } from "../src/logic/rolling.js";

const ROLLS = 1_000_000;
const LUCK = 2.5;

const results = {};

// Set every gem to 0 first.
for (const gem of gems) {
  results[gem.name] = 0;
}

// Perform the rolls.
for (let i = 0; i < ROLLS; i++) {
  const gem = rollGem(LUCK);
  results[gem.name]++;
}

// Display results from rarest to most common.
const sortedGems = [...gems].sort((a, b) => b.rarity - a.rarity);

console.log(`\nResults from ${ROLLS.toLocaleString()} rolls at ${LUCK}x Luck:\n`);

for (const gem of sortedGems) {
  const count = results[gem.name];
  const percentage = (count / ROLLS) * 100;

  const observedRarity =
    count > 0
      ? `1 in ${(ROLLS / count).toFixed(2)}`
      : "Not rolled";

  console.log(
    `${gem.name.padEnd(15)} | ` +
    `Displayed: 1/${gem.rarity.toLocaleString().padEnd(9)} | ` +
    `Count: ${count.toLocaleString().padStart(7)} | ` +
    `${percentage.toFixed(4).padStart(8)}% | ` +
    `Observed: ${observedRarity}`
  );
}
