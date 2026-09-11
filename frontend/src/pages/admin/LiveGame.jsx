import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchGame, fetchParticipants } from "../../lib/api";
import LoadingState from "../../components/ui/LoadingState";
import ErrorState from "../../components/ui/ErrorState";
import Card, { CardHeader } from "../../components/ui/Card";
import GameStatusBadge from "../../components/game/GameStatusBadge";
import GameCountdown from "../../components/game/GameCountdown";
import Button from "../../components/ui/Button";
import { ConfirmationModal } from "../../components/ui/Modal";
import { useToast } from "../../context/ToastContext";

export default function LiveGame() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { notify } = useToast();
  const [status, setStatus] = useState("loading");
  const [game, setGame] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [extraSeconds, setExtraSeconds] = useState(0);
  const [paused, setPaused] = useState(false);
  const [confirmEnd, setConfirmEnd] = useState(false);

  const load = async () => {
    setStatus("loading");
    try {
      const [g, p] = await Promise.all([fetchGame(id), fetchParticipants(id)]);
      setGame(g);
      setParticipants(p);
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
  if (status === "error") return <ErrorState onRetry={load} />;

  const secondsToEnd = Math.max(0, Math.round((game.endsAt - Date.now()) / 1000)) + extraSeconds;
  const submittedCount = participants.filter((p) => p.status === "SUBMITTED").length;

  const addTime = (secs) => {
    setExtraSeconds((s) => s + secs);
    notify(`Added ${secs} seconds. Awaiting backend confirmation.`, { type: "info" });
  };

  return (
    <div className="flex flex-col gap-5 max-w-3xl">
      <button
        onClick={() => navigate(`/admin/games/${id}`)}
        className="text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] w-fit"
      >
        ← Back to game
      </button>

      <Card>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <GameStatusBadge status={game.status} />
              {paused && <span className="text-xs font-medium text-[var(--color-warning)]">PAUSED</span>}
            </div>
            <h2 className="font-display text-xl font-semibold text-[var(--color-ink)]">{game.title}</h2>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs text-[var(--color-ink-muted)]">Countdown</p>
            <GameCountdown seconds={paused ? secondsToEnd : secondsToEnd} size="lg" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-6">
          <Card className="!p-4">
            <p className="text-xs text-[var(--color-ink-muted)]">Participants</p>
            <p className="font-display text-2xl font-semibold text-[var(--color-ink)] mt-1">
              {game.participants}
            </p>
          </Card>
          <Card className="!p-4">
            <p className="text-xs text-[var(--color-ink-muted)]">Submissions</p>
            <p className="font-display text-2xl font-semibold text-[var(--color-ink)] mt-1">
              {submittedCount} / {participants.length}
            </p>
          </Card>
        </div>
      </Card>

      <Card>
        <CardHeader title="Controls" subtitle="UI controls only — the backend determines if these succeed" />
        <div className="flex flex-wrap gap-3 mt-4">
          <Button variant="outline" onClick={() => addTime(10)}>+10 sec</Button>
          <Button variant="outline" onClick={() => addTime(30)}>+30 sec</Button>
          {paused ? (
            <Button variant="outline" onClick={() => { setPaused(false); notify("Game resumed.", { type: "info" }); }}>
              Resume
            </Button>
          ) : (
            <Button variant="outline" onClick={() => { setPaused(true); notify("Game paused.", { type: "info" }); }}>
              Pause
            </Button>
          )}
          <Button variant="danger" onClick={() => setConfirmEnd(true)}>End game</Button>
        </div>
      </Card>

      <Card>
        <CardHeader title="Recent activity" subtitle="Live feed of participant events" />
        <ul className="mt-4 flex flex-col divide-y divide-[var(--color-border)]">
          {participants.slice(0, 6).map((p) => (
            <li key={p.id} className="py-3 flex items-center justify-between text-sm">
              <span className="text-[var(--color-ink)]">
                {p.status === "SUBMITTED" ? `${p.name} submitted an answer` : `${p.name} joined the game`}
              </span>
              <span className="text-[var(--color-ink-faint)]">{p.submittedAt || p.joined || "--"}</span>
            </li>
          ))}
          {participants.length === 0 && (
            <li className="py-3 text-sm text-[var(--color-ink-muted)]">No activity yet.</li>
          )}
        </ul>
      </Card>

      <ConfirmationModal
        open={confirmEnd}
        onClose={() => setConfirmEnd(false)}
        onConfirm={() => {
          notify("Game has ended.", { type: "info" });
          setConfirmEnd(false);
          navigate(`/admin/games/${id}`);
        }}
        title="End this game now?"
        description="Players will no longer be able to submit answers."
        confirmLabel="End game"
        danger
      />
    </div>
  );
}
