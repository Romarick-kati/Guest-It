// ---------------------------------------------------------------------------
// PLAYER STATS (derived, not stored)
// The profile page used to show fixed placeholder numbers here. There's no
// backend tracking of game participation yet, but the app's own mock
// participant store (see mockData.js's `participants`/getAllParticipants)
// already records every game "you" actually joined and answered in this
// session - so these stats are computed from that instead of made up.
//
// A game only counts toward wins/accuracy once it has a declared result
// (a game's `result.correctAnswer`, from the real games backend) and you
// actually submitted an answer - a LIVE game you've joined but that hasn't
// ended yet is neither a win nor a loss. There's no points/score currency
// anywhere else in this app (games pay out real currency, not points), so
// this doesn't invent one either.
// ---------------------------------------------------------------------------
import { getAllParticipants } from "./mockData";
import { fetchGames, getCachedGame } from "./api";

function accuracyFor(answer, correctAnswer) {
  if (correctAnswer === 0) return answer === 0 ? 1 : 0;
  return Math.max(0, 1 - Math.abs(answer - correctAnswer) / correctAnswer);
}

export async function computePlayerStats() {
  // Warms the game cache so the result.correctAnswer lookup below is
  // accurate regardless of what's already been fetched this session -
  // games live on the backend now, this can't look them up synchronously.
  await fetchGames();

  const yours = getAllParticipants().filter((p) => p.id === "you" && !p.seed);
  const gamesPlayed = yours.length;

  const resolved = yours
    .map((participant) => ({ participant, game: getCachedGame(participant.gameId) }))
    .filter(({ participant, game }) => game?.result?.correctAnswer != null && participant.status === "SUBMITTED")
    .sort((a, b) => (a.game.endsAt || 0) - (b.game.endsAt || 0));

  let gamesWon = 0;
  let accuracySum = 0;
  let currentStreak = 0;
  let bestStreak = 0;

  resolved.forEach(({ participant, game }) => {
    const won = participant.answer === game.result.correctAnswer && participant.eligibility !== "INELIGIBLE";
    accuracySum += accuracyFor(participant.answer, game.result.correctAnswer);
    if (won) gamesWon += 1;
    currentStreak = won ? currentStreak + 1 : 0;
    bestStreak = Math.max(bestStreak, currentStreak);
  });

  const resolvedCount = resolved.length;
  const accuracy = resolvedCount > 0 ? Math.round((accuracySum / resolvedCount) * 100) : null;

  return {
    gamesPlayed,
    gamesWon,
    winRate: resolvedCount > 0 ? Math.round((gamesWon / resolvedCount) * 100) : null,
    accuracy,
    winningStreak: currentStreak,
    achievements: [
      {
        key: "first-victory",
        badge: "10W",
        title: "First victory",
        description: "Won your first 10 games.",
        unlocked: gamesWon >= 10
      },
      {
        key: "sharpshooter",
        badge: "90%",
        title: "Sharpshooter",
        description: "Average 90%+ accuracy across resolved games.",
        unlocked: accuracy != null && accuracy >= 90
      },
      {
        key: "hot-streak",
        badge: "7S",
        title: "Hot streak",
        description: "Won 7 games consecutively.",
        unlocked: bestStreak >= 7
      },
      {
        key: "legend",
        badge: "50",
        title: "Legend",
        description: "Win 50 Guess it games.",
        unlocked: gamesWon >= 50
      }
    ]
  };
}
