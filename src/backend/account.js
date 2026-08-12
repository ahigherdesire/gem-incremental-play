import { supabase } from "./supabase.js";
import { ensurePlayerRecord, resetSessionCache } from "./auth.js";


// =========================================================
// ACCOUNT
//
// Every player starts as a guest (anonymous Supabase user).
// Signing in with Google *links* that identity to the guest
// account so the save carries across, rather than starting
// a second account.
// =========================================================


export function isGuest(user) {
  if (!user) {
    return true;
  }

  if (user.is_anonymous === true) {
    return true;
  }

  return !user.email && (user.identities ?? []).length === 0;
}


export function describeAccount(user) {
  if (!user) {
    return {
      name: "Signing in...",
      detail: "",
      initials: "?",
      avatarUrl: null,
      guest: true
    };
  }

  if (isGuest(user)) {
    return {
      name: "Guest",
      detail: "Progress saved to this browser only",
      initials: "G",
      avatarUrl: null,
      guest: true
    };
  }

  const metadata = user.user_metadata ?? {};

  const name =
    metadata.full_name ||
    metadata.name ||
    user.email?.split("@")[0] ||
    "Player";

  return {
    name,
    detail: user.email ?? "Signed in",
    initials: initialsFor(name),
    avatarUrl: metadata.avatar_url || metadata.picture || null,
    guest: false
  };
}


function initialsFor(name) {
  const parts = String(name).trim().split(/\s+/).slice(0, 2);

  const letters = parts
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();

  return letters || "P";
}


// ---------------------------------------------------------
// REDIRECT TARGET
//
// Send the player back to the page they signed in from, with
// any previous auth fragment stripped off.
// ---------------------------------------------------------

function currentPageUrl() {
  return window.location.origin + window.location.pathname;
}


// ---------------------------------------------------------
// GOOGLE SIGN-IN
//
// Returns { started, needsFallback, message }. When the
// browser redirects, nothing after the call runs.
// ---------------------------------------------------------

export async function signInWithGoogle({ allowNewAccount = false } = {}) {
  const { data: sessionData } = await supabase.auth.getSession();

  const user = sessionData.session?.user ?? null;

  const options = {
    redirectTo: currentPageUrl(),
    queryParams: { prompt: "select_account" }
  };

  // A guest with a save: attach Google to the existing account.
  if (user && isGuest(user) && !allowNewAccount) {
    const { error } = await supabase.auth.linkIdentity({
      provider: "google",
      options
    });

    if (!error) {
      return { started: true };
    }

    console.error("Could not link Google identity:", error);

    return {
      started: false,
      needsFallback: true,
      message: describeAuthError(error)
    };
  }

  // Signing in fresh, or the player accepted a separate account.
  if (user && allowNewAccount) {
    await supabase.auth.signOut();

    resetSessionCache();
  }

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options
  });

  if (error) {
    console.error("Google sign-in failed:", error);

    return { started: false, message: describeAuthError(error) };
  }

  return { started: true };
}


function describeAuthError(error) {
  const message = String(error?.message ?? "").toLowerCase();

  if (message.includes("manual linking") || message.includes("not enabled")) {
    return "Account linking is turned off for this project.";
  }

  if (message.includes("already") || error?.code === "identity_already_exists") {
    return "That Google account is already linked to another save.";
  }

  if (message.includes("provider is not enabled")) {
    return "Google sign-in is not enabled for this project yet.";
  }

  return error?.message ?? "Google sign-in failed.";
}


// ---------------------------------------------------------
// SIGN OUT
//
// Signing out drops back to a brand new guest account, since
// the game is unplayable without a session.
// ---------------------------------------------------------

export async function signOutAccount() {
  const { error } = await supabase.auth.signOut();

  resetSessionCache();

  if (error) {
    console.error("Sign-out failed:", error);

    return false;
  }

  return true;
}


// ---------------------------------------------------------
// SESSION EVENTS
// ---------------------------------------------------------

export function onAccountChange(callback) {
  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    const user = session?.user ?? null;

    callback(event, user);

    if (!user) {
      return;
    }

    if (event !== "SIGNED_IN" && event !== "USER_UPDATED") {
      return;
    }

    // This callback runs while the auth client holds its internal
    // lock. Any Supabase request made here would need that same
    // lock to read the access token and would deadlock, so the
    // record check is pushed to the next task instead.
    setTimeout(() => {
      ensurePlayerRecord(user).catch((error) => {
        console.error("Could not ensure player record:", error);
      });
    }, 0);
  });

  return () => data.subscription.unsubscribe();
}
