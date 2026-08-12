import recipes
  from "../src/data/recipes.js";

import {
  ensurePlayerAuth
} from "../src/backend/auth.js";

import {
  supabase
} from "../src/backend/supabase.js";


const status =
  document.getElementById(
    "status"
  );

const seedButton =
  document.getElementById(
    "seedButton"
  );


seedButton.addEventListener(
  "click",
  async () => {
    seedButton.disabled =
      true;


    const user =
      await ensurePlayerAuth();


    if (!user) {
      status.textContent =
        "❌ Authentication failed.";

      seedButton.disabled =
        false;

      return;
    }


    status.textContent =
      `Sending ${recipes.length} recipes...`;


    const {
      data,
      error
    } =
      await supabase
        .functions
        .invoke(
          "seed-recipes",
          {
            body: {
              recipes
            }
          }
        );


    if (error) {
      console.error(
        "Recipe seed failed:",
        error
      );

      status.textContent =
        "❌ Recipe seed failed.";

      seedButton.disabled =
        false;

      return;
    }


    console.log(
      "Seed result:",
      data
    );


    status.textContent =
      `✅ Seeded ${data.seeded} recipes.`;
  }
);
