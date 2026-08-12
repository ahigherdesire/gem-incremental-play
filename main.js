import {
  ensurePlayerAuth
} from "./src/backend/auth.js";

import {
  supabase
} from "./src/backend/supabase.js";

import {
  createPlayer,
  loadPlayer,
  recordRoll
} from "./src/logic/player.js";


const rollButton =
  document.getElementById(
    "rollButton"
  );

const result =
  document.getElementById(
    "result"
  );


let player =
  loadPlayer() ??
  createPlayer();

let cooldownTimer =
  null;


// =========================================================
// LOAD SERVER ROLL STATE
// =========================================================

async function loadServerRollState() {
  const [
    playerResult,
    inventoryResult
  ] =
    await Promise.all([
      supabase
        .from("players")
        .select(`
          inventory_capacity,
          next_roll_at
        `)
        .single(),

      supabase
        .from("inventory_gems")
        .select(
          "id",
          {
            count: "exact",
            head: true
          }
        )
    ]);


  if (playerResult.error) {
    console.error(
      "Failed to load player roll state:",
      playerResult.error
    );

    return null;
  }


  if (inventoryResult.error) {
    console.error(
      "Failed to load inventory count:",
      inventoryResult.error
    );

    return null;
  }


  return {
    capacity:
      playerResult.data
        .inventory_capacity,

    nextRollAt:
      playerResult.data
        .next_roll_at,

    inventoryCount:
      inventoryResult.count ??
      0
  };
}


// =========================================================
// READY BUTTON
// =========================================================

async function showReadyButton() {
  const state =
    await loadServerRollState();


  if (!state) {
    rollButton.disabled =
      true;

    rollButton.textContent =
      "ERROR";

    return;
  }


  if (
    state.inventoryCount >=
    state.capacity
  ) {
    rollButton.disabled =
      true;

    rollButton.textContent =
      "INVENTORY FULL";

    return;
  }


  rollButton.disabled =
    false;

  rollButton.textContent =
    "ROLL";
}


// =========================================================
// COOLDOWN DISPLAY
// =========================================================

function startCooldown(
  cooldownEnd
) {
  if (cooldownTimer) {
    clearInterval(
      cooldownTimer
    );
  }


  rollButton.disabled =
    true;


  function updateCooldown() {
    const remaining =
      cooldownEnd -
      Date.now();


    if (
      remaining <= 0
    ) {
      clearInterval(
        cooldownTimer
      );

      cooldownTimer =
        null;


      showReadyButton();

      return;
    }


    rollButton.textContent =
      `ROLL (${(
        remaining /
        1000
      ).toFixed(1)}s)`;
  }


  updateCooldown();


  cooldownTimer =
    setInterval(
      updateCooldown,
      100
    );
}


// =========================================================
// RESTORE SERVER STATE
// =========================================================

async function restoreGameState() {
  const user =
    await ensurePlayerAuth();


  if (!user) {
    rollButton.disabled =
      true;

    rollButton.textContent =
      "AUTH ERROR";

    return;
  }


  const state =
    await loadServerRollState();


  if (!state) {
    rollButton.disabled =
      true;

    rollButton.textContent =
      "ERROR";

    return;
  }


  if (
    state.nextRollAt
  ) {
    const cooldownEnd =
      new Date(
        state.nextRollAt
      ).getTime();


    if (
      cooldownEnd >
      Date.now()
    ) {
      startCooldown(
        cooldownEnd
      );

      return;
    }
  }


  await showReadyButton();
}


// =========================================================
// SERVER ROLL
// =========================================================

async function performServerRoll() {
  rollButton.disabled =
    true;

  rollButton.textContent =
    "ROLLING...";


  const {
    data,
    error
  } =
    await supabase
      .functions
      .invoke(
        "roll"
      );


  // =======================================================
  // HANDLE SERVER ERROR
  // =======================================================

  if (error) {
    console.error(
      "Server roll failed:",
      error
    );


    if (
      error.name ===
      "FunctionsHttpError"
    ) {
      try {
        const details =
          await error.context
            .json();


        console.error(
          "Server response:",
          details
        );


        // ---------------------------------
        // COOLDOWN
        // ---------------------------------

        if (
          details.error ===
          "cooldown"
        ) {
          if (
            details.nextRollAt
          ) {
            startCooldown(
              new Date(
                details.nextRollAt
              ).getTime()
            );
          }

          return;
        }


        // ---------------------------------
        // INVENTORY FULL
        // ---------------------------------

        if (
          details.error ===
          "inventory_full"
        ) {
          rollButton.disabled =
            true;

          rollButton.textContent =
            "INVENTORY FULL";

          return;
        }
      } catch (
        parseError
      ) {
        console.error(
          "Could not read server error:",
          parseError
        );
      }
    }


    rollButton.disabled =
      false;

    rollButton.textContent =
      "ROLL";

    return;
  }


  if (!data) {
    console.error(
      "Server returned no roll."
    );

    await showReadyButton();

    return;
  }


  // =======================================================
  // NORMALIZE SERVER RESULT
  // =======================================================

  const rolled = {
    gem: {
      name:
        data.gem.name,

      rarity:
        data.gem.rarity,

      baseWeight:
        data.gem.baseWeight,

      valuePerGram:
        data.gem.valuePerGram
    },

    weightMultiplier:
      data.weightMultiplier,

    rolledWeight:
      data.rolledWeight,

    finalWeight:
      data.finalWeight,

    value:
      data.value
  };


  // =======================================================
  // TEMPORARY LOCAL LIFETIME STATS
  //
  // Total Rolls / Rarest Gem / Gem Index
  // have not been migrated yet.
  // =======================================================

  recordRoll(
    player,
    rolled
  );


  // =======================================================
  // DISPLAY RESULT
  // =======================================================

  const autoDeposited =
    data.autoCraft?.deposited ===
    true;
  
  const autoCraftRecipe =
    autoDeposited
      ? recipes.find(
          (recipe) =>
            recipe.id ===
            data.autoCraft.recipeId
        )
      : null;
  
  const autoCraftName =
    autoCraftRecipe?.name ??
    data.autoCraft?.recipeId ??
    "crafting";
  
  
  result.innerHTML = `
    <h2>
      ${rolled.gem.name}
    </h2>
  
    <p>
      Rarity:
      1 in
      ${rolled.gem.rarity.toLocaleString()}
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
            Auto-deposited into
            <strong>
              ${autoCraftName}
            </strong>.
          </p>
        `
        : `
          <p>
            Inventory:
            ${data.inventory.count}
            /
            ${data.inventory.capacity}
          </p>
        `
    }
  `;

  // =======================================================
  // SERVER COOLDOWN
  // =======================================================

  if (
    data.cooldown
      ?.nextRollAt
  ) {
    startCooldown(
      new Date(
        data.cooldown
          .nextRollAt
      ).getTime()
    );
  } else {
    await showReadyButton();
  }
}


// =========================================================
// ROLL BUTTON
// =========================================================

rollButton.addEventListener(
  "click",
  async (event) => {
    // This is no longer a security
    // mechanism — the server enforces
    // everything important.
    //
    // We can still ignore synthetic
    // clicks for normal UI behaviour.
    if (!event.isTrusted) {
      return;
    }


    await performServerRoll();
  }
);


// =========================================================
// PAGE EVENTS
// =========================================================

window.addEventListener(
  "pageshow",
  restoreGameState
);


restoreGameState();
