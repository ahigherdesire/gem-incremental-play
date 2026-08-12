import {
  ensurePlayerAuth
} from "../src/backend/auth.js";

import {
  supabase
} from "../src/backend/supabase.js";

import {
  loadCraftingState
} from "../src/logic/storage.js";

import {
  createCraftingState
} from "../src/logic/crafting.js";


const status =
  document.getElementById(
    "status"
  );

const migrateButton =
  document.getElementById(
    "migrateButton"
  );


migrateButton.addEventListener(
  "click",
  async () => {
    migrateButton.disabled =
      true;


    const user =
      await ensurePlayerAuth();


    if (!user) {
      status.textContent =
        "❌ Authentication failed.";

      migrateButton.disabled =
        false;

      return;
    }


    const craftingState =
      loadCraftingState() ??
      createCraftingState();


    console.log(
      "Local crafting state:",
      craftingState
    );


    status.textContent =
      "Migrating crafting state...";


    const {
      data,
      error
    } =
      await supabase
        .functions
        .invoke(
          "migrate-crafting",
          {
            body: {
              craftingState
            }
          }
        );


    if (error) {
      console.error(
        "Crafting migration failed:",
        error
      );

      status.textContent =
        "❌ Crafting migration failed.";

      migrateButton.disabled =
        false;

      return;
    }


    console.log(
      "Migration result:",
      data
    );


    status.textContent =
      `✅ Crafting migrated. ` +
      `${data.recipeProgressRows} progress row(s) copied.`;
  }
);
