// ---------------------------------------------------------------------------
// API SERVICE LAYER
// Pages/components call these functions instead of touching mock data or
// fetch() directly. Games are now real (backed by the `games` collection in
// backend/src/server.js) - everything else here is still the original mock
// store in mockData.js.
// ---------------------------------------------------------------------------
import {
  participants,
  winners,
  users,
  transactions,
  notifications,
  dashboardStats,
  recentActivity,
  comments,
  resolutions,
  getUserById,
  getAllParticipants,
  joinParticipant,
  recordSubmission,
} from "./mockData";
import { API_BASE_URL, httpError } from "./httpBase";
import { getSession } from "./auth";

const delay = (ms = 400) => new Promise((res) => setTimeout(res, ms));

// ---------------------------------------------------------------------------
// GAMES - backed by the real backend now. A couple of other places
// (PlayerLayout's header title, lib/playerStats.js) need a game's title/
// result synchronously, before they'd have a chance to await a fetch - this
// small cache, kept warm by every call below, is what getCachedGame serves
// them from. It's read-only best-effort: if nothing's been fetched yet in
// this session, callers just get `undefined` and skip showing that detail.
// ---------------------------------------------------------------------------
const gameCache = new Map();

function cacheGame(game) {
  if (game?.id) gameCache.set(game.id, game);
  return game;
}

export function getCachedGame(id) {
  return gameCache.get(id);
}

// `auth: true` attaches the signed-in session's token - required for the
// admin-only writes (create/update) but not for the public reads.
async function gamesRequest(path, { method, body, auth } = {}) {
  const headers = {};
  if (body) headers["Content-Type"] = "application/json";
  if (auth) {
    const token = getSession()?.token;
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, { method, body, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw httpError(data.message || "Games request failed.", response.status);
  return data;
}

export async function fetchGames() {
  const list = await gamesRequest("/api/games");
  list.forEach(cacheGame);
  return list;
}

export async function fetchGame(id) {
  try {
    return cacheGame(await gamesRequest(`/api/games/${id}`));
  } catch (error) {
    if (error.status === 404) throw new Error("Game not found");
    throw error;
  }
}

export async function createGame(payload) {
  return cacheGame(await gamesRequest("/api/games", { method: "POST", body: JSON.stringify(payload), auth: true }));
}

export async function updateGame(id, payload) {
  return cacheGame(await gamesRequest(`/api/games/${id}`, { method: "PATCH", body: JSON.stringify(payload), auth: true }));
}

// The one admin-dashboard number that isn't derivable from the public
// games list - the real registered-user count.
export async function fetchAdminStats() {
  return gamesRequest("/api/admin/stats", { auth: true });
}

export async function fetchParticipants(gameId) {
  await delay();
  return participants[gameId] || [];
}

export async function fetchAllParticipants() {
  // Warms the game cache so gameTitle below resolves to a real title
  // instead of falling back to the bare id - games live on the backend now,
  // so getAllParticipants (synchronous) can't look titles up itself.
  await fetchGames();
  // Recomputed on every call so it reflects anyone who has joined or
  // submitted since the app loaded, not just the seeded demo data.
  return getAllParticipants().map((p) => ({ ...p, gameTitle: getCachedGame(p.gameId)?.title || p.gameId }));
}

export async function fetchWinners() {
  await delay();
  return winners;
}

export async function fetchUsers() {
  await delay();
  return users;
}

export async function fetchUser(id) {
  await delay();
  const user = getUserById(id);
  if (!user) throw new Error("User not found");
  return user;
}

export async function fetchTransactions() {
  await delay();
  return transactions;
}

export async function fetchNotifications() {
  await delay();
  return notifications;
}

export async function fetchDashboardStats() {
  await delay();
  return dashboardStats;
}

export async function fetchRecentActivity() {
  await delay();
  return recentActivity;
}

// ---------------------------------------------------------------------------
// PLAYER REGISTRATION - this is the fix for the payment/entry flow never
// actually registering the player anywhere. `joinGame` is called once,
// right when the player reaches the entry screen (after payment/
// verification, or immediately for free games) and writes ONE participant
// record with all the info known at that point. `submitAnswer` then
// updates that SAME record instead of writing something disconnected from
// it - so by the time a game closes, every player who played has exactly
// one consistent row: how they joined, whether they paid, and (once they
// answer) what they guessed and when.
// ---------------------------------------------------------------------------

// Called once when the player lands on the "You're in!" entry screen.
// Idempotent - safe to call again (e.g. the player navigates back to this
// screen) since joinParticipant no-ops if they're already registered.
export async function joinGame(gameId, info = {}) {
  const game = await fetchGame(gameId);
  const alreadyJoined = Boolean(participants[gameId]?.some((p) => p.id === "you"));

  const joined = new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  const participant = {
    id: "you",
    name: info.name || "You",
    joined,
    // By the time they reach this screen they've already cleared payment
    // (if required) and identity verification (if required) - both
    // enforced earlier in the flow - so the entry itself is confirmed.
    payment: game.requiresPayment ? "CONFIRMED" : "N/A",
    status: "PENDING",
    submittedAt: null,
    answer: null,
    eligibility: "ELIGIBLE",
  };
  const result = joinParticipant(gameId, participant);

  // Only bump the real, persisted count the first time this player
  // actually joins - not on every revisit to this screen.
  if (!alreadyJoined) {
    cacheGame(await gamesRequest(`/api/games/${gameId}/join`, { method: "POST" }));
  }

  return result;
}

export async function submitAnswer(gameId, answer) {
  await delay(900);
  // Simulated ~10% failure so the UI's error state is reachable in testing.
  if (Math.random() < 0.1) throw new Error("Submission failed");
  // Updates the same "you" record joinGame created - not a second,
  // disconnected write - so admin views/results see one consistent entry.
  recordSubmission(gameId, "you", answer);
  cacheGame(await gamesRequest(`/api/games/${gameId}/submissions`, { method: "POST" }));
  return { gameId, answer, submittedAt: new Date().toISOString() };
}

// ---------------------------------------------------------------------------
// COMMENTS - per-game discussion thread. Mutates the in-memory mock store
// so newly posted comments/likes are visible again on refetch within the
// session; a real backend just needs to match this same request/response
// shape (see mockData.js comments for the exact fields used).
// ---------------------------------------------------------------------------
export async function fetchComments(gameId) {
  await delay(350);
  return comments[gameId] ? [...comments[gameId]] : [];
}

export async function postComment(gameId, { text, parentId = null }) {
  await delay(450);
  const comment = {
    id: `c${Date.now()}${Math.floor(Math.random() * 1000)}`,
    gameId,
    author: "You",
    initials: "Y",
    text,
    likes: 0,
    likedByMe: false,
    createdAt: Date.now(),
    replies: [],
  };
  if (!comments[gameId]) comments[gameId] = [];
  if (parentId) {
    const parent = comments[gameId].find((c) => c.id === parentId);
    if (parent) parent.replies.push(comment);
  } else {
    comments[gameId].unshift(comment);
  }
  return comment;
}

export async function toggleCommentLike(gameId, commentId) {
  await delay(150);
  const list = comments[gameId] || [];
  const target = list.find((c) => c.id === commentId) || list.flatMap((c) => c.replies).find((r) => r.id === commentId);
  if (target) {
    target.likedByMe = !target.likedByMe;
    target.likes += target.likedByMe ? 1 : -1;
  }
  return target;
}

// ---------------------------------------------------------------------------
// WINNER RESOLUTION - see lib/resolution.js for how a tie is detected, and
// mockData.js's `resolutions` for the record shape. The system determines
// the outcome; nothing here lets an admin hand-pick a specific winner.
// ---------------------------------------------------------------------------
export async function fetchResolution(gameId) {
  await delay(300);
  return resolutions[gameId] || null;
}

// The system draws one winner at random from the eligible tied pool.
// `candidateNames` is supplied by the caller, which already computed the
// eligible pool via lib/resolution.js from live participant data.
export async function runSystemDraw(gameId, candidateNames) {
  await delay(1400); // gives the UI room for a brief "drawing..." moment
  const pick = candidateNames[Math.floor(Math.random() * candidateNames.length)];
  const record = {
    status: "RESOLVED",
    method: "RANDOM",
    playerChoices: null,
    winners: [{ name: pick, share: 100 }],
    resolvedAt: Date.now(),
  };
  resolutions[gameId] = record;
  return record;
}

// Invites the tied players to choose between splitting the prize evenly
// or settling it with a tiebreaker game, instead of the system drawing.
export async function offerChoiceToPlayers(gameId, candidateNames) {
  await delay(400);
  const existing = resolutions[gameId];
  const playerChoices = existing?.playerChoices ? { ...existing.playerChoices } : {};
  candidateNames.forEach((name) => {
    if (!(name in playerChoices)) playerChoices[name] = null;
  });
  const record = { status: "AWAITING_PLAYERS", method: null, playerChoices, winners: null, resolvedAt: null };
  resolutions[gameId] = record;
  return record;
}

// One tied player's response. Once everyone tied has answered, this
// resolves the game: an even split if everyone agreed to split, otherwise
// a tiebreaker game is scheduled (the mini-game itself is out of scope
// here - the backend/game-logic owns that follow-up).
export async function respondToTie(gameId, name, choice) {
  await delay(400);
  const record = resolutions[gameId];
  if (!record) return null;
  record.playerChoices = { ...record.playerChoices, [name]: choice };
  const values = Object.values(record.playerChoices);
  const allResponded = values.every((v) => v != null);
  if (allResponded) {
    if (values.every((v) => v === "SPLIT")) {
      const names = Object.keys(record.playerChoices);
      const share = +(100 / names.length).toFixed(1);
      record.method = "SPLIT";
      record.winners = names.map((n) => ({ name: n, share }));
    } else {
      record.method = "TIEBREAKER";
      record.winners = null;
    }
    record.status = "RESOLVED";
    record.resolvedAt = Date.now();
  }
  resolutions[gameId] = record;
  return record;
}

export async function processPayment({ phoneNumber }) {
  await delay(1800);
  // Simulated outcome for building UI states only - never determines
  // whether a real payment succeeded.
  if (!phoneNumber || phoneNumber.length < 8) {
    throw new Error("Payment could not be confirmed");
  }
  return { success: true, reference: `PMT-${Date.now()}` };
}
