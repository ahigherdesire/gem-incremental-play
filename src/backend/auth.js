import { supabase } from "./supabase.js";
import { ensureCloudPlayer } from "./playerCloud.js";


// =========================================================
// PLAYER SESSION
// =========================================================

// A single in-flight promise, so the modules that all call
// ensurePlayerAuth() on load do not race each other into
// creating several anonymous users.
let sessionPromise = null;


// Kept so the UI can explain *why* sign-in failed instead of
// only reporting that it did.
let lastAuthError = null;


export function getLastAuthError() {
  return lastAuthError;
}


function recordAuthError(stage, error) {
  lastAuthError = {
    stage,
    name: error?.name ?? null,
    message: error?.message ?? "Unknown authentication error.",
    status: error?.status ?? null,
    code: error?.code ?? null
  };

  console.error(`[auth] ${stage} failed:`, lastAuthError);

  // A failure must not be cached, or the retry never happens.
  sessionPromise = null;

  return null;
}


export async function ensurePlayerAuth() {
  if (!sessionPromise) {
    sessionPromise = resolveSession().catch((error) => {
      sessionPromise = null;

      throw error;
    });
  }

  return sessionPromise;
}


async function resolveSession() {
  lastAuthError = null;

  const { data: sessionData, error: sessionError } =
    await supabase.auth.getSession();

  if (sessionError) {
    return recordAuthError("getSession", sessionError);
  }

  let user = sessionData.session?.user ?? null;

  if (!user) {
    // No session yet: create a guest player. The account can be
    // upgraded to Google later without losing progress.
    const { data, error } = await supabase.auth.signInAnonymously();

    if (error) {
      return recordAuthError("signInAnonymously", error);
    }

    user = data.user ?? null;

    if (!user) {
      return recordAuthError("signInAnonymously", {
        name: "MissingUser",
        message: "Supabase returned no user after anonymous sign-in."
      });
    }
  }

  const ready = await ensurePlayerRecord(user);

  if (!ready) {
    return recordAuthError("ensurePlayerRecord", {
      name: "PlayerRecord",
      message: "Signed in, but the cloud save could not be created."
    });
  }

  return user;
}


// Sign-out and OAuth both invalidate whatever we cached.
export function resetSessionCache() {
  sessionPromise = null;

  recordChecks.clear();
}


// =========================================================
// PLAYER RECORD BOOTSTRAP
//
// The Edge Functions (roll, craft-recipe, sell-gem, ...) all
// reject with "Player record not found." unless public.players
// holds a row for the signed-in user, and sign-up does not
// create one. ensureCloudPlayer() does the work; this only
// makes sure it happens once per player per page.
//
// See README.md for the trigger that removes the need for it.
// =========================================================

const recordChecks = new Map();


export function ensurePlayerRecord(user) {
  if (!user?.id) {
    return Promise.resolve(false);
  }

  let pending = recordChecks.get(user.id);

  if (!pending) {
    pending = ensureCloudPlayer(user)
      .then((player) => player !== null)
      .catch((error) => {
        recordChecks.delete(user.id);

        throw error;
      });

    recordChecks.set(user.id, pending);
  }

  return pending;
}
