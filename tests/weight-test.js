import { rollWeightMultiplier } from "../src/logic/weight.js";

const ROLLS = 5_000_000;
const WEIGHT_LUCK = 2.25;

const bands = {
  "0.50x–0.85x": 0,
  "0.85x–1.10x": 0,
  "1.10x–1.50x": 0,
  "1.50x–2.00x": 0,
  "2.00x+": 0
};

const thresholds = {
  2: 0,
  3: 0,
  4: 0,
  5: 0,
  6: 0,
  7: 0,
  8: 0,
  9: 0,
  10: 0
};

let totalMultiplier = 0;
let lowest = Infinity;
let highest = -Infinity;

for (let i = 0; i < ROLLS; i++) {
  const weight = rollWeightMultiplier(WEIGHT_LUCK);

  totalMultiplier += weight;
  lowest = Math.min(lowest, weight);
  highest = Math.max(highest, weight);

  // Main weight bands
  if (weight < 0.85) {
    bands["0.50x–0.85x"]++;
  } else if (weight < 1.10) {
    bands["0.85x–1.10x"]++;
  } else if (weight < 1.50) {
    bands["1.10x–1.50x"]++;
  } else if (weight < 2.00) {
    bands["1.50x–2.00x"]++;
  } else {
    bands["2.00x+"]++;
  }

  // High-weight thresholds
  for (const threshold in thresholds) {
    if (weight >= Number(threshold)) {
      thresholds[threshold]++;
    }
  }
}

console.log(
  `\nResults from ${ROLLS.toLocaleString()} weight rolls at ${WEIGHT_LUCK}x Weight Luck:\n`
);

console.log("MAIN DISTRIBUTION\n");

for (const [band, count] of Object.entries(bands)) {
  const percentage = (count / ROLLS) * 100;

  console.log(
    `${band.padEnd(14)} | ` +
    `${count.toLocaleString().padStart(9)} | ` +
    `${percentage.toFixed(4).padStart(8)}%`
  );
}

console.log("\nHIGH-WEIGHT TAIL\n");

for (const [threshold, count] of Object.entries(thresholds)) {
  const observed =
    count > 0
      ? `1 in ${(ROLLS / count).toFixed(2)}`
      : "Not rolled";

  const expectedRarity =
    16 * Math.pow(2, Number(threshold) - 2);

  console.log(
    `>= ${threshold}x`.padEnd(8) +
    ` | Expected: 1/${expectedRarity.toLocaleString().padEnd(6)}` +
    ` | Count: ${count.toLocaleString().padStart(8)}` +
    ` | Observed: ${observed}`
  );
}

console.log("\nSUMMARY\n");

console.log(
  `Average multiplier: ${(totalMultiplier / ROLLS).toFixed(4)}x`
);

console.log(
  `Lowest rolled:      ${lowest.toFixed(4)}x`
);

console.log(
  `Highest rolled:     ${highest.toFixed(4)}x`
);
