// ---------------------------------------------------------------------------
// WINNER RESOLUTION
// A game's winner is determined by the system, not chosen by an admin:
// a player wins by matching the exact correct answer. Since more than one
// player can land on the exact number, this file just computes the *pool*
// of exact matches from live participant data - it never picks a person.
//
// Once there's a tie, resolving it (down to final winner(s)) is a separate
// step that the system carries out - either a random draw, or letting the
// tied players choose to split the prize or settle it with a tiebreaker
// game. That decision is tracked server-side per game (see
// lib/api.js's fetchResolution/runSystemDraw/offerChoiceToPlayers/
// respondToTie, backed by mockData.js's `resolutions` store for now).
// ---------------------------------------------------------------------------

// Everyone who submitted the exact correct answer, regardless of whether
// they're eligible to actually win (e.g. still excluded by the repeat-
// winner cooldown).
export function getExactMatches(participants, correctAnswer) {
  return participants.filter((p) => p.status === "SUBMITTED" && p.answer === correctAnswer);
}

// Exact matches that are actually eligible to be selected as a winner.
export function getEligibleMatches(participants, correctAnswer) {
  return getExactMatches(participants, correctAnswer).filter((p) => p.eligibility !== "INELIGIBLE");
}

// Summarises where a game's result stands, purely from data - no stored
// "winner" field required. This is what makes the outcome system-derived:
// re-run this against the same participants and you get the same answer.
export function summariseOutcome(participants, correctAnswer) {
  const eligible = getEligibleMatches(participants, correctAnswer);
  if (eligible.length === 0) return { case: "NO_WINNER", eligible };
  if (eligible.length === 1) return { case: "SINGLE_WINNER", eligible };
  return { case: "TIE", eligible };
}
