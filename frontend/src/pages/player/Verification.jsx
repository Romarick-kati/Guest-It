import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../../components/ui/Button";
import { Spinner, CheckIcon, XIcon } from "../../components/ui/StatusScreen";

// UI-only placeholder for the facial-recognition verification step.
// The real capture/matching logic belongs to the appropriate backend developer.
export default function Verification() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [state, setState] = useState("preparing"); // preparing | verifying | success | failed

  const startVerification = () => {
    setState("verifying");
    setTimeout(() => {
      // Simulated outcome for UI purposes only.
      setState(Math.random() < 0.85 ? "success" : "failed");
    }, 2200);
  };

  return (
    <div className="max-w-sm mx-auto px-4 sm:px-6 py-10 text-center">
      <h1 className="font-display text-xl font-semibold text-[var(--color-ink)]">
        Identity verification
      </h1>
      <p className="text-sm text-[var(--color-ink-muted)] mt-2">
        Before entering the game, we need to verify your identity.
      </p>

      <div className="mt-8 aspect-square rounded-2xl border-2 border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface-muted)] flex flex-col items-center justify-center gap-3">
        {state === "preparing" && (
          <>
            <svg className="h-10 w-10 text-[var(--color-ink-faint)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
              <rect x="3" y="6" width="18" height="13" rx="2" />
              <circle cx="12" cy="12.5" r="3.4" />
              <path d="M8 6l1.2-2h5.6L16 6" />
            </svg>
            <p className="text-xs text-[var(--color-ink-muted)]">Camera preview will appear here</p>
          </>
        )}
        {state === "verifying" && (
          <>
            <Spinner className="h-10 w-10 text-[var(--color-accent)]" />
            <p className="text-xs text-[var(--color-ink-muted)]">Verifying your identity...</p>
          </>
        )}
        {state === "success" && (
          <>
            <div className="h-12 w-12 rounded-full bg-[var(--color-success-soft)] text-[var(--color-success)] flex items-center justify-center">
              <CheckIcon className="h-6 w-6" />
            </div>
            <p className="text-xs text-[var(--color-success)] font-medium">Verification successful</p>
          </>
        )}
        {state === "failed" && (
          <>
            <div className="h-12 w-12 rounded-full bg-[var(--color-danger-soft)] text-[var(--color-danger)] flex items-center justify-center">
              <XIcon className="h-6 w-6" />
            </div>
            <p className="text-xs text-[var(--color-danger)] font-medium">Verification failed</p>
          </>
        )}
      </div>

      <p className="text-xs text-[var(--color-ink-faint)] mt-4">
        Follow the instructions on screen. Make sure your face is clearly visible and well lit.
      </p>

      <div className="mt-6 flex flex-col gap-2">
        {state === "preparing" && (
          <Button size="lg" fullWidth onClick={startVerification}>
            Continue
          </Button>
        )}
        {state === "verifying" && (
          <Button size="lg" fullWidth disabled loading>
            Verifying
          </Button>
        )}
        {state === "success" && (
          <Button size="lg" fullWidth onClick={() => navigate(`/games/${id}/entry`)}>
            Continue
          </Button>
        )}
        {state === "failed" && (
          <>
            <Button size="lg" fullWidth onClick={startVerification}>
              Retry
            </Button>
            <Button variant="outline" fullWidth onClick={() => navigate(`/games/${id}`)}>
              Back to game
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
