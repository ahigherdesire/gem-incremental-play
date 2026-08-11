import { rollResult } from "./src/logic/rollResult.js";

import {
  createInventory,
  addGemToInventory,
  isInventoryFull
} from "./src/logic/inventory.js";

import recipes from "./src/data/recipes.js";

import {
  createCraftingState,
  tryAutoDeposit
} from "./src/logic/crafting.js";

import {
  getPlayerStats
} from "./src/logic/playerStats.js";

import {
  createPlayer,
  loadPlayer,
  recordRoll
} from "./src/logic/player.js";

import {
  saveInventory,
  loadInventory,
  saveCooldownEnd,
  loadCooldownEnd,
  clearCooldownEnd,
  saveCraftingState,
  loadCraftingState
} from "./src/logic/storage.js";

const rollButton =
  document.getElementById("rollButton");

const result =
  document.getElementById("result");

let inventory =
  loadInventory() ??
  createInventory();

let craftingState =
  loadCraftingState() ??
  createCraftingState();

let player =
  loadPlayer() ??
  createPlayer();

let cooldownTimer = null;

function getCooldownMs() {
  const stats =
    getPlayerStats(inventory);

  const baseCooldownSeconds = 3;

  return (
    baseCooldownSeconds /
    stats.rollSpeed
  ) * 1000;
}

function refreshInventory() {
  inventory =
    loadInventory() ??
    createInventory();
}

function refreshCraftingState() {
  craftingState =
    loadCraftingState() ??
    createCraftingState();
}

function showReadyButton() {
  refreshInventory();

  if (isInventoryFull(inventory)) {
    rollButton.disabled = true;
    rollButton.textContent =
      "INVENTORY FULL";
  } else {
    rollButton.disabled = false;
    rollButton.textContent =
      "ROLL";
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
    setInterval(
      updateCooldown,
      100
    );
}

function restoreGameState() {
  refreshInventory();
  refreshCraftingState();

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

  rollButton.addEventListener(
    "click",
    (event) => {
      if (!event.isTrusted) {
        return;
      }
    refreshInventory();
    refreshCraftingState();

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

    const stats =
      getPlayerStats(inventory);

    const rolled =
      rollResult(
        stats.luck,
        stats.weightLuck,
        stats.weightMultiplier
      );
      recordRoll(
        player,
        rolled
      );

    let autoDeposited = false;

    if (
      craftingState.activeAutoCraftRecipeId
    ) {
      const activeRecipe =
        recipes.find(
          (recipe) =>
            recipe.id ===
            craftingState
              .activeAutoCraftRecipeId
        );

      if (activeRecipe) {
        autoDeposited =
          tryAutoDeposit(
            craftingState,
            activeRecipe,
            rolled
          );

        if (autoDeposited) {
          saveCraftingState(
            craftingState
          );
        }
      }
    }

    if (!autoDeposited) {
      const added =
        addGemToInventory(
          inventory,
          rolled
        );

      if (!added) {
        showReadyButton();
        return;
      }

      saveInventory(inventory);
    }

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

      ${
        autoDeposited
          ? `
            <p>
              Auto-deposited into crafting.
            </p>
          `
          : `
            <p>
              Inventory:
              ${inventory.gems.length}/${inventory.capacity}
            </p>
          `
      }
    `;

    const newCooldownEnd =
      Date.now() +
      getCooldownMs();

    saveCooldownEnd(
      newCooldownEnd
    );

    startCooldown(
      newCooldownEnd
    );
  }
);

window.addEventListener(
  "pageshow",
  restoreGameState
);

restoreGameState();
