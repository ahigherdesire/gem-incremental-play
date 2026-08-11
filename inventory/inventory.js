import {
  toggleLock,
  removeFromInventory
} from "../src/logic/inventory.js";

import {
  loadInventory,
  saveInventory
} from "../src/logic/storage.js";

const inventoryCount =
  document.getElementById("inventoryCount");

const inventoryList =
  document.getElementById("inventoryList");

let inventory = loadInventory();

function renderInventory() {
  inventoryList.innerHTML = "";

  if (!inventory) {
    inventoryCount.textContent = "0 / 15";
    inventoryList.innerHTML =
      "<p>Your inventory is empty.</p>";
    return;
  }

  inventoryCount.textContent =
    `${inventory.items.length} / ${inventory.capacity}`;

  if (inventory.items.length === 0) {
    inventoryList.innerHTML =
      "<p>Your inventory is empty.</p>";
    return;
  }

  inventory.items.forEach((item, index) => {
    const card = document.createElement("div");

    card.className = "inventory-item";

    card.innerHTML = `
      <h2>${item.gem.name}</h2>

      <p>Rarity: 1 in ${item.gem.rarity.toLocaleString()}</p>

      <p>Weight: ${item.finalWeight.toFixed(2)}g</p>

      <p>Value: $${item.value.toFixed(2)}</p>

      <button class="lock-button">
        ${item.locked ? "🔒 Locked" : "🔓 Unlocked"}
      </button>

      <button class="remove-button">
        Remove
      </button>
    `;

    card.querySelector(".lock-button")
      .addEventListener("click", () => {
        toggleLock(inventory, index);
        saveInventory(inventory);
        renderInventory();
      });

    card.querySelector(".remove-button")
      .addEventListener("click", () => {
        if (item.locked) {
          return;
        }

        removeFromInventory(inventory, index);
        saveInventory(inventory);
        renderInventory();
      });

    inventoryList.appendChild(card);
  });
}

renderInventory();
