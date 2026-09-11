import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import GameForm from "../../components/admin/GameForm";
import LoadingState from "../../components/ui/LoadingState";
import ErrorState from "../../components/ui/ErrorState";
import { fetchGame, updateGame } from "../../lib/api";
import { useToast } from "../../context/ToastContext";

// datetime-local inputs need "YYYY-MM-DDTHH:mm" in the browser's local time.
function toDatetimeLocal(ms) {
  if (!ms) return "";
  const d = new Date(ms);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function EditGame() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { notify } = useToast();
  const [status, setStatus] = useState("loading");
  const [game, setGame] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setStatus("loading");
    try {
      setGame(await fetchGame(id));
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      await updateGame(id, values);
      notify("Game updated successfully.", { type: "success" });
      navigate(`/admin/games/${id}`);
    } catch {
      notify("Game could not be updated.", { type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "loading") return <LoadingState fullPage />;
  if (status === "error") return <ErrorState onRetry={load} />;

  return (
    <div className="flex flex-col gap-5 max-w-3xl">
      <div>
        <h2 className="font-display text-lg font-semibold text-[var(--color-ink)]">Edit game</h2>
        <p className="text-sm text-[var(--color-ink-muted)]">{game.title}</p>
      </div>
      <GameForm
        initialValues={{
          title: game.title,
          gameType: game.gameType || "GUESSING",
          description: game.description,
          instructions: game.howToPlay,
          media: game.media || null,
          question: game.question || "",
          unit: game.unit,
          correctAnswer: game.result?.correctAnswer ?? "",
          countdownMinutes: String(Math.round((game.endsAt - game.startsAt) / 60000) || 5),
          startAt: toDatetimeLocal(game.startsAt),
          endAt: toDatetimeLocal(game.endsAt),
          participantLimit: game.participantLimit ?? "",
          prize: game.prize,
          entryFee: game.entryFee,
          rewardDescription: game.rewardDescription || "",
          status: game.status,
        }}
        onSubmit={handleSubmit}
        submitting={submitting}
      />
    </div>
  );
}
