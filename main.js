import { rollResult } from "./src/logic/rollResult.js";

import {
  createInventory,
  addToInventory,
  isInventoryFull
} from "./src/logic/inventory.js";

import {
  saveInventory,
  loadInventory
} from "./src/logic/storage.js";

const rollButton = document.getElementById("rollButton");
const result = document.getElementById("result");

const playerStats = {
  luck: 1,
  weightLuck: 1,
  weightMultiplier: 1,
  rollSpeed: 1
};

let inventory =
  loadInventory() ?? createInventory();

let canRoll = !isInventoryFull(inventory);

if (!canRoll) {
  rollButton.disabled = true;
  rollButton.textContent = "INVENTORY FULL";
}

function getCooldownMs() {
  const baseCooldownSeconds = 5;
  return (baseCooldownSeconds / playerStats.rollSpeed) * 1000;
}

rollButton.addEventListener("click", () => {
  if (!canRoll) {
    return;
  }

  canRoll = false;
  rollButton.disabled = true;

  const rolled = rollResult(
    playerStats.luck,
    playerStats.weightLuck,
    playerStats.weightMultiplier
  );

  const added = addToInventory(inventory, rolled);

  if (!added) {
    rollButton.disabled = true;
    rollButton.textContent = "INVENTORY FULL";
    canRoll = false;
    return;
  }

  saveInventory(inventory);

  result.innerHTML = `
    <h2>${rolled.gem.name}</h2>

    <p>Rarity: 1 in ${rolled.gem.rarity.toLocaleString()}</p>

    <p>
      Weight: ${rolled.finalWeight.toFixed(2)}g
      (${rolled.weightMultiplier.toFixed(3)}x)
    </p>

    <p>Value: $${rolled.value.toFixed(2)}</p>

    <p>
      Inventory:
      ${inventory.items.length}/${inventory.capacity}
    </p>
  `;

  const cooldownMs = getCooldownMs();

  let remaining = cooldownMs;

  rollButton.textContent =
    `ROLL (${(remaining / 1000).toFixed(1)}s)`;

  const timer = setInterval(() => {
    remaining -= 100;

    if (remaining <= 0) {
      clearInterval(timer);

      if (isInventoryFull(inventory)) {
        rollButton.disabled = true;
        rollButton.textContent = "INVENTORY FULL";
        canRoll = false;
      } else {
        canRoll = true;
        rollButton.disabled = false;
        rollButton.textContent = "ROLL";
      }

      return;
    }

    rollButton.textContent =
      `ROLL (${(remaining / 1000).toFixed(1)}s)`;
  }, 100);
});
