import {
  ensurePlayerAuth
} from "../src/backend/auth.js";

import {
  supabase
} from "../src/backend/supabase.js";

import {
  loadInventory
} from "../src/logic/storage.js";


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


    const localInventory =
      loadInventory();


    const equipment =
      localInventory
        ?.equipment ??
      [];


    console.log(
      "Local equipment:",
      equipment
    );


    status.textContent =
      `Found ${equipment.length} local equipment item(s). Migrating...`;


    const {
      data,
      error
    } =
      await supabase
        .functions
        .invoke(
          "migrate-equipment",
          {
            body: {
              equipment
            }
          }
        );


    if (error) {
      console.error(
        "Migration error:",
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
      `✅ Migrated ${data.migrated} equipment item(s).`;
  }
);
