// ---------------------------------------------------------------------------
// MOCK DATA
// This file simulates the shape of data that the backend/API will
// eventually provide for ON Point (the platform). Games themselves are real
// now (see backend/src/server.js's `games` collection, wired up through
// lib/api.js) - everything below is still mock/local.
// ---------------------------------------------------------------------------

export const GAME_TYPES = [
  { value: "GUESSING", label: "Guessing Game" },
  { value: "PREDICTION", label: "Prediction Game" },
  { value: "QUIZ", label: "Quiz" },
  { value: "CHALLENGE", label: "Challenge" },
];

// Per-game participant lists (used on /admin/games/:id/participants)
//
// `eligibility` / `eligibilityReason`: whether this entry can be selected
// as the winner. Entry itself is never blocked - someone can always play -
// but the backend excludes an entry from winner selection for reasons like
// unconfirmed payment or (per the fairness rule) already having won a
// different game within the last few days. This is intentionally not
// surfaced to players; it's admin-only context for why an exact match
// isn't always the declared winner.
export const participants = {
  g1: [
    { id: "p1", name: "Jordan K.", joined: "10:02 AM", payment: "CONFIRMED", status: "SUBMITTED", submittedAt: "10:31 AM", answer: 347, eligibility: "ELIGIBLE" },
    { id: "p2", name: "Amara T.", joined: "10:04 AM", payment: "CONFIRMED", status: "PENDING", submittedAt: null, answer: null, eligibility: "ELIGIBLE" },
    { id: "p3", name: "Liam O.", joined: "10:10 AM", payment: "CONFIRMED", status: "SUBMITTED", submittedAt: "10:34 AM", answer: 360, eligibility: "ELIGIBLE" },
    { id: "p4", name: "Fatima N.", joined: "10:12 AM", payment: "CONFIRMED", status: "SUBMITTED", submittedAt: "10:36 AM", answer: 355, eligibility: "ELIGIBLE" },
    { id: "p5", name: "Chidi A.", joined: "10:15 AM", payment: "PENDING", status: "PENDING", submittedAt: null, answer: null, eligibility: "INELIGIBLE", eligibilityReason: "Payment not confirmed" },
  ],
  g4: [
    { id: "p6", name: "Amara T.", joined: "08:55 AM", payment: "CONFIRMED", status: "SUBMITTED", submittedAt: "09:02 AM", answer: 350, eligibility: "ELIGIBLE" },
    { id: "p7", name: "Grace M.", joined: "08:58 AM", payment: "CONFIRMED", status: "SUBMITTED", submittedAt: "09:05 AM", answer: 300, eligibility: "ELIGIBLE" },
    { id: "p8", name: "Samuel P.", joined: "09:00 AM", payment: "CONFIRMED", status: "SUBMITTED", submittedAt: "09:10 AM", answer: 410, eligibility: "ELIGIBLE" },
    // Demonstrates the repeat-winner cooldown in action: Tunde also matched
    // the exact number, but he'd already won a different game two days
    // earlier, so the system excludes him from the winner pool. He was
    // still allowed to play - he's just not eligible to be picked - which
    // is why Amara ends up the sole (automatic) winner despite there being
    // two exact matches.
    { id: "p11", name: "Tunde B.", joined: "08:50 AM", payment: "CONFIRMED", status: "SUBMITTED", submittedAt: "08:59 AM", answer: 350, eligibility: "INELIGIBLE", eligibilityReason: "Won another game within the last 3 days" },
  ],
  g5: [
    { id: "p9", name: "Nadia F.", joined: "Sep 7, 9:10 AM", payment: "CONFIRMED", status: "SUBMITTED", submittedAt: "9:40 AM", answer: 210, eligibility: "ELIGIBLE" },
    { id: "p10", name: "Bello S.", joined: "Sep 7, 9:12 AM", payment: "CONFIRMED", status: "PENDING", submittedAt: null, answer: null, eligibility: "ELIGIBLE" },
  ],
  // No one matched the exact number here - a perfectly normal outcome,
  // not an error state. The result page should say so plainly rather
  // than implying something went wrong.
  g3: [
    { id: "p15", name: "Chidi A.", joined: "Aug 28, 10:02 AM", payment: "CONFIRMED", status: "SUBMITTED", submittedAt: "10:20 AM", answer: 250, eligibility: "ELIGIBLE" },
    { id: "p16", name: "Bello S.", joined: "Aug 28, 10:05 AM", payment: "CONFIRMED", status: "SUBMITTED", submittedAt: "10:22 AM", answer: 290, eligibility: "ELIGIBLE" },
    { id: "p17", name: "Nadia F.", joined: "Aug 28, 10:07 AM", payment: "CONFIRMED", status: "SUBMITTED", submittedAt: "10:25 AM", answer: 275, eligibility: "ELIGIBLE" },
  ],
  // Three exact matches on the same number - a genuine tie the system
  // needs to resolve (see `resolutions.g8` below). "You" is seeded in
  // here as one of the tied players so the player-facing result page has
  // something real to demonstrate the decision prompt against.
  g8: [
    // `seed: true` marks this as scripted demo data for the result/tie-break
    // screen, not something the signed-in player actually did - profile
    // stats (lib/playerStats.js) exclude it so a fresh account doesn't show
    // a "win" it never played.
    { id: "you", seed: true, name: "You", joined: "Sep 9, 7:40 AM", payment: "CONFIRMED", status: "SUBMITTED", submittedAt: "7:58 AM", answer: 214, eligibility: "ELIGIBLE" },
    { id: "p13", name: "Jordan K.", joined: "Sep 9, 7:42 AM", payment: "CONFIRMED", status: "SUBMITTED", submittedAt: "8:01 AM", answer: 214, eligibility: "ELIGIBLE" },
    { id: "p14", name: "Nadia F.", joined: "Sep 9, 7:45 AM", payment: "CONFIRMED", status: "SUBMITTED", submittedAt: "8:03 AM", answer: 214, eligibility: "ELIGIBLE" },
    { id: "p18", name: "Bello S.", joined: "Sep 9, 7:50 AM", payment: "CONFIRMED", status: "SUBMITTED", submittedAt: "8:05 AM", answer: 200, eligibility: "ELIGIBLE" },
  ],
};

// ---------------------------------------------------------------------------
// WINNER RESOLUTION (mutable, per game)
// Tracks how a tie between exact-match players gets resolved. An admin
// toggles which path to take - a random draw, or letting the tied players
// decide - and sends it; if they hand it to the players, the system then
// waits for each tied player to say what they want (split the prize or
// play a tiebreaker) before the outcome is final. See lib/resolution.js
// for how the tie itself is detected, and lib/api.js's fetchResolution/
// offerChoiceToPlayers/runSystemDraw/respondToTie for how this record
// gets read and updated.
// `playerChoices`: name -> "SPLIT" | "TIEBREAKER" | null (not yet answered)
// `status`: "AWAITING_PLAYERS" | "RESOLVED"
// `method`: null | "RANDOM" | "SPLIT" | "TIEBREAKER"
// `winners`: null until resolved, then [{ name, share }]
//
// Starts empty on purpose: g8's tie is unresolved until an admin picks a
// path on the result page and sends it - that toggle step is the point.
// ---------------------------------------------------------------------------
export const resolutions = {};

// Platform-wide participation view for /admin/participants. A function
// (not a static snapshot) so it always reflects players who joined or
// submitted after the module first loaded - see joinParticipant/
// recordSubmission below, which are the only two things that mutate
// `participants` after initial load.
// Games moved to the real backend, so this no longer resolves gameTitle
// itself (it can't - it's synchronous, games aren't) - lib/api.js's
// fetchAllParticipants fills that in from its game cache after this runs.
export function getAllParticipants() {
  return Object.entries(participants).flatMap(([gameId, list]) => list.map((p) => ({ ...p, gameId })));
}

// ---------------------------------------------------------------------------
// PARTICIPANT REGISTRATION (mutable)
// The payment/verification/entry flow and the answer-submission flow used
// to be two disconnected mocks - paying never actually created a
// participant record, and submitting an answer didn't update one either.
// These two functions are now the single place both flows write through,
// so a player who joins then submits ends up as ONE record that's
// consistent everywhere it's read (admin participant tables, results,
// tie resolution, dashboard counts) - not two separate, out-of-sync facts.
// ---------------------------------------------------------------------------

// Registers a player into a game's participant list. Safe to call more
// than once (e.g. the player revisits the entry screen) - it's a no-op
// after the first time, so a participant is only ever added once.
export function joinParticipant(gameId, participant) {
  if (!participants[gameId]) participants[gameId] = [];
  const existing = participants[gameId].find((p) => p.id === participant.id);
  if (existing) return existing;
  participants[gameId] = [...participants[gameId], participant];
  // Bumping the game's own `participants` count now happens against the
  // real backend (see lib/api.js's joinGame, which calls POST
  // /api/games/:id/join) - games aren't a local mutable object anymore.
  return participant;
}

// Updates that same participant's record with their submitted answer,
// rather than storing the answer somewhere disconnected from who they are.
export function recordSubmission(gameId, participantId, answer) {
  const list = participants[gameId] || [];
  const idx = list.findIndex((p) => p.id === participantId);
  const submittedAt = new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

  if (idx === -1) {
    // Self-healing fallback: normally joinParticipant already ran, but if
    // a submission ever arrives without a prior join record, create one
    // rather than silently losing the answer.
    participants[gameId] = [
      ...list,
      { id: participantId, name: "You", joined: submittedAt, payment: "CONFIRMED", status: "SUBMITTED", submittedAt, answer, eligibility: "ELIGIBLE" },
    ];
  } else {
    const updated = { ...list[idx], status: "SUBMITTED", answer, submittedAt };
    participants[gameId] = [...list.slice(0, idx), updated, ...list.slice(idx + 1)];
  }

  // Bumping the game's own `submissions` count now happens against the
  // real backend (see lib/api.js's submitAnswer, which calls POST
  // /api/games/:id/submissions) - games aren't a local mutable object anymore.
}

export const winners = [
  {
    id: "w1",
    game: "Popcorn Bucket",
    gameId: "g4",
    winner: "Amara T.",
    winningAnswer: 350,
    prize: 60000,
    currency: "FCFA",
    date: "Sep 6, 2026",
    status: "PAID",
  },
  {
    id: "w2",
    game: "Coin Countdown",
    gameId: "g0",
    winner: "Bello S.",
    winningAnswer: 512,
    prize: 90000,
    currency: "FCFA",
    date: "Sep 2, 2026",
    status: "PAID",
  },
  {
    id: "w3",
    game: "Jelly Jar",
    gameId: "g00",
    winner: "Nadia F.",
    winningAnswer: 275,
    prize: 40000,
    currency: "FCFA",
    date: "Aug 29, 2026",
    status: "PENDING",
  },
  {
    id: "w4",
    game: "Marble Rush",
    gameId: "g000",
    winner: "Grace M.",
    winningAnswer: 180,
    prize: 35000,
    currency: "FCFA",
    date: "Aug 24, 2026",
    status: "CONFIRMED",
  },
];

export const users = [
  { id: "u1", name: "Amara T.", email: "amara.t@example.com", status: "ACTIVE", gamesPlayed: 12, wins: 3, losses: 9, points: 420, joined: "Jun 2, 2026" },
  { id: "u2", name: "Jordan K.", email: "jordan.k@example.com", status: "ACTIVE", gamesPlayed: 8, wins: 1, losses: 7, points: 150, joined: "Jun 14, 2026" },
  { id: "u3", name: "Liam O.", email: "liam.o@example.com", status: "SUSPENDED", gamesPlayed: 3, wins: 0, losses: 3, points: 20, joined: "Jul 1, 2026" },
  { id: "u4", name: "Fatima N.", email: "fatima.n@example.com", status: "ACTIVE", gamesPlayed: 20, wins: 4, losses: 16, points: 610, joined: "May 20, 2026" },
  { id: "u5", name: "Chidi A.", email: "chidi.a@example.com", status: "INACTIVE", gamesPlayed: 5, wins: 0, losses: 5, points: 40, joined: "Aug 3, 2026" },
  { id: "u6", name: "Bello S.", email: "bello.s@example.com", status: "ACTIVE", gamesPlayed: 14, wins: 2, losses: 12, points: 300, joined: "Jul 22, 2026" },
  { id: "u7", name: "Nadia F.", email: "nadia.f@example.com", status: "ACTIVE", gamesPlayed: 9, wins: 1, losses: 8, points: 180, joined: "Aug 11, 2026" },
];

export const transactions = [
  { id: "t1", player: "Jordan K.", game: "Guess it", amount: 100, currency: "FCFA", type: "GAME_ENTRY", status: "SUCCESS", date: "Sep 9, 2026 10:02" },
  { id: "t2", player: "Amara T.", game: "Popcorn Bucket", amount: 60000, currency: "FCFA", type: "PRIZE", status: "SUCCESS", date: "Sep 6, 2026 14:20" },
  { id: "t3", player: "Chidi A.", game: "Guess it", amount: 100, currency: "FCFA", type: "GAME_ENTRY", status: "PENDING", date: "Sep 9, 2026 10:15" },
  { id: "t4", player: "Liam O.", game: "Marble Challenge", amount: 0, currency: "FCFA", type: "REFUND", status: "CANCELLED", date: "Aug 30, 2026 08:40" },
  { id: "t5", player: "Nadia F.", game: "Button Jar", amount: 50, currency: "FCFA", type: "GAME_ENTRY", status: "FAILED", date: "Sep 7, 2026 09:41" },
  { id: "t6", player: "Bello S.", game: "Coin Countdown", amount: 90000, currency: "FCFA", type: "PRIZE", status: "SUCCESS", date: "Sep 2, 2026 16:05" },
];

export const notifications = [
  { id: "n1", category: "GAME", text: "Game \"Guess it\" went live.", time: "5 min ago", read: false },
  { id: "n2", category: "PAYMENT", text: "Payment confirmation received for Guess it entry.", time: "20 min ago", read: false },
  { id: "n3", category: "SYSTEM", text: "New winner determined for Popcorn Bucket.", time: "2 hours ago", read: true },
  { id: "n4", category: "USER", text: "128 new players joined this week.", time: "1 day ago", read: true },
  { id: "n5", category: "GAME", text: "Game \"Marble Challenge\" ended successfully.", time: "2 days ago", read: true },
];

export const dashboardStats = {
  totalUsers: 12450,
  activeGames: 8,
  completedGames: 124,
  totalParticipants: 28450,
  totalWinners: 620,
  totalEntries: 41200,
};

export const recentActivity = [
  { id: "a1", text: "Game \"Guess it\" went live", time: "5 min ago" },
  { id: "a2", text: "124th player joined Guess it", time: "40 min ago" },
  { id: "a3", text: "Amara T. won \"Popcorn Bucket\"", time: "2 hours ago" },
  { id: "a4", text: "Payment confirmed for Button Jar entry", time: "3 hours ago" },
  { id: "a5", text: "New game \"Sweet Jellybeans\" scheduled", time: "6 hours ago" },
  { id: "a6", text: "Admin updated game \"Guess it\"", time: "8 hours ago" },
  { id: "a7", text: "128 new players joined this week", time: "1 day ago" },
];

export function getUserById(id) {
  return users.find((u) => u.id === id);
}

// ---------------------------------------------------------------------------
// COMMENTS
// Per-game discussion thread, shown while players wait for a result and on
// the result page itself. Shaped so a real backend can drop in behind
// lib/api.js's fetchComments/postComment/toggleCommentLike without any
// component changes: each comment is
// { id, gameId, author, initials, text, likes, likedByMe, createdAt, replies }
// ---------------------------------------------------------------------------
export const comments = {
  g1: [
    {
      id: "cm1",
      gameId: "g1",
      author: "Jordan K.",
      initials: "JK",
      text: "My guess is way off from what I'm seeing others post, this jar is deceiving 😅",
      likes: 6,
      likedByMe: false,
      createdAt: Date.now() - 1000 * 60 * 9,
      replies: [
        {
          id: "cm1-r1",
          gameId: "g1",
          author: "Fatima N.",
          initials: "FN",
          text: "Same here, I counted in sections and still wasn't confident",
          likes: 2,
          likedByMe: false,
          createdAt: Date.now() - 1000 * 60 * 6,
          replies: [],
        },
      ],
    },
    {
      id: "cm2",
      gameId: "g1",
      author: "Liam O.",
      initials: "LO",
      text: "Good luck everyone, excited to see the result!",
      likes: 3,
      likedByMe: false,
      createdAt: Date.now() - 1000 * 60 * 20,
      replies: [],
    },
  ],
  g4: [
    {
      id: "cm3",
      gameId: "g4",
      author: "Samuel P.",
      initials: "SP",
      text: "Congrats to the winner, that was a close one",
      likes: 5,
      likedByMe: false,
      createdAt: Date.now() - 1000 * 60 * 60 * 20,
      replies: [],
    },
  ],
};

