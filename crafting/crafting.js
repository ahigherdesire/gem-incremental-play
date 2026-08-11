import recipes from "../src/data/recipes.js";

import {
  createCraftingState,
  ensureRecipeProgress,
  manuallyDepositGem,
  isRecipeReady,
  resetRecipeProgress
} from "../src/logic/crafting.js";

import {
  addEquipment,
  hasEquipment,
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

function setAutoCraft(recipeId) {
  if (
    craftingState.activeAutoCraftRecipeId ===
    recipeId
  ) {
    craftingState.activeAutoCraftRecipeId =
      null;
  } else {
    craftingState.activeAutoCraftRecipeId =
      recipeId;
  }

  saveCraftingState(craftingState);

  renderRecipes();
}

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

  // Consume previous equipment if the recipe requires it
  for (const requirement of recipe.requirements) {
    if (
      requirement.type ===
      "equipment"
    ) {
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
  }

  // Add and auto-equip the newly crafted equipment
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

function renderRecipes() {
  recipeList.innerHTML = "";

  moneyDisplay.textContent =
    `$${player.money.toFixed(2)}`;

  for (const recipe of recipes) {
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
        .filter(
          (requirement) =>
            requirement.type ===
            "gem-count"
        )
        .map((requirement) => {
          const current =
            progress[
              requirement.gem
            ] ?? 0;

          const complete =
            current >=
            requirement.amount;

          return `
            <div class="requirement">
              <span>
                ${requirement.gem}
              </span>

              <span>
                ${current} /
                ${requirement.amount}
                ${complete ? "✓" : ""}

                ${
                  !complete &&
                  !owned
                    ? `
                      <button
                        class="deposit-button"
                        data-recipe="${recipe.id}"
                        data-gem="${requirement.gem}"
                      >
                        Deposit
                      </button>
                    `
                    : ""
                }
              </span>
            </div>
          `;
        })
        .join("");

    const equipmentRequirementsHtml =
      recipe.requirements
        .filter(
          (requirement) =>
            requirement.type ===
            "equipment"
        )
        .map((requirement) => {
          const requiredEquipment =
            inventory.equipment.find(
              (equipment) =>
                equipment.id ===
                requirement.equipmentId
            );

          const requirementMet =
            Boolean(requiredEquipment);

          const requiredRecipe =
            recipes.find(
              (otherRecipe) =>
                otherRecipe.reward?.id ===
                requirement.equipmentId
            );

          const requiredName =
            requiredRecipe?.reward?.name ??
            requirement.equipmentId;

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
        })
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
        +${(
          (recipe.reward?.bonus?.luck ?? 0) *
          100
        ).toFixed(0)}% Luck
      </p>

      ${
        owned
          ? `
            <p>
              ✓ Owned
            </p>

            <p>
              Bonus:
              +${(
                recipe.reward
                  .bonus.luck *
                100
              ).toFixed(0)}%
              Luck
            </p>
          `
          : `
            <div class="requirements">
              ${equipmentRequirementsHtml}
              ${requirementsHtml}

              <div class="requirement">
                <span>
                  Money
                </span>

                <span>
                  $${player.money.toFixed(2)}
                  /
                  $${recipe.moneyCost.toFixed(2)}
                  ${moneyComplete ? "✓" : ""}
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
              ${ready ? "" : "disabled"}
            >
              Craft
            </button>
          `
      }
    `;

    if (!owned) {
      card
        .querySelector(
          ".auto-craft-button"
        )
        .addEventListener(
          "click",
          () => {
            setAutoCraft(
              recipe.id
            );
          }
        );

      card
        .querySelector(
          ".craft-button"
        )
        .addEventListener(
          "click",
          () => {
            craftRecipe(recipe);
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

                const gemName =
                  button.dataset
                    .gem;

                const selectedRecipe =
                  recipes.find(
                    (recipe) =>
                      recipe.id ===
                      recipeId
                  );

                if (!selectedRecipe) {
                  return;
                }

                const deposited =
                  manuallyDepositGem(
                    craftingState,
                    selectedRecipe,
                    inventory,
                    gemName
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
