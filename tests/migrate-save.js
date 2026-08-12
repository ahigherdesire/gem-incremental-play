import {
  ensurePlayerAuth
} from "../src/backend/auth.js";

import {
  supabase
} from "../src/backend/supabase.js";


const preview =
  document.getElementById(
    "preview"
  );

const result =
  document.getElementById(
    "result"
  );

const migrateButton =
  document.getElementById(
    "migrateButton"
  );


// =========================================================
// READ LEGACY SAVE
// =========================================================

function readLegacySave() {
  let player = null;
  let inventory = null;
  let crafting = null;


  try {
    player =
      JSON.parse(
        localStorage.getItem(
          "gemIncrementalPlayer"
        )
      );
  } catch {
    player = null;
  }


  try {
    inventory =
      JSON.parse(
        localStorage.getItem(
          "gemIncrementalInventory"
        )
      );
  } catch {
    inventory = null;
  }


  try {
    crafting =
      JSON.parse(
        localStorage.getItem(
          "gemIncrementalCrafting"
        )
      );
  } catch {
    crafting = null;
  }


  return {
    player,
    inventory,
    crafting
  };
}


// =========================================================
// PREVIEW
// =========================================================

const legacySave =
  readLegacySave();


preview.textContent =
  JSON.stringify(
    legacySave,
    null,
    2
  );


if (
  !legacySave.player ||
  !legacySave.inventory ||
  !legacySave.crafting
) {
  result.textContent =
    "❌ Complete legacy save not found.";

  migrateButton.disabled =
    true;
}


// =========================================================
// MIGRATION
// =========================================================

migrateButton.addEventListener(
  "click",
  async () => {
    migrateButton.disabled =
      true;

    result.textContent =
      "Authenticating...";


    const user =
      await ensurePlayerAuth();


    if (!user) {
      result.textContent =
        "❌ Authentication failed.";

      migrateButton.disabled =
        false;

      return;
    }


    console.log(
      "Cloud player:",
      user.id
    );


    console.log(
      "Legacy migration payload:",
      legacySave
    );


    result.textContent =
      "Migrating legacy save...";


    const {
      data,
      error
    } =
      await supabase
        .functions
        .invoke(
          "migrate-save",
          {
            body:
              legacySave
          }
        );


    if (error) {
      console.error(
        "Migration invoke error:",
        error
      );


      // Supabase function errors sometimes hide the
      // response body inside the error context.
      let details =
        error.message ??
        String(error);


      try {
        if (
          error.context &&
          typeof error.context.json ===
            "function"
        ) {
          const body =
            await error.context.json();

          details =
            body.error ??
            JSON.stringify(
              body
            );
        }
      } catch {
        // Ignore response parsing failure.
      }


      result.textContent =
        `❌ Migration failed:\n${details}`;

      migrateButton.disabled =
        false;

      return;
    }


    console.log(
      "Migration result:",
      data
    );


    result.textContent =
      `✅ Migration complete.\n\n${
        JSON.stringify(
          data,
          null,
          2
        )
      }`;
  }
);
