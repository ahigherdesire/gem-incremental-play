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

// Startup and the auth-state listener can both reach this at the
// same time; one request per player is enough.
const recordChecks = new Map();


export function ensurePlayerRecord(user) {
  if (!user?.id) {
    return Promise.resolve(false);
  }

  let pending = recordChecks.get(user.id);

  if (!pending) {
    pending = createPlayerRecord(user.id).catch((error) => {
      recordChecks.delete(user.id);

      throw error;
    });

    recordChecks.set(user.id, pending);
  }

  return pending;
}


async function createPlayerRecord(playerId) {
  // An upsert that ignores duplicates is idempotent, so a row
  // that already exists is left untouched and concurrent callers
  // do not collide.
  const { error } = await supabase
    .from("players")
    .upsert({ id: playerId }, { onConflict: "id", ignoreDuplicates: true });

  if (error) {
    console.error("Could not create player record:", error);

    recordChecks.delete(playerId);

    return false;
  }

  return true;
}
