import recipes from "../src/data/recipes.js";

import {
  createCraftingState,
  ensureRecipeProgress,
  manuallyDepositRequirement,
  isRequirementComplete,
  isRecipeReady,
  resetRecipeProgress
} from "../src/logic/crafting.js";

import {
  addEquipment,
  hasEquipmentTierOrHigher
} from "../src/logic/inventory.js";

import {
  loadInventory,
  saveInventory,
  loadCraftingState,
  saveCraftingState
} from "../src/logic/storage.js";

import {
  createPlayer,
  loadPlayer,
  savePlayer
} from "../src/logic/player.js";

const recipeList =
  document.getElementById("recipeList");

const moneyDisplay =
  document.getElementById("money");

const craftingTabs =
  document.querySelectorAll(".crafting-tab");

let craftingState =
  loadCraftingState() ??
  createCraftingState();

let player =
  loadPlayer() ??
  createPlayer();

let inventory =
  loadInventory() ?? {
    capacity: 15,
    gems: [],
    equipment: []
  };

let selectedCategory = "pickaxe";


// =========================================================
// DISPLAY HELPERS
// =========================================================

function formatBonuses(bonus = {}) {
  const bonuses = [];

  if (bonus.luck) {
    bonuses.push(
      `+${(bonus.luck * 100).toFixed(0)}% Luck`
    );
  }

  if (bonus.rollSpeed) {
    bonuses.push(
      `+${(bonus.rollSpeed * 100).toFixed(0)}% Roll Speed`
    );
  }

  if (bonus.weightLuck) {
    bonuses.push(
      `+${(bonus.weightLuck * 100).toFixed(0)}% Weight Luck`
    );
  }

  if (bonus.weightMultiplier) {
    bonuses.push(
      `+${(
        bonus.weightMultiplier *
        100
      ).toFixed(0)}% Weight Multiplier`
    );
  }

  return bonuses.length > 0
    ? bonuses.join(", ")
    : "None";
}


function formatRequirementLabel(requirement) {
  switch (requirement.type) {
    case "gem-count":
      return requirement.gem;

    case "equipment":
      return (
        `Required: ` +
        (
          requirement.equipmentName ??
          requirement.equipmentId
        )
      );

    case "gem-total-weight":
      return `${requirement.gem} total weight`;

    case "gem-min-weight-multiplier":
      return (
        `${requirement.gem} ≥ ` +
        `${requirement.minimumWeightMultiplier}× weight`
      );

    case "gem-max-weight-multiplier":
      return (
        `${requirement.gem} ≤ ` +
        `${requirement.maximumWeightMultiplier}× weight`
      );

    case "specimen-condition":
      return (
        requirement.label ??
        "Special specimen"
      );

    case "specimen-value-total":
      return "Sacrifice value";

    case "rarity-points":
      return "Rarity points";

    case "gem-range":
      return (
        requirement.label ??
        "Gem collection"
      );

    default:
      return requirement.type;
  }
}


function formatRequirementProgress(
  requirement,
  progressValue
) {
  switch (requirement.type) {
    case "gem-count":
      return (
        `${progressValue ?? 0} / ` +
        `${requirement.amount}`
      );

    case "gem-total-weight":
      return (
        `${(progressValue ?? 0).toFixed(2)}g / ` +
        `${requirement.totalWeight}g`
      );

    case "gem-min-weight-multiplier":
    case "gem-max-weight-multiplier":
    case "specimen-condition":
      return (
        `${progressValue ?? 0} / ` +
        `${requirement.amount ?? 1}`
      );

    case "specimen-value-total":
      return (
        `$${(progressValue ?? 0).toFixed(2)} / ` +
        `$${requirement.totalValue.toFixed(2)}`
      );

    case "rarity-points": {
      const points =
        progressValue?.points ?? 0;

      const unique =
        progressValue?.gemTypes?.length ?? 0;

      const minimumUnique =
        requirement.minimumUniqueGemTypes ?? 0;

      if (minimumUnique > 0) {
        return (
          `${points} / ${requirement.points} points` +
          ` | ${unique} / ${minimumUnique} gem types`
        );
      }

      return (
        `${points} / ${requirement.points}`
      );
    }

    case "gem-range": {
      const current =
        progressValue ?? {};

      const completed =
        requirement.gems.filter(
          (gemName) =>
            (current[gemName] ?? 0) >=
            (requirement.amountEach ?? 1)
        ).length;

      return (
        `${completed} / ` +
        `${requirement.gems.length} gems`
      );
    }

    default:
      return "";
  }
}


function getRequirementProgressKey(
  requirement,
  index
) {
  if (requirement.id) {
    return requirement.id;
  }

  if (
    requirement.type ===
    "gem-count"
  ) {
    return requirement.gem;
  }

  return (
    `${requirement.type}-${index}`
  );
}


// =========================================================
// CRAFTING CATEGORY TABS
// =========================================================

function setCraftingCategory(category) {
  selectedCategory =
    category;

  craftingTabs.forEach(
    (tab) => {
      tab.classList.toggle(
        "active",
        tab.dataset.category ===
          category
      );
    }
  );

  renderRecipes();
}


craftingTabs.forEach(
  (tab) => {
    tab.addEventListener(
      "click",
      () => {
        setCraftingCategory(
          tab.dataset.category
        );
      }
    );
  }
);


// =========================================================
// AUTO CRAFT
// =========================================================

function setAutoCraft(recipeId) {
  if (
    craftingState
      .activeAutoCraftRecipeId ===
    recipeId
  ) {
    craftingState
      .activeAutoCraftRecipeId =
      null;
  } else {
    craftingState
      .activeAutoCraftRecipeId =
      recipeId;
  }

  saveCraftingState(
    craftingState
  );

  renderRecipes();
}


// =========================================================
// CRAFT ITEM
// =========================================================

function craftRecipe(recipe) {
  if (
    hasEquipmentTierOrHigher(
      inventory,
      recipe.reward.category,
      recipe.reward.tier
    )
  ) {
    return;
  }

  if (
    !isRecipeReady(
      craftingState,
      recipe,
      player,
      inventory
    )
  ) {
    return;
  }

  player.money -=
    recipe.moneyCost;

  // Consume previous equipment
  // when upgrading.
  for (
    const requirement
    of recipe.requirements
  ) {
    if (
      requirement.type !==
      "equipment"
    ) {
      continue;
    }

    const index =
      inventory.equipment.findIndex(
        (equipment) =>
          equipment.id ===
          requirement.equipmentId
      );

    if (index !== -1) {
      inventory.equipment.splice(
        index,
        1
      );
    }
  }

  // Add new equipment and
  // automatically equip it.
  addEquipment(
    inventory,
    {
      ...recipe.reward,
      equipped: true
    }
  );

  resetRecipeProgress(
    craftingState,
    recipe.id
  );

  savePlayer(player);
  saveInventory(inventory);

  saveCraftingState(
    craftingState
  );

  renderRecipes();
}


// =========================================================
// RENDER RECIPES
// =========================================================

function renderRecipes() {
  recipeList.innerHTML = "";

  moneyDisplay.textContent =
    `$${player.money.toFixed(2)}`;

  const visibleRecipes =
    recipes.filter(
      (recipe) =>
        recipe.category ===
        selectedCategory
    );

  for (
    const recipe
    of visibleRecipes
  ) {
    const progress =
      ensureRecipeProgress(
        craftingState,
        recipe
      );

    const owned =
      hasEquipmentTierOrHigher(
        inventory,
        recipe.reward.category,
        recipe.reward.tier
      );

    const requirementsHtml =
      recipe.requirements
        .map(
          (requirement, index) => {
            // -------------------------
            // EQUIPMENT REQUIREMENT
            // -------------------------

            if (
              requirement.type ===
              "equipment"
            ) {
              const requirementMet =
                inventory.equipment.some(
                  (equipment) =>
                    equipment.id ===
                    requirement.equipmentId
                );

              const requiredRecipe =
                recipes.find(
                  (otherRecipe) =>
                    otherRecipe.reward
                      ?.id ===
                    requirement
                      .equipmentId
                );

              const requiredName =
                requiredRecipe
                  ?.reward
                  ?.name ??
                requirement
                  .equipmentName ??
                requirement
                  .equipmentId;

              return `
                <div class="requirement">
                  <span>
                    Required:
                    ${requiredName}
                  </span>

                  <span>
                    ${
                      requirementMet
                        ? "✓"
                        : "✗"
                    }
                  </span>
                </div>
              `;
            }

            // -------------------------
            // NORMAL / SPECIAL
            // REQUIREMENT
            // -------------------------

            const key =
              getRequirementProgressKey(
                requirement,
                index
              );

            const value =
              progress[key];

            const complete =
              isRequirementComplete(
                craftingState,
                recipe,
                requirement,
                index,
                inventory
              );

            return `
              <div class="requirement">
                <span>
                  ${formatRequirementLabel(
                    requirement
                  )}
                </span>

                <span>
                  ${formatRequirementProgress(
                    requirement,
                    value
                  )}

                  ${
                    complete
                      ? "✓"
                      : ""
                  }

                  ${
                    !complete &&
                    !owned
                      ? `
                        <button
                          class="deposit-button"
                          data-recipe="${recipe.id}"
                          data-requirement-index="${index}"
                        >
                          Deposit
                        </button>
                      `
                      : ""
                  }
                </span>
              </div>
            `;
          }
        )
        .join("");

    const moneyComplete =
      player.money >=
      recipe.moneyCost;

    const autoCraftEnabled =
      craftingState
        .activeAutoCraftRecipeId ===
      recipe.id;

    const ready =
      isRecipeReady(
        craftingState,
        recipe,
        player,
        inventory
      );

    const card =
      document.createElement(
        "div"
      );

    card.className =
      "recipe-card";

    card.innerHTML = `
      <h2>
        ${recipe.name}
      </h2>

      <p>
        Bonus:
        ${formatBonuses(
          recipe.reward?.bonus
        )}
      </p>

      ${
        owned
          ? `
            <p>
              ✓ Owned
            </p>
          `
          : `
            <div class="requirements">
              ${requirementsHtml}

              <div class="requirement">
                <span>
                  Money
                </span>

                <span>
                  $${player.money.toFixed(2)}
                  /
                  $${recipe.moneyCost.toFixed(2)}
                  ${
                    moneyComplete
                      ? "✓"
                      : ""
                  }
                </span>
              </div>
            </div>

            <button
              class="auto-craft-button"
            >
              Auto Craft:
              ${
                autoCraftEnabled
                  ? "ON"
                  : "OFF"
              }
            </button>

            <button
              class="craft-button"
              ${
                ready
                  ? ""
                  : "disabled"
              }
            >
              Craft
            </button>
          `
      }
    `;

    // =====================================================
    // BUTTON EVENTS
    // =====================================================

    if (!owned) {
      const autoCraftButton =
        card.querySelector(
          ".auto-craft-button"
        );

      autoCraftButton
        ?.addEventListener(
          "click",
          () => {
            setAutoCraft(
              recipe.id
            );
          }
        );


      const craftButton =
        card.querySelector(
          ".craft-button"
        );

      craftButton
        ?.addEventListener(
          "click",
          () => {
            craftRecipe(
              recipe
            );
          }
        );


      card
        .querySelectorAll(
          ".deposit-button"
        )
        .forEach(
          (button) => {
            button.addEventListener(
              "click",
              () => {
                const recipeId =
                  button.dataset
                    .recipe;

                const requirementIndex =
                  Number(
                    button.dataset
                      .requirementIndex
                  );

                const selectedRecipe =
                  recipes.find(
                    (recipe) =>
                      recipe.id ===
                      recipeId
                  );

                if (
                  !selectedRecipe
                ) {
                  return;
                }

                const deposited =
                  manuallyDepositRequirement(
                    craftingState,
                    selectedRecipe,
                    inventory,
                    requirementIndex
                  );

                if (!deposited) {
                  return;
                }

                saveInventory(
                  inventory
                );

                saveCraftingState(
                  craftingState
                );

                renderRecipes();
              }
            );
          }
        );
    }

    recipeList.appendChild(
      card
    );
  }

  saveCraftingState(
    craftingState
  );
}


// =========================================================
// REFRESH PAGE STATE
// =========================================================

function refreshCraftingPage() {
  craftingState =
    loadCraftingState() ??
    createCraftingState();

  player =
    loadPlayer() ??
    createPlayer();

  inventory =
    loadInventory() ?? {
      capacity: 15,
      gems: [],
      equipment: []
    };

  renderRecipes();
}


window.addEventListener(
  "pageshow",
  refreshCraftingPage
);

refreshCraftingPage();
