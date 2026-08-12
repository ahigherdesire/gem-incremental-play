import {
  ensurePlayerAuth
} from "../src/backend/auth.js";

import {
  supabase
} from "../src/backend/supabase.js";

import {
  loadPlayer
} from "../src/logic/player.js";


const migrateButton =
  document.getElementById(
    "migrateButton"
  );

const status =
  document.getElementById(
    "status"
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


    const localPlayer =
      loadPlayer();


    if (!localPlayer) {
      status.textContent =
        "❌ No local player save found.";

      migrateButton.disabled =
        false;

      return;
    }


    const totalRolls =
      Number(
        localPlayer.stats
          ?.totalRolls ??
        0
      );


    const rarestGem =
      localPlayer.stats
        ?.rarestGem ??
      null;


    const gemIndex =
      localPlayer.gemIndex ??
      {};


    console.log(
      "Migrating:",
      {
        totalRolls,
        rarestGem,
        gemIndex
      }
    );


    status.textContent =
      `Migrating ${totalRolls} local rolls...`;


    const {
      data,
      error
    } =
      await supabase
        .functions
        .invoke(
          "migrate-stats",
          {
            body: {
              totalRolls,
              rarestGem,
              gemIndex
            }
          }
        );


    if (error) {
      console.error(
        "Stats migration failed:",
        error
      );

      status.textContent =
        "❌ Migration failed.";

      migrateButton.disabled =
        false;

      return;
    }


    console.log(
      "Migration result:",
      data
    );


    status.textContent =
      `✅ Migrated. Total rolls: ${data.totalRolls}.`;
  }
);
