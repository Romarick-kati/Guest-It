import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { fetchGame, fetchParticipants } from "../../lib/api";
import { formatCurrency, GAME_STATUS } from "../../lib/gameStatus";
import { GAME_TYPES } from "../../lib/mockData";
import { TableSkeleton } from "../../components/ui/Skeleton";
import ErrorState from "../../components/ui/ErrorState";
import Card, { CardHeader } from "../../components/ui/Card";
import GameStatusBadge from "../../components/game/GameStatusBadge";
import GameCountdown from "../../components/game/GameCountdown";
import GameImage from "../../components/game/GameImage";
import Button from "../../components/ui/Button";
import { ConfirmationModal } from "../../components/ui/Modal";
import { useToast } from "../../context/ToastContext";

const TABS = ["Overview", "Configuration", "Activity"];

function gameTypeLabel(type) {
  return GAME_TYPES.find((t) => t.value === type)?.label || type || "—";
}

export default function AdminGameDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { notify } = useToast();
  const [status, setStatus] = useState("loading");
  const [game, setGame] = useState(null);
  const [recentParticipants, setRecentParticipants] = useState([]);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [tab, setTab] = useState("Overview");

  const load = async () => {
    setStatus("loading");
    try {
      const [g, p] = await Promise.all([fetchGame(id), fetchParticipants(id)]);
      setGame(g);
      setRecentParticipants(p);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (status === "loading") return <TableSkeleton cols={4} rows={4} />;
  if (status === "error") return <ErrorState onRetry={load} />;

  const secondsToEnd = Math.max(0, Math.round((game.endsAt - Date.now()) / 1000));
  const isLive = game.status === GAME_STATUS.LIVE || game.status === GAME_STATUS.PAUSED;

  const handleEndGame = () => {
    notify("Game has ended.", { type: "info" });
    setConfirmEnd(false);
  };

  return (
    <div className="flex flex-col gap-5 max-w-3xl">
      <button
        onClick={() => navigate("/admin/games")}
        className="text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] inline-flex items-center gap-1 w-fit"
      >
        ← Back to games
      </button>

      <Card padded={false} className="overflow-hidden">
        <GameImage image={game.image} media={game.media} title={game.title} className="h-40" />
        <div className="p-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <GameStatusBadge status={game.status} />
                <span className="text-xs text-[var(--color-ink-faint)]">{gameTypeLabel(game.gameType)}</span>
              </div>
              <h2 className="font-display text-xl font-semibold text-[var(--color-ink)]">{game.title}</h2>
              <p className="text-sm text-[var(--color-ink-muted)] mt-1">{game.description}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {(game.status === GAME_STATUS.DRAFT || game.status === GAME_STATUS.UPCOMING) && (
                <Link to={`/admin/games/${id}/edit`}>
                  <Button variant="outline" size="sm">Edit</Button>
                </Link>
              )}
              {isLive && (
                <Link to={`/admin/games/${id}/live`}>
                  <Button size="sm">View live game</Button>
                </Link>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
            <Stat label="Participants" value={game.participants} />
            <Stat label="Submissions" value={game.submissions ?? "--"} />
            <Stat label="Prize" value={game.prize ? formatCurrency(game.prize, game.currency) : "--"} />
            <Stat label="Entry fee" value={game.entryFee ? formatCurrency(game.entryFee, game.currency) : "Free"} />
          </div>

          {isLive && (
            <div className="mt-4 flex items-center gap-2 text-sm text-[var(--color-ink-muted)]">
              <span>Time remaining:</span>
              <GameCountdown seconds={secondsToEnd} size="sm" />
            </div>
          )}
        </div>
      </Card>

      {/* Section tabs */}
      <div className="flex items-center gap-2 border-b border-[var(--color-border)]">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t
                ? "border-[var(--color-accent)] text-[var(--color-accent)]"
                : "border-transparent text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Overview" && (
        <Card>
          <CardHeader title="Overview" subtitle="Everything about this game at a glance" />
          <dl className="grid sm:grid-cols-2 gap-4 mt-4 text-sm">
            <Row label="How to play" value={game.howToPlay} />
            <Row label="Unit" value={game.unit} />
            <Row label="Start" value={new Date(game.startsAt).toLocaleString()} />
            <Row label="End" value={new Date(game.endsAt).toLocaleString()} />
            <Row label="Created" value={game.createdAt} />
            <Row label="Participant limit" value={game.participantLimit || "Unlimited"} />
          </dl>
          <div className="flex flex-wrap gap-3 mt-5 pt-5 border-t border-[var(--color-border)]">
            <Link to={`/admin/games/${id}/participants`}>
              <Button variant="outline">View participants</Button>
            </Link>
            {game.status === GAME_STATUS.COMPLETED && (
              <Link to={`/admin/games/${id}/result`}>
                <Button variant="outline">View result</Button>
              </Link>
            )}
            {isLive && (
              <Button variant="danger" onClick={() => setConfirmEnd(true)}>
                End game
              </Button>
            )}
          </div>
        </Card>
      )}

      {tab === "Configuration" && (
        <Card>
          <CardHeader title="Configuration" subtitle="Settings this game was created with" />
          <dl className="grid sm:grid-cols-2 gap-4 mt-4 text-sm">
            <Row label="Game type" value={gameTypeLabel(game.gameType)} />
            <Row label="Requires payment" value={game.requiresPayment ? "Yes" : "No"} />
            <Row label="Requires verification" value={game.requiresVerification ? "Yes" : "No"} />
            <Row label="Correct answer" value={game.result?.correctAnswer ?? "Hidden until result is published"} />
          </dl>
        </Card>
      )}

      {tab === "Activity" && (
        <Card>
          <CardHeader title="Activity" subtitle="Recent participant activity on this game" />
          {recentParticipants.length === 0 ? (
            <p className="text-sm text-[var(--color-ink-muted)] mt-4">No activity yet.</p>
          ) : (
            <ul className="mt-4 flex flex-col divide-y divide-[var(--color-border)]">
              {recentParticipants.map((p) => (
                <li key={p.id} className="py-3 flex items-center justify-between text-sm">
                  <span className="text-[var(--color-ink)]">
                    {p.name} {p.status === "SUBMITTED" ? "submitted an answer" : "joined the game"}
                  </span>
                  <span className="text-[var(--color-ink-faint)]">{p.submittedAt || p.joined || "--"}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      <ConfirmationModal
        open={confirmEnd}
        onClose={() => setConfirmEnd(false)}
        onConfirm={handleEndGame}
        title="End this game?"
        description="This will stop new submissions and move the game to closed. This action is subject to backend confirmation."
        confirmLabel="End game"
        danger
      />
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="bg-[var(--color-surface-muted)] rounded-xl px-3 py-3">
      <p className="text-xs text-[var(--color-ink-muted)]">{label}</p>
      <p className="font-display font-semibold text-[var(--color-ink)] mt-0.5 text-sm">{value}</p>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div>
      <dt className="text-xs text-[var(--color-ink-muted)]">{label}</dt>
      <dd className="text-[var(--color-ink)] mt-0.5">{value}</dd>
    </div>
  );
}
