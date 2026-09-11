import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import GameImage from "../../components/game/GameImage";
import GameStatusBadge from "../../components/game/GameStatusBadge";
import GameCountdown from "../../components/game/GameCountdown";
import Button from "../../components/ui/Button";
import LoadingState from "../../components/ui/LoadingState";
import ErrorState from "../../components/ui/ErrorState";
import { fetchGame } from "../../lib/api";
import { GAME_STATUS, formatCurrency } from "../../lib/gameStatus";

export default function GameDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");
  const [game, setGame] = useState(null);

  const load = async () => {
    setStatus("loading");
    try {
      const data = await fetchGame(id);
      setGame(data);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (status === "loading") return <LoadingState fullPage label="Loading game details..." />;
  if (status === "error") return <ErrorState onRetry={load} className="min-h-[50vh]" />;

  const now = Date.now();
  const secondsToStart = Math.max(0, Math.round((game.startsAt - now) / 1000));
  const secondsToEnd = Math.max(0, Math.round((game.endsAt - now) / 1000));

  const handleEnter = () => {
    if (game.requiresPayment) {
      navigate(`/games/${game.id}/payment`);
    } else if (game.requiresVerification) {
      navigate(`/games/${game.id}/verify`);
    } else {
      navigate(`/games/${game.id}/entry`);
    }
  };

  const renderCta = () => {
    if (game.status === GAME_STATUS.UPCOMING) {
      return (
        <Button size="lg" variant="outline" fullWidth disabled>
          Coming soon
        </Button>
      );
    }
    if (game.status === GAME_STATUS.COMPLETED || game.status === GAME_STATUS.CLOSED) {
      return (
        <Button size="lg" fullWidth onClick={() => navigate(`/games/${game.id}/result`)}>
          View result
        </Button>
      );
    }
    return (
      <Button size="lg" fullWidth onClick={handleEnter}>
        {game.requiresPayment ? "Join & pay" : "Enter game"}
      </Button>
    );
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <button
        onClick={() => navigate("/games")}
        className="text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] mb-4 inline-flex items-center gap-1"
      >
        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M12.7 4.3a1 1 0 010 1.4L8.42 10l4.3 4.3a1 1 0 01-1.42 1.4l-5-5a1 1 0 010-1.4l5-5a1 1 0 011.4 0z"
            clipRule="evenodd"
          />
        </svg>
        Back to games
      </button>

      <GameImage image={game.image} media={game.media} title={game.title} className="h-56 rounded-2xl" controls />

      <div className="flex items-start justify-between gap-4 mt-5">
        <div>
          <div className="mb-2">
            <GameStatusBadge status={game.status} />
          </div>
          <h1 className="font-display text-2xl font-semibold text-[var(--color-ink)]">
            {game.title}
          </h1>
          <p className="text-[var(--color-ink-muted)] mt-1">{game.description}</p>
        </div>
        {game.status === GAME_STATUS.LIVE && (
          <div className="text-right shrink-0">
            <p className="text-xs text-[var(--color-ink-muted)]">Ends in</p>
            <GameCountdown seconds={secondsToEnd} size="md" />
          </div>
        )}
        {game.status === GAME_STATUS.UPCOMING && (
          <div className="text-right shrink-0">
            <p className="text-xs text-[var(--color-ink-muted)]">Starts in</p>
            <GameCountdown seconds={secondsToStart} size="md" />
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
        <InfoStat label="Prize" value={game.prize ? formatCurrency(game.prize, game.currency) : "None"} />
        <InfoStat label="Entry fee" value={game.entryFee ? formatCurrency(game.entryFee, game.currency) : "Free"} />
        <InfoStat label="Participants" value={`${game.participants}${game.participantLimit ? ` / ${game.participantLimit}` : ""}`} />
        <InfoStat label="Time limit" value={`${Math.round((game.endsAt - game.startsAt) / 60000)} min`} />
      </div>

      <section className="mt-8">
        <h2 className="font-display font-semibold text-[var(--color-ink)] mb-2">How to play</h2>
        <p className="text-sm text-[var(--color-ink-muted)]">{game.howToPlay}</p>
      </section>

      <section className="mt-6">
        <h2 className="font-display font-semibold text-[var(--color-ink)] mb-2">Rules</h2>
        <ul className="text-sm text-[var(--color-ink-muted)] list-disc pl-5 space-y-1">
          {game.rules.map((rule, i) => (
            <li key={i}>{rule}</li>
          ))}
        </ul>
      </section>

      <div className="mt-8 sticky bottom-0 bg-[var(--color-bg)] pt-3 pb-1 sm:static sm:pt-0">
        {renderCta()}
      </div>
    </div>
  );
}

function InfoStat({ label, value }) {
  return (
    <div className="bg-[var(--color-surface-muted)] rounded-xl px-3 py-3">
      <p className="text-xs text-[var(--color-ink-muted)]">{label}</p>
      <p className="font-display font-semibold text-[var(--color-ink)] mt-0.5 text-sm">{value}</p>
    </div>
  );
}
