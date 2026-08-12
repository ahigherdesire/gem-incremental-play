import {
  ensurePlayerAuth
} from "../src/backend/auth.js";

import {
  supabase
} from "../src/backend/supabase.js";

const status =
  document.getElementById(
    "status"
  );


async function testServerRoll() {
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
    await supabase
      .functions
      .invoke(
        "roll",
        {
          body: {}
        }
      );


  if (error) {
    console.error(
      "Server roll failed:",
      error
    );

    status.textContent =
      "❌ Server roll failed";

    return;
  }


  console.log(
    "Server roll:",
    data
  );


  status.innerHTML = `
    <h2>
      ✅ Server Roll Works!
    </h2>

    <p>
      Player:
      ${data.playerId}
    </p>

    <hr>

    <h2>
      ${data.gem.name}
    </h2>

    <p>
      Rarity:
      1 in
      ${data.gem.rarity.toLocaleString()}
    </p>

    <p>
      Weight:
      ${data.finalWeight.toFixed(2)}g
    </p>

    <p>
      Natural Weight Multiplier:
      ${data.weightMultiplier.toFixed(3)}x
    </p>

    <p>
      Value:
      $${data.value.toFixed(2)}
    </p>
  `;
}


testServerRoll();
