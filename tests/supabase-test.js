import {
  ensurePlayerAuth
} from "../src/backend/auth.js";

const status =
  document.getElementById("status");

async function testAuth() {
  const user =
    await ensurePlayerAuth();

  if (!user) {
    status.textContent =
      "❌ Authentication failed";

    return;
  }

  console.log(
    "Supabase user:",
    user
  );

  status.innerHTML = `
    ✅ Authentication works!
    <br><br>

    Player ID:
    <code>${user.id}</code>
  `;
}

testAuth();
