import {
  ensurePlayerAuth
} from "../src/backend/auth.js";

import {
  supabase
} from "../src/backend/supabase.js";

const status =
  document.getElementById("status");

async function testRollFunction() {
  const user =
    await ensurePlayerAuth();

  if (!user) {
    status.textContent =
      "❌ Authentication failed";

    return;
  }

  const {
    data,
    error
  } =
    await supabase.functions.invoke(
      "roll-test",
      {
        body: {}
      }
    );

  if (error) {
    console.error(
      "Function error:",
      error
    );

    status.textContent =
      "❌ Edge Function failed";

    return;
  }

  console.log(
    "Function response:",
    data
  );

  status.innerHTML = `
    ✅ Authenticated Edge Function works!

    <br><br>

    Browser Player ID:
    <code>${user.id}</code>

    <br><br>

    Server Player ID:
    <code>${data.playerId}</code>
  `;
}

testRollFunction();
