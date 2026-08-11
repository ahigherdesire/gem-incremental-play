const DEFAULT_CAPACITY = 15;

export function createInventory(capacity = DEFAULT_CAPACITY) {
  return {
    capacity,
    items: []
  };
}

export function isInventoryFull(inventory) {
  return inventory.items.length >= inventory.capacity;
}

export function addToInventory(inventory, specimen) {
  if (isInventoryFull(inventory)) {
    return false;
  }

  inventory.items.push({
    ...specimen,
    locked: false
  });

  return true;
}

export function removeFromInventory(inventory, index) {
  if (index < 0 || index >= inventory.items.length) {
    return null;
  }

  return inventory.items.splice(index, 1)[0];
}

export function toggleLock(inventory, index) {
  const item = inventory.items[index];

  if (!item) {
    return false;
  }

  item.locked = !item.locked;
  return true;
}

export function getInventoryCount(inventory) {
  return inventory.items.length;
}
