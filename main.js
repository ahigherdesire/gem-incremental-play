import { rollResult } from "./src/logic/rollResult.js";

const rollButton = document.getElementById("rollButton");
const result = document.getElementById("result");

const playerStats = {
  luck: 1,
  weightLuck: 1,
  weightMultiplier: 1
};

rollButton.addEventListener("click", () => {
  const rolled = rollResult(
    playerStats.luck,
    playerStats.weightLuck,
    playerStats.weightMultiplier
  );

  result.innerHTML = `
    <h2>${rolled.gem.name}</h2>

    <p>Rarity: 1 in ${rolled.gem.rarity.toLocaleString()}</p>

    <p>
      Weight: ${rolled.finalWeight.toFixed(2)}g
      (${rolled.weightMultiplier.toFixed(3)}x)
    </p>

    <p>Value: $${rolled.value.toFixed(2)}</p>
  `;
});
