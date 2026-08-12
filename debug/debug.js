import recipes
  from "../src/data/recipes.js";

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


// =========================================================
// RENDER DEBUG PAGE
// =========================================================

async function renderDebug() {
  // =================================
  // AUTH
  // =================================

  const user =
    await ensurePlayerAuth();


  if (!user) {
    debugStats.innerHTML = `
      <section class="debug-card">
        <h2>
          Error
        </h2>

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
        <h2>
          Error
        </h2>

        <p>
          Could not load cloud debug state.
        </p>
      </section>
    `;

    return;
  }


  // =================================
  // AUTO CRAFT DISPLAY
  // =================================

  const activeAutoCraftId =
    cloudState
      .crafting
      .activeAutoCraftRecipeId;


  const activeAutoCraftRecipe =
    activeAutoCraftId
      ? recipes.find(
          (recipe) =>
            recipe.id ===
            activeAutoCraftId
        )
      : null;


  const activeAutoCraftText =
    activeAutoCraftRecipe
      ?.name ??
    activeAutoCraftId ??
    "None";


  // =================================
  // RAREST GEM DISPLAY
  // =================================

  let rarestGemText =
    "None";


  if (
    cloudState
      .lifetime
      .rarestGemName
  ) {
    const name =
      cloudState
        .lifetime
        .rarestGemName;


    const rarity =
      cloudState
        .lifetime
        .rarestGemRarity;


    rarestGemText =
      rarity
        ? `${name} (1 in ${rarity.toLocaleString()})`
        : name;
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
        ${activeAutoCraftText}
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
        ${cloudState.lifetime.totalRolls.toLocaleString()}
      </p>

      <p>
        Rarest Gem:
        ${rarestGemText}
      </p>
    </section>
  `;
}


// =========================================================
// INITIAL LOAD
// =========================================================

renderDebug();


// =========================================================
// REFRESH WHEN RETURNING TO PAGE
// =========================================================

window.addEventListener(
  "pageshow",
  renderDebug
);


// =========================================================
// LIVE DEBUG REFRESH
// =========================================================

setInterval(
  renderDebug,
  500
);
