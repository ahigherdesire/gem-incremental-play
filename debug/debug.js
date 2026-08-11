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

const debugStats =
  document.getElementById("debugStats");

function renderDebug() {
  const inventory =
    loadInventory() ??
    createInventory();

  const stats =
    getPlayerStats(inventory);

  const craftingState =
    loadCraftingState() ??
    createCraftingState();

  const player =
    loadPlayer() ??
    createPlayer();

  const cooldownEnd =
    loadCooldownEnd();

  const cooldownRemaining =
    cooldownEnd
      ? Math.max(
          0,
          cooldownEnd - Date.now()
        )
      : 0;

  const activeRecipe =
    craftingState
      .activeAutoCraftRecipeId ??
    "None";

  debugStats.innerHTML = `
    <div class="debug-card">
      <h2>Player Stats</h2>

      <p>
        Luck:
        ${stats.luck.toFixed(2)}x
      </p>

      <p>
        Roll Speed:
        ${stats.rollSpeed.toFixed(2)}x
      </p>

      <p>
        Weight Luck:
        ${stats.weightLuck.toFixed(2)}x
      </p>

      <p>
        Weight Multiplier:
        ${stats.weightMultiplier.toFixed(2)}x
      </p>
    </div>

    <div class="debug-card">
      <h2>Player</h2>

      <p>
        Money:
        $${player.money.toFixed(2)}
      </p>

      <p>
        Gems:
        ${inventory.gems.length}
        /
        ${inventory.capacity}
      </p>

      <p>
        Equipment Owned:
        ${inventory.equipment.length}
      </p>
    </div>

    <div class="debug-card">
      <h2>Crafting</h2>

      <p>
        Active Auto Craft:
        ${activeRecipe}
      </p>
    </div>

    <div class="debug-card">
      <h2>Rolling</h2>

      <p>
        Cooldown Remaining:
        ${(cooldownRemaining / 1000).toFixed(1)}s
      </p>
    </div>
    <div class="debug-card">
      <h2>Lifetime Stats</h2>
    
      <p>
        Total Rolls:
        ${player.stats?.totalRolls ?? 0}
      </p>
    
      <p>
        Rarest Gem:
        ${
          player.stats?.rarestGem
            ? `
              ${player.stats.rarestGem.name}
              (1 in ${player.stats.rarestGem.rarity.toLocaleString()})
            `
            : "None yet"
        }
      </p>
    </div>
  `;
}

renderDebug();

setInterval(
  renderDebug,
  100
);
