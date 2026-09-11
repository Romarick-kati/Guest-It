import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchGame, submitAnswer } from "../../lib/api";
import GameImage from "../../components/game/GameImage";
import GameCountdown from "../../components/game/GameCountdown";
import AnswerInput from "../../components/game/AnswerInput";
import SubmitAnswerButton from "../../components/game/SubmitAnswerButton";
import LoadingState from "../../components/ui/LoadingState";
import ErrorState from "../../components/ui/ErrorState";
import { useToast } from "../../context/ToastContext";

export default function GamePlay() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { notify } = useToast();
  const [status, setStatus] = useState("loading");
  const [game, setGame] = useState(null);
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [submitStatus, setSubmitStatus] = useState("idle");
  const [timeUp, setTimeUp] = useState(false);

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

  if (status === "loading") return <LoadingState fullPage />;
  if (status === "error") return <ErrorState onRetry={load} className="min-h-[50vh]" />;

  const secondsRemaining = Math.max(0, Math.round((game.endsAt - Date.now()) / 1000));

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (timeUp) return;
    if (answer === "" || Number(answer) < 0) {
      setError("Enter a valid estimate before submitting.");
      return;
    }
    setError("");
    setSubmitStatus("submitting");
    try {
      await submitAnswer(id, Number(answer));
      setSubmitStatus("submitted");
      notify("Answer submitted successfully.", { type: "success" });
      navigate(`/games/${id}/submitted`, { state: { answer: Number(answer) } });
    } catch {
      setSubmitStatus("error");
      notify("We couldn't submit your answer. Please try again.", { type: "error" });
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-[var(--color-ink-faint)]">
            {game.title}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-[var(--color-ink-muted)]">Time remaining</p>
          <GameCountdown
            seconds={secondsRemaining}
            size="md"
            onFinish={() => setTimeUp(true)}
          />
        </div>
      </div>

      <GameImage image={game.image} media={game.media} title={game.title} className="h-64 rounded-2xl" controls />

      <form onSubmit={handleSubmit} className="mt-6">
        <p className="text-center font-display font-semibold text-[var(--color-ink)] mb-3">
          {game.question || `How many ${game.unit} are inside?`}
        </p>

        <AnswerInput
          value={answer}
          onChange={(v) => {
            setAnswer(v);
            if (error) setError("");
          }}
          unit={game.unit}
          error={error}
          disabled={submitStatus === "submitted" || timeUp}
          loading={submitStatus === "submitting"}
        />
        <p className="text-center text-xs text-[var(--color-ink-faint)] mt-2">Your estimate</p>

        {timeUp ? (
          <div className="mt-6 text-center">
            <p className="text-sm font-medium text-[var(--color-danger)] mb-3">
              Time's up. You can no longer submit an answer for this game.
            </p>
          </div>
        ) : (
          <SubmitAnswerButton
            status={submitStatus}
            className="mt-6"
            disabled={answer === ""}
          />
        )}
      </form>
    </div>
  );
}
