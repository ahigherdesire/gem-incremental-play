import {
  supabase
} from "./supabase.js";


export async function loadCloudGems() {
  const {
    data,
    error
  } =
    await supabase
      .from("inventory_gems")
      .select(`
        id,
        gem_name,
        rarity,
        base_weight,
        value_per_gram,
        rolled_weight_multiplier,
        rolled_weight,
        final_weight,
        value,
        locked,
        created_at
      `)
      .order(
        "created_at",
        {
          ascending: true
        }
      );

  if (error) {
    console.error(
      "Failed to load cloud gems:",
      error
    );

    return null;
  }

  return data;
}


export async function loadCloudPlayerState() {
  const {
    data,
    error
  } =
    await supabase
      .from("players")
      .select(`
        inventory_capacity,
        money
      `)
      .single();

  if (error) {
    console.error(
      "Failed to load cloud player state:",
      error
    );

    return null;
  }

  return data;
}

export async function toggleCloudGemLock(
  specimenId
) {
  const {
    data,
    error
  } =
    await supabase
      .functions
      .invoke(
        "toggle-gem-lock",
        {
          body: {
            specimenId
          }
        }
      );

  if (error) {
    console.error(
      "Failed to toggle gem lock:",
      error
    );

    return null;
  }

  return data;
}
