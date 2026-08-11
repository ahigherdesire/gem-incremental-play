const PLAYER_KEY =
  "gemIncrementalPlayer";

export function createPlayer() {
  return {
    money: 0,

    stats: {
      totalRolls: 0,
      rarestGem: null
    },

    gemIndex: {}
  };
}

export function savePlayer(player) {
  localStorage.setItem(
    PLAYER_KEY,
    JSON.stringify(player)
  );
}

export function loadPlayer() {
  const saved =
    localStorage.getItem(PLAYER_KEY);

  if (!saved) {
    return null;
  }

  try {
    const player =
      JSON.parse(saved);

    // Migrate old player saves.
    if (!player.stats) {
      player.stats = {
        totalRolls: 0,
        rarestGem: null
      };
    }

    if (
      player.stats.totalRolls == null
    ) {
      player.stats.totalRolls = 0;
    }

    if (
      player.stats.rarestGem === undefined
    ) {
      player.stats.rarestGem = null;
    }

    if (!player.gemIndex) {
      player.gemIndex = {};
    }

    return player;
  } catch {
    return null;
  }
}

export function recordRoll(
  player,
  rolled
) {
  if (!player.stats) {
    player.stats = {
      totalRolls: 0,
      rarestGem: null
    };
  }

  if (!player.gemIndex) {
    player.gemIndex = {};
  }

  // ---------------------------------
  // Lifetime roll count
  // ---------------------------------

  player.stats.totalRolls += 1;

  // ---------------------------------
  // Rarest gem ever
  // ---------------------------------

  if (
    !player.stats.rarestGem ||
    rolled.gem.rarity >
      player.stats.rarestGem.rarity
  ) {
    player.stats.rarestGem = {
      name: rolled.gem.name,
      rarity: rolled.gem.rarity
    };
  }

  // ---------------------------------
  // Gem Index
  // ---------------------------------

  const gemName =
    rolled.gem.name;

  if (!player.gemIndex[gemName]) {
    player.gemIndex[gemName] = {
      discovered: true,
      totalRolled: 0,
      heaviestWeight: 0
    };
  }

  const indexEntry =
    player.gemIndex[gemName];

  indexEntry.discovered = true;

  indexEntry.totalRolled += 1;

  if (
    rolled.finalWeight >
    indexEntry.heaviestWeight
  ) {
    indexEntry.heaviestWeight =
      rolled.finalWeight;
  }

  savePlayer(player);
}
