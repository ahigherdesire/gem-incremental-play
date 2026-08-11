import {
  ensurePlayerAuth
} from "../src/backend/auth.js";

import {
  ensureCloudPlayer
} from "../src/backend/playerCloud.js";

const status =
  document.getElementById("status");

async function testBackend() {
  const user =
    await ensurePlayerAuth();

  if (!user) {
    status.textContent =
      "❌ Authentication failed";

    return;
  }

  const cloudPlayer =
    await ensureCloudPlayer(
      user
    );

  if (!cloudPlayer) {
    status.textContent =
      "❌ Player database test failed";

    return;
  }

  console.log(
    "Cloud player:",
    cloudPlayer
  );

  status.innerHTML = `
    ✅ Backend works!
    <br><br>

    Player ID:
    <code>${user.id}</code>

    <br><br>

    Cloud Player ID:
    <code>${cloudPlayer.id}</code>

    <br><br>

    Last Seen:
    ${cloudPlayer.last_seen}
  `;
}

testBackend();
