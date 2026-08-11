const PLAYER_KEY =
  "gemIncrementalPlayer";

export function createPlayer() {
  return {
    money: 0,

    stats: {
      totalRolls: 0,
      rarestGem: null
    }
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

    // Migrate older player saves
    // that do not yet have stats.
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
      player.stats.rarestGem ===
      undefined
    ) {
      player.stats.rarestGem = null;
    }

    return player;
  } catch {
    return null;
  }
}
