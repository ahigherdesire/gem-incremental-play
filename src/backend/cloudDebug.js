import {
  supabase
} from "./supabase.js";


export async function loadCloudDebugState() {
  const [
    playerResult,
    equipmentResult,
    gemsResult
  ] =
    await Promise.all([
      supabase
        .from("players")
        .select(`
          money,
          inventory_capacity,
          next_roll_at
        `)
        .single(),

      supabase
        .from("player_equipment")
        .select(`
          id,
          equipped,
          luck_bonus,
          roll_speed_bonus,
          weight_luck_bonus,
          weight_multiplier_bonus
        `),

      supabase
        .from("inventory_gems")
        .select(
          "id",
          {
            count: "exact",
            head: true
          }
        )
    ]);


  // =================================
  // CHECK ERRORS
  // =================================

  if (playerResult.error) {
    console.error(
      "Failed to load cloud player:",
      playerResult.error
    );

    return null;
  }


  if (equipmentResult.error) {
    console.error(
      "Failed to load cloud equipment:",
      equipmentResult.error
    );

    return null;
  }


  if (gemsResult.error) {
    console.error(
      "Failed to count cloud gems:",
      gemsResult.error
    );

    return null;
  }


  // =================================
  // CALCULATE EQUIPMENT STATS
  // =================================

  let luck =
    1;

  let rollSpeed =
    1;

  let weightLuck =
    1;

  let weightMultiplier =
    1;


  const equipment =
    equipmentResult.data ?? [];


  for (
    const item
    of equipment
  ) {
    if (!item.equipped) {
      continue;
    }


    luck +=
      Number(
        item.luck_bonus ?? 0
      );

    rollSpeed +=
      Number(
        item.roll_speed_bonus ?? 0
      );

    weightLuck +=
      Number(
        item.weight_luck_bonus ?? 0
      );

    weightMultiplier +=
      Number(
        item.weight_multiplier_bonus ??
        0
      );
  }


  // =================================
  // COOLDOWN
  // =================================

  let cooldownRemaining =
    0;


  if (
    playerResult.data.next_roll_at
  ) {
    const remainingMs =
      new Date(
        playerResult.data
          .next_roll_at
      ).getTime() -
      Date.now();


    cooldownRemaining =
      Math.max(
        0,
        remainingMs / 1000
      );
  }


  // =================================
  // RETURN STATE
  // =================================

  return {
    stats: {
      luck,
      rollSpeed,
      weightLuck,
      weightMultiplier
    },

    player: {
      money:
        playerResult.data.money,

      inventoryCapacity:
        playerResult.data
          .inventory_capacity,

      gemCount:
        gemsResult.count ?? 0,

      equipmentCount:
        equipment.length
    },

    rolling: {
      cooldownRemaining
    }
  };
}
