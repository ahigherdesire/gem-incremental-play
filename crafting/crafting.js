import recipes from "../src/data/recipes.js";

import {
  createCraftingState,
  ensureRecipeProgress,
  isRequirementComplete
} from "../src/logic/crafting.js";

import {
  loadCloudCraftingState,
  manuallyDepositCloudRequirement,
  craftCloudRecipe
} from "../src/backend/cloudCrafting.js";

import {
  loadCloudEquipment
} from "../src/backend/cloudEquipment.js";

import {
  loadCloudPlayerState
} from "../src/backend/cloudInventory.js";

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

let cloudEquipment =
  [];

let cloudMoney =
  0;

let selectedCategory =
  "pickaxe";


// =========================================================
// LOAD CLOUD PAGE STATE
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


  const [
    cloudState,
    cloudPlayerState,
    loadedEquipment
  ] =
    await Promise.all([
      loadCloudCraftingState(),
      loadCloudPlayerState(),
      loadCloudEquipment()
    ]);


  if (
    !cloudState ||
    !cloudPlayerState ||
    !loadedEquipment
  ) {
    console.error(
      "Could not load crafting page state."
    );

    return false;
  }


  craftingState =
    cloudState;

  cloudMoney =
    Number(
      cloudPlayerState.money ??
      0
    );

  cloudEquipment =
    loadedEquipment;


  return true;
}


// =========================================================
// EQUIPMENT HELPERS
// =========================================================

function hasCloudEquipment(
  equipmentId
) {
  return cloudEquipment.some(
    (equipment) =>
      equipment.equipment_id ===
      equipmentId
  );
}


function hasCloudEquipmentTierOrHigher(
  category,
  tier
) {
  return cloudEquipment.some(
    (equipment) =>
      equipment.category ===
        category &&
      Number(
        equipment.tier
      ) >=
        tier
  );
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
        `${Number(
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
        `$${Number(
          progressValue ??
          0
        ).toFixed(2)} / ` +
        `$${Number(
          requirement.totalValue
        ).toFixed(2)}`
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
        minimumUnique > 0
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
// CLOUD RECIPE READY CHECK
// =========================================================

function isCloudRecipeReady(
  recipe
) {
  const requirementsComplete =
    recipe.requirements.every(
      (
        requirement,
        index
      ) => {
        if (
          requirement.type ===
          "equipment"
        ) {
          return hasCloudEquipment(
            requirement.equipmentId
          );
        }


        return isRequirementComplete(
          craftingState,
          recipe,
          requirement,
          index,
          {
            equipment:
              cloudEquipment.map(
                (equipment) => ({
                  id:
                    equipment
                      .equipment_id
                })
              )
          }
        );
      }
    );


  const moneyComplete =
    cloudMoney >=
    recipe.moneyCost;


  return (
    requirementsComplete &&
    moneyComplete
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
// RENDER RECIPES
// =========================================================

function renderRecipes() {
  recipeList.innerHTML =
    "";


  moneyDisplay.textContent =
    `$${cloudMoney.toFixed(2)}`;


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
      hasCloudEquipmentTierOrHigher(
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
                hasCloudEquipment(
                  requirement
                    .equipmentId
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
              progress[
                key
              ];


            const complete =
              isRequirementComplete(
                craftingState,
                recipe,
                requirement,
                index,
                {
                  equipment:
                    cloudEquipment.map(
                      (
                        equipment
                      ) => ({
                        id:
                          equipment
                            .equipment_id
                      })
                    )
                }
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
      cloudMoney >=
      recipe.moneyCost;


    const autoCraftEnabled =
      craftingState
        .activeAutoCraftRecipeId ===
      recipe.id;


    const ready =
      isCloudRecipeReady(
        recipe
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
                  $${cloudMoney.toFixed(2)}
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
      // -----------------------------------------------------
      // AUTO CRAFT
      // STILL TEMPORARILY DISABLED
      // -----------------------------------------------------

      const autoCraftButton =
        card.querySelector(
          ".auto-craft-button"
        );


      autoCraftButton
        ?.addEventListener(
          "click",
          () => {
            console.warn(
              "Auto Craft is temporarily disabled during cloud migration.",
              recipe.id
            );
          }
        );


      // -----------------------------------------------------
      // CLOUD CRAFT
      // -----------------------------------------------------

      const craftButton =
        card.querySelector(
          ".craft-button"
        );


      craftButton
        ?.addEventListener(
          "click",
          async () => {
            craftButton.disabled =
              true;


            const result =
              await craftCloudRecipe(
                recipe.id
              );


            if (!result) {
              await loadCraftingPageState();

              renderRecipes();

              return;
            }


            console.log(
              "Cloud craft:",
              result
            );


            await loadCraftingPageState();

            renderRecipes();
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
