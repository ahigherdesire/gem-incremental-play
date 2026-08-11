const INVENTORY_KEY =
  "gemIncrementalInventory";

const COOLDOWN_KEY =
  "gemIncrementalCooldownEnd";

const CRAFTING_KEY =
  "gemIncrementalCrafting";

export function saveInventory(inventory) {
  localStorage.setItem(
    INVENTORY_KEY,
    JSON.stringify(inventory)
  );
}

export function loadInventory() {
  const saved =
    localStorage.getItem(INVENTORY_KEY);

  if (!saved) {
    return null;
  }

  try {
    const inventory =
      JSON.parse(saved);

    // Migrate old inventory format:
    // { capacity, items }
    // ->
    // { capacity, gems, equipment }

    if (
      Array.isArray(inventory.items) &&
      !Array.isArray(inventory.gems)
    ) {
      inventory.gems =
        inventory.items;

      inventory.equipment = [];

      delete inventory.items;

      saveInventory(inventory);
    }

    if (!Array.isArray(inventory.gems)) {
      inventory.gems = [];
    }

    if (!Array.isArray(inventory.equipment)) {
      inventory.equipment = [];
    }

    // Temporary v0.1 equipment migration:
    // automatically equip the only item in a category
    for (const equipment of inventory.equipment) {
      const sameCategory =
        inventory.equipment.filter(
          (item) =>
            item.category === equipment.category
        );
    
      const categoryHasEquipped =
        sameCategory.some(
          (item) => item.equipped
        );
    
      if (
        sameCategory.length === 1 &&
        !categoryHasEquipped
      ) {
        equipment.equipped = true;
      }
    }
    
    saveInventory(inventory);

    return inventory;
  } catch {
    return null;
  }
}

export function saveCooldownEnd(time) {
  localStorage.setItem(
    COOLDOWN_KEY,
    time.toString()
  );
}

export function loadCooldownEnd() {
  const saved =
    localStorage.getItem(COOLDOWN_KEY);

  if (!saved) {
    return null;
  }

  return Number(saved);
}

export function clearCooldownEnd() {
  localStorage.removeItem(
    COOLDOWN_KEY
  );
}

export function saveCraftingState(
  craftingState
) {
  localStorage.setItem(
    CRAFTING_KEY,
    JSON.stringify(craftingState)
  );
}

export function loadCraftingState() {
  const saved =
    localStorage.getItem(CRAFTING_KEY);

  if (!saved) {
    return null;
  }

  try {
    return JSON.parse(saved);
  } catch {
    return null;
  }
}
