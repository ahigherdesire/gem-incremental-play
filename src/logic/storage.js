const INVENTORY_KEY = "gemIncrementalInventory";

export function saveInventory(inventory) {
  localStorage.setItem(
    INVENTORY_KEY,
    JSON.stringify(inventory)
  );
}

export function loadInventory() {
  const saved = localStorage.getItem(INVENTORY_KEY);

  if (!saved) {
    return null;
  }

  try {
    return JSON.parse(saved);
  } catch {
    return null;
  }
}
