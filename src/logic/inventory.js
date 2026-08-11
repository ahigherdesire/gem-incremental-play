const DEFAULT_CAPACITY = 15;

export function createInventory(capacity = DEFAULT_CAPACITY) {
  return {
    capacity,
    gems: [],
    equipment: []
  };
}

export function isInventoryFull(inventory) {
  return inventory.gems.length >= inventory.capacity;
}

export function addGemToInventory(inventory, specimen) {
  if (isInventoryFull(inventory)) {
    return false;
  }

  inventory.gems.push({
    ...specimen,
    locked: false
  });

  return true;
}

export function removeGemFromInventory(inventory, index) {
  if (
    index < 0 ||
    index >= inventory.gems.length
  ) {
    return null;
  }

  return inventory.gems.splice(index, 1)[0];
}

export function toggleGemLock(inventory, index) {
  const item = inventory.gems[index];

  if (!item) {
    return false;
  }

  item.locked = !item.locked;
  return true;
}

export function getGemCount(inventory) {
  return inventory.gems.length;
}

export function addEquipment(inventory, equipment) {
  inventory.equipment.push(equipment);

  return true;
}

export function hasEquipment(inventory, equipmentId) {
  return inventory.equipment.some(
    (item) => item.id === equipmentId
  );
}
