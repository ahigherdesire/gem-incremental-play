import {
  supabase
} from "./supabase.js";


export async function ensurePlayerAuth() {
  console.log(
    "[AUTH] Checking existing session..."
  );


  // =========================================================
  // CHECK EXISTING SESSION
  // =========================================================

  const {
    data: sessionData,
    error: sessionError
  } =
    await supabase.auth
      .getSession();


  if (sessionError) {
    console.error(
      "[AUTH] Failed to load Supabase session:",
      {
        name:
          sessionError.name,

        message:
          sessionError.message,

        status:
          sessionError.status,

        code:
          sessionError.code,

        fullError:
          sessionError
      }
    );


    return null;
  }


  // =========================================================
  // EXISTING USER
  // =========================================================

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


  // =========================================================
  // CREATE ANONYMOUS USER
  // =========================================================

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
    console.error(
      "[AUTH] Anonymous sign-in failed:",
      {
        name:
          error.name,

        message:
          error.message,

        status:
          error.status,

        code:
          error.code,

        fullError:
          error
      }
    );


    return null;
  }


  if (!data.user) {
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
