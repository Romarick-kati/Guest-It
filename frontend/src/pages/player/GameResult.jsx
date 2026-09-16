import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchGame, fetchParticipants, fetchResolution, respondToTie } from "../../lib/api";
import { formatCurrency } from "../../lib/gameStatus";
import { getExactMatches, summariseOutcome } from "../../lib/resolution";
import LoadingState from "../../components/ui/LoadingState";
import ErrorState from "../../components/ui/ErrorState";
import EmptyState from "../../components/ui/EmptyState";
import Button from "../../components/ui/Button";
import CommentSection from "../../components/game/CommentSection";

// Stand-in for "the logged-in player" until real accounts are wired up -
// mirrors the placeholder used in the comment section.
const YOU = "You";

export default function GameResult() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");
  const [game, setGame] = useState(null);
  const [exactMatches, setExactMatches] = useState([]);
  const [outcome, setOutcome] = useState(null);
  const [resolution, setResolution] = useState(null);
  const [responding, setResponding] = useState(false);

  const load = async () => {
    setStatus("loading");
    try {
      const [g, list] = await Promise.all([fetchGame(id), fetchParticipants(id)]);
      setGame(g);
      if (g.result) {
        setExactMatches(getExactMatches(list, g.result.correctAnswer));
        const summary = summariseOutcome(list, g.result.correctAnswer);
        setOutcome(summary);
        if (summary.case === "TIE") {
          setResolution(await fetchResolution(id));
        }
      }
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleRespond = async (choice) => {
    setResponding(true);
    try {
      setResolution(await respondToTie(id, YOU, choice));
    } finally {
      setResponding(false);
    }
  };

  if (status === "loading") return <LoadingState fullPage />;
  if (status === "error") return <ErrorState onRetry={load} className="min-h-[50vh]" />;

  if (!game.result) {
    return (
      <div className="max-w-sm mx-auto px-4 sm:px-6 py-16">
        <EmptyState
          title="Result not available yet"
          description="This game's result hasn't been published. Check back once it's finalised."
          action={<Button onClick={() => navigate("/games")}>Back to games</Button>}
        />
      </div>
    );
  }

  const youMatched = exactMatches.some((p) => p.name === YOU);
  const yourChoice = resolution?.playerChoices?.[YOU];

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-12 animate-fade-in-up">
      <div className="text-center">
        <p className="text-xs uppercase tracking-wide text-[var(--color-ink-faint)] mb-1">Game result</p>
        <h1 className="font-display text-2xl font-semibold text-[var(--color-ink)]">{game.title}</h1>
        <p className="text-sm text-[var(--color-ink-muted)] mt-1">
          Correct answer: <span className="font-medium text-[var(--color-ink)]">{game.result.correctAnswer}</span>{game.unit ? ` ${game.unit}` : ""}
        </p>
      </div>

      {/* No one matched */}
      {outcome.case === "NO_WINNER" && (
        <div className="rounded-2xl p-6 mt-6 text-center bg-[var(--color-surface-muted)] animate-scale-in">
          <p className="font-display text-xl font-semibold text-[var(--color-ink)]">No winner this round</p>
          <p className="text-sm text-[var(--color-ink-muted)] mt-1">
            Nobody matched the exact number this time — that happens sometimes.
          </p>
        </div>
      )}

      {/* Clean single winner */}
      {outcome.case === "SINGLE_WINNER" && (
        <div
          className={`rounded-2xl p-6 mt-6 text-center animate-scale-in ${
            outcome.eligible[0].name === YOU ? "bg-[var(--color-success-soft)]" : "bg-[var(--color-surface-muted)]"
          }`}
        >
          <p
            className={`font-display text-xl font-semibold ${
              outcome.eligible[0].name === YOU ? "text-[var(--color-success)]" : "text-[var(--color-ink)]"
            }`}
          >
            {outcome.eligible[0].name === YOU ? "You won! 🎉" : `${outcome.eligible[0].name} won this round`}
          </p>
          <p className="text-sm text-[var(--color-ink-muted)] mt-1">
            Prize: <span className="font-medium text-[var(--color-ink)]">{formatCurrency(game.prize, game.currency)}</span>
          </p>
        </div>
      )}

      {/* Tie in progress or resolved */}
      {outcome.case === "TIE" && (
        <div className="mt-6">
          {(!resolution || resolution.status !== "RESOLVED") && (
            <div className="rounded-2xl p-5 bg-[var(--color-warning-soft)] text-center animate-scale-in">
              <p className="font-display font-semibold text-[var(--color-ink)]">
                {outcome.eligible.length} players matched the exact number
              </p>
              <p className="text-sm text-[var(--color-ink-muted)] mt-1">
                {youMatched
                  ? "You're one of them! Here's how it gets decided."
                  : "This one's being resolved — check back soon for the final result."}
              </p>
            </div>
          )}

          {/* Decision prompt, only for the player if they're tied and haven't answered yet */}
          {youMatched && resolution?.status === "AWAITING_PLAYERS" && yourChoice == null && (
            <div className="mt-4 rounded-2xl border border-[var(--color-border)] p-5 animate-scale-in">
              <p className="font-medium text-[var(--color-ink)] mb-1">How would you like to settle it?</p>
              <p className="text-sm text-[var(--color-ink-muted)] mb-4">
                You can split the prize evenly with the other tied players, or settle it with a tiebreaker game.
              </p>
              <div className="flex flex-col gap-2">
                <Button onClick={() => handleRespond("SPLIT")} loading={responding} disabled={responding}>
                  Split the prize evenly
                </Button>
                <Button variant="outline" onClick={() => handleRespond("TIEBREAKER")} loading={responding} disabled={responding}>
                  Play a tiebreaker game
                </Button>
              </div>
            </div>
          )}

          {youMatched && resolution?.status === "AWAITING_PLAYERS" && yourChoice != null && (
            <p className="text-sm text-[var(--color-ink-muted)] text-center mt-4">
              You chose to {yourChoice === "SPLIT" ? "split the prize" : "play a tiebreaker"}. Waiting on the
              other tied players to respond…
            </p>
          )}

          {resolution?.status === "RESOLVED" && resolution.method === "RANDOM" && (
            <div
              className={`rounded-2xl p-6 mt-4 text-center animate-scale-in ${
                resolution.winners[0].name === YOU ? "bg-[var(--color-success-soft)]" : "bg-[var(--color-surface-muted)]"
              }`}
            >
              <p
                className={`font-display text-xl font-semibold ${
                  resolution.winners[0].name === YOU ? "text-[var(--color-success)]" : "text-[var(--color-ink)]"
                }`}
              >
                {resolution.winners[0].name === YOU ? "You won the draw! 🎉" : `${resolution.winners[0].name} won the draw`}
              </p>
              <p className="text-sm text-[var(--color-ink-muted)] mt-1">
                Prize: <span className="font-medium text-[var(--color-ink)]">{formatCurrency(game.prize, game.currency)}</span>
              </p>
            </div>
          )}

          {resolution?.status === "RESOLVED" && resolution.method === "SPLIT" && (
            <div className="flex flex-col gap-2 mt-4 animate-scale-in">
              {resolution.winners.map((w) => (
                <div
                  key={w.name}
                  className={`flex items-center justify-between rounded-xl px-4 py-3 ${
                    w.name === YOU ? "bg-[var(--color-success-soft)] border border-[var(--color-success)]/30" : "bg-[var(--color-surface-muted)]"
                  }`}
                >
                  <span className="text-sm font-medium text-[var(--color-ink)]">{w.name === YOU ? "You" : w.name}</span>
                  <span className="text-sm text-[var(--color-ink-muted)]">
                    {formatCurrency(Math.round((game.prize * w.share) / 100), game.currency)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {resolution?.status === "RESOLVED" && resolution.method === "TIEBREAKER" && (
            <p className="text-sm text-[var(--color-ink-muted)] text-center mt-4">
              A tiebreaker game will decide the final winner — we'll let you know when it's ready.
            </p>
          )}
        </div>
      )}

      <Button size="lg" fullWidth className="mt-8" onClick={() => navigate("/games")}>
        Back to games
      </Button>

      <div className="h-px bg-[var(--color-border)] my-10" />

      <CommentSection gameId={id} title="Comments" />
    </div>
  );
}
