// ---------------------------------------------------------------------------
// LAST ACTIVE GAME
// Remembers which live game the player is currently "in" for this browser
// tab, so the bottom nav's Play tab can return them straight to it instead
// of resetting to the games list - e.g. they check their profile mid-game,
// tap Play, and land right back where they were.
//
// This is cleared the moment the player is actually looking at the games
// list (see Games.jsx), not just when they press a specific back button -
// so it covers every way back to the list (in-app back, the header logo,
// browser back, a direct URL). Once they're back on the list, Play means
// "the list" again until they open a specific game once more.
// Session-scoped on purpose: it shouldn't stick to a game from a previous
// visit days later.
// ---------------------------------------------------------------------------
const KEY = "onpoint:lastGameId";

export function getLastGameId() {
  try {
    return sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function setLastGameId(id) {
  try {
    sessionStorage.setItem(KEY, id);
  } catch {
    // Private browsing / storage disabled - fine to no-op, this is just a UX nicety.
  }
}

export function clearLastGameId() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // Private browsing / storage disabled - fine to no-op.
  }
}
