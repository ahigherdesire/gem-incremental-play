import recipes from "../src/data/recipes.js";

import {
  createCraftingState,
  ensureRecipeProgress,
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

import {
  loadCloudCraftingState,
  manuallyDepositCloudRequirement
} from "../src/backend/cloudCrafting.js";

import {
  ensurePlayerAuth
} from "../src/backend/auth.js";


const recipeList =
  document.getElementById(
    "recipeList"
  );

const moneyDisplay =
  document.getElementById(
    "money"
  );

const craftingTabs =
  document.querySelectorAll(
    ".crafting-tab"
  );


let craftingState =
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

let selectedCategory =
  "pickaxe";


// =========================================================
// LOAD CLOUD CRAFTING STATE
// =========================================================

async function loadCraftingPageState() {
  const user =
    await ensurePlayerAuth();

  if (!user) {
    console.error(
      "Could not authenticate player."
    );

    return false;
  }


  const cloudState =
    await loadCloudCraftingState();

  if (!cloudState) {
    console.error(
      "Could not load cloud crafting state."
    );

    return false;
  }


  craftingState =
    cloudState;

  return true;
}


// =========================================================
// DISPLAY HELPERS
// =========================================================

function formatBonuses(
  bonus = {}
) {
  const bonuses = [];


  if (bonus.luck) {
    bonuses.push(
      `+${(
        bonus.luck *
        100
      ).toFixed(0)}% Luck`
    );
  }


  if (bonus.rollSpeed) {
    bonuses.push(
      `+${(
        bonus.rollSpeed *
        100
      ).toFixed(0)}% Roll Speed`
    );
  }


  if (bonus.weightLuck) {
    bonuses.push(
      `+${(
        bonus.weightLuck *
        100
      ).toFixed(0)}% Weight Luck`
    );
  }


  if (
    bonus.weightMultiplier
  ) {
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


function formatRequirementLabel(
  requirement
) {
  switch (
    requirement.type
  ) {
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
      return (
        `${requirement.gem} total weight`
      );


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
  switch (
    requirement.type
  ) {
    case "gem-count":
      return (
        `${progressValue ?? 0} / ` +
        `${requirement.amount}`
      );


    case "gem-total-weight":
      return (
        `${(
          progressValue ??
          0
        ).toFixed(2)}g / ` +
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
        `$${(
          progressValue ??
          0
        ).toFixed(2)} / ` +
        `$${requirement.totalValue.toFixed(2)}`
      );


    case "rarity-points": {
      const points =
        progressValue
          ?.points ??
        0;

      const unique =
        progressValue
          ?.gemTypes
          ?.length ??
        0;

      const minimumUnique =
        requirement
          .minimumUniqueGemTypes ??
        0;


      if (
        minimumUnique >
        0
      ) {
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
        progressValue ??
        {};


      const completed =
        requirement.gems
          .filter(
            (gemName) =>
              (
                current[
                  gemName
                ] ??
                0
              ) >=
              (
                requirement
                  .amountEach ??
                1
              )
          )
          .length;


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

function setCraftingCategory(
  category
) {
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
//
// TEMPORARILY DISABLED
// UNTIL SERVER MIGRATION
// =========================================================

function setAutoCraft(
  recipeId
) {
  console.warn(
    "Auto Craft is temporarily disabled during cloud migration.",
    recipeId
  );
}


// =========================================================
// CRAFT ITEM
//
// TEMPORARILY DISABLED
// UNTIL SERVER MIGRATION
// =========================================================

function craftRecipe(
  recipe
) {
  console.warn(
    "Crafting is temporarily disabled during cloud migration.",
    recipe.id
  );
}


// =========================================================
// RENDER RECIPES
// =========================================================

function renderRecipes() {
  recipeList.innerHTML =
    "";


  // ---------------------------------------------------------
  // TEMPORARILY LOCAL MONEY DISPLAY
  //
  // We'll migrate this properly
  // when Craft is server-side.
  // ---------------------------------------------------------

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
          (
            requirement,
            index
          ) => {
            // ===============================================
            // EQUIPMENT REQUIREMENT
            // ===============================================

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
                  (
                    otherRecipe
                  ) =>
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


            // ===============================================
            // NORMAL / SPECIAL REQUIREMENT
            // ===============================================

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
              disabled
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
              disabled
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
      // -----------------------------------------------------
      // AUTO CRAFT
      // TEMPORARILY DISABLED
      // -----------------------------------------------------

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


      // -----------------------------------------------------
      // CRAFT
      // TEMPORARILY DISABLED
      // -----------------------------------------------------

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


      // -----------------------------------------------------
      // CLOUD MANUAL DEPOSIT
      // -----------------------------------------------------

      card
        .querySelectorAll(
          ".deposit-button"
        )
        .forEach(
          (button) => {
            button.addEventListener(
              "click",
              async () => {
                const recipeId =
                  button.dataset
                    .recipe;


                const requirementIndex =
                  Number(
                    button.dataset
                      .requirementIndex
                  );


                if (
                  !recipeId ||
                  !Number.isInteger(
                    requirementIndex
                  )
                ) {
                  return;
                }


                // Prevent duplicate clicks
                // while server processes
                // this deposit.
                button.disabled =
                  true;


                const result =
                  await manuallyDepositCloudRequirement(
                    recipeId,
                    requirementIndex
                  );


                if (!result) {
                  button.disabled =
                    false;

                  return;
                }


                console.log(
                  "Cloud deposit:",
                  result
                );


                // Reload authoritative
                // crafting state.
                const loaded =
                  await loadCraftingPageState();


                if (!loaded) {
                  button.disabled =
                    false;

                  return;
                }


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
}


// =========================================================
// INITIALIZE PAGE
// =========================================================

async function initializeCraftingPage() {
  const loaded =
    await loadCraftingPageState();


  if (!loaded) {
    return;
  }


  renderRecipes();
}


initializeCraftingPage();
