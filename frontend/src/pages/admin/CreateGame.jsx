import { useState } from "react";
import { useNavigate } from "react-router-dom";
import GameForm from "../../components/admin/GameForm";
import { createGame } from "../../lib/api";
import { useToast } from "../../context/ToastContext";

export default function CreateGame() {
  const navigate = useNavigate();
  const { notify } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      const game = await createGame(values);
      notify(
        values.status === "DRAFT" ? "Game saved as draft." : "Game created successfully.",
        { type: "success" }
      );
      navigate(`/admin/games/${game.id}`);
    } catch {
      notify("Game could not be created.", { type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-5 max-w-3xl">
      <div>
        <h2 className="font-display text-lg font-semibold text-[var(--color-ink)]">Create game</h2>
        <p className="text-sm text-[var(--color-ink-muted)]">Set up a new estimation game for players</p>
      </div>
      <GameForm onSubmit={handleSubmit} submitting={submitting} />
    </div>
  );
}
