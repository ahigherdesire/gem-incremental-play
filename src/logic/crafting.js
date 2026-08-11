export function createCraftingState() {
  return {
    activeAutoCraftRecipeId: null,
    progress: {}
  };
}

export function ensureRecipeProgress(
  craftingState,
  recipe
) {
  if (!craftingState.progress[recipe.id]) {
    craftingState.progress[recipe.id] = {};

    for (const requirement of recipe.requirements) {
      if (requirement.type === "gem-count") {
        craftingState.progress[recipe.id][requirement.gem] = 0;
      }
    }
  }

  return craftingState.progress[recipe.id];
}

export function tryAutoDeposit(
  craftingState,
  recipe,
  specimen
) {
  const progress =
    ensureRecipeProgress(craftingState, recipe);

  const requirement =
    recipe.requirements.find(
      (req) =>
        req.type === "gem-count" &&
        req.gem === specimen.gem.name
    );

  if (!requirement) {
    return false;
  }

  const current =
    progress[requirement.gem] ?? 0;

  if (current >= requirement.amount) {
    return false;
  }

  progress[requirement.gem] =
    current + 1;

  return true;
}

export function manuallyDepositGem(
  craftingState,
  recipe,
  inventory,
  gemName
) {
  const progress =
    ensureRecipeProgress(
      craftingState,
      recipe
    );

  const requirement =
    recipe.requirements.find(
      (req) =>
        req.type === "gem-count" &&
        req.gem === gemName
    );

  if (!requirement) {
    return false;
  }

  const current =
    progress[gemName] ?? 0;

  if (current >= requirement.amount) {
    return false;
  }

  const eligible = inventory.gems
    .map((item, index) => ({
      item,
      index
    }))
    .filter(
      ({ item }) =>
        item.gem.name === gemName &&
        !item.locked
    )
    .sort(
      (a, b) =>
        a.item.finalWeight -
        b.item.finalWeight
    );

  if (eligible.length === 0) {
    return false;
  }

  const selected =
    eligible[0];

  inventory.gems.splice(
    selected.index,
    1
  );

  progress[gemName] =
    current + 1;

  return true;
}

export function isRecipeReady(
  craftingState,
  recipe,
  player
) {
  const progress =
    ensureRecipeProgress(
      craftingState,
      recipe
    );

  const gemsComplete =
    recipe.requirements.every(
      (requirement) => {
        if (
          requirement.type !==
          "gem-count"
        ) {
          return true;
        }

        const current =
          progress[requirement.gem] ?? 0;

        return (
          current >= requirement.amount
        );
      }
    );

  const moneyComplete =
    player.money >= recipe.moneyCost;

  return (
    gemsComplete &&
    moneyComplete
  );
}

export function resetRecipeProgress(
  craftingState,
  recipeId
) {
  delete craftingState.progress[recipeId];

  if (
    craftingState.activeAutoCraftRecipeId ===
    recipeId
  ) {
    craftingState.activeAutoCraftRecipeId =
      null;
  }
}
