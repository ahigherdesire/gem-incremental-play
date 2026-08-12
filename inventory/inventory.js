import {
  toggleGemLock,
  removeGemFromInventory
} from "../src/logic/inventory.js";

import {
  loadInventory,
  saveInventory
} from "../src/logic/storage.js";

import {
  createPlayer,
  loadPlayer,
  savePlayer
} from "../src/logic/player.js";

import {
  ensurePlayerAuth
} from "../src/backend/auth.js";

import {
  loadCloudGems,
  loadCloudPlayerState,
  toggleCloudGemLock,
  sellCloudGem,
  upgradeCloudInventory
} from "../src/backend/cloudInventory.js";


// =========================================================
// DOM ELEMENTS
// =========================================================

const inventoryCount =
  document.getElementById("inventoryCount");

const moneyDisplay =
  document.getElementById("money");

const inventoryList =
  document.getElementById("inventoryList");

const equipmentList =
  document.getElementById("equipmentList");

const gemsTab =
  document.getElementById("gemsTab");

const equipmentTab =
  document.getElementById("equipmentTab");

const gemsSection =
  document.getElementById("gemsSection");

const equipmentSection =
  document.getElementById("equipmentSection");

const capacityStatus =
  document.getElementById("capacityStatus");

const capacityUpgradeInfo =
  document.getElementById(
    "capacityUpgradeInfo"
  );

const capacityUpgradeButton =
  document.getElementById(
    "capacityUpgradeButton"
  );


// =========================================================
// SAVED STATE
// =========================================================

let inventory =
  loadInventory() ?? {
    capacity: 15,
    gems: [],
    equipment: []
  };

let player =
  loadPlayer() ??
  createPlayer();

let cloudGems = [];

let cloudCapacity = 15;

let cloudMoney = 0;


// =========================================================
// CAPACITY UPGRADES
// =========================================================

const capacityUpgrades = [
  {
    from: 15,
    to: 20,
    cost: 1000
  },
  {
    from: 20,
    to: 25,
    cost: 3000
  },
  {
    from: 25,
    to: 30,
    cost: 8000
  },
  {
    from: 30,
    to: 40,
    cost: 20000
  },
  {
    from: 40,
    to: 50,
    cost: 50000
  }
];


function getNextCapacityUpgrade() {
  return capacityUpgrades.find(
    (upgrade) =>
      upgrade.from ===
      cloudCapacity
  );
}


function renderCapacityUpgrade() {
  capacityStatus.textContent =
    `${cloudCapacity} slots`;


  const nextUpgrade =
    getNextCapacityUpgrade();


  if (!nextUpgrade) {
    capacityUpgradeInfo.textContent =
      "Maximum capacity reached.";

    capacityUpgradeButton.disabled =
      true;

    capacityUpgradeButton.textContent =
      "MAXED";

    return;
  }


  capacityUpgradeInfo.textContent =
    `Next upgrade: ` +
    `${nextUpgrade.to} slots — ` +
    `$${nextUpgrade.cost.toLocaleString()}`;


  capacityUpgradeButton.disabled =
    cloudMoney <
    nextUpgrade.cost;


  capacityUpgradeButton.textContent =
    "Upgrade Capacity";
}


// =========================================================
// INVENTORY TABS
// =========================================================

function showGemsTab() {
  gemsTab.classList.add(
    "active"
  );

  equipmentTab.classList.remove(
    "active"
  );

  gemsSection.classList.remove(
    "hidden"
  );

  equipmentSection.classList.add(
    "hidden"
  );
}


function showEquipmentTab() {
  equipmentTab.classList.add(
    "active"
  );

  gemsTab.classList.remove(
    "active"
  );

  equipmentSection.classList.remove(
    "hidden"
  );

  gemsSection.classList.add(
    "hidden"
  );
}


gemsTab.addEventListener(
  "click",
  showGemsTab
);


equipmentTab.addEventListener(
  "click",
  showEquipmentTab
);


// =========================================================
// RENDER GEM INVENTORY
// =========================================================

function renderGems() {
  inventoryList.innerHTML = "";

  inventoryCount.textContent =
    `${cloudGems.length} / ${cloudCapacity}`;

  if (
    cloudGems.length === 0
  ) {
    inventoryList.innerHTML =
      "<p>Your gem inventory is empty.</p>";

    return;
  }

  cloudGems.forEach(
    (gem) => {
      const card =
        document.createElement(
          "div"
        );

      card.className =
        "inventory-item";

      card.innerHTML = `
        <h2>
          ${gem.gem_name}
        </h2>

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
          ${
            gem.locked
              ? "🔒 Locked"
              : "🔓 Unlocked"
          }
        </p>

        <button
          class="lock-button"
        >
          ${
            gem.locked
              ? "🔓 Unlock"
              : "🔒 Lock"
          }
        </button>

        <button
          class="sell-button"
          ${gem.locked ? "disabled" : ""}
        >
          Sell
        </button>
      `;


      // =================================
      // LOCK / UNLOCK
      // =================================

      const lockButton =
        card.querySelector(
          ".lock-button"
        );

      lockButton.addEventListener(
        "click",
        async () => {
          lockButton.disabled =
            true;

          const result =
            await toggleCloudGemLock(
              gem.id
            );

          if (!result) {
            lockButton.disabled =
              false;

            return;
          }

          await refreshInventoryPage();
        }
      );


      // =================================
      // SELL GEM
      // =================================

      const sellButton =
        card.querySelector(
          ".sell-button"
        );

      sellButton.addEventListener(
        "click",
        async () => {
          // Extra client-side guard.
          // The server also checks this.
          if (gem.locked) {
            return;
          }

          sellButton.disabled =
            true;

          lockButton.disabled =
            true;

          const result =
            await sellCloudGem(
              gem.id
            );

          if (!result) {
            sellButton.disabled =
              false;

            lockButton.disabled =
              false;

            return;
          }

          await refreshInventoryPage();
        }
      );


      // =================================
      // ADD CARD
      // =================================

      inventoryList.appendChild(
        card
      );
    }
  );
}

// =========================================================
// RENDER EQUIPMENT
// =========================================================

function renderEquipment() {
  equipmentList.innerHTML = "";

  if (
    inventory.equipment.length === 0
  ) {
    equipmentList.innerHTML =
      "<p>You do not own any equipment yet.</p>";

    return;
  }

  inventory.equipment.forEach(
    (equipment) => {
      const card =
        document.createElement(
          "div"
        );

      card.className =
        "equipment-item";

      const bonuses = [];


      if (
        equipment.bonus?.luck
      ) {
        bonuses.push(
          `+${(
            equipment.bonus.luck *
            100
          ).toFixed(0)}% Luck`
        );
      }


      if (
        equipment.bonus?.rollSpeed
      ) {
        bonuses.push(
          `+${(
            equipment.bonus.rollSpeed *
            100
          ).toFixed(0)}% Roll Speed`
        );
      }


      if (
        equipment.bonus?.weightLuck
      ) {
        bonuses.push(
          `+${(
            equipment.bonus.weightLuck *
            100
          ).toFixed(0)}% Weight Luck`
        );
      }


      if (
        equipment.bonus
          ?.weightMultiplier
      ) {
        bonuses.push(
          `+${(
            equipment.bonus
              .weightMultiplier *
            100
          ).toFixed(0)}% Weight Multiplier`
        );
      }


      card.innerHTML = `
        <h2>
          ${equipment.name}
        </h2>

        <p>
          Type:
          ${equipment.category}
        </p>

        <p>
          Tier:
          ${equipment.tier ?? "?"}
        </p>

        <p>
          Bonus:
          ${
            bonuses.length > 0
              ? bonuses.join(", ")
              : "None"
          }
        </p>

        <p>
          Status:
          ${
            equipment.equipped
              ? "Equipped"
              : "Not Equipped"
          }
        </p>
      `;


      equipmentList.appendChild(
        card
      );
    }
  );
}


// =========================================================
// RENDER FULL INVENTORY PAGE
// =========================================================

function renderInventory() {
  moneyDisplay.textContent =
    `$${cloudMoney.toFixed(2)}`;

  renderCapacityUpgrade();

  renderGems();

  renderEquipment();
}


// =========================================================
// BUY CAPACITY UPGRADE
// =========================================================

capacityUpgradeButton.addEventListener(
  "click",
  async () => {
    capacityUpgradeButton.disabled =
      true;


    const result =
      await upgradeCloudInventory();


    if (!result) {
      await refreshInventoryPage();

      return;
    }


    await refreshInventoryPage();
  }
);

// =========================================================
// REFRESH SAVED STATE
// =========================================================

async function refreshInventoryPage() {
  inventory =
    loadInventory() ?? {
      capacity: 15,
      gems: [],
      equipment: []
    };

  player =
    loadPlayer() ??
    createPlayer();


  const user =
    await ensurePlayerAuth();

  if (!user) {
    console.error(
      "Could not authenticate player."
    );

    return;
  }


  const loadedGems =
    await loadCloudGems();

  if (loadedGems) {
    cloudGems =
      loadedGems;
  }


  const cloudPlayerState =
    await loadCloudPlayerState();

  if (cloudPlayerState) {
    cloudCapacity =
      cloudPlayerState
        .inventory_capacity;

    cloudMoney =
      cloudPlayerState.money;
  }


  renderInventory();
}


window.addEventListener(
  "pageshow",
  refreshInventoryPage
);


// =========================================================
// INITIAL RENDER
// =========================================================

refreshInventoryPage();
