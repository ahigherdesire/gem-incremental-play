import gems from "../src/data/gems.js";

import {
  ensurePlayerAuth
} from "../src/backend/auth.js";

import {
  supabase
} from "../src/backend/supabase.js";


const gemList =
  document.getElementById(
    "gemList"
  );

const discoveryCount =
  document.getElementById(
    "discoveryCount"
  );


// =========================================================
// LOAD CLOUD GEM INDEX
// =========================================================

async function loadCloudGemIndex() {
  const {
    data,
    error
  } =
    await supabase
      .from(
        "gem_index"
      )
      .select(`
        gem_name,
        total_rolled,
        heaviest_weight
      `);


  if (error) {
    console.error(
      "Failed to load cloud Gem Index:",
      error
    );

    return null;
  }


  const indexByName =
    {};


  for (
    const entry
    of data ?? []
  ) {
    indexByName[
      entry.gem_name
    ] = {
      totalRolled:
        Number(
          entry.total_rolled ??
          0
        ),

      heaviestWeight:
        Number(
          entry.heaviest_weight ??
          0
        )
    };
  }


  return indexByName;
}


// =========================================================
// RENDER GEM INDEX
// =========================================================

async function renderIndex() {
  // =================================
  // AUTH
  // =================================

  const user =
    await ensurePlayerAuth();


  if (!user) {
    discoveryCount.textContent =
      "Could not authenticate player.";

    gemList.innerHTML =
      "";

    return;
  }


  // =================================
  // LOAD CLOUD INDEX
  // =================================

  const gemIndex =
    await loadCloudGemIndex();


  if (!gemIndex) {
    discoveryCount.textContent =
      "Could not load Gem Index.";

    gemList.innerHTML =
      "";

    return;
  }


  // =================================
  // DISCOVERY COUNT
  // =================================

  const discovered =
    gems.filter(
      (gem) =>
        Boolean(
          gemIndex[
            gem.name
          ]
        )
    ).length;


  discoveryCount.textContent =
    `${discovered} / ${gems.length} discovered`;


  // =================================
  // RENDER CARDS
  // =================================

  gemList.innerHTML =
    "";


  for (
    const gem
    of gems
  ) {
    const entry =
      gemIndex[
        gem.name
      ];


    const isDiscovered =
      Boolean(
        entry
      );


    const card =
      document.createElement(
        "div"
      );


    card.className =
      "gem-card";


    // =================================
    // UNDISCOVERED GEM
    // =================================

    if (
      !isDiscovered
    ) {
      card.classList.add(
        "undiscovered"
      );


      card.innerHTML = `
        <h2>
          ???
        </h2>

        <p>
          Rarity:
          ???
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


    // =================================
    // DISCOVERED GEM
    // =================================

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

      <p class="gem-description">
        ${
          gem.description ??
          "No description available."
        }
      </p>

      <hr>

      <p>
        Total Rolled:
        ${entry.totalRolled.toLocaleString()}
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


// =========================================================
// PAGE EVENTS
// =========================================================

window.addEventListener(
  "pageshow",
  renderIndex
);


renderIndex();
