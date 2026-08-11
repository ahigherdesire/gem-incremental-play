import {
  supabase
} from "./supabase.js";

export async function ensureCloudPlayer(
  user
) {
  const {
    data,
    error
  } =
    await supabase
      .from("players")
      .upsert(
        {
          id: user.id,
          last_seen:
            new Date().toISOString()
        },
        {
          onConflict: "id"
        }
      )
      .select()
      .single();

  if (error) {
    console.error(
      "Failed to create/load cloud player:",
      error
    );

    return null;
  }

  return data;
}
