import {
  supabase
} from "./supabase.js";


let lastAuthError =
  null;


// =========================================================
// GET LAST AUTH ERROR
// =========================================================

export function getLastAuthError() {
  return lastAuthError;
}


// =========================================================
// AUTHENTICATE PLAYER
// =========================================================

export async function ensurePlayerAuth() {
  lastAuthError =
    null;


  console.log(
    "[AUTH] Checking existing session..."
  );


  // =======================================================
  // EXISTING SESSION
  // =======================================================

  const {
    data: sessionData,
    error: sessionError
  } =
    await supabase.auth
      .getSession();


  if (sessionError) {
    lastAuthError = {
      stage:
        "getSession",

      name:
        sessionError.name ??
        null,

      message:
        sessionError.message ??
        "Unknown session error.",

      status:
        sessionError.status ??
        null,

      code:
        sessionError.code ??
        null
    };


    console.error(
      "[AUTH] Failed to load Supabase session:",
      lastAuthError
    );


    return null;
  }


  if (
    sessionData.session?.user
  ) {
    console.log(
      "[AUTH] Existing session found:",
      sessionData.session.user.id
    );


    return (
      sessionData.session.user
    );
  }


  // =======================================================
  // CREATE ANONYMOUS USER
  // =======================================================

  console.log(
    "[AUTH] No session found. Creating anonymous user..."
  );


  const {
    data,
    error
  } =
    await supabase.auth
      .signInAnonymously();


  if (error) {
    lastAuthError = {
      stage:
        "signInAnonymously",

      name:
        error.name ??
        null,

      message:
        error.message ??
        "Unknown anonymous sign-in error.",

      status:
        error.status ??
        null,

      code:
        error.code ??
        null
    };


    console.error(
      "[AUTH] Anonymous sign-in failed:",
      lastAuthError
    );


    return null;
  }


  if (!data.user) {
    lastAuthError = {
      stage:
        "signInAnonymously",

      name:
        "MissingUser",

      message:
        "Supabase returned no user after anonymous sign-in.",

      status:
        null,

      code:
        null
    };


    console.error(
      "[AUTH] Anonymous sign-in returned no user."
    );


    return null;
  }


  console.log(
    "[AUTH] Anonymous user created:",
    data.user.id
  );


  return data.user;
}
