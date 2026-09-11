import { useNavigate, useParams } from "react-router-dom";
import Button from "../../components/ui/Button";
import CommentSection from "../../components/game/CommentSection";

export default function GameWaiting() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-12">
      <div className="text-center flex flex-col items-center animate-fade-in-up">
        <div className="h-16 w-16 rounded-full bg-[var(--color-surface-sunken)] text-[var(--color-ink-muted)] flex items-center justify-center mb-5">
          <svg className="h-7 w-7 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3.5 2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1 className="font-display text-xl font-semibold text-[var(--color-ink)]">
          Waiting for results
        </h1>
        <p className="text-sm text-[var(--color-ink-muted)] mt-2 max-w-sm">
          Your answer has been recorded. The game is currently closed while we prepare the final result.
        </p>

        <div className="w-full max-w-sm">
          <Button size="lg" fullWidth className="mt-8" onClick={() => navigate(`/games/${id}/result`)}>
            Check result
          </Button>
          <Button variant="outline" fullWidth className="mt-2" onClick={() => navigate(`/games/${id}`)}>
            View game details
          </Button>
          <Button variant="ghost" fullWidth className="mt-2" onClick={() => navigate("/games")}>
            Browse other games
          </Button>
        </div>
      </div>

      <div className="h-px bg-[var(--color-border)] my-10" />

      <CommentSection gameId={id} title="Discuss while you wait" />
    </div>
  );
}
