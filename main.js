import { rollResult } from "./src/logic/rollResult.js";

import {
  createInventory,
  addToInventory,
  isInventoryFull
} from "./src/logic/inventory.js";

import {
  saveInventory,
  loadInventory,
  saveCooldownEnd,
  loadCooldownEnd,
  clearCooldownEnd
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

let cooldownTimer = null;

function getCooldownMs() {
  const baseCooldownSeconds = 5;

  return (
    baseCooldownSeconds /
    playerStats.rollSpeed
  ) * 1000;
}

function refreshInventory() {
  inventory =
    loadInventory() ?? createInventory();
}

function showReadyButton() {
  refreshInventory();

  if (isInventoryFull(inventory)) {
    rollButton.disabled = true;
    rollButton.textContent = "INVENTORY FULL";
  } else {
    rollButton.disabled = false;
    rollButton.textContent = "ROLL";
  }
}

function startCooldown(cooldownEnd) {
  if (cooldownTimer) {
    clearInterval(cooldownTimer);
  }

  rollButton.disabled = true;

  function updateCooldown() {
    const remaining =
      cooldownEnd - Date.now();

    if (remaining <= 0) {
      clearInterval(cooldownTimer);
      cooldownTimer = null;

      clearCooldownEnd();
      showReadyButton();

      return;
    }

    rollButton.textContent =
      `ROLL (${(remaining / 1000).toFixed(1)}s)`;
  }

  updateCooldown();

  cooldownTimer =
    setInterval(updateCooldown, 100);
}

function restoreGameState() {
  refreshInventory();

  const cooldownEnd =
    loadCooldownEnd();

  if (
    cooldownEnd &&
    cooldownEnd > Date.now()
  ) {
    startCooldown(cooldownEnd);
  } else {
    clearCooldownEnd();
    showReadyButton();
  }
}

rollButton.addEventListener("click", () => {
  refreshInventory();

  if (isInventoryFull(inventory)) {
    showReadyButton();
    return;
  }

  const cooldownEnd =
    loadCooldownEnd();

  if (
    cooldownEnd &&
    cooldownEnd > Date.now()
  ) {
    startCooldown(cooldownEnd);
    return;
  }

  const rolled = rollResult(
    playerStats.luck,
    playerStats.weightLuck,
    playerStats.weightMultiplier
  );

  const added =
    addToInventory(inventory, rolled);

  if (!added) {
    showReadyButton();
    return;
  }

  saveInventory(inventory);

  result.innerHTML = `
    <h2>${rolled.gem.name}</h2>

    <p>
      Rarity:
      1 in ${rolled.gem.rarity.toLocaleString()}
    </p>

    <p>
      Weight:
      ${rolled.finalWeight.toFixed(2)}g
      (${rolled.weightMultiplier.toFixed(3)}x)
    </p>

    <p>
      Value:
      $${rolled.value.toFixed(2)}
    </p>

    <p>
      Inventory:
      ${inventory.items.length}/${inventory.capacity}
    </p>
  `;

  const newCooldownEnd =
    Date.now() + getCooldownMs();

  saveCooldownEnd(newCooldownEnd);

  startCooldown(newCooldownEnd);
});

window.addEventListener(
  "pageshow",
  restoreGameState
);

restoreGameState();
