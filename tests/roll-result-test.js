import { rollResult } from "../src/logic/rollResult.js";

const TEST_ROLLS = 20;

// Test with normal starting stats first.
const LUCK = 1;
const WEIGHT_LUCK = 1;
const WEIGHT_MULTIPLIER = 1;

console.log(
  `\nRunning ${TEST_ROLLS} sample rolls\n` +
  `Luck: ${LUCK}x\n` +
  `Weight Luck: ${WEIGHT_LUCK}x\n` +
  `Weight Multiplier: ${WEIGHT_MULTIPLIER}x\n`
);

for (let i = 1; i <= TEST_ROLLS; i++) {
  const result = rollResult(
    LUCK,
    WEIGHT_LUCK,
    WEIGHT_MULTIPLIER
  );

  console.log(
    `Roll ${String(i).padStart(2)} | ` +
    `${result.gem.name.padEnd(12)} | ` +
    `1/${result.gem.rarity.toLocaleString().padEnd(8)} | ` +
    `${result.weightMultiplier.toFixed(3)}x | ` +
    `${result.finalWeight.toFixed(2)}g | ` +
    `$${result.value.toFixed(2)}`
  );
}
