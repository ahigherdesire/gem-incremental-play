import {
  supabase
} from "./supabase.js";


export async function loadCloudCraftingState() {
  const [
    craftingResult,
    progressResult
  ] =
    await Promise.all([
      supabase
        .from("player_crafting")
        .select(`
          active_auto_craft
        `)
        .single(),

      supabase
        .from("crafting_progress")
        .select(`
          recipe_id,
          progress
        `)
    ]);


  if (craftingResult.error) {
    console.error(
      "Failed to load cloud crafting state:",
      craftingResult.error
    );

    return null;
  }


  if (progressResult.error) {
    console.error(
      "Failed to load cloud crafting progress:",
      progressResult.error
    );

    return null;
  }


  const progress = {};


  for (
    const row
    of progressResult.data ?? []
  ) {
    progress[
      row.recipe_id
    ] =
      row.progress ?? {};
  }


  return {
    activeAutoCraftRecipeId:
      craftingResult.data
        ?.active_auto_craft ??
      null,

    progress
  };
}
