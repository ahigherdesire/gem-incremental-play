import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL =
  "https://fuzidbblwzrhhbonjqjm.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_sCiiZxMP5DG8_gjGLg9qUg_HnWVD27U";


export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,

      // OAuth sends the player back with the session in the
      // URL, so the client has to pick it up on load.
      detectSessionInUrl: true,
      flowType: "pkce"
    }
  }
);
