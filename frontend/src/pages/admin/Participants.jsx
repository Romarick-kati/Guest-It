import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchGame, fetchParticipants } from "../../lib/api";
import { TableSkeleton } from "../../components/ui/Skeleton";
import ErrorState from "../../components/ui/ErrorState";
import EmptyState from "../../components/ui/EmptyState";
import ParticipantTable from "../../components/admin/ParticipantTable";

export default function Participants() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");
  const [game, setGame] = useState(null);
  const [participants, setParticipants] = useState([]);

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

  if (status === "loading") return <TableSkeleton cols={6} />;
  if (status === "error") return <ErrorState onRetry={load} />;

  return (
    <div className="flex flex-col gap-5">
      <button
        onClick={() => navigate(`/admin/games/${id}`)}
        className="text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] w-fit"
      >
        ← Back to game
      </button>
      <div>
        <h2 className="font-display text-lg font-semibold text-[var(--color-ink)]">Participants</h2>
        <p className="text-sm text-[var(--color-ink-muted)]">{game.title} · {participants.length} joined</p>
      </div>

      {participants.length === 0 ? (
        <EmptyState title="No participants yet" description="Players who join this game will appear here." />
      ) : (
        <ParticipantTable participants={participants} />
      )}
    </div>
  );
}
