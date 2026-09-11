import { useLocation, useNavigate, useParams } from "react-router-dom";
import { CheckIcon } from "../../components/ui/StatusScreen";
import Button from "../../components/ui/Button";

export default function Submission() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const answer = location.state?.answer;

  return (
    <div className="max-w-sm mx-auto px-4 sm:px-6 py-16 text-center flex flex-col items-center">
      <div className="h-16 w-16 rounded-full bg-[var(--color-success-soft)] text-[var(--color-success)] flex items-center justify-center mb-5">
        <CheckIcon />
      </div>
      <h1 className="font-display text-xl font-semibold text-[var(--color-ink)]">
        Answer submitted
      </h1>

      <div className="mt-6 w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] py-6">
        <p className="text-xs text-[var(--color-ink-muted)]">Your answer</p>
        <p className="font-display text-3xl font-semibold text-[var(--color-ink)] mt-1">
          {answer ?? "--"}
        </p>
      </div>

      <p className="text-sm text-[var(--color-ink-muted)] mt-5">
        Your submission has been received. You can no longer change your answer.
      </p>

      <Button size="lg" fullWidth className="mt-8" onClick={() => navigate(`/games/${id}/closed`)}>
        View game status
      </Button>
    </div>
  );
}
