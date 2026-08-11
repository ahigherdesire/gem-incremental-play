import {
  createInventory,
  addToInventory,
  isInventoryFull,
  removeFromInventory,
  toggleLock,
  getInventoryCount
} from "../src/logic/inventory.js";

const inventory = createInventory();

console.log("Starting inventory:");
console.log(inventory);

for (let i = 1; i <= 15; i++) {
  const added = addToInventory(inventory, {
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
    `Slots: ${getInventoryCount(inventory)}/${inventory.capacity}`
  );
}

console.log("\nInventory full:", isInventoryFull(inventory));

const extraItemAdded = addToInventory(inventory, {
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

toggleLock(inventory, 0);
console.log(
  "First item locked:",
  inventory.items[0].locked
);

const removed = removeFromInventory(inventory, 1);
console.log(
  "Removed:",
  removed?.gem.name
);

console.log(
  `Final slots: ${getInventoryCount(inventory)}/${inventory.capacity}`
);
