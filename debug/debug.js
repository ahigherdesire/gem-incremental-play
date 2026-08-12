import {
  loadInventory,
  loadCraftingState
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
  ensurePlayerAuth
} from "../src/backend/auth.js";

import {
  loadCloudDebugState
} from "../src/backend/cloudDebug.js";


const debugStats =
  document.getElementById(
    "debugStats"
  );


async function renderDebug() {
  // =================================
  // AUTH
  // =================================

  const user =
    await ensurePlayerAuth();

  if (!user) {
    debugStats.innerHTML = `
      <section class="debug-card">
        <h2>Error</h2>
        <p>
          Could not authenticate player.
        </p>
      </section>
    `;

    return;
  }


  // =================================
  // LOAD CLOUD STATE
  // =================================

  const cloudState =
    await loadCloudDebugState();

  if (!cloudState) {
    debugStats.innerHTML = `
      <section class="debug-card">
        <h2>Error</h2>
        <p>
          Could not load cloud debug state.
        </p>
      </section>
    `;

    return;
  }


  // =================================
  // LOAD REMAINING LOCAL STATE
  // =================================

  const inventory =
    loadInventory() ??
    createInventory();

  const craftingState =
    loadCraftingState() ??
    createCraftingState();

  const player =
    loadPlayer() ??
    createPlayer();


  // =================================
  // LOCAL CRAFTING VALUE
  // =================================

  const activeAutoCraft =
    craftingState.activeAutoCraft ??
    "None";


  // =================================
  // LOCAL LIFETIME STATS
  // =================================

  const totalRolls =
    player.stats?.totalRolls ??
    0;
  
  let rarestGemText =
    "None";
  
  if (
    player.stats?.rarestGem
  ) {
    const rarestGem =
      player.stats.rarestGem;

    if (
      typeof rarestGem ===
      "string"
    ) {
      rarestGemText =
        rarestGem;
    } else {
      const name =
        rarestGem.name ??
        "Unknown";

      const rarity =
        rarestGem.rarity;

      rarestGemText =
        rarity
          ? `${name} (1 in ${Number(rarity).toLocaleString()})`
          : name;
    }
  }


  // =================================
  // RENDER PAGE
  // =================================

  debugStats.innerHTML = `
    <section class="debug-card">
      <h2>
        Player Stats
      </h2>

      <p>
        Luck:
        ${cloudState.stats.luck.toFixed(2)}x
      </p>

      <p>
        Roll Speed:
        ${cloudState.stats.rollSpeed.toFixed(2)}x
      </p>

      <p>
        Weight Luck:
        ${cloudState.stats.weightLuck.toFixed(2)}x
      </p>

      <p>
        Weight Multiplier:
        ${cloudState.stats.weightMultiplier.toFixed(2)}x
      </p>
    </section>


    <section class="debug-card">
      <h2>
        Player
      </h2>

      <p>
        Money:
        $${cloudState.player.money.toFixed(2)}
      </p>

      <p>
        Gems:
        ${cloudState.player.gemCount}
        /
        ${cloudState.player.inventoryCapacity}
      </p>

      <p>
        Equipment Owned:
        ${cloudState.player.equipmentCount}
      </p>
    </section>


    <section class="debug-card">
      <h2>
        Crafting
      </h2>

      <p>
        Active Auto Craft:
        ${activeAutoCraft}
      </p>
    </section>


    <section class="debug-card">
      <h2>
        Rolling
      </h2>

      <p>
        Cooldown Remaining:
        ${cloudState.rolling.cooldownRemaining.toFixed(1)}s
      </p>
    </section>


    <section class="debug-card">
      <h2>
        Lifetime Stats
      </h2>

      <p>
        Total Rolls:
        ${totalRolls}
      </p>

      <p>
        Rarest Gem:
        ${rarestGemText}
      </p>
    </section>
  `;
}


renderDebug();


window.addEventListener(
  "pageshow",
  renderDebug
);


setInterval(
  renderDebug,
  500
);
