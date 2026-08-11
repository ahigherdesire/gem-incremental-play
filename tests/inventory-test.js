import {
  createInventory,
  addGemToInventory,
  isInventoryFull,
  removeGemFromInventory,
  toggleGemLock,
  getGemCount
} from "../src/logic/inventory.js";

const inventory = createInventory();

console.log("Starting inventory:");
console.log(inventory);

for (let i = 1; i <= 15; i++) {
  const added = addGemToInventory(inventory, {
    gem: {
      name: `Test Gem ${i}`,
      rarity: 10,
      baseWeight: 100,
      valuePerGram: 1
    },
    weightMultiplier: 1,
    rolledWeight: 100,
    finalWeight: 100,
    value: 100
  });

  console.log(
    `Added item ${i}: ${added} | ` +
    `Slots: ${getGemCount(inventory)}/${inventory.capacity}`
  );
}

console.log("\nInventory full:", isInventoryFull(inventory));

const extraItemAdded = addGemToInventory(inventory, {
  gem: {
    name: "Extra Gem",
    rarity: 999,
    baseWeight: 100,
    valuePerGram: 1
  },
  weightMultiplier: 1,
  rolledWeight: 100,
  finalWeight: 100,
  value: 100
});

console.log("Can add 16th item:", extraItemAdded);

toggleGemLock(inventory, 0);
console.log(
  "First item locked:",
  inventory.gems[0].locked
);

const removed = removeGemFromInventory(inventory, 1);
console.log(
  "Removed:",
  removed?.gem.name
);

console.log(
  `Final slots: ${getGemCount(inventory)}/${inventory.capacity}`
);
