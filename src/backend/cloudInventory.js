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


export async function loadCloudCapacity() {
  const {
    data,
    error
  } =
    await supabase
      .from("players")
      .select(
        "inventory_capacity"
      )
      .single();

  if (error) {
    console.error(
      "Failed to load cloud capacity:",
      error
    );

    return null;
  }

  return data.inventory_capacity;
}
