import {
  ensurePlayerAuth
} from "../src/backend/auth.js";

import {
  loadCloudGems
} from "../src/backend/cloudInventory.js";


const status =
  document.getElementById(
    "status"
  );

const inventoryDisplay =
  document.getElementById(
    "inventory"
  );


async function testCloudInventory() {
  const user =
    await ensurePlayerAuth();

  if (!user) {
    status.textContent =
      "❌ Authentication failed";

    return;
  }


  const gems =
    await loadCloudGems();


  if (!gems) {
    status.textContent =
      "❌ Failed to load inventory";

    return;
  }


  status.textContent =
    `✅ Loaded ${gems.length} cloud gem(s)`;


  if (
    gems.length === 0
  ) {
    inventoryDisplay.innerHTML =
      "<p>No gems stored.</p>";

    return;
  }


  inventoryDisplay.innerHTML =
    gems
      .map(
        (gem) => `
          <div>
            <h2>
              ${gem.gem_name}
            </h2>

            <p>
              ID:
              ${gem.id}
            </p>

            <p>
              Rarity:
              1 in
              ${gem.rarity.toLocaleString()}
            </p>

            <p>
              Weight:
              ${gem.final_weight.toFixed(2)}g
            </p>

            <p>
              Weight Multiplier:
              ${gem.rolled_weight_multiplier.toFixed(3)}x
            </p>

            <p>
              Value:
              $${gem.value.toFixed(2)}
            </p>

            <p>
              Locked:
              ${gem.locked}
            </p>

            <hr>
          </div>
        `
      )
      .join("");
}


testCloudInventory();
