const INVENTORY_KEY = "gemIncrementalInventory";
const COOLDOWN_KEY = "gemIncrementalCooldownEnd";

export function saveCooldownEnd(time) {
  localStorage.setItem(
    COOLDOWN_KEY,
    time.toString()
  );
}

export function loadCooldownEnd() {
  const saved = localStorage.getItem(COOLDOWN_KEY);

  if (!saved) {
    return null;
  }

  return Number(saved);
}

export function clearCooldownEnd() {
  localStorage.removeItem(COOLDOWN_KEY);
}

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
