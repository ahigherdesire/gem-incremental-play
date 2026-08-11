import recipes from "../src/data/recipes.js";

import {
  createCraftingState,
  ensureRecipeProgress,
  manuallyDepositGem
} from "../src/logic/crafting.js";

import {
  loadInventory,
  saveInventory,
  loadCraftingState,
  saveCraftingState
} from "../src/logic/storage.js";

import {
  createPlayer,
  loadPlayer
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
    items: []
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

    const card =
      document.createElement("div");

    card.className = "recipe-card";

    const requirementsHtml =
      recipe.requirements
        .filter(
          (requirement) =>
            requirement.type ===
            "gem-count"
        )
        .map((requirement) => {
          const current =
            progress[requirement.gem] ?? 0;

          const complete =
            current >= requirement.amount;

          return `
            <div class="requirement">
              <span>
                ${requirement.gem}
              </span>

              <span>
                ${current} / ${requirement.amount}
                ${complete ? "✓" : ""}

                ${
                  !complete
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

    const moneyComplete =
      player.money >= recipe.moneyCost;

    const autoCraftEnabled =
      craftingState.activeAutoCraftRecipeId ===
      recipe.id;

    card.innerHTML = `
      <h2>${recipe.name}</h2>

      <div class="requirements">
        ${requirementsHtml}

        <div class="requirement">
          <span>Money</span>

          <span>
            $${player.money.toFixed(2)}
            /
            $${recipe.moneyCost.toFixed(2)}
            ${moneyComplete ? "✓" : ""}
          </span>
        </div>
      </div>

      <button class="auto-craft-button">
        Auto Craft:
        ${autoCraftEnabled ? "ON" : "OFF"}
      </button>

      <button
        class="craft-button"
        disabled
      >
        Craft
      </button>
    `;

    card
      .querySelector(
        ".auto-craft-button"
      )
      .addEventListener(
        "click",
        () => {
          setAutoCraft(recipe.id);
        }
      );

    card
      .querySelectorAll(
        ".deposit-button"
      )
      .forEach((button) => {
        button.addEventListener(
          "click",
          () => {
            const recipeId =
              button.dataset.recipe;

            const gemName =
              button.dataset.gem;

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

            saveInventory(inventory);

            saveCraftingState(
              craftingState
            );

            renderRecipes();
          }
        );
      });

    recipeList.appendChild(card);
  }

  saveCraftingState(craftingState);
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
      items: []
    };

  renderRecipes();
}

window.addEventListener(
  "pageshow",
  refreshCraftingPage
);

refreshCraftingPage();
