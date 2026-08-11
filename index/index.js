import gems from "../src/data/gems.js";

import {
  createPlayer,
  loadPlayer
} from "../src/logic/player.js";

const gemList =
  document.getElementById("gemList");

const discoveryCount =
  document.getElementById(
    "discoveryCount"
  );

function renderIndex() {
  const player =
    loadPlayer() ??
    createPlayer();

  const gemIndex =
    player.gemIndex ?? {};

  const discovered =
    gems.filter(
      (gem) =>
        gemIndex[gem.name]
          ?.discovered
    ).length;

  discoveryCount.textContent =
    `${discovered} / ${gems.length} discovered`;

  gemList.innerHTML = "";

  for (const gem of gems) {
    const entry =
      gemIndex[gem.name];

    const isDiscovered =
      Boolean(
        entry?.discovered
      );

    const card =
      document.createElement(
        "div"
      );

    card.className =
      "gem-card";

    if (!isDiscovered) {
      card.classList.add(
        "undiscovered"
      );

      card.innerHTML = `
        <h2>???</h2>

        <p>
          Rarity: ???
        </p>

        <p>
          Not yet discovered.
        </p>
      `;

      gemList.appendChild(
        card
      );

      continue;
    }

    const baseValue =
      gem.baseWeight *
      gem.valuePerGram;

    card.innerHTML = `
      <h2>
        ${gem.name}
      </h2>

      <p>
        Rarity:
        1 in
        ${gem.rarity.toLocaleString()}
      </p>

      <p>
        Base Weight:
        ${gem.baseWeight.toFixed(2)}g
      </p>

      <p>
        Value per Gram:
        $${gem.valuePerGram.toFixed(3)}
      </p>

      <p>
        Base Value:
        $${baseValue.toFixed(2)}
      </p>

      <hr>

      <p>
        Total Rolled:
        ${entry.totalRolled}
      </p>

      <p>
        Heaviest Ever:
        ${entry.heaviestWeight.toFixed(2)}g
      </p>
    `;

    gemList.appendChild(
      card
    );
  }
}

window.addEventListener(
  "pageshow",
  renderIndex
);

renderIndex();
