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


// =========================================================
// CAPACITY UPGRADES
// =========================================================

const capacityUpgrades = [
  {
    capacity: 20,
    cost: 1000
  },

  {
    capacity: 25,
    cost: 3000
  },

  {
    capacity: 30,
    cost: 8000
  },

  {
    capacity: 40,
    cost: 20000
  },

  {
    capacity: 50,
    cost: 50000
  }
];


function getNextCapacityUpgrade() {
  return capacityUpgrades.find(
    (upgrade) =>
      upgrade.capacity >
      inventory.capacity
  );
}


function renderCapacityUpgrade() {
  capacityStatus.textContent =
    `${inventory.capacity} slots`;

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
    `${nextUpgrade.capacity} slots — ` +
    `$${nextUpgrade.cost.toLocaleString()}`;

  capacityUpgradeButton.disabled =
    player.money <
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
    `${inventory.gems.length} / ${inventory.capacity}`;

  if (
    inventory.gems.length === 0
  ) {
    inventoryList.innerHTML =
      "<p>Your gem inventory is empty.</p>";

    return;
  }

  inventory.gems.forEach(
    (item, index) => {
      const card =
        document.createElement(
          "div"
        );

      card.className =
        "inventory-item";

      card.innerHTML = `
        <h2>
          ${item.gem.name}
        </h2>

        <p>
          Rarity:
          1 in
          ${item.gem.rarity.toLocaleString()}
        </p>

        <p>
          Weight:
          ${item.finalWeight.toFixed(2)}g
        </p>

        <p>
          Value:
          $${item.value.toFixed(2)}
        </p>

        <button
          class="lock-button"
        >
          ${
            item.locked
              ? "🔒 Locked"
              : "🔓 Unlocked"
          }
        </button>

        <button
          class="sell-button"
        >
          Sell
        </button>
      `;


      // -------------------------
      // LOCK / UNLOCK
      // -------------------------

      card
        .querySelector(
          ".lock-button"
        )
        .addEventListener(
          "click",
          () => {
            toggleGemLock(
              inventory,
              index
            );

            saveInventory(
              inventory
            );

            renderInventory();
          }
        );


      // -------------------------
      // SELL GEM
      // -------------------------

      card
        .querySelector(
          ".sell-button"
        )
        .addEventListener(
          "click",
          () => {
            if (item.locked) {
              return;
            }

            player.money +=
              item.value;

            removeGemFromInventory(
              inventory,
              index
            );

            saveInventory(
              inventory
            );

            savePlayer(
              player
            );

            renderInventory();
          }
        );


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
    `$${player.money.toFixed(2)}`;

  renderCapacityUpgrade();

  renderGems();

  renderEquipment();
}


// =========================================================
// BUY CAPACITY UPGRADE
// =========================================================

capacityUpgradeButton.addEventListener(
  "click",
  () => {
    const nextUpgrade =
      getNextCapacityUpgrade();

    if (!nextUpgrade) {
      return;
    }

    if (
      player.money <
      nextUpgrade.cost
    ) {
      return;
    }

    player.money -=
      nextUpgrade.cost;

    inventory.capacity =
      nextUpgrade.capacity;

    savePlayer(
      player
    );

    saveInventory(
      inventory
    );

    renderInventory();
  }
);


// =========================================================
// REFRESH SAVED STATE
// =========================================================

function refreshInventoryPage() {
  inventory =
    loadInventory() ?? {
      capacity: 15,
      gems: [],
      equipment: []
    };

  player =
    loadPlayer() ??
    createPlayer();

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
