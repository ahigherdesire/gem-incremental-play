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

const inventoryCount =
  document.getElementById("inventoryCount");

const moneyDisplay =
  document.getElementById("money");

const inventoryList =
  document.getElementById("inventoryList");

let inventory = loadInventory();

let player =
  loadPlayer() ?? createPlayer();

function renderInventory() {
  inventoryList.innerHTML = "";

  moneyDisplay.textContent =
    `$${player.money.toFixed(2)}`;

  if (!inventory) {
    inventoryCount.textContent = "0 / 15";
    inventoryList.innerHTML =
      "<p>Your inventory is empty.</p>";
    return;
  }

  inventoryCount.textContent =
    `${inventory.gems.length} / ${inventory.capacity}`;

  if (inventory.gems.length === 0) {
    inventoryList.innerHTML =
      "<p>Your inventory is empty.</p>";
    return;
  }

  inventory.gems.forEach((item, index) => {
    const card =
      document.createElement("div");

    card.className =
      "inventory-item";

    card.innerHTML = `
      <h2>${item.gem.name}</h2>

      <p>
        Rarity:
        1 in ${item.gem.rarity.toLocaleString()}
      </p>

      <p>
        Weight:
        ${item.finalWeight.toFixed(2)}g
      </p>

      <p>
        Value:
        $${item.value.toFixed(2)}
      </p>

      <button class="lock-button">
        ${item.locked ? "🔒 Locked" : "🔓 Unlocked"}
      </button>

      <button class="sell-button">
        Sell
      </button>
    `;

    card
      .querySelector(".lock-button")
      .addEventListener("click", () => {
        toggleGemLock(inventory, index);

        saveInventory(inventory);

        renderInventory();
      });

    card
      .querySelector(".sell-button")
      .addEventListener("click", () => {
        if (item.locked) {
          return;
        }

        player.money += item.value;

        removeGemFromInventory(
          inventory,
          index
        );

        saveInventory(inventory);
        savePlayer(player);

        renderInventory();
      });

    inventoryList.appendChild(card);
  });
}

function refreshInventoryPage() {
  inventory =
    loadInventory();

  player =
    loadPlayer() ?? createPlayer();

  renderInventory();
}

window.addEventListener(
  "pageshow",
  refreshInventoryPage
);

refreshInventoryPage();
