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
