const PLAYER_KEY = "gemIncrementalPlayer";

export function createPlayer() {
  return {
    money: 0
  };
}

export function savePlayer(player) {
  localStorage.setItem(
    PLAYER_KEY,
    JSON.stringify(player)
  );
}

export function loadPlayer() {
  const saved = localStorage.getItem(PLAYER_KEY);

  if (!saved) {
    return null;
  }

  try {
    return JSON.parse(saved);
  } catch {
    return null;
  }
}
