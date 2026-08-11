import {
  supabase
} from "./supabase.js";

export async function ensurePlayerAuth() {
  // Check whether this browser already has a session.
  const {
    data: sessionData,
    error: sessionError
  } =
    await supabase.auth.getSession();

  if (sessionError) {
    console.error(
      "Failed to load Supabase session:",
      sessionError
    );

    return null;
  }

  // Already signed in.
  if (sessionData.session?.user) {
    return sessionData.session.user;
  }

  // No session yet:
  // create a new anonymous player.
  const {
    data,
    error
  } =
    await supabase.auth.signInAnonymously();

  if (error) {
    console.error(
      "Anonymous sign-in failed:",
      error
    );

    return null;
  }

  return data.user;
}
