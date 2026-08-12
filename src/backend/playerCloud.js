import {
  supabase
} from "./supabase.js";


// =========================================================
// ENSURE CLOUD PLAYER
//
// Every Edge Function rejects a request with "Player record
// not found." unless public.players holds a row for the
// signed-in user, and nothing creates that row on sign-up.
//
// Note this is an ignore-duplicates upsert, which Postgres
// runs as INSERT ... ON CONFLICT DO NOTHING. A merge-duplicates
// upsert would need UPDATE on public.players, which the
// authenticated role is not granted, and fails with 403
// "permission denied for table players".
//
// See README.md for the trigger that makes this unnecessary.
// =========================================================

export async function ensureCloudPlayer(
  user
) {
  if (!user?.id) {
    return null;
  }


  const {
    error: insertError
  } =
    await supabase
      .from("players")
      .upsert(
        {
          id: user.id
        },
        {
          onConflict:
            "id",

          ignoreDuplicates:
            true
        }
      );


  if (insertError) {
    console.error(
      "Failed to create cloud player:",
      insertError
    );

    return null;
  }


  // An ignored duplicate returns no rows, so the row is read
  // back separately rather than from the upsert response.
  const {
    data,
    error
  } =
    await supabase
      .from("players")
      .select("*")
      .eq(
        "id",
        user.id
      )
      .maybeSingle();


  if (error) {
    console.error(
      "Failed to load cloud player:",
      error
    );

    return null;
  }


  return data;
}
