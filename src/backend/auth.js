import { supabase } from "./supabase.js";


// =========================================================
// PLAYER SESSION
// =========================================================

// A single in-flight promise, so the five modules that all
// call ensurePlayerAuth() on load do not race each other
// into creating several anonymous users.
let sessionPromise = null;


export async function ensurePlayerAuth() {
  if (!sessionPromise) {
    sessionPromise = resolveSession().catch((error) => {
      // Never cache a failure — the next call should retry.
      sessionPromise = null;

      throw error;
    });
  }

  return sessionPromise;
}


async function resolveSession() {
  const { data: sessionData, error: sessionError } =
    await supabase.auth.getSession();

  if (sessionError) {
    console.error("Failed to load Supabase session:", sessionError);

    return null;
  }

  let user = sessionData.session?.user ?? null;

  if (!user) {
    // No session yet: create a guest player. The account can
    // be upgraded to Google later without losing progress.
    const { data, error } = await supabase.auth.signInAnonymously();

    if (error) {
      console.error("Anonymous sign-in failed:", error);

      return null;
    }

    user = data.user;
  }

  if (!user) {
    return null;
  }

  const ready = await ensurePlayerRecord(user);

  if (!ready) {
    return null;
  }

  return user;
}


// Sign-out and OAuth both invalidate whatever we cached.
export function resetSessionCache() {
  sessionPromise = null;
}


// =========================================================
// PLAYER RECORD BOOTSTRAP
//
// The edge functions (roll, craft-recipe, sell-gem, ...) all
// reject with "Player record not found." unless public.players
// holds a row for the signed-in user. New sign-ups do not get
// one automatically, so the client creates it on first load.
//
// See README.md for the database trigger that removes the need
// for this fallback.
// =========================================================

// Postgres duplicate-key. Two tabs starting at once is fine:
// whichever loses the race just reuses the existing row.
const UNIQUE_VIOLATION = "23505";


export async function ensurePlayerRecord(user) {
  if (!user?.id) {
    return false;
  }

  const { data, error } = await supabase
    .from("players")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Could not read player record:", error);

    return false;
  }

  if (data) {
    return true;
  }

  const { error: insertError } = await supabase
    .from("players")
    .insert({ id: user.id });

  if (insertError && insertError.code !== UNIQUE_VIOLATION) {
    console.error("Could not create player record:", insertError);

    return false;
  }

  return true;
}
