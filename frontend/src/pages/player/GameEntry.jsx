import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchGame, joinGame } from "../../lib/api";
import Button from "../../components/ui/Button";
import LoadingState from "../../components/ui/LoadingState";
import ErrorState from "../../components/ui/ErrorState";
import GameImage from "../../components/game/GameImage";

export default function GameEntry() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");
  const [game, setGame] = useState(null);

  const load = async () => {
    setStatus("loading");
    try {
      const [g] = await Promise.all([fetchGame(id), joinGame(id)]);
      // Reaching this screen means payment (if required) and identity
      // verification (if required) already succeeded, so this is the one
      // moment the player is registered as a participant - not before
      // (payment could still fail) and not silently skipped after.
      setGame(g);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (status === "loading") return <LoadingState fullPage />;
  if (status === "error") return <ErrorState onRetry={load} className="min-h-[50vh]" />;

  return (
    <div className="max-w-sm mx-auto px-4 sm:px-6 py-14 text-center">
      <GameImage image={game.image} media={game.media} title={game.title} className="h-40 rounded-2xl mb-6" />
      <p className="text-sm font-medium text-[var(--color-accent)] mb-1">You're in!</p>
      <h1 className="font-display text-2xl font-semibold text-[var(--color-ink)]">{game.title}</h1>
      <p className="text-sm text-[var(--color-ink-muted)] mt-2">
        Get ready. Once you start, the countdown begins immediately.
      </p>
      <Button size="lg" fullWidth className="mt-8" onClick={() => navigate(`/games/${id}/play`)}>
        Start game
      </Button>
    </div>
  );
}
