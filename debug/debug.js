import {
  loadInventory,
  loadCraftingState,
  loadCooldownEnd
} from "../src/logic/storage.js";

import {
  createInventory
} from "../src/logic/inventory.js";

import {
  createCraftingState
} from "../src/logic/crafting.js";

import {
  createPlayer,
  loadPlayer
} from "../src/logic/player.js";

import {
  getPlayerStats
} from "../src/logic/playerStats.js";

import {
  loadCloudDebugState
} from "../src/backend/cloudDebug.js";

import {
  ensurePlayerAuth
} from "../src/backend/auth.js";

const debugStats =
  document.getElementById("debugStats");

async function renderDebug() {
  const user =
    await ensurePlayerAuth();


  if (!user) {
    console.error(
      "Could not authenticate player."
    );

    return;
  }


  const cloudState =
    await loadCloudDebugState();


  if (!cloudState) {
    console.error(
      "Could not load cloud debug state."
    );

    return;
  }


  // =================================
  // CLOUD PLAYER STATS
  // =================================

  luckDisplay.textContent =
    `Luck: ${cloudState.stats.luck.toFixed(2)}x`;

  rollSpeedDisplay.textContent =
    `Roll Speed: ${cloudState.stats.rollSpeed.toFixed(2)}x`;

  weightLuckDisplay.textContent =
    `Weight Luck: ${cloudState.stats.weightLuck.toFixed(2)}x`;

  weightMultiplierDisplay.textContent =
    `Weight Multiplier: ${cloudState.stats.weightMultiplier.toFixed(2)}x`;


  // =================================
  // CLOUD PLAYER DATA
  // =================================

  moneyDisplay.textContent =
    `Money: $${cloudState.player.money.toFixed(2)}`;

  gemsDisplay.textContent =
    `Gems: ` +
    `${cloudState.player.gemCount} / ` +
    `${cloudState.player.inventoryCapacity}`;

  equipmentDisplay.textContent =
    `Equipment Owned: ` +
    `${cloudState.player.equipmentCount}`;


  // =================================
  // CLOUD COOLDOWN
  // =================================

  cooldownDisplay.textContent =
    `Cooldown Remaining: ` +
    `${cloudState.rolling.cooldownRemaining.toFixed(1)}s`;


  // =================================
  // KEEP EXISTING LOCAL CODE
  // =================================

  // Active Auto Craft
  // Total Rolls
  // Rarest Gem
  //
  // Leave these using the existing
  // localStorage logic for now.
}

window.addEventListener(
  "pageshow",
  renderDebug
);

setInterval(
  renderDebug,
  100
);
